import { useCallback, useState, useRef, useEffect } from 'react';
import {
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Box,
  LinearProgress,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import DownloadIcon from '@mui/icons-material/Download';

// Using the unified client SDK (packages/client)
import { ClientSdk } from '@cere-ddc-sdk/client';

import { USER_SEED } from './constants';

type LogEntry = {
  ts: number;
  level: 'info' | 'error' | 'success' | 'warning' | 'data';
  message: string;
};

const getSupportedMimeType = () => {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/mp4'];
  for (const t of types) {
    if ((window as any).MediaRecorder && (window as any).MediaRecorder.isTypeSupported?.(t)) {
      return t;
    }
  }
  return ''; // let browser choose
};

const formatTime = (ms: number) => {
  const sec = Math.floor(ms / 1000);
  const s = sec % 60;
  const m = Math.floor(sec / 60) % 60;
  const h = Math.floor(sec / 3600);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

export const RecordPage = () => {
  // Configuration
  const [httpUrl, setHttpUrl] = useState<string>('http://localhost:8085');
  const [wtUrl, setWtUrl] = useState<string>('https://localhost:4433/sis');
  const [workspace, setWorkspace] = useState<string>('2105');
  const [agentService, setAgentService] = useState<string>(
    '0xf15078913e31bf558abb540f9f3b6edac4bcca7ac8e8af597df5f2e64d9ca238',
  );
  const [dataStreamId, setDataStreamId] = useState<string | null>('stream-ffd265c8');

  // SDK State
  const [client, setClient] = useState<ClientSdk | null>(null);
  const [streamId, setStreamId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [busy, setBusy] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [level, setLevel] = useState(0);

  const publisherRef = useRef<any>(null);
  const chunkIndexRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Aggregation for streamed chunks coming from subscription
  const receivedChunksRef = useRef<Map<number, string>>(new Map());
  const totalChunksRef = useRef<number | null>(null);
  const receivedMimeRef = useRef<string>('audio/webm');

  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    setLogs((prev) => [{ ts: Date.now(), level, message }, ...prev].slice(0, 200));
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const ctx = { agent_service: agentService, workspace, stream: dataStreamId! };

  // Initialize client and create stream
  const onCreateStream = useCallback(async () => {
    setBusy(true);
    setConnectionStatus('connecting');
    console.log('ctx', ctx);
    try {
      addLog('info', 'Initializing ClientSdk...');
      const sdk = new ClientSdk({
        url: httpUrl,
        sisUrl: httpUrl,
        eventRuntimeUrl: 'http://localhost:8084',
        webTransportUrl: wtUrl,
        context: ctx,
        wallet: USER_SEED,
      });
      setClient(sdk);

      addLog('info', 'Creating stream...');
      const stream = await sdk.stream.create();
      setStreamId(stream.id);

      // Subscribe to stream for playback
      subscribeToStream(sdk, stream.id);

      setConnectionStatus('connected');
      addLog('success', `Stream created: ${stream.id}`);
      await sdk.event.create('STREAM_START', {
        dataStreamId: stream.id,
        description: 'Start Streaming',
      });
      addLog('success', `Agent triggered...`);
    } catch (e: any) {
      console.error(e);
      addLog('error', `Failed to create stream: ${e?.message || String(e)}`);
      setConnectionStatus('disconnected');
    } finally {
      setBusy(false);
    }
  }, [addLog, ctx, httpUrl, wtUrl]);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        resolve(res);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const dataUrlToBlobPart = (dataUrl: string): Blob => {
    const [meta, b64] = dataUrl.split(',');
    const mime = /data:(.*?);base64/.exec(meta)?.[1] || receivedMimeRef.current;
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  };

  const subscribeToStream = useCallback(
    (sdk: ClientSdk, streamId: string) => {
      const subscriber = sdk.stream.subscribe(streamId, (result, error) => {
        if (error) {
          console.log('error', error);
          addLog('error', `Stream subscribe error: ${error.message}`);
          subscriber.abort();
          return;
        }
        try {
          const payload = typeof result?.data === 'string' ? JSON.parse(result.data) : result?.data;
          if (!payload || typeof payload !== 'object') return;
          console.log('Received Packet data...', payload);
          if (payload.type === 'AUDIO_CHUNK') {
            const { index, mimeType, data: b64DataUrl } = payload;
            receivedMimeRef.current = mimeType || receivedMimeRef.current;
            receivedChunksRef.current.set(index, b64DataUrl);
            addLog('data', `Received chunk #${index}`);
          } else if (payload.type === 'AUDIO_COMPLETE') {
            const { total, mimeType } = payload;
            if (mimeType) receivedMimeRef.current = mimeType;
            totalChunksRef.current = total;

            // Try to assemble now
            const totalChunks = totalChunksRef.current;
            if (totalChunks != null) {
              const parts: BlobPart[] = [];
              for (let i = 0; i < totalChunks; i++) {
                const d = receivedChunksRef.current.get(i);
                if (!d) {
                  addLog('warning', `Missing chunk ${i}`);
                  return;
                }
                parts.push(dataUrlToBlobPart(d));
              }
              const blob = new Blob(parts, { type: receivedMimeRef.current });
              const url = URL.createObjectURL(blob);
              setAudioUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return url;
              });
              addLog('success', 'Assembled audio from streamed chunks');
              console.log('streamId', streamId);
              setTimeout(async () => {
                await sdk.stream.unsubscribe(streamId);
              }, 2000);
            }
          }
        } catch (e) {
          console.error('Failed to handle incoming data', e);
        }
      });
    },
    [addLog],
  );

  const startMeter = useCallback((stream: MediaStream) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteTimeDomainData(data);
        let sumSquares = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sumSquares += v * v;
        }
        const rms = Math.sqrt(sumSquares / data.length);
        setLevel(rms);
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {
      // ignore meter errors
    }
  }, []);

  const stopMeter = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try {
      analyserRef.current?.disconnect();
      audioContextRef.current?.close();
    } catch (_) {
      /* empty */
    }
    analyserRef.current = null;
    audioContextRef.current = null;
    setLevel(0);
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      stopMeter();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl, stopMeter]);

  const startRecording = async () => {
    if (!client || !streamId) {
      addLog('error', 'Please create a stream first');
      return;
    }

    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setElapsedMs(0);
    receivedChunksRef.current.clear();
    totalChunksRef.current = null;

    try {
      const recId = crypto.randomUUID();
      chunkIndexRef.current = 0;

      addLog('info', 'Opening publisher...');
      const publisher = await client.stream.publisher(streamId);
      publisherRef.current = publisher;

      addLog('info', 'Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      startMeter(stream);

      const mimeType = getSupportedMimeType();
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      rec.ondataavailable = async (evt) => {
        if (evt.data && evt.data.size > 0) {
          try {
            const dataUrl = await blobToBase64(evt.data);
            const idx = chunkIndexRef.current++;
            const payload = {
              type: 'AUDIO_CHUNK',
              recordingId: recId,
              index: idx,
              data: dataUrl,
              mimeType: rec.mimeType || mimeType || 'audio/webm',
            };
            await publisherRef.current.send({ message: payload, index: idx });
            addLog('info', `Sent chunk #${idx}`);
          } catch (err: any) {
            addLog('error', `Failed to send chunk: ${err?.message}`);
          }
        }
      };

      rec.onerror = (evt: any) => {
        addLog('error', evt.error?.message || 'Recording error');
      };

      rec.onstop = async () => {
        const total = chunkIndexRef.current;
        const payload = {
          type: 'AUDIO_COMPLETE',
          recordingId: recId,
          total,
          mimeType: rec.mimeType || mimeType || 'audio/webm',
        };
        try {
          await publisherRef.current?.send({ message: payload, index: total });
          addLog('success', `Recording complete. Total chunks: ${total}`);
        } catch (e: any) {
          addLog('warning', `Failed to send completion: ${e?.message}`);
        }
        setIsRecording(false);
      };

      rec.start(1000); // collect data every second
      mediaRecorderRef.current = rec;
      setIsRecording(true);

      const start = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - start);
      }, 250);

      addLog('success', 'Recording started');
    } catch (e: any) {
      addLog('error', e.message || String(e));
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    const rec = mediaRecorderRef.current;
    if (!rec) return;

    try {
      if (timerRef.current) clearInterval(timerRef.current);
      if (rec.state !== 'inactive') rec.stop();
    } catch (_) {
      /* empty */
    }

    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    stopMeter();

    setIsRecording(false);
    addLog('info', 'Recording stopped');
  };

  const download = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `recording_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
    a.click();
  };

  const getStatusColor = (status: typeof connectionStatus) => {
    switch (status) {
      case 'connected':
        return 'success';
      case 'connecting':
        return 'warning';
      default:
        return 'error';
    }
  };

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'success.main';
      case 'error':
        return 'error.main';
      case 'warning':
        return 'warning.main';
      case 'data':
        return 'secondary.main';
      default:
        return 'info.main';
    }
  };

  const meterWidth = Math.min(100, Math.round(level * 100));

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant="h5">🎙️ Audio Recording via Stream</Typography>
      <Typography variant="body2" color="text.secondary">
        Record audio from microphone and stream via WebTransport
      </Typography>

      {/* Configuration */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="subtitle1">⚙️ Configuration</Typography>
          <Chip
            label={connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            color={getStatusColor(connectionStatus)}
            size="small"
          />
        </Stack>

        <Stack spacing={2}>
          <Stack spacing={2} direction="row">
            <TextField
              fullWidth
              size="small"
              label="HTTP API URL"
              value={httpUrl}
              onChange={(e) => setHttpUrl(e.target.value)}
              placeholder="http://localhost:8085"
            />
            <TextField
              fullWidth
              size="small"
              label="WebTransport URL"
              value={wtUrl}
              onChange={(e) => setWtUrl(e.target.value)}
              placeholder="https://localhost:4433/sis"
            />
          </Stack>

          <Stack spacing={2} direction="row">
            <TextField
              fullWidth
              size="small"
              label="Workspace"
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="Agent Service"
              value={agentService}
              onChange={(e) => setAgentService(e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="Data Stream Id"
              value={dataStreamId}
              onChange={(e) => setDataStreamId(e.target.value)}
            />
          </Stack>

          <LoadingButton
            variant="contained"
            loading={busy}
            onClick={onCreateStream}
            disabled={connectionStatus === 'connected'}
          >
            🚀 Create Stream
          </LoadingButton>

          {streamId && (
            <Typography variant="body2" color="text.secondary">
              Stream ID: {streamId}
            </Typography>
          )}
        </Stack>
      </Paper>

      {/* Recording Controls */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          🎤 Recording
        </Typography>

        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: isRecording ? 'error.main' : 'primary.main',
              cursor: connectionStatus === 'connected' ? 'pointer' : 'not-allowed',
              transition: 'transform 0.1s',
              '&:hover': {
                transform: connectionStatus === 'connected' ? 'scale(1.05)' : 'none',
              },
              '&:active': {
                transform: connectionStatus === 'connected' ? 'scale(0.95)' : 'none',
              },
            }}
            onClick={connectionStatus === 'connected' ? (isRecording ? stopRecording : startRecording) : undefined}
          >
            {isRecording ? (
              <StopIcon sx={{ fontSize: 48, color: 'white' }} />
            ) : (
              <MicIcon sx={{ fontSize: 48, color: 'white' }} />
            )}
          </Box>

          <Typography variant="h6">{formatTime(elapsedMs)}</Typography>

          <Box sx={{ width: '100%', maxWidth: 300 }}>
            <LinearProgress
              variant="determinate"
              value={meterWidth}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'success.main',
                },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}
            >
              Live input level
            </Typography>
          </Box>

          {audioUrl && !isRecording && (
            <Stack spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
              <audio src={audioUrl} controls style={{ width: '100%' }} />
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={download}>
                Download Recording
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* Logs */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle1">📋 Logs</Typography>
          <Button size="small" onClick={clearLogs}>
            Clear
          </Button>
        </Stack>
        <List dense sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'grey.50', borderRadius: 1 }}>
          {logs.length === 0 ? (
            <ListItem>
              <ListItemText secondary="No logs yet" />
            </ListItem>
          ) : (
            logs.map((log, idx) => (
              <ListItem key={idx} sx={{ py: 0 }}>
                <ListItemText
                  primary={log.message}
                  secondary={new Date(log.ts).toLocaleTimeString()}
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: getLogColor(log.level),
                    sx: { fontFamily: 'monospace' },
                  }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Stack>
  );
};

export default RecordPage;
