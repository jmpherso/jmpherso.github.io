import React, { useState } from 'react';
import './TechnologiesCard.css';
import useTilt from './useTilt';

const TechnologiesCard = ({ title, technologies }) => {
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
      className="technologies-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <div className="technologies-container">
          {technologies.map((technology, index) => (
            <div key={technology} className={`technology-item item-${index}`}>
              {technology}
            </div>
          ))}
        </div>
      </div>
      <style>{`.technologies-card:hover::before { transform-origin: ${transformOrigin}; transform: scale(1); }`}</style>
    </div>
  );
};

export default TechnologiesCard;