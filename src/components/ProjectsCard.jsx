import React from 'react';
import './ProjectsCard.css';

const Card = ({ title, bodyText }) => {
  return (
    <div className="projects-card">
      <h3 className="card-title">{title}</h3>
      <div className="projects-container">
        <a href="https://github.com/jmpherso/atelier-storefront" target="_blank" rel="noopener noreferrer">
          <div className="project-item projectButtonOne">
            <span className="project-item-title">ATELIER</span>
            <p className="project-item-tech">Full stack e-commerce site made with React, Node, Express, PostgreSQL, CSS, HTML</p>
          </div>
        </a>
        <a href="https://github.com/jmpherso/recipease" target="_blank" rel="noopener noreferrer">
          <div className="project-item projectButtonTwo">
            <span className="project-item-title">RECIPEASE</span>
            <p className="project-item-tech">Multi-platform recipe inspiration app made using React Native, Expo, PostgreSQL, Node</p>
          </div>
        </a>
        <a href="https://github.com/jmpherso/shredded" target="_blank" rel="noopener noreferrer">
          <div className="project-item projectButtonThree">
            <span className="project-item-title">SHREDDED</span>
            <p className="project-item-tech">Full stack fitness planning/tracking app made using React, Passport, PostgreSQL, Node</p>
          </div>
        </a>
        <a href="https://github.com/jmpherso/" target="_blank" rel="noopener noreferrer">
          <div className="project-item projectButtonFour">
            <span className="project-item-title">TWINFO</span>
            <p className="project-item-tech">Twitter analytics platform made using React, Node, Twitter API, Tailwind</p>
          </div>
        </a>
        <div className="project-item projectButtonFive">
          <span className="project-item-title">PORTFOLIO</span>
          <p className="project-item-tech">Personal portfolio page made using React, Threejs, CSS</p>
        </div>
      </div>
    </div>
  );
};

export default Card;