//src/LoginButton.js
import React from 'react';

const LoginButton = ({ onClick }) => {
  return (
    <button onClick={onClick} className="login-button">
      Login
    </button>
  );
};

export default LoginButton;