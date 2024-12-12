// src/utils/meshHelpers.ts

import * as THREE from 'three';

/**
 * Creates a THREE.CanvasTexture with the specified text drawn on it.
 * @param text - The text to display on the texture.
 * @returns A THREE.CanvasTexture with the rendered text.
 */
export function createCanvasTexture(text: string): THREE.CanvasTexture {
 const canvas = document.createElement('canvas');
 canvas.height = 206;
 canvas.width = canvas.height * 6.16; // Higher resolution for sharp text

 const ctx = canvas.getContext('2d');
 if (!ctx) {
   console.error('Failed to get canvas rendering context.');
   return new THREE.CanvasTexture(canvas);
 }

 ctx.fillStyle = 'rgba(231,231,231, 0.1)'; // White background with 0.01 opacity
ctx.fillRect(0, 0, canvas.width, canvas.height);

 ctx.fillStyle = 'white'; // Black text
 ctx.font = '136px Burbank Big Condensed';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText(text, canvas.width / 2, canvas.height / 2);


 // Create texture
 const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = false; // Fix the flipped Y-axis issue (vertical flip)
  texture.minFilter = THREE.LinearFilter; // Prevent blurry textures
  texture.magFilter = THREE.LinearFilter; // Prevent blurry textures
  texture.needsUpdate = true;

 return texture;
}





/**
 * Applies a texture to a THREE.Mesh, replacing its material if necessary.
 * @param mesh - The THREE.Mesh to apply the texture to.
 * @param texture - The THREE.CanvasTexture to apply.
 */
export function applyTextureToMesh(mesh: THREE.Mesh, texture: THREE.CanvasTexture) {
 // Ensure UV mapping is enabled
 if (!mesh.geometry.attributes.uv) {
   console.warn(`Mesh "${mesh.name}" has no UV mapping. Texture may not display properly.`);
   return;
 }

 // Apply texture to materials
 if (Array.isArray(mesh.material)) {
   mesh.material.forEach((material) => {
     if (material instanceof THREE.MeshBasicMaterial) {
       material.map = texture;
       material.needsUpdate = true;
     }
   });
 } else if (mesh.material instanceof THREE.MeshBasicMaterial) {

   mesh.material.map = texture;
   mesh.material.needsUpdate = true;
   mesh.material.transparent = true;
   mesh.material.opacity = 1.0;
  console.log('Material after replacement:', mesh.material);

 } else {
   console.warn(`Material on mesh "${mesh.name}" is not a MeshBasicMaterial. Texture not applied.`);
 }
}
