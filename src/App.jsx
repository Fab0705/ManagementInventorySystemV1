import { BrowserRouter as Router, Routes, Route, Navigate  } from 'react-router-dom';
//import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import NavBar from './components/Navbar/NavBar';
import AsideBar from './components/AsideBar/AsideBar';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Transfers from './pages/Transfers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SystemNotifications from './pages/SystemNotifications';
//import './App.css'

function App() {
  const { isAuthenticated, loading, userData } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>;

  const isAdmin = userData?.roles === "Jefe de Logística";

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to={isAdmin ? "/inventory" : "/"} replace /> : <Login />
          }
        />

        <Route
          path="*"
          element={
            isAuthenticated ? (
              <div className="flex h-screen">
                <AsideBar />
                <div className="flex flex-col flex-1">
                  <NavBar />
                  <Routes>
                    {/* Redirección automática según el rol */}
                    <Route
                      path="/"
                      element={<Navigate to={isAdmin ? "/inventory" : "/home"} replace />}
                    />
                    <Route path="/home" element={<Home />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/transfers" element={<Transfers />} />
                    <Route path="/notifications" element={<SystemNotifications />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App
