'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const isWebGLSupported = () => {
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    };

    if (!isWebGLSupported()) {
      console.warn('WebGL is not supported in this browser. Falling back to static background.');
      return;
    }

    const container = containerRef.current;
    const width = container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 800);
    const height = container.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 600);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.0018);

    const camera = new THREE.PerspectiveCamera(65, width / (height || 1), 1, 1000);
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2));
    container.appendChild(renderer.domElement);

    // Particles Setup
    const particleCount = 130;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const particlesData: { velocity: THREE.Vector3; numConnections: number }[] = [];

    const colorBlue = new THREE.Color('#38bdf8');
    const colorPurple = new THREE.Color('#a855f7');
    const colorCyan = new THREE.Color('#22d3ee');
    const colorsList = [colorBlue, colorPurple, colorCyan];

    const range = 350;

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * range - range / 2;
      const y = Math.random() * range - range / 2;
      const z = Math.random() * range - range / 2;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const chosenColor = colorsList[Math.floor(Math.random() * colorsList.length)];
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;

      particlesData.push({
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4
        ),
        numConnections: 0
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Circle Dot Canvas Generator
    const createCircleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const material = new THREE.PointsMaterial({
      size: 4.5,
      map: createCircleTexture(),
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // Line Connectors Setup
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const lineGeometry = new THREE.BufferGeometry();
    const maxLines = particleCount * 5;
    const linePositions = new Float32Array(maxLines * 6);

    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);

    // Interaction Variables
    const mouse = new THREE.Vector2(9999, 9999);
    const targetMouse = new THREE.Vector2(9999, 9999);

    const onMouseMove = (event: MouseEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      targetMouse.x = (event.clientX / w) * 2 - 1;
      targetMouse.y = -(event.clientY / h) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    let animationFrameId: number;
    const limit = range / 2;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Mouse Lerp
      mouse.x += (targetMouse.x - mouse.x) * 0.08;
      mouse.y += (targetMouse.y - mouse.y) * 0.08;

      const posAttr = pointCloud.geometry.getAttribute('position') as THREE.BufferAttribute;
      const coords = posAttr.array as Float32Array;

      const linePosAttr = lineMesh.geometry.getAttribute('position') as THREE.BufferAttribute;
      const lineCoords = linePosAttr.array as Float32Array;

      let lineCount = 0;

      // Update node positions
      for (let i = 0; i < particleCount; i++) {
        let x = coords[i * 3];
        let y = coords[i * 3 + 1];
        let z = coords[i * 3 + 2];
        const data = particlesData[i];

        x += data.velocity.x;
        y += data.velocity.y;
        z += data.velocity.z;

        // Bounce
        if (x < -limit || x > limit) data.velocity.x = -data.velocity.x;
        if (y < -limit || y > limit) data.velocity.y = -data.velocity.y;
        if (z < -limit || z > limit) data.velocity.z = -data.velocity.z;

        // Mouse repelling
        if (mouse.x < 100) {
          const mouseVec = new THREE.Vector3(mouse.x * 150, mouse.y * 150, 0);
          const nodeVec = new THREE.Vector3(x, y, z);
          const dist = nodeVec.distanceTo(mouseVec);

          if (dist < 75) {
            const push = nodeVec.sub(mouseVec).normalize().multiplyScalar(1.2);
            x += push.x;
            y += push.y;
          }
        }

        coords[i * 3] = x;
        coords[i * 3 + 1] = y;
        coords[i * 3 + 2] = z;
      }
      posAttr.needsUpdate = true;

      // Redraw connection lines
      for (let i = 0; i < particleCount; i++) {
        const x1 = coords[i * 3];
        const y1 = coords[i * 3 + 1];
        const z1 = coords[i * 3 + 2];

        for (let j = i + 1; j < particleCount; j++) {
          const x2 = coords[j * 3];
          const y2 = coords[j * 3 + 1];
          const z2 = coords[j * 3 + 2];

          const dx = x1 - x2;
          const dy = y1 - y2;
          const dz = z1 - z2;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 65 && lineCount < maxLines) {
            lineCoords[lineCount * 6] = x1;
            lineCoords[lineCount * 6 + 1] = y1;
            lineCoords[lineCount * 6 + 2] = z1;
            lineCoords[lineCount * 6 + 3] = x2;
            lineCoords[lineCount * 6 + 4] = y2;
            lineCoords[lineCount * 6 + 5] = z2;
            lineCount++;
          }
        }
      }

      linePosAttr.needsUpdate = true;
      lineMesh.geometry.setDrawRange(0, lineCount * 2);

      pointCloud.rotation.y += 0.0006;
      pointCloud.rotation.x += 0.0002;
      lineMesh.rotation.y += 0.0006;
      lineMesh.rotation.x += 0.0002;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      
      scene.remove(pointCloud);
      scene.remove(lineMesh);
      
      geometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundColor: 'transparent'
      }}
    />
  );
}
