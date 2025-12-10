import { useState } from 'react';
import { Box, Stack, Typography, Divider, Button } from '@mui/material';
import { Playground } from './Playground';
import { BrowserStreaming } from './BrowserStreaming';

export const Main = () => {
  const [showPlayground, setShowPlayground] = useState(false);
  const [showBrowserStreaming, setShowBrowserStreaming] = useState(false);

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

        {showPlayground && showBrowserStreaming && <Divider />}

        {showBrowserStreaming && (
          <Box>
            <Typography variant="h4" gutterBottom>
              Browser Streaming
            </Typography>
            <BrowserStreaming />
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default Main;
