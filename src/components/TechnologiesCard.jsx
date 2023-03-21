import React from 'react';
import './TechnologiesCard.css';

const TechnologiesCard = ({ title, technologies }) => {
  return (
    <div className="technologies-card">
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