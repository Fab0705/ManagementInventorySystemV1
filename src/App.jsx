import { BrowserRouter as Router, Routes, Route, Navigate  } from 'react-router-dom';
//import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import NavBar from './components/Navbar/NavBar';
import AsideBar from './components/AsideBar/AsideBar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Transfers from './pages/Transfers';
import Purchases from './pages/Purchases';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
//import './App.css'

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>;

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
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
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/transfers" element={<Transfers />} />
                    <Route path="/purchases" element={<Purchases />} />
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
