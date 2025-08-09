import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as random from 'maath/random';
import { motion } from 'framer-motion';

// Mouse interaction hook
function useMouseInteraction() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return mouse;
}

// Simplified Neural Network Nodes Component with minimal animation
function NeuralNodes({ count = 50 }) {
  const ref = useRef<THREE.Points>(null);
  const sphere = useMemo(() => random.inSphere(new Float32Array(count * 3), { radius: 1.5 }), [count]);

  useFrame((state, delta) => {
    if (ref.current) {
      // Very slow, subtle rotation
      ref.current.rotation.x -= delta / 50;
      ref.current.rotation.y -= delta / 60;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#f1d2b6"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.3}
        />
      </Points>
    </group>
  );
}

// Simplified Cloud Storage Nodes Component
function CloudNodes({ count = 30 }) {
  const ref = useRef<THREE.Points>(null);
  const sphere = useMemo(() => random.inSphere(new Float32Array(count * 3), { radius: 2 }), [count]);

  useFrame((state, delta) => {
    if (ref.current) {
      // Very slow, subtle rotation
      ref.current.rotation.x += delta / 80;
      ref.current.rotation.y += delta / 100;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#d9aa90"
          size={0.01}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.2}
        />
      </Points>
    </group>
  );
}

// Simplified AI Brain Mesh Component
function AIBrain() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (ref.current) {
      // Very slow rotation
      ref.current.rotation.x += delta * 0.02;
      ref.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <MeshDistortMaterial
        color="#a65e46"
        speed={0.5}
        distort={0.1}
        radius={1}
        transparent
        opacity={0.1}
      />
    </mesh>
  );
}

// Simplified Floating Data Points Component
function DataPoints({ count = 100 }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, [count]);

  useFrame((state, delta) => {
    if (ref.current) {
      // Very slow rotation
      ref.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#f8b583"
        size={0.008}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.15}
      />
    </Points>
  );
}

// Simplified Circuit Lines Component
function CircuitLines() {
  const lines = useMemo(() => {
    const lineCount = 10;
    const linesData = [];
    
    for (let i = 0; i < lineCount; i++) {
      const start = [
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3
      ];
      const end = [
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3
      ];
      linesData.push([start, end]);
    }
    return linesData;
  }, []);

  return (
    <group>
      {lines.map((line, index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...line[0], ...line[1]])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#c18a6f" transparent opacity={0.1} />
        </line>
      ))}
    </group>
  );
}

// Static background option
function StaticBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-accent-50/30" />
      <div className="absolute inset-0 bg-gradient-to-tl from-primary-100/20 via-transparent to-accent-100/20" />
    </div>
  );
}

// Main 3D Background Component with options
interface Background3DProps {
  variant?: 'animated' | 'static' | 'minimal';
  enabled?: boolean;
}

export function Background3D({ variant = 'minimal', enabled = true }: Background3DProps) {
  if (!enabled) {
    return <StaticBackground />;
  }

  if (variant === 'static') {
    return <StaticBackground />;
  }

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.4} color="#f1d2b6" />
        <pointLight position={[-10, -10, -10]} intensity={0.2} color="#d9aa90" />
        
        {/* Neural Network Nodes */}
        <NeuralNodes count={50} />
        
        {/* Cloud Storage Nodes */}
        <CloudNodes count={30} />
        
        {/* AI Brain */}
        <AIBrain />
        
        {/* Data Points */}
        <DataPoints count={100} />
        
        {/* Circuit Lines */}
        <CircuitLines />
      </Canvas>
    </div>
  );
}

// Floating Tech Icons Component with reduced animation
export function FloatingTechIcons() {
  const icons = [
    { icon: '⚛️', position: [2, 1, 0] },
    { icon: '☁️', position: [-2, -1, 0] },
    { icon: '🤖', position: [1, -2, 0] },
    { icon: '🔗', position: [-1, 2, 0] },
    { icon: '⚡', position: [0, 3, 0] },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {icons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute text-3xl opacity-10"
          style={{
            left: `${50 + item.position[0] * 10}%`,
            top: `${50 + item.position[1] * 10}%`,
          }}
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 4 + index * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {item.icon}
        </motion.div>
      ))}
    </div>
  );
}

// Warm Gradient Overlay
export function WarmGradientOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/20 via-transparent to-accent-50/20" />
      <div className="absolute inset-0 bg-gradient-to-tl from-primary-100/10 via-transparent to-accent-100/10" />
    </div>
  );
} 