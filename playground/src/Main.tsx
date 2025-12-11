
import { useState } from 'react';
import { Box, Stack, Typography, Divider, Button } from '@mui/material';
import { Playground } from './Playground';
import { BrowserStreaming } from './BrowserStreaming';
import { RecordPage } from './RecordPage';

export const Main = () => {
  const [showPlayground, setShowPlayground] = useState(false);
  const [showBrowserStreaming, setShowBrowserStreaming] = useState(false);
  const [showRecordPage, setShowRecordPage] = useState(false);

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2} direction="row" sx={{ mb: 4 }}>
        <Button
          variant="contained"
          onClick={() => setShowPlayground(!showPlayground)}
        >
          {showPlayground ? 'Hide' : 'Load'} DDC Playground
        </Button>
        <Button
          variant="contained"
          onClick={() => setShowBrowserStreaming(!showBrowserStreaming)}
        >
          {showBrowserStreaming ? 'Hide' : 'Load'} Browser Streaming
        </Button>
        <Button
          variant="contained"
          onClick={() => setShowRecordPage(!showRecordPage)}
        >
          {showRecordPage ? 'Hide' : 'Load'} Audio Recording
        </Button>
      </Stack>

      <Stack spacing={4}>
        {showPlayground && (
          <Box>
            <Typography variant="h4" gutterBottom>
              DDC Playground
            </Typography>
            <Playground />
          </Box>
        )}

        {showPlayground && (showBrowserStreaming || showRecordPage) && <Divider />}

        {showBrowserStreaming && (
          <Box>
            <Typography variant="h4" gutterBottom>
              Browser Streaming
            </Typography>
            <BrowserStreaming />
          </Box>
        )}

        {showBrowserStreaming && showRecordPage && <Divider />}

        {showRecordPage && (
          <Box>
            <Typography variant="h4" gutterBottom>
              Audio Recording
            </Typography>
            <RecordPage />
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default Main;
