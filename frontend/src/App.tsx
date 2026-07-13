import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { ToastProvider } from './components/ui/Toast.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { RootLayout } from './layouts/RootLayout.js';
import { ProtectedRoute } from './layouts/ProtectedRoute.js';

// Pages
import { LandingPage } from './pages/LandingPage.js';
import { Login } from './pages/Login.js';
import { Signup } from './pages/Signup.js';
import { ForgotPassword } from './pages/ForgotPassword.js';
import { Dashboard } from './pages/Dashboard.js';
import { NotFound } from './pages/NotFound.js';
import { Unauthorized } from './pages/Unauthorized.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public routes wrapped in RootLayout */}
                  <Route element={<RootLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    
                    {/* Protected routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                    </Route>
                    
                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
