<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { database, ref, onValue } from '../firebase'; // Adjust the path to your Firebase file
  import { createCanvasTexture, applyTextureToMesh } from '../utils/meshHelpers';

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

  // container for three.js scene
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

      // create canvas

      

      // Load GLTF Model
      const loader = new GLTFLoader();
      loader.load(
        '/new-leaderboard.glb',
        (gltf) => {
          console.log('Model loaded:', gltf);
          const model = gltf.scene;

          // Traverse the model and find the "board" mesh
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;

              if (Array.isArray(mesh.material)) {
                // console.log('Array of materials:', mesh.material); // Log the array of materials
                mesh.material.forEach((material, index) => {
                  if (material instanceof THREE.MeshStandardMaterial) {
                    console.log('Found MeshStandardMaterial in array');

                    // Create a new MeshBasicMaterial and copy relevant properties
                    const newMaterial = new THREE.MeshBasicMaterial({
                      map: material.map,
                      transparent: material.transparent,
                      opacity: material.opacity,
                      color: material.color,
                    });

                    mesh.material = newMaterial; // Replace material in the array
                  }
                });
              } else if (mesh.material instanceof THREE.MeshStandardMaterial) {

                const newMaterial = new THREE.MeshBasicMaterial({
                  map: mesh.material.map,
                  transparent: mesh.material.transparent,
                  opacity: mesh.material.opacity,
                  color: mesh.material.color,
                });

                mesh.material = newMaterial;
              } else {
                console.log('Other material type:', mesh.material);
              }

              // Apply texture dynamically using the helper functions
              if (mesh.name === 'first') {
                console.log("yeet first",mesh);
                const firstTexture = createCanvasTexture('#1st @username 10pts');
                applyTextureToMesh(mesh, firstTexture);
              } else if (mesh.name === 'second') {
                const secondTexture = createCanvasTexture('#2nd @user 8pts');
                applyTextureToMesh(mesh, secondTexture);
              } else if (mesh.name === 'third') {
                const thirdTexture = createCanvasTexture('#3rd @player 6pts');
                applyTextureToMesh(mesh, thirdTexture)
              }
            }
          });


          // Adjust scale and position of the model
          model.scale.set(1, 1, 1);
          model.position.set(0,-1.5,3.5);
          model.rotation.set(0.2,0,0)
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
