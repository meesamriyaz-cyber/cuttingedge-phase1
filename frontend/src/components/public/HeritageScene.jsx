import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const ARTS = [
  {
    label: "Copperware",
    caption: "Samawar forms",
    photo: "/assets/images/Kashmiri-Samovar-02.jpg",
    tint: 0xc97936
  },
  {
    label: "Kani weave",
    caption: "Woven valley motifs",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Shawl%2C_India%2C_Kashmir%2C_early_19th_century%2C_Honolulu_Museum_of_Art_2831.JPG/960px-Shawl%2C_India%2C_Kashmir%2C_early_19th_century%2C_Honolulu_Museum_of_Art_2831.JPG",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Shawl,_India,_Kashmir,_early_19th_century,_Honolulu_Museum_of_Art_2831.JPG",
    tint: 0x2f6d78
  },
  {
    label: "Papier mache",
    caption: "Painted florals",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/5/55/Kashmir_papier-m%C3%A2ch%C3%A9_trinket_boxes.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kashmir_papier-m%C3%A2ch%C3%A9_trinket_boxes.jpg",
    tint: 0xc95d63
  },
  {
    label: "Walnut wood",
    caption: "Carved relief",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/8/84/Kashmir_Woodcarver.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kashmir_Woodcarver.jpg",
    tint: 0x6f4324
  },
  {
    label: "Pashmina",
    caption: "Soft handspun texture",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Handwoven-kashmir-pashmina.jpg/960px-Handwoven-kashmir-pashmina.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Handwoven-kashmir-pashmina.jpg",
    tint: 0x8f6b4d
  }
];

const LEAF_COLORS = [0xc45728, 0xd8892e, 0xae4824, 0xf0b34d, 0x7f321d];
const PANEL_RADIUS = 2.18;
const CAROUSEL_STEP = (Math.PI * 2) / ARTS.length;
const CAROUSEL_SPEED = 0.34;
const FRONT_PAUSE_SECONDS = 1;
const FOCUSED_PANEL_TINT = new THREE.Color(0xffffff);
const RESTING_PANEL_TINT = new THREE.Color(0x74695d);

function damp(current, target, lambda, delta) {
  return THREE.MathUtils.damp(current, target, lambda, delta);
}

function makeLeafGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.5);
  shape.bezierCurveTo(0.11, 0.22, 0.34, 0.38, 0.24, 0.1);
  shape.bezierCurveTo(0.52, 0.05, 0.31, -0.08, 0.2, -0.11);
  shape.bezierCurveTo(0.32, -0.43, 0.05, -0.28, 0.01, -0.48);
  shape.bezierCurveTo(-0.05, -0.28, -0.32, -0.43, -0.2, -0.11);
  shape.bezierCurveTo(-0.31, -0.08, -0.52, 0.05, -0.24, 0.1);
  shape.bezierCurveTo(-0.34, 0.38, -0.11, 0.22, 0, 0.5);
  return new THREE.ShapeGeometry(shape, 14);
}

function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 384;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(192, 192, 22, 192, 192, 178);
  gradient.addColorStop(0, "rgba(244, 196, 99, 0.55)");
  gradient.addColorStop(0.42, "rgba(168, 63, 32, 0.24)");
  gradient.addColorStop(1, "rgba(168, 63, 32, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 384, 384);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makePanelPlaceholder(art) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 84;
  const context = canvas.getContext("2d");
  const background = context.createLinearGradient(0, 0, 64, 84);
  background.addColorStop(0, "#fffaf0");
  background.addColorStop(0.45, `#${art.tint.toString(16).padStart(6, "0")}`);
  background.addColorStop(1, "#172018");
  context.fillStyle = background;
  context.fillRect(0, 0, 64, 84);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function fitTextureToPanel(texture, panelAspect) {
  const imageAspect = texture.image.width / texture.image.height;
  texture.center.set(0.5, 0.5);
  if (imageAspect > panelAspect) {
    texture.repeat.set(panelAspect / imageAspect, 1);
  } else {
    texture.repeat.set(1, imageAspect / panelAspect);
  }
}

function disposeScene(root) {
  root.traverse((object) => {
    if (!object.isMesh && !object.isLine) return;
    object.geometry?.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      material.map?.dispose();
      material.dispose();
    });
  });
}

