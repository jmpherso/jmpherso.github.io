import React from 'react';
import './FloatingButton.css';

const FloatingButton = () => {
  return (
    <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
      <div className="floatingButton">
        resume
      </div>
    </a>
  );
};

export default FloatingButton;