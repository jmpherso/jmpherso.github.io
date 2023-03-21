import React from 'react';
import './TechnologiesCard.css';
import useTilt from './useTilt';

const TechnologiesCard = ({ title, technologies }) => {
  const tiltRef = useTilt();

  return (
    <div ref={tiltRef} className="technologies-card">
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
    </div>
  );
};

export default TechnologiesCard;