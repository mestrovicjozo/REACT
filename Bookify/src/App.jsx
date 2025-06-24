import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LoginForm from './components/LoginForm.jsx';
import HomePage from './components/HomePage.jsx';
import AdminPage from './components/AdminPage.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import Profile from './components/Profile.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Animation variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: -20
  },
  in: {
    opacity: 1,
    x: 0
  },
  out: {
    opacity: 0,
    x: 20
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

function App() {
  // Get the token from localStorage (if any)
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  // Get the whole user object from localStorage (if available)
  const [user, setUser] = useState(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  );
  
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Callback called after successful login, which updates token and user
  const onLogin = () => {
    const storedToken = localStorage.getItem('token');
    console.log("Token from localStorage:", storedToken);
    setToken(storedToken);
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      console.log("User set in state:", JSON.parse(storedUser));
    }
  };

  // Callback for logout: clear localStorage and reset state
  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setShowProfile(false);
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <AnimatePresence mode="wait">
        {!token && !showRegister && (
          <motion.div
            key="login"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <LoginForm onLogin={onLogin} onShowRegister={() => setShowRegister(true)} />
          </motion.div>
        )}

        {!token && showRegister && (
          <motion.div
            key="register"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <RegisterForm onRegisterComplete={() => setShowRegister(false)} />
          </motion.div>
        )}

        {token && showProfile && (
          <motion.div
            key="profile"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Profile userId={user?._id} onBack={() => setShowProfile(false)} />
          </motion.div>
        )}

        {token && !showProfile && (
          <motion.div
            key={user?.role === 'admin' ? 'admin' : 'home'}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {user?.role === 'admin' ? (
              <AdminPage onLogout={onLogout} />
            ) : (
              <HomePage onLogout={onLogout} onShowProfile={() => setShowProfile(true)} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
