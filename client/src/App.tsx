import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Header from './components/shared/Header';
import Login from './components/auth/Login';
import MainView from './components/shared/MainView';
import Loading from './components/shared/Loading';
import './styles/globals.css';

// Lazy-load route-level components (only loaded when navigated to)
const ProspectForm = React.lazy(() => import('./components/prospects/ProspectForm'));
const ProspectDetail = React.lazy(() => import('./components/prospects/ProspectDetail'));
const RiderForm = React.lazy(() => import('./components/riders/RiderForm'));
const RiderDetail = React.lazy(() => import('./components/riders/RiderDetail'));
const WorkerForm = React.lazy(() => import('./components/workers/WorkerForm'));
const WorkerDetail = React.lazy(() => import('./components/workers/WorkerDetail'));
const Dashboard = React.lazy(() => import('./components/dashboard/Dashboard'));

// Redirects authenticated users away from login
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="soul-winning-theme">
      <AuthProvider>
        <AppProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground gradient-bg">
              <Header />
              <main className="container mx-auto px-4 py-6">
                <Suspense fallback={<Loading />}>
                  <Routes>
                    {/* Public */}
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

                    {/* Main view (switches between Prospects/Riders/Workers) */}
                    <Route path="/" element={<ProtectedRoute><MainView /></ProtectedRoute>} />

                    {/* Prospects */}
                    <Route path="/prospects/new" element={<ProtectedRoute><ProspectForm /></ProtectedRoute>} />
                    <Route path="/prospects/:id" element={<ProtectedRoute><ProspectDetail /></ProtectedRoute>} />
                    <Route path="/prospects/:id/edit" element={<ProtectedRoute><ProspectForm isEdit /></ProtectedRoute>} />

                    {/* Riders */}
                    <Route path="/riders/new" element={<ProtectedRoute><RiderForm /></ProtectedRoute>} />
                    <Route path="/riders/:id" element={<ProtectedRoute><RiderDetail /></ProtectedRoute>} />
                    <Route path="/riders/:id/edit" element={<ProtectedRoute><RiderForm isEdit /></ProtectedRoute>} />

                    {/* Workers */}
                    <Route path="/workers/new" element={<ProtectedRoute><WorkerForm /></ProtectedRoute>} />
                    <Route path="/workers/:id" element={<ProtectedRoute><WorkerDetail /></ProtectedRoute>} />
                    <Route path="/workers/:id/edit" element={<ProtectedRoute><WorkerForm isEdit /></ProtectedRoute>} />

                    {/* Dashboard & Reports */}
                    <Route path="/reports" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </main>
            </div>
          </Router>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;