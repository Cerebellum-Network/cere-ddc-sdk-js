import {File, Signer, UriSigner, MB, KB} from '@cere-ddc-sdk/ddc-client';
import {useDropzone} from 'react-dropzone';

import {
    Container,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Button,
    Typography,
    Box,
    CircularProgress,
    Stack,
    TextField,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    styled,
} from '@mui/material';

import {LoadingButton} from '@mui/lab';

import {useClient} from './useClient';
import {useCallback, useEffect, useState} from 'react';
import {USER_SEED} from './constants';
import {createDataStream} from './helpers';

const Dropzone = styled(Box)(({theme}) => ({
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'gray',
    borderRadius: 8,
    width: 500,
    cursor: 'pointer',
}));

export const Playground = () => {
    const bucketId = 0n;
    const dropzone = useDropzone({
        multiple: false,
    });

    const [signer, setSigner] = useState<Signer>();
    const [seed, setSeed] = useState(USER_SEED);
    const [randomFileSize, setRandomFileSize] = useState(150);
    const [randomFileCid, setRandomFileCid] = useState<string>();
    const [realFileCid, setRealFileCid] = useState<string>();
    const [inProgress, setInProgress] = useState(false);
    const [step, setStep] = useState(0);
    const [errorStep, setErrorStep] = useState<number>();
    const isCompleted = !!realFileCid && !!randomFileCid;

    const client = useClient({signer});

    const handleConnectWallet = useCallback(async () => {
        setStep(1);

        const signer = new UriSigner(seed);
        await signer.isReady();

        setSigner(signer);
    }, []);

    const handleRandomFileUpload = useCallback(async () => {
        setInProgress(true);

        const size = randomFileSize * MB;
        const stream = createDataStream(size, 64 * KB);
        const file = new File(stream, {size});

        try {
            const uri = await client!.store(bucketId, file);
            const fileResponse = await client!.read(uri);
            const contentBuffer = await fileResponse.arrayBuffer();

            if (contentBuffer.byteLength !== size) {
                throw new Error('Uploaded size does not match input');
            }

            setRandomFileCid(uri.cid);
            setStep(3);
        } catch (error) {
            setErrorStep(2);

            console.error(error);
        }

        setInProgress(false);
    }, [client, randomFileSize]);

    const handleRealFileUpload = useCallback(async () => {
        setInProgress(true);
        const [acceptedFile] = dropzone.acceptedFiles;

        const file = new File(acceptedFile.stream(), {
            size: acceptedFile.size,
        });

        try {
            const uri = await client!.store(bucketId, file, {
                name: acceptedFile.name,
            });

            const fileResponse = await client!.read(uri);
            const contentBuffer = await fileResponse.arrayBuffer();

            if (contentBuffer.byteLength !== acceptedFile.size) {
                throw new Error('Uploaded size does not match input');
            }

            setRealFileCid(uri.cid);
            setStep(4);
        } catch (error) {
            setErrorStep(3);

            console.error(error);
        }

        setInProgress(false);
    }, [client, dropzone.acceptedFiles]);

    useEffect(() => {
        if (client) {
            setStep(2);
        }
    }, [client]);

    return (
        <Container maxWidth="md" sx={{paddingY: 2}}>
            <Typography variant="h3">DDC SDK Playground</Typography>

            <Box paddingY={1}>
                <Stepper orientation="vertical" activeStep={step}>
                    <Step completed={!!signer}>
                        <StepLabel>Connect wallet</StepLabel>
                        <StepContent>
                            <Stack paddingTop={1} spacing={1} alignItems="start">
                                <TextField
                                    fullWidth
                                    label="Seed phrase"
                                    value={seed}
                                    onChange={(event) => setSeed(event.target.value)}
                                ></TextField>

                                <Button variant="contained" onClick={handleConnectWallet}>
                                    Continue
                                </Button>
                            </Stack>
                        </StepContent>
                    </Step>

                    <Step completed={!!client}>
                        <StepLabel icon={step === 1 && !client ? <CircularProgress size={24} /> : undefined}>
                            Initialize client
                        </StepLabel>
                    </Step>

                    <Step completed={!!randomFileCid}>
                        <StepLabel error={errorStep === 2}>
                            Random file{' '}
                            {randomFileCid && (
                                <Typography color="GrayText" variant="caption">
                                    ({randomFileCid})
                                </Typography>
                            )}
                        </StepLabel>
                        <StepContent>
                            <Stack paddingTop={1} spacing={1} alignItems="start">
                                <Typography variant="body1">Upload and download randomly generate file</Typography>
                                <TextField
                                    value={randomFileSize || ''}
                                    label="File size"
                                    type="number"
                                    onChange={(event) => setRandomFileSize(+event.target.value)}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">MB</InputAdornment>,
                                    }}
                                ></TextField>
                                <LoadingButton
                                    disabled={randomFileSize === 0}
                                    loading={inProgress}
                                    variant="contained"
                                    onClick={handleRandomFileUpload}
                                >
                                    Continue
                                </LoadingButton>
                            </Stack>
                        </StepContent>
                    </Step>

                    <Step>
                        <StepLabel error={errorStep === 3}>
                            Real file{' '}
                            {realFileCid && (
                                <Typography color="GrayText" variant="caption">
                                    ({realFileCid})
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

                                <LoadingButton
                                    disabled={!dropzone.acceptedFiles.length}
                                    loading={inProgress}
                                    variant="contained"
                                    onClick={handleRealFileUpload}
                                >
                                    Continue
                                </LoadingButton>
                            </Stack>
                        </StepContent>
                    </Step>

                    <Step completed={isCompleted} expanded={isCompleted}>
                        <StepLabel>Done!</StepLabel>
                        <StepContent>
                            <Stack spacing={1}>
                                <Typography>We have successfully uploaded the following files:</Typography>
                                <List disablePadding>
                                    {randomFileCid && (
                                        <ListItem disablePadding>
                                            <ListItemText
                                                primary={`Random file (${randomFileSize.toFixed(2)} MB)`}
                                                secondary={randomFileCid}
                                            />
                                        </ListItem>
                                    )}

                                    {dropzone.acceptedFiles.map((file, index) => (
                                        <ListItem disablePadding key={index}>
                                            <ListItemText
                                                primary={`${file.name} (${(file.size / MB).toFixed(2)} MB)`}
                                                secondary={realFileCid}
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
