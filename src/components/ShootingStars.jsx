import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const ShootingStar = ({ position, speed }) => {
  const shootingStar = useRef();

  useFrame(() => {
    if (shootingStar.current) {
      shootingStar.current.position.x -= speed;
      shootingStar.current.position.y -= speed;

      if (shootingStar.current.position.x < -2 || shootingStar.current.position.y < -1) {
        shootingStar.current.position.x = Math.random() * 3 - 1;
        shootingStar.current.position.y = Math.random() * 2;
      }
    }
  });

  return (
    <group ref={shootingStar} position={position}>
      <mesh>
        <planeBufferGeometry attach="geometry" args={[0.005, 0.025]} />
        <meshBasicMaterial attach="material" color="white" />
      </mesh>
      <mesh>
        <planeBufferGeometry attach="geometry" args={[0.025, 0.005]} />
        <meshBasicMaterial attach="material" color="white" />
      </mesh>
    </group>
  );
};

const ShootingStars = () => {
  const shootingStars = [...Array(20)].map(() => ({
    position: [Math.random() * 3 + 1, Math.random() * 2, 4],
    speed: 0.001 + Math.random() * 0.002,
  }));

  return (
    <>
      {shootingStars.map((star, i) => (
        <ShootingStar key={i} position={star.position} speed={star.speed} />
      ))}
    </>
  );
};

export default ShootingStars;