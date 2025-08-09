import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Stars } from '@react-three/drei';

// You can customize these colors to match your palette
const BG_COLOR = '#18181b'; // Tailwind's zinc-900
const ACCENT_COLOR = '#38bdf8'; // Tailwind's sky-400
const SECONDARY_ACCENT = '#a21caf'; // Tailwind's fuchsia-800

function AnimatedShapes() {
  return (
    <>
      {/* Floating 3D Torus */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[-2, 0, 0]}>
          <torusGeometry args={[0.8, 0.25, 16, 100]} />
          <meshStandardMaterial color={ACCENT_COLOR} metalness={0.7} roughness={0.2} />
        </mesh>
      </Float>
      {/* Floating 3D Sphere */}
      <Float speed={1.5} rotationIntensity={1.2} floatIntensity={1.5}>
        <mesh position={[2, 1, -1]}>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial color={SECONDARY_ACCENT} metalness={0.6} roughness={0.3} />
        </mesh>
      </Float>
      {/* Subtle grid plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={'#23232a'} metalness={0.2} roughness={0.8} />
      </mesh>
    </>
  );
}

const ThreeDBackground: React.FC = () => {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 60 }}
        style={{ width: '100vw', height: '100vh', background: BG_COLOR }}
        gl={{ alpha: false }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={0.7} />
        <AnimatedShapes />
        <Stars radius={10} depth={30} count={100} factor={0.5} saturation={0.5} fade speed={1} />
        {/* Controls are disabled for background, but you can enable for debugging */}
        {/* <OrbitControls enableZoom={false} enablePan={false} /> */}
      </Canvas>
    </div>
  );
};

export default ThreeDBackground; 