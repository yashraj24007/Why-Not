import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Environment, Lightformer } from '@react-three/drei';

const MainBlob = () => {
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere args={[1, 128, 128]} scale={2.5} position={[2, 0, 0]}>
        <MeshDistortMaterial
          color="#3b0764" 
          attach="material"
          distort={0.5}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
};

const FloatingSphere = ({ position, color, scale }: { position: [number, number, number], color: string, scale: number }) => {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1, 64, 64]} position={position} scale={scale}>
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
  return (
    <div className="w-full h-screen absolute inset-0 -z-10 bg-black">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        {/* Environment for glossy reflections */}
        <Environment preset="night">
            <Lightformer intensity={4} color="white" position={[0, 5, -9]} scale={[10, 50, 1]} onUpdate={(self) => self.lookAt(0, 0, 0)} />
            <Lightformer intensity={2} color="purple" position={[-5, 1, -1]} scale={[10, 2, 1]} onUpdate={(self) => self.lookAt(0, 0, 0)} />
            <Lightformer intensity={2} color="blue" position={[10, 1, 0]} scale={[20, 2, 1]} onUpdate={(self) => self.lookAt(0, 0, 0)} />
        </Environment>

        <ambientLight intensity={0.2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#00f3ff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#bc13fe" />

        <MainBlob />
        
        {/* Floating Green Spheres from the reference image */}
        <FloatingSphere position={[-1, -2, 2]} color="#10b981" scale={0.6} /> 
        <FloatingSphere position={[4, 1, 1]} color="#0ea5e9" scale={0.4} /> 
        <FloatingSphere position={[1, 3, -1]} color="#2dd4bf" scale={0.3} />
        
      </Canvas>
    </div>
  );
};

export default ThreeScene;