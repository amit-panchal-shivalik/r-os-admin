
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { store } from './store/store';
import App from './App.tsx';
import './index.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';

const theme = createTheme({
  primaryColor: 'gray',
  fontFamily: 'Bricolage Grotesque, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  headings: {
    fontFamily: 'Bricolage Grotesque, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: '700',
  },
  colors: {
    gray: [
      '#f8f9fa',
      '#e9ecef',
      '#dee2e6',
      '#ced4da',
      '#adb5bd',
      '#6c757d',
      '#495057',
      '#343a40',
      '#212529',
      '#000000'
    ],
    dark: [
      '#f8f9fa',
      '#e9ecef',
      '#dee2e6',
      '#ced4da',
      '#adb5bd',
      '#6c757d',
      '#495057',
      '#343a40',
      '#212529',
      '#000000'
    ],
  },
  components: {
    Paper: {
      defaultProps: {
        shadow: 'none',
        radius: '12',
        style: {
          border: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
        }
      },
    },
    Card: {
      defaultProps: {
        shadow: 'none',
        radius: '12',
        style: {
          border: '1px solid #e5e7eb',
        }
      },
    },
    Button: {
      defaultProps: {
        radius: '8',
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <MantineProvider theme={theme}>
      <Notifications />
      <App />
    </MantineProvider>
  </Provider>
);
