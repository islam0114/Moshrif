import React from "react";
import "./LoadingScreen.css";

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-logo">
          <div className="logo-pulse"></div>
          <div className="logo-core">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#e14eca" />
              <path d="M2 17L12 22L22 17" stroke="#e14eca" strokeWidth="2" />
              <path d="M2 12L12 17L22 12" stroke="#e14eca" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div className="loading-text">
          <h2>Moshrif Security</h2>
          <p>Initializing secure system...</p>
        </div>

        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <span className="progress-text">Loading modules...</span>
        </div>

        <div className="security-badges">
          <div className="badge">
            <span className="badge-icon">🔒</span>
            <span>Encrypted</span>
          </div>
          <div className="badge">
            <span className="badge-icon">🛡️</span>
            <span>Secure</span>
          </div>
          <div className="badge">
            <span className="badge-icon">⚡</span>
            <span>Fast</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;