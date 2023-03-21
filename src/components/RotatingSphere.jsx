import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const RotatingSphere = ({ position, radius, rotationSpeed }) => {
  const sphereRef = useRef();

  useFrame(({ clock }) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = clock.getElapsedTime() * rotationSpeed;
      sphereRef.current.rotation.y = clock.getElapsedTime() * rotationSpeed;
    }
  });

  return (
    <mesh ref={sphereRef} position={position} scale={[radius, radius, radius]}>
      <sphereBufferGeometry attach="geometry" args={[1, 32, 32]} />
      <meshBasicMaterial
        attach="material"
        color="white"
        wireframe={true}
        transparent={true}
        opacity={0.5}
      />
    </mesh>
  );
};

export default RotatingSphere;