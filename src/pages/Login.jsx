import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SocialButton from '../components/Buttons/SocialButton';
import InputField from '../components/Buttons/InputField';
import { loginAuth } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { FaGoogle, FaApple } from 'react-icons/fa';

export default function Login({  }) {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const loginData = { Username: user, Password: password };
    

    try {
      const res = await loginAuth(loginData);

      /* if (res.success) {
        login();
        navigate('/');
      } else {
        setError(res.error);
      } */

      if (res.success && res.data) {
        login(res.data); // Aquí se pasa el objeto con los datos del usuario
        navigate('/');
      } else {
        setError(res.data);
      }
    } catch (err) {
      setError('Error en el servidor');
    }
  };


  return (
    <div className="flex h-screen bg-gradient-to-r from-green-100-100 to-green-300">
        {/* Left side - Login */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 md:px-16 bg-white">
        <div className="max-w-md w-full space-y-6">
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-gray-500">We are glad to see you again!<br />Please, enter your details</p>

          
          {/* <div className="flex gap-4">
            <SocialButton icon={<FaGoogle />} text="Log in with Google" />
            <SocialButton icon={<FaApple />} text="Log in with Apple" />
          </div>

          <div className="flex items-center justify-center text-gray-400 text-sm">
            <span className="border-t w-full"></span>
            <span className="px-2">or</span>
            <span className="border-t w-full"></span>
          </div> */}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <InputField label="Username" type="text" placeholder="Enter your username" maxlength="20" value={user} onChange={(e) => setUser(e.target.value)} />
            <InputField label="Password" type="password" placeholder="Enter your password" maxlength="30" value={password} onChange={(e) => setPassword(e.target.value)} />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="form-checkbox" />
                Remember me
              </label>
              <a href="#" className="text-black font-medium">Forgot Password?</a>
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button className="w-full bg-black text-white py-2 rounded-xl hover:opacity-90 transition">Login</button>
          </form>
        </div>
      </div>
    </div>
  )
}
