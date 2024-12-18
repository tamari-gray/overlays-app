<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
  import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
  import { database, ref, onValue } from '../firebase'; // Adjust path if needed


 
  let sceneContainer: HTMLDivElement | null = null;
 
  let scene: THREE.Scene;
  let camera: THREE.OrthographicCamera;
  let renderer: THREE.WebGLRenderer;
  let mixer: THREE.AnimationMixer | undefined;
  const clock = new THREE.Clock();

  //three.js scene
  let winMesh: THREE.Mesh | undefined;
  let loseMesh: THREE.Mesh | undefined;
  let font: Font | undefined;
  let textMaterial: THREE.MeshBasicMaterial;
  let textParams: {
    font: Font;
    size: number;
    depth: number;
    curveSegments: number;
  };

  let username: string = '';
  const usernameRef = ref(database, 'prediction/person');


  // Listen to Firebase updates
  onValue(usernameRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val() as string;
      username = data;
    } else {
      username = '';
    }
    console.log('username updated:', username);

    // Update text in the scene after leaderboard updates
    updateUsername();
  });

 
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
      '/lana-voting.glb', // Update this to your actual .glb path
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

            // console.log(mesh.name, mesh);


            if(mesh.name =='heartBannerRedBroken' || mesh.name =='HeartBannerGreen'){
              // mesh.material[0].transparent = true;
              mesh.renderOrder = 100;
            }

            // Identify the board meshes
            if (mesh.name === 'win') {
              winMesh = mesh;
              console.log('winMesh found:', winMesh);
            }
            if (mesh.name === 'lose') {
              loseMesh = mesh;
              console.log('loseMesh found:', loseMesh);
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
        // Load the font after the model is added
        const fontLoader = new FontLoader();
        fontLoader.load(
          '/fonts/burbank.json',
          (loadedFont) => {
            font = loadedFont;
            textParams = {
              font: font,
              size: 0.04,
              depth: 0.001,
              curveSegments: 12,
            };
            textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

            // Render loop
            const animate = () => {
              requestAnimationFrame(animate);

              // Update animation mixer
              const delta = clock.getDelta();
              if (mixer) mixer.update(delta);

              renderer.render(scene, camera);
            };
            animate();

            // Once everything is ready, we can update the text based on current leaderboard data
            updateUsername();
          }, (xhr) => {
            console.log(`Font loading: ${(xhr.loaded / xhr.total) * 100}% loaded`);
          },
          (error) => {
            console.error('Error loading font:', error);
          }
        );
      },
      (progress) => {
        console.log('loading lana', progress);
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

  function updateUsername() {
    // Only proceed if font and meshes are loaded
    if (!font || !winMesh || !loseMesh) return;

    // Clear old text
    clearOldText(winMesh);
    clearOldText(loseMesh);

    addText(winMesh, username, 'lose');
    addText(loseMesh, username, 'win');
  }

  function clearOldText(mesh: THREE.Mesh) {
    // Remove all children that are text meshes
    const removable: THREE.Object3D[] = [];
    mesh.children.forEach((child) => {
      if (child.userData && child.userData.isText) {
        removable.push(child);
      }
    });
    removable.forEach((child) => mesh.remove(child));
  }

  function addText(
    parentMesh: THREE.Mesh,
    name: string,
    type: 'win' | 'lose' // Specify the type of text to add
  ) {
    let textString: string;
    
    if (type === 'win') {
      textString = `!win: vote ${name} to win`;
    } else if (type === 'lose') {
      textString = `!lose: vote ${name} to lose`;
    } else {
      console.warn('Unknown text type:', type);
      return;
    }

    console.log(`Adding text to ${type}Mesh:`, textString);

    // Create Text Geometry
    const geometry = new TextGeometry(textString, textParams);
    geometry.computeBoundingBox();
    const textMesh = new THREE.Mesh(geometry, textMaterial);
    textMesh.userData.isText = true;

    // Add text to parent mesh
    parentMesh.add(textMesh);

    // Position the text relative to the parent mesh
    if (type === 'win') {
      textMesh.position.set(-0.351, 1.21, 0.2999); // Adjust Y as needed
    } else if (type === 'lose') {
      textMesh.position.set(-0.346, 1.143, 0.2999); // Adjust Y as needed

    }

    console.log(`${type} text added at position:`, textMesh.position);
    textMesh.quaternion.copy(parentMesh.quaternion);
    textMesh.quaternion.y= 0;
    textMesh.quaternion.z = 0.036;
  }

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