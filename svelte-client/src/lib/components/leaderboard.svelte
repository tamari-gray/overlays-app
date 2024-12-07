<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { database, ref, onValue } from '../firebase'; // Adjust the path to your Firebase file

  // Define types
  type LeaderboardItem = {
    rank: number;
    name: string;
    points: number;
  };

  // Type for data structure from Firebase
  type LeaderboardFirebaseItem = {
    Username: string;
    Points: number;
  };

  // Leaderboard data array
  let leaderboard: LeaderboardItem[] = [];

  let sceneContainer: HTMLDivElement | null = null;

  onMount(() => {
    if (sceneContainer) {
      // Initialize Three.js Scene
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 5;

      const renderer = new THREE.WebGLRenderer({
        alpha: true, // Enable transparency
        antialias: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0); // Transparent background
      sceneContainer.appendChild(renderer.domElement);

      // Load GLTF Model
      const loader = new GLTFLoader();
      loader.load(
        '/leaderboard.glb',
        (gltf) => {
          console.log('Model loaded:', gltf);
          const model = gltf.scene;

          // Traverse the model and find the "board" mesh
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              
              console.log('Mesh Material:', mesh.material); // Log to inspect the material type

              // Check if the material is an array
              if (Array.isArray(mesh.material)) {
                console.log('yo - Array of materials:', mesh.material);  // Log the array of materials
                mesh.material.forEach((material) => {
                  if (material instanceof THREE.MeshStandardMaterial) {
                    console.log('yo - Found MeshStandardMaterial in array');
                    
                    // Create a new MeshBasicMaterial and copy relevant properties
                    const newMaterial = new THREE.MeshBasicMaterial({
                      map: material.map, // Retain the texture map
                      transparent: material.transparent,
                      opacity: material.opacity,
                      color: material.color, // Preserve color if needed
                    });

                    // Replace the material with MeshBasicMaterial
                    mesh.material = newMaterial;
                  }
                });
              } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
                console.log('yo - Found single MeshStandardMaterial:', mesh.material); // Log the single material
                
                // Create a new MeshBasicMaterial and copy relevant properties
                const newMaterial = new THREE.MeshBasicMaterial({
                  map: mesh.material.map, // Retain the texture map
                  transparent: mesh.material.transparent,
                  opacity: mesh.material.opacity,
                  color: mesh.material.color, // Preserve color if needed
                });

                // Replace the material with MeshBasicMaterial
                mesh.material = newMaterial;
              } else {
                console.log('yo - Other material type', mesh.material); // Log if it's another material type
              }
            }
          });

          // Adjust scale and position of the model
          model.scale.set(1, 1, 1);
          model.position.set(14, -2, 6); // Center the model
          scene.add(model);
        },
        (progress) => {
          console.log(`Loading: ${(progress.loaded / progress.total) * 100}%`);
        },
        (error) => {
          console.error('Error loading GLTF model:', error);
        }
      );

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();

      // Handle resizing
      const handleResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        sceneContainer?.removeChild(renderer.domElement);
      };
    }

    // Fetch leaderboard data from Firebase
    const leaderboardRef = ref(database, 'leaderboard'); // Reference to the leaderboard data in Firebase
    onValue(leaderboardRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as Record<string, LeaderboardFirebaseItem>;
        leaderboard = Object.values(data).map((item, index) => ({
          rank: index + 1,
          name: item.Username,
          points: item.Points,
        }));
      } else {
        leaderboard = [];
      }
    });
  });
</script>

<style>
  /* Fullscreen container for Three.js */
  .scene-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: transparent; /* Ensure the container background is transparent */
    overflow: hidden;
  }

</style>

<!-- Fullscreen Transparent Three.js scene -->
<div bind:this={sceneContainer} class="scene-container"></div>
