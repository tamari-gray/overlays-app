<script lang="ts">
 import { onMount } from 'svelte';
 import * as THREE from 'three';
 import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

 let sceneContainer: HTMLDivElement | null = null;

 let scene: THREE.Scene;
 let camera: THREE.OrthographicCamera;
 let renderer: THREE.WebGLRenderer;
 let mixer: THREE.AnimationMixer | undefined;
 const clock = new THREE.Clock();

 onMount(() => {
   if (!sceneContainer) return;

   // Set up scene, camera, renderer
   scene = new THREE.Scene();
   const aspectRatio = window.innerWidth / window.innerHeight;
   camera = new THREE.OrthographicCamera(
     -aspectRatio,   // left
     aspectRatio,    // right
     1,              // top
     -1,             // bottom
     0.01,           // near
     1000            // far
   );

   camera.position.z = 5;

   renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, precision: 'highp' });
   renderer.setSize(window.innerWidth, window.innerHeight);
   renderer.setPixelRatio(window.devicePixelRatio || 1);
   renderer.setClearColor(0x000000, 0);
   sceneContainer.appendChild(renderer.domElement);

   // Load the GLB
   const loader = new GLTFLoader();
   loader.load(
     '/lana-folded-arms-new.glb', // Update this to your actual .glb path
     (gltf) => {
       const model = gltf.scene;

       // Convert materials to MeshBasicMaterial
       model.traverse((child) => {
         if ((child as THREE.Mesh).isMesh) {
           const mesh = child as THREE.Mesh;
           if (Array.isArray(mesh.material)) {
             mesh.material = mesh.material.map((material: any) => {
               if (
                 material instanceof THREE.MeshStandardMaterial ||
                 material instanceof THREE.MeshPhongMaterial ||
                 material instanceof THREE.MeshLambertMaterial
               ) {
                 return new THREE.MeshBasicMaterial({
                   map: material.map,
                   transparent: material.transparent,
                   opacity: material.opacity,
                   color: material.color,
                 });
               }
               return material;
             });
           } else if (
             mesh.material instanceof THREE.MeshStandardMaterial ||
             mesh.material instanceof THREE.MeshPhongMaterial ||
             mesh.material instanceof THREE.MeshLambertMaterial
           ) {
             mesh.material = new THREE.MeshBasicMaterial({
               map: mesh.material.map,
               transparent: mesh.material.transparent,
               opacity: mesh.material.opacity,
               color: mesh.material.color,
             });
           }
         }
       });

       model.scale.set(1.5,1.5,1.5);
       model.position.set(0, -2, 0);

       scene.add(model);

       // Set up animation if available
       if (gltf.animations && gltf.animations.length > 0) {
         mixer = new THREE.AnimationMixer(model);
         const clip = gltf.animations[0]; // use the first available animation
         const action = mixer.clipAction(clip);
         action.play();
       }

       const animate = () => {
         requestAnimationFrame(animate);
         const delta = clock.getDelta();
         if (mixer) mixer.update(delta);
         renderer.render(scene, camera);
       };
       animate();
     },
     (progress) => {
       console.log(`Loading: ${(progress.loaded / progress.total) * 100}%`);
     },
     (error) => {
       console.error('Error loading GLTF model:', error);
     }
   );

   // Handle resizing
   window.addEventListener('resize', onWindowResize, false);

   function onWindowResize() {
     const aspect = window.innerWidth / window.innerHeight;
     camera.left = -aspect;
     camera.right = aspect;
     camera.top = 1;
     camera.bottom = -1;
     camera.updateProjectionMatrix();
     renderer.setSize(window.innerWidth, window.innerHeight);
   }

   // Cleanup on unmount
   return () => {
     window.removeEventListener('resize', onWindowResize);
     sceneContainer?.removeChild(renderer.domElement);
   };
 });
</script>

<style>
 .scene-container {
   position: fixed;
   top: 0;
   left: 0;
   width: 100vw;
   height: 100vh;
   background: transparent;
   overflow: hidden;
 }
</style>

<div bind:this={sceneContainer} class="scene-container"></div>
