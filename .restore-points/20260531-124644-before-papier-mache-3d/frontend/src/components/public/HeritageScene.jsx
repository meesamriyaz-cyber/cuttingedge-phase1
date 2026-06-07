import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeritageScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const palette = [0xf4b860, 0xd95d39, 0x247b7b, 0x7a5cff, 0xf7f1df];
    const materials = palette.map(
      (color) =>
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.42,
          metalness: 0.1
        })
    );

    const rings = Array.from({ length: 7 }, (_, index) => {
      const geometry = new THREE.TorusKnotGeometry(1.05 + index * 0.16, 0.018, 160, 8, 2 + (index % 3), 5);
      const mesh = new THREE.Mesh(geometry, materials[index % materials.length]);
      mesh.rotation.set(index * 0.38, index * 0.22, index * 0.18);
      mesh.scale.setScalar(1 - index * 0.045);
      group.add(mesh);
      return mesh;
    });

    const threadGeometry = new THREE.BufferGeometry();
    const points = [];
    for (let index = 0; index < 220; index += 1) {
      const angle = index * 0.19;
      const radius = 1.4 + Math.sin(index * 0.08) * 0.45;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, (index - 110) * 0.015));
    }
    threadGeometry.setFromPoints(points);
    const thread = new THREE.Line(
      threadGeometry,
      new THREE.LineBasicMaterial({
        color: 0xfff8e8,
        transparent: true,
        opacity: 0.62
      })
    );
    group.add(thread);

    const ambient = new THREE.AmbientLight(0xffffff, 1.15);
    const key = new THREE.DirectionalLight(0xfff0d2, 2.3);
    key.position.set(3, 4, 5);
    const rim = new THREE.PointLight(0x55d6c2, 3, 16);
    rim.position.set(-4, -3, 4);
    scene.add(ambient, key, rim);

    const resize = () => {
      const width = mount.clientWidth || 640;
      const height = mount.clientHeight || 520;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const time = performance.now() * 0.001;

      group.rotation.x = Math.sin(time * 0.22) * 0.18;
      group.rotation.y = time * 0.18;
      group.rotation.z = Math.cos(time * 0.18) * 0.08;

      rings.forEach((ring, index) => {
        ring.rotation.x += 0.002 + index * 0.00045;
        ring.rotation.y -= 0.0014 + index * 0.00035;
      });

      thread.rotation.z = -time * 0.22;
      renderer.render(scene, camera);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      mount.removeChild(renderer.domElement);
      threadGeometry.dispose();
      thread.material.dispose();
      rings.forEach((ring) => {
        ring.geometry.dispose();
      });
      materials.forEach((material) => material.dispose());
      renderer.dispose();
    };
  }, []);

  return <div className="heritage-scene" ref={mountRef} aria-hidden="true" />;
}
