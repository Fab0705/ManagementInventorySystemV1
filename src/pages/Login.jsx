import React from 'react'
import SocialButton from '../components/Buttons/SocialButton'
import InputField from '../components/Buttons/InputField'
import { FaGoogle, FaApple } from 'react-icons/fa';

export default function Login() {
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
          <form className="space-y-4">
            <InputField label="Email" type="email" placeholder="Enter your email" />
            <InputField label="Password" type="password" placeholder="Enter your password" />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="form-checkbox" />
                Remember me
              </label>
              <a href="#" className="text-black font-medium">Forgot Password?</a>
            </div>

            <button className="w-full bg-black text-white py-2 rounded-xl hover:opacity-90 transition">Login</button>
          </form>
        </div>
      </div>
    </div>
  )
}
