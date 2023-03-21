import React from 'react';
import headshot from './headshot.png';
import './Card.css';

const Card = ({ title, bodyText }) => {
  return (
    <div className="card">
        <h3 className="card-title">{title}</h3>
        <p className="card-body-text">
            <img src={headshot} alt="headshot" className="headshot" /><br />
          A full-stack software engineer with an education in Aerospace Engineering, a passion for front end development and UI design and a love for learning new technologies.
        </p>
    </div>
  );
};

export default Card;