import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import AlertContainer from './components/ui/AlertContainer';
import './App.css';

// Initialize Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// This code is for all users
window.__TANSTACK_QUERY_CLIENT__ = queryClient;

// 🕵️ DEBUG: Global Query Cache Logger
queryClient.getQueryCache().subscribe((event) => {
  if (event.type === 'updated' && event.action.type === 'success') {
    console.groupCollapsed(`📦 Cache Updated: ${JSON.stringify(event.query.queryKey)}`);
    console.log('Data:', event.action.data);
    console.log('Query Instance:', event.query);
    console.groupEnd();
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router
          basename={import.meta.env.BASE_URL}
        >
          <AuthProvider>
            <AppRoutes />
            <AlertContainer />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
