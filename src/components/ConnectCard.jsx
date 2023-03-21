import React from 'react';
import './ConnectCard.css';
import gitimg from './github.svg';
import linkedinimg from './linkedin.svg';
import emailimg from './mail.png';
import useTilt from './useTilt';

const Card = ({ title, bodyText }) => {
  const tiltRef = useTilt();

  return (
    <div ref={tiltRef} className="connect-card">
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
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
    </div>
  );
};

export default Card;