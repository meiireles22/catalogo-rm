import { useState } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import CategoryPage from '@/pages/CategoryPage';
import ProductPage from '@/pages/ProductPage';
import VideoGalleryPage from './pages/VideoGalleryPage';
import VideoPlayerPage from './pages/VideoPlayerPage';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('authenticated') === 'true';
  });
  
  const [userRole, setUserRole] = useState(() => {
    return sessionStorage.getItem('userRole') || '';
  });

  const [username, setUsername] = useState(() => {
    return sessionStorage.getItem('username') || '';
  });

  const handleLogin = (success, role, user) => {
    if (success) {
      sessionStorage.setItem('authenticated', 'true');
      sessionStorage.setItem('userRole', role);
      sessionStorage.setItem('username', user);
      setIsAuthenticated(true);
      setUserRole(role);
      setUsername(user);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('authenticated');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('username');
    setIsAuthenticated(false);
    setUserRole('');
    setUsername('');
  };

  const isAdmin = userRole === 'admin';

  return (
    <div className="App min-h-screen bg-[#09090b]">
      <div className="noise-overlay" />
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/catalogo" replace /> : 
                <LoginPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/catalogo" 
            element={
              isAuthenticated ? 
                <Dashboard onLogout={handleLogout} isAdmin={isAdmin} username={username} /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/catalogo/:categoryId" 
            element={
              isAuthenticated ? 
                <CategoryPage onLogout={handleLogout} isAdmin={isAdmin} username={username} /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/catalogo/:categoryId/:productId" 
            element={
              isAuthenticated ? 
                <ProductPage onLogout={handleLogout} isAdmin={isAdmin} /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route path="/videos" element={isAuthenticated ? <VideoGalleryPage onLogout={handleLogout} isAdmin={isAdmin} username={username} /> : <Navigate to="/" />} />
          <Route path="/videos/:videoId" element={isAuthenticated ? <VideoPlayerPage onLogout={handleLogout} /> : <Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;