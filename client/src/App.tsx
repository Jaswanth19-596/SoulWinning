import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ContactProvider } from './contexts/ContactContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Header from './components/shared/Header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ContactList from './components/contacts/ContactList';
import ContactForm from './components/contacts/ContactForm';
import ContactDetail from './components/contacts/ContactDetail';
import TeamPrayerWall from './components/prayer-wall/TeamPrayerWall';
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="soul-winning-theme">
      <AuthProvider>
        <ContactProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground gradient-bg">
              <Header />
              <main className="container mx-auto px-4 py-8">
              <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ContactList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contacts/new"
                element={
                  <ProtectedRoute>
                    <ContactForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contacts/:id"
                element={
                  <ProtectedRoute>
                    <ContactDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contacts/:id/edit"
                element={
                  <ProtectedRoute>
                    <ContactForm isEdit={true} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prayer-wall"
                element={
                  <ProtectedRoute>
                    <TeamPrayerWall />
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </main>
          </div>
          </Router>
        </ContactProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;