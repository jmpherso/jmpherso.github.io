import React, { useState } from 'react';
import headshot from './headshot.png';
import useTilt from './useTilt';
import './Card.css';

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
      className="card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <h3 className="card-title" style={{ transformOrigin }}>{title}</h3>
      <p className="card-body-text" style={{ transformOrigin }}>
        <img src={headshot} alt="headshot" className="headshot" />
        <br />
        A full-stack software engineer with an education in Aerospace Engineering, a passion for front end development and UI design, and a love for learning new technologies.
      </p>
      <style>{`.card:hover::before { transform-origin: ${transformOrigin}; transform: scale(1); }`}</style>
    </div>
  );
};

export default Card;