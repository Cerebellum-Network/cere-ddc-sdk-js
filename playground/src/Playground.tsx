import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { LoadingButton } from '@mui/lab';
import { EmbedWallet } from '@cere/embed-wallet';
import FileIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { Blockchain, Cluster, BucketId, ClusterId, Web3Signer, CereWalletSigner } from '@cere-ddc-sdk/blockchain';

import {
  File,
  Signer,
  UriSigner,
  MB,
  DEVNET,
  TESTNET,
  MAINNET,
  DdcClient,
  DagNode,
  Link,
  DagNodeUri,
} from '@cere-ddc-sdk/ddc-client';

import {
  Container,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Box,
  Stack,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  styled,
  Link as MuiLink,
  ListItemIcon,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';

import { CERE, USER_SEED } from './constants';
import { createDataStream } from './helpers';

const Dropzone = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[100],
  borderWidth: 1,
  borderStyle: 'dashed',
  borderColor: 'gray',
  borderRadius: 8,
  width: 500,
  cursor: 'pointer',
}));

const bcPresets = {
  devnet: { ...DEVNET, baseUrl: 'https://storage.devnet.cere.network' },
  testnet: { ...TESTNET, baseUrl: 'https://storage.testnet.cere.network' },
  mainnet: { ...MAINNET, baseUrl: 'https://storage.dragon.cere.network' },
  custom: {
    blockchain: __BC_ENDPOINT__ || '',
    baseUrl: 'http://localhost:8091',
  },
};

