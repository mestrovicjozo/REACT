import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import loginImage from '../assets/login.jpg';

function LoginForm({ onLogin, onShowRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(''); 
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log(JSON.stringify(data.user))
        if (onLogin) onLogin();
        navigate('/homepage');
      } else {
        setErrorMessage(data.error || 'Krivi username ili password');
        console.error('Greška:', data.error);
      }
    } catch (err) {
      console.error('❌ Greška prilikom slanja zahtjeva:', err);
      setErrorMessage('Došlo je do pogreške prilikom spajanja na server.');
    }
  };

  return (
    <div className="bg-sky-100 flex justify-center items-center h-screen rounded-2xl">
      {/* Left: Image */}
      <motion.div 
        className="w-1/2 h-screen hidden lg:block"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={loginImage}
          alt="Placeholder"
          className="object-cover w-full h-full rounded-2xl"
        />
      </motion.div>

      {/* Right: Login Form */}
      <motion.div 
        className="w-full lg:w-1/2 p-8"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div 
          className="max-w-md mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-center">Prijava</h2>
          {errorMessage && (
            <motion.div 
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errorMessage}
            </motion.div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label htmlFor="uname" className="block text-gray-600">
                Username
              </label>
              <input
                type="text"
                id="uname"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500 text-black bg-white"
                autoComplete="off"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label htmlFor="pword" className="block text-gray-800">
                Password
              </label>
              <input
                type="password"
                id="pword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500 text-black bg-white"
                autoComplete="off"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <button
                type="submit"
                className="bg-red-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full"
              >
                Login
              </button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-4"
            >
              <button
                type="button"
                onClick={onShowRegister}
                className="cursor-pointer justify-center rounded-md py-2 px-4 bg-green-600 text-sm font-medium text-white shadow-sm inline-flex border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 w-full mt-24"
              >
                <span>Registracija</span>
              </button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default LoginForm;
