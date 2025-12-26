import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Environment, Lightformer } from '@react-three/drei';
import { getThreeJSConfig, isMobileViewport } from '../../utils/mobileOptimization';

const MainBlob = ({ isMobile }: { isMobile: boolean }) => {
  const segments = isMobile ? 64 : 128; // Reduce geometry complexity on mobile

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere args={[1, segments, segments]} scale={2.5} position={[2, 0, 0]}>
        <MeshDistortMaterial
          color="#1a0b2e"
          attach="material"
          distort={0.5}
          speed={2}
          roughness={0.1}
          metalness={0.9}
        />
      </Sphere>
    </Float>
  );
};

const FloatingSphere = ({
  position,
  color,
  scale,
  isMobile,
}: {
  position: [number, number, number];
  color: string;
  scale: number;
  isMobile: boolean;
}) => {
  const segments = isMobile ? 32 : 64; // Reduce geometry complexity on mobile

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1, segments, segments]} position={position} scale={scale}>
        {}
        <meshPhysicalMaterial
          color={color}
          roughness={0.1}
          metalness={0.1}
          transmission={0.5} // Glass-like
          thickness={2}
        />
      </Sphere>
    </Float>
  );
};

const ThreeScene: React.FC = () => {
  const config = useMemo(() => getThreeJSConfig(), []);
  const mobile = useMemo(() => isMobileViewport(), []);

  return (
    <div className="w-full h-screen absolute inset-0 -z-10 bg-black">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={config.pixelRatio}
        gl={{
          antialias: config.antialias,
          powerPreference: mobile ? 'low-power' : 'high-performance',
        }}
      >
        {/* Environment for glossy reflections */}
        <Environment background={false}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, 5, -9]}
            scale={[10, 50, 1]}
            onUpdate={self => self.lookAt(0, 0, 0)}
          />
          <Lightformer
            intensity={1.5}
            color="#a855f7"
            position={[-5, 1, -1]}
            scale={[10, 2, 1]}
            onUpdate={self => self.lookAt(0, 0, 0)}
          />
          <Lightformer
            intensity={1}
            color="#6366f1"
            position={[10, 1, 0]}
            scale={[20, 2, 1]}
            onUpdate={self => self.lookAt(0, 0, 0)}
          />
        </Environment>

        {}
        <ambientLight intensity={0.4} />
        {}
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={0.5}
          color="#ffffff"
        />
        {}
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#ec4899" />

        <MainBlob isMobile={mobile} />

        {/* Floating spheres with rose-purple-pink palette */}
        <FloatingSphere position={[-1, -2, 2]} color="#10b981" scale={0.6} isMobile={mobile} />
        <FloatingSphere position={[4, 1, 1]} color="#a855f7" scale={0.4} isMobile={mobile} />
        <FloatingSphere position={[1, 3, -1]} color="#ec4899" scale={0.3} isMobile={mobile} />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
