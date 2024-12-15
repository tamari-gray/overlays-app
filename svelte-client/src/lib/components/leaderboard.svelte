<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
  import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { database, ref, onValue } from '../firebase'; // Adjust path if needed

  // Define types
  type LeaderboardItem = {
    rank: number;
    name: string;
    points: number;
  };

  type LeaderboardFirebaseItem = {
    Username: string;
    Points: number;
  };

  let leaderboard: LeaderboardItem[] = [];
  let sceneContainer: HTMLDivElement | null = null;

  let scene: THREE.Scene;
  let camera: THREE.OrthographicCamera;
  let renderer: THREE.WebGLRenderer;

  let firstMesh: THREE.Mesh | undefined;
  let secondMesh: THREE.Mesh | undefined;
  let thirdMesh: THREE.Mesh | undefined;

  let font: Font | undefined;
  let textMaterial: THREE.MeshBasicMaterial;
  let textParams: {
    font: Font;
    size: number;
    depth: number;
    curveSegments: number;
  };

  const leaderboardRef = ref(database, 'leaderboard');

  // Animation related
  let mixer: THREE.AnimationMixer | undefined;
  const clock = new THREE.Clock();

  // Listen to Firebase updates
  onValue(leaderboardRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val() as LeaderboardFirebaseItem[];
      leaderboard = data.map((item, index) => ({
        rank: index + 1,
        name: item.Username,
        points: item.Points,
      }));
    } else {
      leaderboard = [];
    }
    console.log('Leaderboard updated:', leaderboard);

    // Update text in the scene after leaderboard updates
    updateLeaderboardText();
  });

  onMount(() => {
    if (!sceneContainer) return;

    // Set up scene, camera, renderer
    scene = new THREE.Scene();
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.OrthographicCamera(
        -aspectRatio * 1,  // left
        aspectRatio * 1,   // right
        1,            // top
        -1,           // bottom
        0.01,         // near
        1000          // far
    );

    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, precision: 'highp' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setClearColor(0x000000, 0);
    sceneContainer.appendChild(renderer.domElement);

    const loader = new GLTFLoader();
    loader.load(
      '/new-leaderboard.glb',
      (gltf) => {
        const model = gltf.scene;

        // Convert materials and find our meshes
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;

            // Convert materials to MeshBasicMaterial
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

            if(mesh.name =='icon'){
              console.log('icon', mesh);
              // mesh.material[0].transparent = true;
              mesh.renderOrder = 100;
            }

            // Identify the board meshes
            if (mesh.name === 'first') firstMesh = mesh;
            if (mesh.name === 'second') secondMesh = mesh;
            if (mesh.name === 'third') thirdMesh = mesh;
          }
        });

        model.scale.set(1.2, 1.2, 1.2);
        model.position.set(0, -1, -2);
        scene.add(model);

        // Setup animation
        mixer = new THREE.AnimationMixer(model);
        const clip = THREE.AnimationClip.findByName(gltf.animations, 'Action.001');
        if (clip) {
          const action = mixer.clipAction(clip);
          action.play();
        } else {
          console.warn('No animation named "leaderboardAnimation" found');
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
              depth: 0.0001,
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
            updateLeaderboardText();
          },
          (error) => {
            console.error('Error loading font:', error);
          }
        );
      },
      (progress) => {
        console.log(`Loading: ${(progress.loaded / progress.total) * 100}%`);
      },
      (error) => {
        console.error('Error loading GLTF model:', error);
      }
    );

    // Cleanup on unmount
    return () => {
      sceneContainer?.removeChild(renderer.domElement);
    };
  });

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

  function updateLeaderboardText() {
    // Only proceed if font and meshes are loaded
    if (!font || !firstMesh || !secondMesh || !thirdMesh) return;

    // Clear old text
    clearOldText(firstMesh);
    clearOldText(secondMesh);
    clearOldText(thirdMesh);

    const firstData = leaderboard[0] || { rank: 1, name: 'Unknown', points: 0 };
    const secondData = leaderboard[1] || { rank: 2, name: 'Unknown', points: 0 };
    const thirdData = leaderboard[2] || { rank: 3, name: 'Unknown', points: 0 };

    addLeaderboardText(firstMesh, `#${firstData.rank}st`, firstData.name, `${firstData.points}pts`);
    addLeaderboardText(secondMesh, `#${secondData.rank}nd`, secondData.name, `${secondData.points}pts`);
    addLeaderboardText(thirdMesh, `#${thirdData.rank}rd`, thirdData.name, `${thirdData.points}pts`);
  }

  function addLeaderboardText(
    parentMesh: THREE.Mesh,
    rankText: string,
    originalUsernameText: string,
    pointsText: string
  ) {
    if(rankText == '#1st') console.log(parentMesh);
    const rankGeometry = new TextGeometry(rankText, textParams);
    const rankMesh = new THREE.Mesh(rankGeometry, textMaterial);
    rankMesh.userData.isText = true;

    const pointsGeometry = new TextGeometry(pointsText, textParams);
    const pointsMesh = new THREE.Mesh(pointsGeometry, textMaterial);
    pointsMesh.userData.isText = true;

    parentMesh.add(rankMesh);
    parentMesh.add(pointsMesh);

    // Position rank and points relative to the plane (parentMesh)
    
    rankMesh.position.set(-0.236, -0.001, -0.018);
    pointsMesh.position.set(0.14, -0.001, -0.018);

    // We'll place the username at a fixed starting point from the plane
    const usernameStartX = -0.13;  // Adjust as needed
    const usernameY = -0.001;
    const usernameZ = -0.018;

    const usernamePointsMargin = 0.01;
    const pointsBox = new THREE.Box3().setFromObject(pointsMesh);
    const pointsSize = new THREE.Vector3();
    pointsBox.getSize(pointsSize);

    const maxUsernameWidth = (pointsMesh.position.x - usernamePointsMargin) - usernameStartX;

    function measureUsernameWidth(usernameStr: string): number {
      const testGeometry = new TextGeometry(usernameStr, textParams);
      const testMesh = new THREE.Mesh(testGeometry, textMaterial);
      testMesh.position.set(usernameStartX, usernameY, usernameZ);

      parentMesh.add(testMesh);
      const testBox = new THREE.Box3().setFromObject(testMesh);
      parentMesh.remove(testMesh);

      const testSize = new THREE.Vector3();
      testBox.getSize(testSize);
      return testSize.x;
    }

    let usernameText = originalUsernameText;
    let usernameWidth = measureUsernameWidth(usernameText);

    if (usernameWidth > maxUsernameWidth) {
      while (usernameText.length > 0 && usernameWidth > maxUsernameWidth) {
        usernameText = usernameText.slice(0, -1); // remove last character
        const testText = usernameText + '..';
        usernameWidth = measureUsernameWidth(testText);

        if (usernameWidth <= maxUsernameWidth) {
          usernameText = testText;
          break;
        }
      }
    }

    const usernameGeometry = new TextGeometry(usernameText, textParams);
    usernameGeometry.computeBoundingBox();
    
    const usernameMesh = new THREE.Mesh(usernameGeometry, textMaterial);
    usernameMesh.userData.isText = true;
    console.log(parentMesh.quaternion);
    

    parentMesh.add(usernameMesh);
    usernameMesh.position.set(usernameStartX, usernameY, usernameZ);


    // Make all text face the camera
    // rankMesh.lookAt(camera.position);
    // usernameMesh.lookAt(camera.position);
    // pointsMesh.lookAt(camera.position);
    rankMesh.quaternion.copy(parentMesh.quaternion);
    rankMesh.quaternion.x = 0.7;
    usernameMesh.quaternion.copy(parentMesh.quaternion);
    usernameMesh.quaternion.x = 0.7;
    pointsMesh.quaternion.copy(parentMesh.quaternion);
    pointsMesh.quaternion.x = 0.7;
    
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
