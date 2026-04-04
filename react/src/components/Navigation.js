import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';
import './Navigation.css';

function Navigation({ isLoggedIn, username, onLogin, onLogout, onUsernameChange }) {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);

  const handleLogin = () => {
    if (tempUsername.trim()) {
      onUsernameChange(tempUsername);
      onLogin();
      setShowLoginModal(false);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo">
            <span className="logo-emoji">{'\u26A1'}</span>
            FOCUSDETECTOR
          </Link>

          <ul className="nav-links">
            <li><Link to="/">HOME</Link></li>
            <li><Link to="/dashboard">DASHBOARD</Link></li>
            <li><Link to="/face-guard">FACE GUARD</Link></li>
          </ul>

          <div className="nav-actions">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {isDark ? '\u2600' : '\u263E'}
            </button>

            {isLoggedIn ? (
              <div className="user-menu">
                <span className="username">{username}</span>
                <button className="btn-logout" onClick={onLogout}>Logout</button>
              </div>
            ) : (
              <button className="btn-login" onClick={() => setShowLoginModal(true)}>
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Welcome to FOCUSDETECTOR</h2>
            <input
              type="text"
              placeholder="Enter your username"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button className="btn btn-primary" onClick={handleLogin}>
              Continue
            </button>
            <button className="btn-close" onClick={() => setShowLoginModal(false)}>x</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navigation;
