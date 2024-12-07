<script lang="ts">
 import * as THREE from 'three'; // Import Three.js
 import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'; // Import the GLTFLoader
 import { onMount } from 'svelte'; // Lifecycle hook

 let sceneContainer: HTMLDivElement | null = null;

 onMount(() => {
   if (sceneContainer) {
     // Create the scene
     const scene = new THREE.Scene();

     // Set up the camera
     const camera = new THREE.PerspectiveCamera(
       75, // Field of view
       sceneContainer.clientWidth / sceneContainer.clientHeight, // Aspect ratio
       0.1, // Near clipping plane
       1000 // Far clipping plane
     );
     camera.position.z = 5;

     // Set up the renderer with a transparent background
     const renderer = new THREE.WebGLRenderer({ alpha: true }); // Transparency enabled
     renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
     renderer.setClearColor(0x000000, 0); // Transparent background
     sceneContainer.appendChild(renderer.domElement);

     // Add lighting
     const light = new THREE.AmbientLight(0xffffff, 1); // Ambient light
     scene.add(light);

     const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
     directionalLight.position.set(5, 10, 7.5);
     scene.add(directionalLight);

     // Load your 3D model
     const loader = new GLTFLoader();
     loader.load(
       './lana-folded-arms.glb', // Replace with your model path
       (gltf) => {
         const model = gltf.scene;

         // Adjust the model's position and scale
         model.position.set(0, -1, 0); // Center the model
         model.scale.set(1, 1, 1); // Scale the model if needed

         scene.add(model);
       },
       undefined,
       (error) => {
         console.error('Error loading model:', error);
       }
     );

     // Animation loop
     const animate = () => {
       requestAnimationFrame(animate);

       // Render the scene
       renderer.render(scene, camera);
     };
     animate();

     // Handle resizing
     const handleResize = () => {
       if (sceneContainer) {
         renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
         camera.aspect = sceneContainer.clientWidth / sceneContainer.clientHeight;
         camera.updateProjectionMatrix();
       }
     };
     window.addEventListener('resize', handleResize);

     // Cleanup
     return () => {
       window.removeEventListener('resize', handleResize);
       sceneContainer?.removeChild(renderer.domElement);
     };
   }
 });
</script>

<style>
 /* Styling for the Three.js container */
 .three-container {
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   z-index: 1; /* Behind the overlay */
   overflow: hidden;
 }

 /* Your existing overlay styles */
 .overlay-textbox {
   position: absolute;
   top: 50%;
   left: 80%;
   transform: translate(-50%, -50%) skewX(-10deg); /* Lean right */
   background-color: rgba(0, 0, 0, 0.801); /* Grey/black background with slight transparency */
   color: white;
   padding: 20px 30px;
   text-align: center;
   font-size: 36px;
   font-family: 'Burbank Big Condensed';
   line-height: 1.3;
   width: 500px;
   position: relative;
   z-index: 2; /* On top of the Three.js scene */
 }

 .overlay-textbox span {
   display: inline-block;
   transform: skewX(10deg);
 }

 .overlay-textbox::after {
   content: '';
   position: absolute;
   bottom: -50px;
   right: 50px;
   z-index: 5;
   width: 0;
   height: 0;
   border-left: 20px solid transparent;
   border-right: 20px solid transparent;
   border-top: 50px solid rgba(0, 0, 0, 0.8);
 }
</style>

<!-- HTML structure -->
<div bind:this={sceneContainer} class="three-container"></div>
<div class="overlay-textbox">
 <span>
   🎯 Top 3 predictors win V-Bucks! <br />
   Vote on 1v1 predicts. <br />
   1 point for every correct vote!
 </span>
</div>
