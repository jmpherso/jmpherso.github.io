import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Plane } from '@react-three/drei';
import * as THREE from 'three';
import { generatePerlinNoise } from 'perlin-noise';

const Landscape = () => {
  const meshRef = useRef();
  const clock = new THREE.Clock();

  const updateGeometry = () => {
    const width = 100;
    const height = 100;
    const segments = 200;
    const noiseFactor = 3;
    const geo = meshRef.current.geometry;
    const vertices = geo.attributes.position.array;

    const noise = generatePerlinNoise(segments + 1, segments + 1);

    for (let i = 2, j = 0; i < vertices.length; i += 3, j++) {
      vertices[i] = noise[j] * noiseFactor;
    }

    geo.attributes.position.needsUpdate = true;
  };

  const animateLandscape = () => {
    const elapsedTime = clock.getElapsedTime();
    const vertices = meshRef.current.geometry.attributes.position.array;
    const segments = 200;

    for (let i = 2, j = 0; i < vertices.length; i += 3, j++) {
      const x = j % (segments + 1);
      const y = Math.floor(j / (segments + 1));
      vertices[i] = Math.sin(x / 4 + elapsedTime) * Math.cos(y / 4 + elapsedTime) * 1.5;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
  };

  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 'white',
    wireframe: true,
  });

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.001;
      animateLandscape();
    }
  });

  useEffect(() => {
    if (meshRef.current) {
      updateGeometry();
    }
  });

  return (
    <Plane
      ref={meshRef}
      args={[100, 100, 200, 200]}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -10, 0]}
      material={wireframeMaterial}
    />
  );
};

export default Landscape;