//src/LoginForm.js
import React, { useState } from 'react';

const LoginForm = ({ visible, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Perform login logic here
    onLogin(username);
  };

  if (!visible) return null;

  return (
    <div className="login-form">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default LoginForm;