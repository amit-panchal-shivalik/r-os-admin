import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { store } from './store/store';
import App from './App.tsx';
import './index.css';

const antdTheme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      borderRadius: 8,
    },
    Card: {
      borderRadius: 12,
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
  },
};

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ConfigProvider theme={antdTheme}>
      <App />
    </ConfigProvider>
  </Provider>
);
