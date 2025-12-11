import { useCallback, useMemo, useState, useRef } from 'react';
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
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

// Using the unified client SDK (packages/client)
import { ClientSdk } from '@cere-ddc-sdk/client';

type LogEntry = {
  ts: number;
  level: 'info' | 'error' | 'success' | 'warning' | 'data';
  message: string;
};

type ReceivedMessage = {
  seqNum: number;
  payload: string;
  ts: number;
};

type StreamInfo = {
  id: string;
  status: string;
  ownerNode: string;
};

/**
 * BrowserStreaming component
 * - Create stream
 * - Publish messages via WebTransport
 * - Subscribe to stream and receive messages
 *
 * Note: This is a standalone component for the playground. It does not write tests.
 */
export const BrowserStreaming = () => {
  // Configuration
  const [httpUrl, setHttpUrl] = useState<string>('http://localhost:8085');
  const [wtUrl, setWtUrl] = useState<string>('https://localhost:4433/sis');
  const [workspace, setWorkspace] = useState<string>('playground');
  const [agentService, setAgentService] = useState<string>('ddc-playground-agent');

  // State
  const [client, setClient] = useState<ClientSdk | null>(null);
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [busy, setBusy] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Publisher state
  const [publisherConnected, setPublisherConnected] = useState<boolean>(false);
  const [messageInput, setMessageInput] = useState<string>('Hello from browser! 🌐');
  const [sentCount, setSentCount] = useState<number>(0);
  const [lastAck, setLastAck] = useState<number | null>(null);
  const publisherRef = useRef<any>(null);

  // Subscriber state
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [offsetInput, setOffsetInput] = useState<string>('');
  const [receivedMessages, setReceivedMessages] = useState<ReceivedMessage[]>([]);
  const subscriberRef = useRef<any>(null);

  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    setLogs((prev) => [{ ts: Date.now(), level, message }, ...prev].slice(0, 200));
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const ctx = useMemo(
    () => ({ agent_service: agentService, workspace, stream: '' }),
    [agentService, workspace],
  );

  // Initialize client and create stream
  const onCreateStream = useCallback(async () => {
    setBusy(true);
    setConnectionStatus('connecting');
    try {
      addLog('info', 'Initializing ClientSdk...');
      const sdk = new ClientSdk({
        url: httpUrl,
        sisUrl: httpUrl,
        webTransportUrl: wtUrl,
        context: ctx,
        // Demo-only wallet for playground purposes; replace with a secure wallet in real apps
        wallet: 'test test test test test test test test test test test junk',
      });
      setClient(sdk);

      addLog('info', 'Creating stream...');
      const stream = await sdk.stream.create();
      console.log('stream', stream);

      // Fetch stream details
      const details = await sdk.stream.get(stream.id);

      setStreamInfo({
        id: stream.id,
        status: details?.status || 'unknown',
        ownerNode: details?.owner_node || 'Unknown',
      });

      setConnectionStatus('connected');
      addLog('success', `Stream created: ${stream.id}`);
    } catch (e: any) {
      console.log(e);
      addLog('error', `Failed to create stream: ${e?.message || String(e)}`);
      setConnectionStatus('disconnected');
    } finally {
      setBusy(false);
    }
  }, [addLog, ctx, httpUrl, wtUrl]);

  // Connect publisher
  const onConnectPublisher = useCallback(async () => {
    if (!client) {
      addLog('error', 'Client is not initialized. Click "Create Stream" first.');
      return;
    }
    if (!streamInfo) {
      addLog('error', 'No stream available. Click "Create Stream" first.');
      return;
    }

    setBusy(true);
    try {
      addLog('info', `Opening publisher for stream ${streamInfo.id}...`);
      const publisher = await client.stream.publisher(streamInfo.id);
      publisherRef.current = publisher;
      setPublisherConnected(true);
      addLog('success', 'Publisher connected!');
    } catch (e: any) {
      addLog('error', `Failed to connect publisher: ${e?.message || String(e)}`);
    } finally {
      setBusy(false);
    }
  }, [addLog, client, streamInfo]);

  // Send message
  const onSendMessage = useCallback(async () => {
    if (!publisherRef.current) {
      addLog('error', 'Publisher not connected');
      return;
    }
    if (!messageInput) {
      addLog('warning', 'Message is empty');
      return;
    }

    setBusy(true);
    try {
      await publisherRef.current.send({ message: messageInput, index: sentCount });

      const newSentCount = sentCount + 1;
      setSentCount(newSentCount);
      setLastAck(newSentCount - 1);

      addLog('info', `Sent message #${sentCount}: "${messageInput}"`);
      addLog('success', `ACK received: seq=${sentCount}`);
    } catch (e: any) {
      addLog('error', `Failed to send: ${e?.message || String(e)}`);
    } finally {
      setBusy(false);
    }
  }, [addLog, messageInput, sentCount]);

  // Disconnect publisher
  const onDisconnectPublisher = useCallback(async () => {
    try {
      if (publisherRef.current) {
        await publisherRef.current.close();
        publisherRef.current = null;
      }
      setPublisherConnected(false);
      addLog('info', 'Publisher disconnected');
    } catch (e: any) {
      addLog('error', `Error disconnecting: ${e?.message || String(e)}`);
    }
  }, [addLog]);

  // Subscribe to stream
  const onSubscribe = useCallback(async () => {
    if (!client) {
      addLog('error', 'Client is not initialized. Click "Create Stream" first.');
      return;
    }
    if (!streamInfo) {
      addLog('error', 'No stream available. Click "Create Stream" first.');
      return;
    }

    setBusy(true);
    try {
      addLog('info', `Subscribing to stream (live mode)...`);

      setSubscribed(true);
      addLog('success', 'Subscribed! Waiting for messages...');

      // Use the SDK's subscribe method with callback
      client.stream.subscribe(streamInfo.id, (data, error) => {
        if (error) {
          addLog('error', `Subscription error: ${error.message}`);
          return;
        }
        if (data) {
          setReceivedMessages((prev) => [
            ...prev,
            {
              seqNum: prev.length,
              payload: data.data,
              ts: Date.now(),
            },
          ]);
          addLog('data', `Received packet: ${data.data}`);
        }
      });
    } catch (e: any) {
      addLog('error', `Failed to subscribe: ${e?.message || String(e)}`);
      setSubscribed(false);
    } finally {
      setBusy(false);
    }
  }, [addLog, client, streamInfo]);

  // Unsubscribe
  const onUnsubscribe = useCallback(async () => {
    try {
      if (subscriberRef.current) {
        await subscriberRef.current?.close?.();
        subscriberRef.current = null;
      }
      setSubscribed(false);
      addLog('info', 'Unsubscribed');
    } catch (e: any) {
      addLog('error', `Error unsubscribing: ${e?.message || String(e)}`);
    }
  }, [addLog]);

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

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant="h5">⚡ SIS Browser Streaming</Typography>
      <Typography variant="body2" color="text.secondary">
        Stream data from browser using WebTransport
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
          </Stack>

          <LoadingButton variant="contained" loading={busy} onClick={onCreateStream}>
            🚀 Create Stream
          </LoadingButton>

          {streamInfo && (
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.default' }}>
              <Typography variant="caption" display="block">
                <strong>Stream ID:</strong> {streamInfo.id}
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Status:</strong> {streamInfo.status}
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Owner Node:</strong> {streamInfo.ownerNode}
              </Typography>
            </Paper>
          )}
        </Stack>
      </Paper>

      <Stack direction="row" spacing={2}>
        {/* Publish */}
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            📤 Publish
          </Typography>

          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              label="Message"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message here..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && publisherConnected) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
            />

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={onConnectPublisher}
                disabled={busy || !streamInfo || publisherConnected}
              >
                🔌 Connect
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={onSendMessage}
                disabled={busy || !publisherConnected}
              >
                📨 Send
              </Button>
              <Button variant="outlined" color="error" onClick={onDisconnectPublisher} disabled={!publisherConnected}>
                ❌ Disconnect
              </Button>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              Sent: <strong>{sentCount}</strong> | Last ACK: <strong>{lastAck !== null ? `#${lastAck}` : '-'}</strong>
            </Typography>
          </Stack>
        </Paper>

        {/* Subscribe */}
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            📥 Subscribe
          </Typography>

          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Starting Offset (optional)"
              value={offsetInput}
              onChange={(e) => setOffsetInput(e.target.value)}
              placeholder="Leave empty for live mode"
            />

            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={onSubscribe} disabled={busy || !streamInfo || subscribed}>
                ▶️ Subscribe
              </Button>
              <Button variant="outlined" color="error" onClick={onUnsubscribe} disabled={!subscribed}>
                ⏹️ Unsubscribe
              </Button>
            </Stack>

            <Paper variant="outlined" sx={{ p: 1, maxHeight: 150, overflow: 'auto', bgcolor: 'background.default' }}>
              {receivedMessages.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                  No messages yet. Subscribe to start receiving.
                </Typography>
              ) : (
                <List dense disablePadding>
                  {receivedMessages.map((msg) => (
                    <ListItem key={`${msg.seqNum}-${msg.ts}`} disablePadding sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Typography variant="caption" color="primary">
                            Received Packet: #{msg.seqNum}
                          </Typography>
                        }
                        secondary={msg.payload}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Stack>
        </Paper>
      </Stack>

      {/* Event Log */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle1">📋 Event Log</Typography>
          <Button size="small" onClick={clearLogs}>
            Clear
          </Button>
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            maxHeight: 240,
            overflow: 'auto',
            bgcolor: 'background.default',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
          }}
        >
          <Stack spacing={0.5}>
            {logs.length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                No logs yet.
              </Typography>
            ) : (
              logs.map((l) => (
                <Typography key={l.ts} variant="caption" color={getLogColor(l.level)} sx={{ fontFamily: 'monospace' }}>
                  [{new Date(l.ts).toLocaleTimeString()}] {l.message}
                </Typography>
              ))
            )}
          </Stack>
        </Paper>
      </Paper>
    </Stack>
  );
};

export default BrowserStreaming;
