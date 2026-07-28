import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { LoadingButton } from '@mui/lab';
import { EmbedWallet } from '@cere/embed-wallet';
import FileIcon from '@mui/icons-material/InsertDriveFileOutlined';
import {
  connect,
  decodeAddress,
  CERE_WS,
  type CereClient,
  type CereNetwork,
  type BucketId,
  type ClusterId,
  type SignerType,
  Web3Signer,
  CereWalletSigner,
} from '@cere-ddc-sdk/blockchain';

import { File, Signer, UriSigner, MB, DdcClient, DagNode, Link, DagNodeUri } from '@cere-ddc-sdk/ddc-client';

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
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';

import { CERE, USER_SEED } from './constants';
import { createDataStream } from './helpers';

const hexToU8a = (hex: string) => {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }

  return bytes;
};

const u8aToHex = (bytes: Uint8Array) => `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;

const SIGNER_TYPES: readonly SignerType[] = ['ed25519', 'sr25519', 'ecdsa', 'ethereum'];

/** Narrows an `EmbedWallet` account's key type to a papi `SignerType`, when recognized. */
const isSignerType = (type?: string): type is SignerType => SIGNER_TYPES.includes(type as SignerType);

/**
 * Adapts a connected `EmbedWallet` account into a chain-free papi `CereWalletSigner`.
 * `EmbedWallet`'s `Signer.signMessage` only signs/returns strings (encoding
 * unspecified), so bytes are hex-encoded going in and hex-decoded coming back —
 * a pragmatic bridge for this demo, not a guaranteed-stable wire format.
 */
const toCereWalletSigner = async (wallet: EmbedWallet) => {
  await wallet.connect();

  const [account] = await wallet.getAccounts();

  if (!account) {
    throw new Error('Cere Wallet has no connected accounts');
  }

  const walletSigner = wallet.getSigner({ address: account.address });
  const publicKey = decodeAddress(account.address);
  // Derive the signer's key type from the connected account; fall back to
  // `sr25519` (CereWalletSigner's own default) when the account exposes no
  // key type recognized by papi's `SignerType`.
  const type = isSignerType(account.type) ? account.type : 'sr25519';

  return new CereWalletSigner(
    account.address,
    publicKey,
    async (bytes) => hexToU8a(await walletSigner.signMessage(u8aToHex(bytes))),
    type,
  );
};

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

/**
 * Public storage/CDN endpoints per network. The SDK itself has no baked-in
 * presets (single-cluster config), but the playground keeps this small map as
 * an app-level convenience so picking "Testnet" etc. still fills in sensible
 * defaults; `custom` lets the user type all three (+ the RPC URL) by hand.
 */
const NETWORK_ENDPOINTS: Record<CereNetwork, { storageUrl: string; cdnUrl: string }> = {
  devnet: { storageUrl: 'https://storage.devnet.dragon-1.xyz', cdnUrl: 'https://cdn.devnet.dragon-1.xyz' },
  testnet: { storageUrl: 'https://storage.testnet.dragon-1.xyz', cdnUrl: 'https://cdn.testnet.dragon-1.xyz' },
  mainnet: { storageUrl: 'https://storage.dragon-1.xyz', cdnUrl: 'https://cdn.dragon-1.xyz' },
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
  const [bcCustomUrl, setBcCustomUrl] = useState(__BC_ENDPOINT__ || '');
  const [clusterId, setClusterId] = useState('');
  const [customStorageUrl, setCustomStorageUrl] = useState('http://localhost:8091');
  const [customCdnUrl, setCustomCdnUrl] = useState('');
  const [storageUrl, setStorageUrl] = useState<string>();
  const [cdnUrl, setCdnUrl] = useState<string>();
  const [bucketId, setBucketId] = useState<BucketId | undefined>();
  const [isNewBucket, setIsNewBucket] = useState(false);
  const [balance, setBalance] = useState<string>();
  const [deposit, setDeposit] = useState<string>();
  const [extraDeposit, setExtraDeposit] = useState<number>(0);
  const [client, setClient] = useState<DdcClient>();
  const [blockchain, setBlockchain] = useState<CereClient>();

  const isCompleted = !!realFileCid && !!randomFileCid;

  const getFileUrlByName = (name: string) => [cdnUrl || storageUrl, bucketId, cnsName, name].join('/');
  const getFileUrlByCid = (cid: string) => [cdnUrl || storageUrl, bucketId, cid].join('/');

  const cereWallet = useMemo(() => new EmbedWallet({ env: 'dev', appId: 'ddc-playground' }), []);
  const handleSkip = useCallback(() => {
    setErrorStep(undefined);
    setStep(step + 1);
  }, [step]);

  const handleConnectWallet = useCallback(async () => {
    setInProgress(true);

    let signer: Signer | undefined;

    try {
      if (signerType === 'cere-wallet') {
        if (cereWallet.status === 'not-ready') {
          await cereWallet.init();
        }

        signer = await toCereWalletSigner(cereWallet);
      }

      if (signerType === 'extension') {
        [signer] = await Web3Signer.fromExtension('polkadot-js');
      }

      if (signerType === 'seed') {
        signer = new UriSigner(seed);
      }

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
      // Bucket creation targets the client's configured `clusterId` (single-cluster SDK).
      const newBucketId = await client!.createBucket({
        isPublic: true,
      });

      setBucketId(newBucketId);
      setStep(step + 1);
    } catch (error) {
      setErrorStep(step);
    }

    setInProgress(false);
  }, [bucketId, client, isNewBucket, step]);

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
      setErrorStep(4);
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
      setErrorStep(5);
    }

    setInProgress(false);
  }, [client, bucketId, dropzone.acceptedFiles, step]);

  const handleInitClient = useCallback(async () => {
    if (!clusterId) return;

    const endpoints =
      selectedBc === 'custom'
        ? { storageUrl: customStorageUrl, cdnUrl: customCdnUrl || undefined }
        : NETWORK_ENDPOINTS[selectedBc];

    try {
      setInProgress(true);
      const blockchain = selectedBc === 'custom' ? connect(bcCustomUrl) : connect({ network: selectedBc });
      const client = await DdcClient.create(signer!, {
        blockchain,
        logLevel: 'debug',
        clusterId: clusterId as ClusterId,
        storageUrl: endpoints.storageUrl,
        cdnUrl: endpoints.cdnUrl,
      });
      const [depositAmount, balanceAmount] = await Promise.all([client.getDeposit(), client.getBalance()]);

      setBlockchain(blockchain);
      setClient(client);
      setStorageUrl(endpoints.storageUrl);
      setCdnUrl(endpoints.cdnUrl);
      setBalance(await blockchain.chain.formatBalance(balanceAmount, false));
      setDeposit(await blockchain.chain.formatBalance(depositAmount, false));
      setStep(step + 1);
    } catch (error) {
      setErrorStep(step);
    }

    setInProgress(false);
  }, [selectedBc, step, bcCustomUrl, customStorageUrl, customCdnUrl, clusterId, signer]);

  const handleDeposit = useCallback(async () => {
    try {
      setInProgress(true);
      await client!.depositBalance(BigInt(extraDeposit) * CERE);
      const updatedDeposit = await client!.getDeposit();
      setDeposit(await blockchain!.chain.formatBalance(updatedDeposit, false));
      setStep(step + 1);
    } catch (error) {
      setErrorStep(step);
    }

    setInProgress(false);
  }, [client, blockchain, extraDeposit, step]);

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
                  {clusterId ? ` (${clusterId})` : ''}
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
                    label="RPC URL"
                    placeholder="wss://..."
                    value={selectedBc === 'custom' ? bcCustomUrl : CERE_WS[selectedBc]}
                    onChange={(event) => setBcCustomUrl(event.target.value)}
                    InputProps={{
                      readOnly: selectedBc !== 'custom',
                    }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Cluster ID"
                    placeholder="0x..."
                    value={clusterId}
                    onChange={(event) => setClusterId(event.target.value)}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="url"
                    label="Storage URL"
                    value={selectedBc === 'custom' ? customStorageUrl : NETWORK_ENDPOINTS[selectedBc].storageUrl}
                    onChange={(event) => setCustomStorageUrl(event.target.value)}
                    InputProps={{
                      readOnly: selectedBc !== 'custom',
                    }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="url"
                    label="CDN URL (optional)"
                    value={selectedBc === 'custom' ? customCdnUrl : NETWORK_ENDPOINTS[selectedBc].cdnUrl}
                    onChange={(event) => setCustomCdnUrl(event.target.value)}
                    InputProps={{
                      readOnly: selectedBc !== 'custom',
                    }}
                  />
                </Stack>

                <LoadingButton
                  loading={inProgress}
                  disabled={!clusterId}
                  variant="contained"
                  onClick={handleInitClient}
                >
                  Continue
                </LoadingButton>
              </Stack>
            </StepContent>
          </Step>

          <Step completed={!!deposit && Number(deposit) > 0 && step > 2}>
            <StepLabel error={errorStep === 2}>Make deposit</StepLabel>
            <StepContent>
              <Stack spacing={2} alignItems="start">
                <Stack spacing={0}>
                  <Typography variant="body2">Balance: {balance}</Typography>
                  <Typography variant="body2">Deposit: {deposit || '0'}</Typography>
                  <Typography variant="body2">Cluster: {clusterId}</Typography>
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

          <Step completed={!!bucketId && step > 3}>
            <StepLabel error={errorStep === 3}>
              Select bucket
              {!!bucketId && step > 3 && (
                <Typography color="GrayText" variant="caption">
                  {' - '}
                  {bucketId.toString()}
                </Typography>
              )}
            </StepLabel>
            <StepContent>
              <Stack width={450} paddingTop={1} spacing={2} alignItems="start">
                <Typography variant="body2">Cluster: {clusterId}</Typography>

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
            <StepLabel error={errorStep === 4}>
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
            <StepLabel error={errorStep === 5}>
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
