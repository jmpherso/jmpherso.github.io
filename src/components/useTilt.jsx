import { useRef, useEffect } from 'react';

const useTilt = () => {
  const tiltRef = useRef();

  useEffect(() => {
    if (!tiltRef.current) return;

    const onMouseMove = (event) => {
      const bounds = tiltRef.current.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const maxRotation = 30; // Adjust this value to control the tilt amount

      const deltaX = event.clientX - centerX;
      const deltaY = event.clientY - centerY;

      const rotationX = (deltaY / centerY) * maxRotation;
      const rotationY = -(deltaX / centerX) * maxRotation;

      tiltRef.current.style.transform = `perspective(500px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    };

    const onMouseLeave = () => {
      tiltRef.current.style.transform = '';
    };

    const currentRef = tiltRef.current;
    currentRef.addEventListener('mousemove', onMouseMove);
    currentRef.addEventListener('mouseleave', onMouseLeave);

    return () => {
      currentRef.removeEventListener('mousemove', onMouseMove);
      currentRef.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return tiltRef;
};

export default useTilt;