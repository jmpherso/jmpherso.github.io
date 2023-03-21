import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Html } from '@react-three/drei';
import Landscape from './components/Landscape';
import NameOverlay from './components/NameOverlay';
import AboutCard from './components/AboutCard';
import ProjectsCard from './components/ProjectsCard';
import ConnectCard from './components/ConnectCard';
import TechnologiesCard from './components/TechnologiesCard';
import FloatingButton from './components/FloatingButton';
import ShootingStars from './components/ShootingStars';
import './App.css';

function App() {

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Canvas>
        <Suspense
          fallback={
            <Html center>
              <h1>Loading...</h1>
            </Html>
          }
        >
          <color attach="background" args={['black']} />
          <Landscape />
          <Stars />
          <ShootingStars />
        </Suspense>
      </Canvas>
      <NameOverlay />
      <FloatingButton />
      <div className="card-container">
        <AboutCard title="about" />
        <TechnologiesCard title="technologies" technologies={["javascript", "nodejs", "react", "typescript", "angular", "threejs", "sql", "css"]} />
        <ProjectsCard title="projects" />
        <ConnectCard title="connect" />
      </div>
    </div>
  );
}

export default App;