import { useEffect, useRef } from "react";
import * as THREE from "three";

const LEAF_COLORS = [0xb94825, 0xd58b2f, 0xf0b34d, 0x7f321d, 0x436f3f];

function makeLeafGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.5);
  shape.bezierCurveTo(0.11, 0.22, 0.33, 0.38, 0.24, 0.1);
  shape.bezierCurveTo(0.52, 0.05, 0.31, -0.08, 0.2, -0.11);
  shape.bezierCurveTo(0.32, -0.43, 0.05, -0.28, 0.01, -0.48);
  shape.bezierCurveTo(-0.05, -0.28, -0.32, -0.43, -0.2, -0.11);
  shape.bezierCurveTo(-0.31, -0.08, -0.52, 0.05, -0.24, 0.1);
  shape.bezierCurveTo(-0.33, 0.38, -0.11, 0.22, 0, 0.5);
  return new THREE.ShapeGeometry(shape, 12);
}

function setRendererSize(renderer, camera, element) {
  const { width, height } = element.getBoundingClientRect();
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

export default function SiteAtmosphere({ variant = "ambient" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, variant === "hero" ? 1.6 : 1.2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, variant === "hero" ? 5.6 : 7.2);

    const root = new THREE.Group();
    scene.add(root);

    const leafGeometry = makeLeafGeometry();
    const leafCount = variant === "hero" ? 18 : 34;
    const leaves = Array.from({ length: leafCount }, (_, index) => {
      const material = new THREE.MeshBasicMaterial({
        color: LEAF_COLORS[index % LEAF_COLORS.length],
        transparent: true,
        opacity: variant === "hero" ? 0.28 : 0.16,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(leafGeometry, material);
      const spreadX = variant === "hero" ? 3.2 : 7.8;
      const spreadY = variant === "hero" ? 1.5 : 4.8;
      mesh.userData = {
        x: THREE.MathUtils.lerp(-spreadX, spreadX, (index * 0.37) % 1),
        y: THREE.MathUtils.lerp(-spreadY, spreadY, (index * 0.59) % 1),
        z: THREE.MathUtils.lerp(-1.8, 1.8, (index * 0.23) % 1),
        speed: 0.16 + ((index * 7) % 10) / 80,
        phase: index * 0.71,
        scale: variant === "hero" ? 0.13 + ((index * 5) % 7) / 90 : 0.16 + ((index * 5) % 9) / 80
      };
      mesh.scale.setScalar(mesh.userData.scale);
      root.add(mesh);
      return mesh;
    });

    const threadMaterial = new THREE.LineBasicMaterial({
      color: variant === "hero" ? 0xa83f20 : 0x6f4324,
      transparent: true,
      opacity: variant === "hero" ? 0.22 : 0.12,
      depthWrite: false
    });
    const threadGeometry = new THREE.BufferGeometry();
    const threadCount = variant === "hero" ? 10 : 18;
    const points = [];
    for (let i = 0; i < threadCount; i += 1) {
      const y = THREE.MathUtils.lerp(1.6, -1.6, i / Math.max(1, threadCount - 1));
      points.push(-4.8, y, -0.8, 4.8, y + Math.sin(i) * 0.24, -0.8);
    }
    threadGeometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    const threads = new THREE.LineSegments(threadGeometry, threadMaterial);
    root.add(threads);

    const resize = () => setRendererSize(renderer, camera, mount);
    resize();

    const clock = new THREE.Clock();
    let animationId = 0;
    const animate = () => {
      const elapsed = clock.elapsedTime;
      leaves.forEach((leaf, index) => {
        const data = leaf.userData;
        leaf.position.set(
          data.x + Math.sin(elapsed * data.speed + data.phase) * 0.18,
          data.y + Math.cos(elapsed * (data.speed + 0.08) + data.phase) * 0.22,
          data.z
        );
        leaf.rotation.set(elapsed * data.speed + index, elapsed * 0.18 + data.phase, Math.sin(elapsed + index) * 0.32);
      });
      root.rotation.z = Math.sin(elapsed * 0.18) * 0.02;
      threads.rotation.z = Math.sin(elapsed * 0.22) * 0.018;
      renderer.render(scene, camera);
      if (!prefersReducedMotion) animationId = window.requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      leaves.forEach((leaf) => leaf.material.dispose());
      leafGeometry.dispose();
      threadGeometry.dispose();
      threadMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [variant]);

  return <div ref={mountRef} className={`site-atmosphere site-atmosphere-${variant}`} aria-hidden="true" />;
}
