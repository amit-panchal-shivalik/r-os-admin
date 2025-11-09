import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { AppRoutes } from './routing/AppRoutes';
import { Toaster } from './components/ui/toaster';

// Main App
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Mount the Toaster once at app root so useToast() toasts are visible */}
        <Toaster />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
