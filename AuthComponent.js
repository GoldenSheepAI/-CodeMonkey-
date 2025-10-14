import React, { useState } from 'react';

function AuthComponent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    // Call API to login
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // Call API to logout
    setIsLoggedIn(false);
  };

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <p>Welcome, {username}!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <input type='text' value={username} onChange={(e) => setUsername(e.target.value)} placeholder='Username' />
          <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
}

export default AuthComponent;