import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    const storedUser = localStorage.getItem('userData');

    if (auth === 'true') {
      setIsAuthenticated(true);
      setUserData(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userInfo) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userData', JSON.stringify(userInfo)); 
    setIsAuthenticated(true);
    setUserData(userInfo);
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userData, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
