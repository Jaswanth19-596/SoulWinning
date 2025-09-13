import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ContactProvider } from './contexts/ContactContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Header from './components/shared/Header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ContactList from './components/contacts/ContactList';
import ContactForm from './components/contacts/ContactForm';
import ContactDetail from './components/contacts/ContactDetail';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ContactProvider>
                      <ContactList />
                    </ContactProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contacts/new"
                element={
                  <ProtectedRoute>
                    <ContactProvider>
                      <ContactForm />
                    </ContactProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contacts/:id"
                element={
                  <ProtectedRoute>
                    <ContactProvider>
                      <ContactDetail />
                    </ContactProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contacts/:id/edit"
                element={
                  <ProtectedRoute>
                    <ContactProvider>
                      <ContactForm isEdit={true} />
                    </ContactProvider>
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;