export default function HeritageScene() {
  const mountRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerNdcRef = useRef(null);
  const [activeArt, setActiveArt] = useState(ARTS[0].label);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.18, 6.2);

    const root = new THREE.Group();
    scene.add(root);

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(6.8, 6.8),
      new THREE.MeshBasicMaterial({
        map: makeGlowTexture(),
        transparent: true,
        opacity: 0.94,
        depthWrite: false
      })
    );
    glow.position.set(0, 0.08, -2.1);
    root.add(glow);

    const carousel = new THREE.Group();
    root.add(carousel);

    const panelGeometry = new THREE.PlaneGeometry(1.08, 1.42, 8, 8);
    const panelAspect = 1.08 / 1.42;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    let disposed = false;
    const panels = ARTS.map((art, index) => {
      const placeholder = makePanelPlaceholder(art);
      const material = new THREE.MeshBasicMaterial({
        map: placeholder,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(panelGeometry, material);
      mesh.userData = { index, baseAngle: (index / ARTS.length) * Math.PI * 2, art };
      carousel.add(mesh);

      loader.load(
        art.photo,
        (texture) => {
          if (disposed) {
            texture.dispose();
            return;
          }

          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
          fitTextureToPanel(texture, panelAspect);
          material.map?.dispose();
          material.map = texture;
          material.needsUpdate = true;
        },
        undefined,
        () => {
          material.color.setHex(art.tint);
        }
      );

      return mesh;
    });

    const leafGeometry = makeLeafGeometry();
    const leaves = Array.from({ length: 18 }, (_, index) => {
      const material = new THREE.MeshBasicMaterial({
        color: LEAF_COLORS[index % LEAF_COLORS.length],
        transparent: true,
        opacity: 0.58,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const leaf = new THREE.Mesh(leafGeometry, material);
      leaf.userData = {
        x: THREE.MathUtils.lerp(-2.8, 2.8, (index * 0.37) % 1),
        y: THREE.MathUtils.lerp(-1.45, 1.7, (index * 0.61) % 1),
        z: THREE.MathUtils.lerp(-1.6, 1.8, (index * 0.29) % 1),
        speed: 0.28 + ((index * 11) % 9) / 28,
        phase: index * 0.7,
        scale: 0.1 + ((index * 7) % 8) / 95
      };
      leaf.scale.setScalar(leaf.userData.scale);
      root.add(leaf);
      return leaf;
    });

    scene.add(new THREE.HemisphereLight(0xfff6df, 0x3b1d10, 2.2));
    const keyLight = new THREE.DirectionalLight(0xfff0cf, 3);
    keyLight.position.set(-2.8, 3.2, 4.6);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xf4c463, 4.2, 7.5);
    rimLight.position.set(2.2, 1.4, 3.2);
    scene.add(rimLight);

    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster();
    let animationId = 0;
    let carouselAngle = 0;
    let targetCarouselAngle = 0;
    let frontPauseUntil = FRONT_PAUSE_SECONDS;
    let cameraTargetX = 0;
    let cameraTargetY = 0;
    let hoveredPanel = null;
    let lastLabel = activeArt;

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const compact = width < 520;
      root.scale.setScalar(compact ? 0.82 : 1);
    };

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      const { x, y } = pointerRef.current;
      cameraTargetX = damp(cameraTargetX, x * 0.5, 4.4, delta);
      cameraTargetY = damp(cameraTargetY, -y * 0.24, 4.4, delta);

      camera.position.x = cameraTargetX;
      camera.position.y = 0.18 + cameraTargetY;
      camera.lookAt(0, 0.02, 0);

      root.rotation.y = damp(root.rotation.y, x * 0.1, 4, delta);
      root.rotation.x = damp(root.rotation.x, -y * 0.055, 4, delta);
      glow.rotation.z = elapsed * 0.035;
      if (!hoveredPanel && elapsed >= frontPauseUntil) {
        if (Math.abs(targetCarouselAngle - carouselAngle) < 0.002) {
          targetCarouselAngle += CAROUSEL_STEP;
        }

        const remainingRotation = targetCarouselAngle - carouselAngle;
        const rotationStep = Math.min(Math.abs(remainingRotation), delta * CAROUSEL_SPEED);
        carouselAngle += Math.sign(remainingRotation || 1) * rotationStep;

        if (Math.abs(targetCarouselAngle - carouselAngle) < 0.002) {
          carouselAngle = targetCarouselAngle;
          frontPauseUntil = elapsed + FRONT_PAUSE_SECONDS;
        }
      }

      let nearestPanel = panels[0];
      let nearestZ = -Infinity;
      panels.forEach((panel) => {
        const angle = panel.userData.baseAngle + carouselAngle;
        panel.position.set(
          Math.sin(angle) * PANEL_RADIUS,
          0.1 + Math.sin(elapsed + panel.userData.index) * 0.045,
          Math.cos(angle) * PANEL_RADIUS - 0.42
        );
        panel.lookAt(camera.position);
        panel.userData.frontness = THREE.MathUtils.clamp(
          (panel.position.z + PANEL_RADIUS) / (PANEL_RADIUS * 2),
          0,
          1
        );
        if (panel.position.z > nearestZ) {
          nearestZ = panel.position.z;
          nearestPanel = panel;
        }
      });

      if (pointerNdcRef.current) {
        raycaster.setFromCamera(pointerNdcRef.current, camera);
        const intersectedPanel = raycaster.intersectObjects(panels, false)[0]?.object || null;
        hoveredPanel = intersectedPanel === nearestPanel ? intersectedPanel : null;
        mount.style.cursor = hoveredPanel ? "zoom-in" : "grab";
      }

      const focusedPanel = hoveredPanel || nearestPanel;
      panels.forEach((panel) => {
        const frontness = panel.userData.frontness;
        const isFocused = panel === focusedPanel;
        const isHovered = panel === hoveredPanel;
        const targetScale = isHovered ? 1.58 : isFocused ? 1.22 : 0.72 + frontness * 0.26;
        const targetOpacity = isFocused ? 1 : isHovered ? 1 : 0.14 + frontness * 0.4;
        const targetTint = isFocused ? FOCUSED_PANEL_TINT : RESTING_PANEL_TINT;

        panel.scale.setScalar(damp(panel.scale.x || targetScale, targetScale, 5.2, delta));
        panel.material.opacity = damp(panel.material.opacity, targetOpacity, 4.8, delta);
        panel.material.color.lerp(targetTint, 1 - Math.exp(-5.4 * delta));
        panel.renderOrder = isFocused ? 10 : panel.userData.index;
      });

      const nextLabel = focusedPanel.userData.art.label;
      if (nextLabel !== lastLabel) {
        lastLabel = nextLabel;
        setActiveArt(nextLabel);
      }

      leaves.forEach((leaf, index) => {
        const data = leaf.userData;
        leaf.position.x = data.x + Math.sin(elapsed * data.speed + data.phase) * 0.22 + x * 0.22;
        leaf.position.y = data.y + Math.sin(elapsed * (data.speed + 0.2) + data.phase) * 0.12;
        leaf.position.z = data.z + Math.cos(elapsed * 0.36 + data.phase) * 0.2;
        leaf.rotation.x = elapsed * (0.28 + data.speed) + data.phase;
        leaf.rotation.y = elapsed * 0.38 + index;
        leaf.rotation.z = Math.sin(elapsed * data.speed + index) * 0.7;
      });

      renderer.render(scene, camera);
      animationId = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event) => {
      const rect = mount.getBoundingClientRect();
      pointerRef.current = {
        x: THREE.MathUtils.clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5),
        y: THREE.MathUtils.clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5)
      };
      pointerNdcRef.current = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      };
    };

    const handlePointerLeave = () => {
      pointerRef.current = { x: 0, y: 0 };
      pointerNdcRef.current = null;
      hoveredPanel = null;
      mount.style.cursor = "grab";
    };

    resize();
    animate();
    window.addEventListener("resize", resize);
    mount.addEventListener("pointermove", handlePointerMove);
    mount.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointermove", handlePointerMove);
      mount.removeEventListener("pointerleave", handlePointerLeave);
      disposeScene(root);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <figure className="heritage-scene heritage-three-scene">
      <div ref={mountRef} className="heritage-three-canvas" aria-hidden="true" />
      <div className="heritage-carousel-label">
        <span>{activeArt}</span>
      </div>
    </figure>
  );
}
