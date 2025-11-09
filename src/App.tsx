import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { TerritoryProvider } from './context/TerritoryContext';
import { AppRoutes } from './routing/AppRoutes';
import ChatWidget from '@/components/chat/ChatWidget';
import { Toaster } from '@/components/ui/toaster';

// Main App
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TerritoryProvider>
          <AppRoutes />
          <Toaster />
          <ChatWidget />
        </TerritoryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
