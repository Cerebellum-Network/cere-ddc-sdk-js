import ReactDOM from 'react-dom/client';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

import { Playground } from './Playground';

const theme = createTheme({
  typography: {
    button: {
      textTransform: 'none',
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Playground />
  </ThemeProvider>,
);
