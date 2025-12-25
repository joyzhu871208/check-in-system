
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CheckInRecord } from '../types';

interface Visualizer3DProps {
  checkIns: CheckInRecord[];
  mode?: 'normal' | 'drawing';
}

const Visualizer3D: React.FC<Visualizer3DProps> = ({ checkIns, mode = 'normal' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const textGroupRef = useRef<THREE.Group | null>(null);
  
  const lastCount = useRef(0);
  const rotationSpeed = useRef(0.0015);

  const SPHERE_RADIUS = 55;
  const PARTICLE_COUNT = 4000;

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 130;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Background particles
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = SPHERE_RADIUS * (1.1 + Math.random() * 0.5);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      colors[i * 3] = 0.4; 
      colors[i * 3 + 1] = 0.6;
      colors[i * 3 + 2] = 1.0;
      sizes[i] = Math.random() * 1.5;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);
    pointsRef.current = points;

    const textGroup = new THREE.Group();
    scene.add(textGroup);
    textGroupRef.current = textGroup;

    const animate = () => {
      requestAnimationFrame(animate);
      if (points) {
        points.rotation.y += rotationSpeed.current;
        points.rotation.x += rotationSpeed.current * 0.3;
      }
      if (textGroup) {
        textGroup.rotation.y += rotationSpeed.current;
        textGroup.rotation.x += rotationSpeed.current * 0.3;
        
        textGroup.children.forEach((child, i) => {
          const sprite = child as THREE.Sprite;
          const time = Date.now() * 0.001;
          sprite.position.y += Math.sin(time + i) * 0.02;
        });
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Update speed and color based on mode
  useEffect(() => {
    if (mode === 'drawing') {
      rotationSpeed.current = 0.02; // Fast spin
      if (pointsRef.current) {
        const colors = pointsRef.current.geometry.attributes.color.array as Float32Array;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          colors[i * 3] = 1.0; // Red/Gold
          colors[i * 3 + 1] = 0.8;
          colors[i * 3 + 2] = 0.2;
        }
        pointsRef.current.geometry.attributes.color.needsUpdate = true;
      }
    } else {
      rotationSpeed.current = 0.0015;
      if (pointsRef.current) {
        const colors = pointsRef.current.geometry.attributes.color.array as Float32Array;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          colors[i * 3] = 0.4; // Original Blue
          colors[i * 3 + 1] = 0.6;
          colors[i * 3 + 2] = 1.0;
        }
        pointsRef.current.geometry.attributes.color.needsUpdate = true;
      }
    }
  }, [mode]);

  useEffect(() => {
    if (!textGroupRef.current) return;
    const group = textGroupRef.current;
    
    while(group.children.length > 0){ 
      const child = group.children[0] as THREE.Sprite;
      child.material.map?.dispose();
      child.material.dispose();
      group.remove(child); 
    }

    checkIns.forEach((record, index) => {
      const isNew = index >= lastCount.current && lastCount.current !== 0;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 300; canvas.height = 100;
      ctx.font = 'bold 50px "Microsoft YaHei"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = mode === 'drawing' ? '#ffaa00' : '#00ffff'; ctx.shadowBlur = 20;
      ctx.fillStyle = '#ffffff'; ctx.fillText(record.name, 150, 50);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ 
        map: texture, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending
      });
      const sprite = new THREE.Sprite(spriteMat);
      
      const n = Math.max(checkIns.length, 1);
      const phi = Math.acos(1 - 2 * (index + 0.5) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (index + 0.5);
      const r = SPHERE_RADIUS * 0.85;
      sprite.position.x = r * Math.sin(phi) * Math.cos(theta);
      sprite.position.y = r * Math.sin(phi) * Math.sin(theta);
      sprite.position.z = r * Math.cos(phi);
      
      const baseScale = 14;
      if (isNew) {
        sprite.scale.set(0, 0, 1);
        let s = 0;
        const grow = () => { s += 0.5; sprite.scale.set(s, s/3, 1); if (s < baseScale) requestAnimationFrame(grow); };
        grow();
      } else {
        sprite.scale.set(baseScale, baseScale / 3, 1);
      }
      group.add(sprite);
    });

    lastCount.current = checkIns.length;
  }, [checkIns, mode]);

  return (
    <div className="absolute inset-0 z-0 bg-black">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-12 left-0 right-0 text-center pointer-events-none px-4">
        <h1 className="text-4xl md:text-7xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-200 to-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.8)] uppercase">
          {mode === 'drawing' ? 'Lucky Draw' : 'Welcome'}
        </h1>
      </div>
    </div>
  );
};

export default Visualizer3D;
