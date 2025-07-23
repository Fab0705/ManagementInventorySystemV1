import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SocialButton from '../components/Buttons/SocialButton';
import InputField from '../components/Buttons/InputField';
import { loginAuth } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { FaGoogle, FaApple } from 'react-icons/fa';
import SpinnerWait from '../components/UI/Spinner/SpinnerWait';

export default function Login({  }) {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const loginData = { Username: user, Password: password };
    

    try {
      const res = await loginAuth(loginData);

      if (res.success && res.data) {
        login(res.data);
        navigate('/');
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError('Error en el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      <div className="m-auto w-full max-w-md px-4 py-8">
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          
          <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 text-center">
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-blue-100 mt-1">Please enter your credentials</p>
          </div>
          
          
          <div className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
          
              <div className="space-y-4">
                <InputField 
                  label="Username" 
                  type="text" 
                  placeholder="Enter your username" 
                  maxlength="20" 
                  value={user} 
                  onChange={(e) => {setUser(e.target.value); setError('')}}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
                
                <InputField 
                  label="Password" 
                  type="password" 
                  placeholder="Enter your password" 
                  maxlength="30" 
                  value={password} 
                  onChange={(e) => {setPassword(e.target.value); setError('')}}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

          
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm text-gray-600">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2">Remember me</span>
                </label>
                
                <a href="#" className="text-sm text-green-600 hover:text-green-500 font-medium">
                  Forgot Password?
                </a>
              </div>

          
              {error && (
                <div className="rounded-md bg-red-50 p-3">
                  <p className="text-sm text-red-600">*Incorrect credentials</p>
                </div>
              )}

          
              <button
                type="submit"
                disabled={loading} // <- Deshabilita cuando loading
                className={`w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-900 transition-colors duration-200`}
              >
                {loading ? <SpinnerWait withText /> : 'Sign in'}
              </button>
            </form>
          </div>
          
          
          {/* <SpinnerWait withText /> */}
          <div className="bg-gray-50 px-6 py-4 text-center">
            <p className="text-xs text-gray-500">
              Don't have an account?{' '}
              <a href="#" className="text-green-600 hover:text-green-500 font-medium">
                Contact administrator
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
