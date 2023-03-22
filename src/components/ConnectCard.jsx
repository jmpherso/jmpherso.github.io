import React, { useState } from 'react';
import './ConnectCard.css';
import gitimg from './github.svg';
import linkedinimg from './linkedin.svg';
import emailimg from './mail.png';
import useTilt from './useTilt';

const Card = ({ title, bodyText }) => {
  const tiltRef = useTilt();
  const [transformOrigin, setTransformOrigin] = useState('');

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTransformOrigin(`${x}px ${y}px`);
  };

  const handleMouseLeave = () => {
    setTransformOrigin('');
  };

  return (
    <div
      ref={tiltRef}
      className="connect-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card-content">
        <h3 className="card-title" style={{ transformOrigin }}>{title}</h3>
        <div className="connect-icons">
          <a href="https://www.linkedin.com/in/jerry-macpherson/" target="_blank" rel="noopener noreferrer">
            <img src={linkedinimg} alt="LinkedIn" className="icon-linkedin" />
          </a>
          <a href="https://github.com/jmpherso" target="_blank" rel="noopener noreferrer">
            <img src={gitimg} alt="GitHub" className="icon-github" />
          </a>
          <a href="mailto:jmpherso@gmail.com" target="_blank" rel="noopener noreferrer">
            <img src={emailimg} alt="eMail" className="icon-email" />
          </a>
        </div>
      </div>
      <style>{`.connect-card:hover::before { transform-origin: ${transformOrigin}; transform: scale(1); }`}</style>
    </div>
  );
};

export default Card;