export const Playground = () => {
  const cnsName = 'ddc-playground';
  const dropzone = useDropzone({
    multiple: false,
  });

  const [signerType, setSignerType] = useState<'seed' | 'extension' | 'cere-wallet'>('seed');
  const [signerError, setSignerError] = useState(false);

  const [signer, setSigner] = useState<Signer>();
  const [seed, setSeed] = useState(USER_SEED);
  const [randomFileSize, setRandomFileSize] = useState(150);
  const [randomFileCid, setRandomFileCid] = useState<string>();
  const [realFileCid, setRealFileCid] = useState<string>();
  const [inProgress, setInProgress] = useState(false);
  const [step, setStep] = useState(0);
  const [errorStep, setErrorStep] = useState<number>();
  const [selectedBc, setSelectedBc] = useState<'devnet' | 'testnet' | 'mainnet' | 'custom'>('devnet');
  const [bcCustomUrl, setBcCustomUrl] = useState(bcPresets.custom.blockchain);
  const [clusterId, setClusterId] = useState<string>();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [bucketId, setBucketId] = useState<BucketId | undefined>();
  const [isNewBucket, setIsNewBucket] = useState(false);
  const [balance, setBalance] = useState<string>();
  const [deposit, setDeposit] = useState<string>();
  const [extraDeposit, setExtraDeposit] = useState<number>(0);
  const [client, setClient] = useState<DdcClient>();
  const [blockchain, setBlockchain] = useState<Blockchain>();

  const isCompleted = !!realFileCid && !!randomFileCid;
  const currentClusterId = clusterId || clusters[0]?.clusterId;

  const getFileUrlByName = (name: string) => [bcPresets[selectedBc].baseUrl, bucketId, cnsName, name].join('/');
  const getFileUrlByCid = (cid: string) => [bcPresets[selectedBc].baseUrl, bucketId, cid].join('/');

  const cereWallet = useMemo(() => new EmbedWallet({ env: 'dev', appId: 'ddc-playground' }), []);
  const handleSkip = useCallback(() => {
    setErrorStep(undefined);
    setStep(step + 1);
  }, [step]);

  const handleConnectWallet = useCallback(async () => {
    setInProgress(true);

    let signer: Signer | undefined;

    if (signerType === 'cere-wallet') {
      if (cereWallet.status === 'not-ready') {
        await cereWallet.init();
      }

      signer = new CereWalletSigner(cereWallet);
    }

    if (signerType === 'extension') {
      signer = new Web3Signer();
    }

    if (signerType === 'seed') {
      signer = new UriSigner(seed);
    }

    try {
      await signer?.isReady();
      setStep(1);
    } catch (error) {
      console.error(error);

      setSignerError(true);
      setErrorStep(0);

      return;
    } finally {
      setInProgress(false);
    }

    setSigner(signer);
  }, [cereWallet, seed, signerType]);

  const handleSelectBucket = useCallback(async () => {
    if (bucketId && !isNewBucket) {
      return setStep(step + 1);
    }

    try {
      setInProgress(true);
      const newBucketId = await client!.createBucket(currentClusterId as ClusterId, {
        isPublic: true,
      });

      setBucketId(newBucketId);
      setStep(step + 1);
    } catch (error) {
      setErrorStep(step);
    }

    setInProgress(false);
  }, [bucketId, client, currentClusterId, isNewBucket, step]);

  const handleRandomFileUpload = useCallback(async () => {
    setInProgress(true);

    const size = randomFileSize * MB;
    const stream = createDataStream(size);
    const file = new File(stream, { size });

    try {
      const uri = await client!.store(bucketId!, file);
      const fileResponse = await client!.read(uri);
      const contentBuffer = await fileResponse.arrayBuffer();

      if (contentBuffer.byteLength !== size) {
        throw new Error('Uploaded size does not match input');
      }

      setRandomFileCid(uri.cid);
      setStep(step + 1);
    } catch (error) {
      setErrorStep(5);
    }

    setInProgress(false);
  }, [client, bucketId, randomFileSize, step]);

  const handleRealFileUpload = useCallback(async () => {
    setInProgress(true);
    const [acceptedFile] = dropzone.acceptedFiles;

    try {
      const dagNodeData = JSON.stringify({ createTime: Date.now() });
      const existingDagNode = await client!
        .read(new DagNodeUri(bucketId!, cnsName))
        .catch(() => new DagNode(dagNodeData));

      const file = new File(acceptedFile.stream(), { size: acceptedFile.size });
      const uri = await client!.store(bucketId!, file);
      const fileLink = new Link(uri.cid, acceptedFile.size, acceptedFile.name);

      /**
       * Create new DagNode from existing one with new file link and store it by new CID under the same CNS name.
       */
      const dagNode = new DagNode(dagNodeData, [
        ...existingDagNode.links.filter((link) => link.name !== acceptedFile.name),
        fileLink,
      ]);

      await client!.store(bucketId!, dagNode, { name: cnsName });
      const fileResponse = await client!.read(uri);
      const contentBuffer = await fileResponse.arrayBuffer();

      if (contentBuffer.byteLength !== acceptedFile.size) {
        throw new Error('Uploaded size does not match input');
      }

      setRealFileCid(uri.cid);
      setStep(step + 1);
    } catch (error) {
      setErrorStep(6);
    }

    setInProgress(false);
  }, [client, bucketId, dropzone.acceptedFiles, step]);

  const handleInitClient = useCallback(async () => {
    const preset = bcPresets[selectedBc];

    if (selectedBc === 'custom') {
      preset.blockchain = bcCustomUrl;
    }

    try {
      setInProgress(true);
      const blockchain = await Blockchain.connect({ wsEndpoint: preset.blockchain });
      const client = await DdcClient.create(signer!, { ...preset, blockchain, logLevel: 'debug' });
      const [clusters, balance] = await Promise.all([blockchain.ddcClusters.listClusters(), client.getBalance()]);

      setBlockchain(blockchain);
      setClient(client);
      setClusters(clusters);
      setBalance(blockchain.formatBalance(balance, false));
      setStep(step + 1);
    } catch (error) {
      setErrorStep(step);
    }

    setInProgress(false);
  }, [selectedBc, step, bcCustomUrl, signer]);

  const handleClusterSelect = useCallback(async () => {
    if (!currentClusterId) return;

    try {
      setInProgress(true);
      const deposit = await client!.getDeposit(currentClusterId as ClusterId);
      setDeposit(blockchain!.formatBalance(deposit, false));
      setStep(step + 1);
    } catch (error) {
      setErrorStep(step);
    }

    setInProgress(false);
  }, [client, blockchain, currentClusterId, step]);

  const handleDeposit = useCallback(async () => {
    if (!currentClusterId) return;

    try {
      setInProgress(true);
      await client!.depositBalance(currentClusterId as ClusterId, BigInt(extraDeposit) * CERE);
      const updatedDeposit = await client!.getDeposit(currentClusterId as ClusterId);
      setDeposit(blockchain!.formatBalance(updatedDeposit, false));
      setStep(step + 1);
    } catch (error) {
      setErrorStep(step);
    }

    setInProgress(false);
  }, [client, blockchain, currentClusterId, extraDeposit, step]);

  return (
    <Container maxWidth="md" sx={{ paddingY: 2 }}>
      <Typography variant="h3">DDC SDK Playground</Typography>

      <Box paddingY={1}>
        <Stepper orientation="vertical" activeStep={step}>
          <Step completed={!!signer}>
            <StepLabel>
              Connect wallet
              {signer && (
                <Typography color="GrayText" variant="caption">
                  {' - '}
                  {signer.address}
                </Typography>
              )}
            </StepLabel>
            <StepContent>
              <Stack spacing={1} width={450}>
                <ToggleButtonGroup
                  exclusive
                  fullWidth
                  size="small"
                  value={signerType}
                  onChange={(event, value) => value && setSignerType(value)}
                >
                  <ToggleButton value="seed">Seed phrase</ToggleButton>
                  <ToggleButton value="extension">Browser extension</ToggleButton>
                  <ToggleButton value="cere-wallet">Cere Wallet</ToggleButton>
                </ToggleButtonGroup>

                {signerType === 'seed' && (
                  <TextField
                    fullWidth
                    size="small"
                    value={seed}
                    onChange={(event) => setSeed(event.target.value)}
                  ></TextField>
                )}

                {!signerError && signerType === 'extension' && (
                  <Alert severity="info">
                    Connect your browser extension to continue. The extension will ask you to authorize the connection.
                  </Alert>
                )}

                {signerError && signerType === 'extension' && (
                  <Alert severity="warning">
                    Compatible browser extensions are not detected or the app is not authorized.
                  </Alert>
                )}

                {!signerError && signerType === 'cere-wallet' && (
                  <>
                    <Alert severity="info">Connect Cere Wallet to continue.</Alert>
                  </>
                )}

                {signerError && signerType === 'cere-wallet' && (
                  <Alert severity="warning">Cere Wallet is not connected or the app is not authorized.</Alert>
                )}
              </Stack>

              <Stack paddingTop={2} spacing={2} alignItems="start">
                <LoadingButton loading={inProgress} variant="contained" onClick={handleConnectWallet}>
                  {signerType === 'seed' ? 'Continue' : signerError ? 'Retry' : 'Connect'}
                </LoadingButton>
              </Stack>
            </StepContent>
          </Step>

          <Step completed={!!client}>
            <StepLabel>
              Initialize client
              {selectedBc && step > 1 && (
                <Typography color="GrayText" variant="caption" textTransform="capitalize">
                  {' - '}
                  {selectedBc}
                </Typography>
              )}
            </StepLabel>

            <StepContent>
              <Stack spacing={2} alignItems="start">
                <Stack spacing={1} width={450}>
                  <ToggleButtonGroup
                    exclusive
                    fullWidth
                    size="small"
                    value={selectedBc}
                    onChange={(event, value) => value && setSelectedBc(value)}
                  >
                    <ToggleButton value="devnet">Devnet</ToggleButton>
                    <ToggleButton value="testnet">Testnet</ToggleButton>
                    <ToggleButton value="mainnet">Mainnet</ToggleButton>
                    <ToggleButton value="custom">Custom</ToggleButton>
                  </ToggleButtonGroup>
                  <TextField
                    fullWidth
                    size="small"
                    type="url"
                    placeholder="wss://..."
                    value={selectedBc === 'custom' ? bcCustomUrl : bcPresets[selectedBc].blockchain}
                    onChange={(event) => setBcCustomUrl(event.target.value)}
                    InputProps={{
                      readOnly: selectedBc !== 'custom',
                    }}
                  />
                </Stack>

                <LoadingButton loading={inProgress} variant="contained" onClick={handleInitClient}>
                  Continue
                </LoadingButton>
              </Stack>
            </StepContent>
          </Step>

          <Step completed={!!currentClusterId && step > 2}>
            <StepLabel error={errorStep === 2}>
              Select cluster
              {currentClusterId && step > 2 && (
                <Typography color="GrayText" variant="caption">
                  {' - '}
                  {currentClusterId}
                </Typography>
              )}
            </StepLabel>
            <StepContent>
              {clusters.length === 0 && (
                <Alert severity="warning" sx={{ marginBottom: 1 }}>
                  No clusters found on the selected blockchain.
                </Alert>
              )}

              <Stack width={450} paddingTop={1} spacing={2} alignItems="start">
                {!!clusters.length && (
                  <FormControl fullWidth size="small">
                    <InputLabel>Cluster</InputLabel>
                    <Select
                      label="Cluster"
                      value={currentClusterId}
                      onChange={(event) => setClusterId(event.target.value)}
                    >
                      {clusters.map(({ clusterId }) => (
                        <MenuItem key={clusterId} value={clusterId}>
                          {clusterId}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <Stack direction="row" spacing={1}>
                  <LoadingButton
                    loading={inProgress}
                    disabled={!currentClusterId}
                    variant="contained"
                    onClick={handleClusterSelect}
                  >
                    Continue
                  </LoadingButton>
                </Stack>
              </Stack>
            </StepContent>
          </Step>

          <Step completed={!!deposit && Number(deposit) > 0 && step > 3}>
            <StepLabel error={errorStep === 3}>Make deposit</StepLabel>
            <StepContent>
              <Stack spacing={2} alignItems="start">
                <Stack spacing={0}>
                  <Typography variant="body2">Balance: {balance}</Typography>
                  <Typography variant="body2">Deposit: {deposit || '0'}</Typography>
                  <Typography variant="body2">Cluster: {currentClusterId}</Typography>
                </Stack>

                {Number(deposit) > 0 ? (
                  <Alert severity="info">
                    You already have a deposit in this cluster, so you can either add an additional deposit or skip this
                    step
                  </Alert>
                ) : (
                  <Alert severity="warning">
                    You need to have a positive deposit in this cluster in order to create buckets in future steps.
                  </Alert>
                )}

                <TextField
                  size="small"
                  type="number"
                  value={extraDeposit || ''}
                  onChange={(event) => setExtraDeposit(+event.target.value)}
                  label={Number(deposit) ? 'Extra deposit amount' : 'Deposit amount'}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">CERE</InputAdornment>,
                  }}
                />

                <Stack direction="row" spacing={1}>
                  <LoadingButton
                    disabled={!extraDeposit}
                    loading={inProgress}
                    variant="contained"
                    onClick={handleDeposit}
                  >
                    Continue
                  </LoadingButton>
                  <Button variant="outlined" disabled={inProgress} onClick={handleSkip}>
                    Skip
                  </Button>
                </Stack>
              </Stack>
            </StepContent>
          </Step>

          <Step completed={!!bucketId && step > 4}>
            <StepLabel error={errorStep === 4}>
              Select bucket
              {!!bucketId && step > 4 && (
                <Typography color="GrayText" variant="caption">
                  {' - '}
                  {bucketId.toString()}
                </Typography>
              )}
            </StepLabel>
            <StepContent>
              <Stack width={450} paddingTop={1} spacing={2} alignItems="start">
                <Typography variant="body2">Cluster: {currentClusterId}</Typography>

                <Stack spacing={1} direction="row" alignSelf="stretch">
                  <TextField
                    label="Bucket ID"
                    size="small"
                    type="number"
                    disabled={isNewBucket}
                    value={isNewBucket ? '' : bucketId?.toString() || ''}
                    onChange={(event) => setBucketId(event.target.value ? BigInt(event.target.value) : undefined)}
                  />

                  <FormControlLabel
                    label="Create new"
                    sx={{ whiteSpace: 'nowrap' }}
                    control={
                      <Checkbox checked={isNewBucket} onChange={(event) => setIsNewBucket(event.target.checked)} />
                    }
                  />
                </Stack>

                <Stack direction="row" spacing={1}>
                  <LoadingButton
                    loading={inProgress}
                    disabled={!bucketId && !isNewBucket}
                    variant="contained"
                    onClick={handleSelectBucket}
                  >
                    Continue
                  </LoadingButton>
                </Stack>
              </Stack>
            </StepContent>
          </Step>

          <Step completed={!!randomFileCid}>
            <StepLabel error={errorStep === 5}>
              Random file
              {randomFileCid && (
                <Typography color="GrayText" variant="caption">
                  {' - '}
                  {randomFileCid}
                </Typography>
              )}
            </StepLabel>
            <StepContent>
              <Stack paddingTop={1} spacing={2} alignItems="start">
                <Typography variant="body1">Upload and download randomly generated file</Typography>
                <TextField
                  value={randomFileSize || ''}
                  label="File size"
                  type="number"
                  onChange={(event) => setRandomFileSize(+event.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">MB</InputAdornment>,
                  }}
                ></TextField>

                <Stack direction="row" spacing={1}>
                  <LoadingButton
                    disabled={randomFileSize === 0}
                    loading={inProgress}
                    variant="contained"
                    onClick={handleRandomFileUpload}
                  >
                    Continue
                  </LoadingButton>
                  <Button variant="outlined" disabled={inProgress} onClick={handleSkip}>
                    Skip
                  </Button>
                </Stack>
              </Stack>
            </StepContent>
          </Step>

          <Step completed={!!realFileCid}>
            <StepLabel error={errorStep === 6}>
              Real file
              {realFileCid && (
                <Typography color="GrayText" variant="caption">
                  {' - '}
                  {realFileCid}
                </Typography>
              )}
            </StepLabel>
            <StepContent>
              <Stack paddingTop={1} spacing={1} alignItems="start">
                <Dropzone {...dropzone.getRootProps()}>
                  <input {...dropzone.getInputProps()} />

                  <List>
                    {dropzone.acceptedFiles.length ? (
                      dropzone.acceptedFiles.map((file, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primaryTypographyProps={{
                              maxWidth: 420,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            primary={file.name}
                            secondary={`${(file.size / MB).toFixed(3)} MB`}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText primary="Drag and drop a file here, or click to select one" />
                      </ListItem>
                    )}
                  </List>
                </Dropzone>

                <Stack direction="row" spacing={1}>
                  <LoadingButton
                    disabled={!dropzone.acceptedFiles.length}
                    loading={inProgress}
                    variant="contained"
                    onClick={handleRealFileUpload}
                  >
                    Continue
                  </LoadingButton>
                  <Button variant="outlined" disabled={inProgress} onClick={handleSkip}>
                    Skip
                  </Button>
                </Stack>
              </Stack>
            </StepContent>
          </Step>

          <Step completed={isCompleted} expanded={isCompleted}>
            <StepLabel>Done!</StepLabel>
            <StepContent>
              <Stack spacing={2}>
                {randomFileCid || realFileCid ? (
                  <Typography>We have successfully uploaded the following files:</Typography>
                ) : (
                  <Typography>
                    You did not upload anything to DDC...{' '}
                    <MuiLink href="#" onClick={(event) => (event.preventDefault(), setStep(2))}>
                      Go back
                    </MuiLink>{' '}
                    and try again.
                  </Typography>
                )}

                <List disablePadding>
                  {randomFileCid && (
                    <ListItem disablePadding>
                      <ListItemIcon>
                        <FileIcon sx={{ fontSize: 40 }} />
                      </ListItemIcon>

                      <ListItemText
                        primary={`Random file (${randomFileSize.toFixed(2)} MB)`}
                        secondary={
                          <MuiLink color="inherit" target="_blank" href={getFileUrlByCid(randomFileCid!)}>
                            {randomFileCid}
                          </MuiLink>
                        }
                      />
                    </ListItem>
                  )}

                  {dropzone.acceptedFiles.map((file, index) => (
                    <ListItem disablePadding key={index}>
                      <ListItemIcon>
                        <FileIcon sx={{ fontSize: 40 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1}>
                            <MuiLink
                              maxWidth={500}
                              textOverflow="ellipsis"
                              overflow="hidden"
                              target="_blank"
                              href={getFileUrlByName(file.name)}
                            >
                              {file.name}
                            </MuiLink>
                            <Typography>({(file.size / MB).toFixed(2)} MB)</Typography>
                          </Stack>
                        }
                        secondary={
                          <MuiLink color="inherit" target="_blank" href={getFileUrlByCid(realFileCid!)}>
                            {realFileCid}
                          </MuiLink>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Stack>
            </StepContent>
          </Step>
        </Stepper>
      </Box>
    </Container>
  );
};
