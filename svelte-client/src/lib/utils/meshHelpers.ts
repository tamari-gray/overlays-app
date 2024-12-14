// src/utils/meshHelpers.ts

import * as THREE from 'three';

/**
 * Draws placement, username, and points on a canvas.
 * @param ctx - The canvas rendering context.
 * @param canvas - The canvas element.
 * @param placement - The placement text (e.g., "#1st").
 * @param username - The username text (e.g., "LongUsername").
 * @param points - The points text (e.g., "10pts").
 */
function drawTextLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  placement: string,
  username: string,
  points: string
) {
  // Define section widths
  const padding = 50; // Padding around the text
  const leftWidth = canvas.width * 0.2; // 20% of the canvas for placement
  const rightWidth = canvas.width * 0.2; // 20% of the canvas for points
  const middleWidth = canvas.width - leftWidth - rightWidth - 2 * padding; // Remaining space for username

  const centerY = canvas.height / 2;

  // Draw Placement (Left-aligned)
  ctx.textAlign = 'left';
  ctx.fillText(placement, padding, centerY);

  // Draw Points (Right-aligned)
  ctx.textAlign = 'right';
  ctx.fillText(points, canvas.width - padding, centerY);

  // Draw Username (Centered and truncated)
  ctx.textAlign = 'left'; // Align text to the left from where the placement ends
  const maxUsernameWidth = middleWidth;
  let truncatedUsername = username;

  // Check if the username exceeds the max width
  if (ctx.measureText(username).width > maxUsernameWidth) {
    while (ctx.measureText(truncatedUsername + '...').width > maxUsernameWidth) {
      truncatedUsername = truncatedUsername.slice(0, -1);
    }
    truncatedUsername += '...';
  }
  // Position the username text just after the placement text
  const usernameX = padding + 500; // Offset by the width of the placement text + some padding
  ctx.fillText(truncatedUsername, usernameX, centerY);
}


/**
 * Creates a THREE.CanvasTexture with the specified text drawn on it.
 * @param text - The text to display on the texture.
 * @returns A THREE.CanvasTexture with the rendered text.
 */
export function createCanvasTexture(
  placement: string, // E.g., "#1st"
  username: string,  // E.g., "LongUsernameThatNeedsTruncating"
  points: string   // Points to display
) {
  const resolutionMultiplier = 1; // Increase this for higher resolution
  const baseHeight = 412; // Define the base height of the canvas
  const baseWidth = baseHeight * 6.16; // Maintain aspect ratio of the plane

  // Create a high-resolution canvas
  const canvas = document.createElement('canvas');
  canvas.height = baseHeight * resolutionMultiplier;
  canvas.width = baseWidth * resolutionMultiplier;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Failed to get canvas rendering context.');
    return new THREE.CanvasTexture(canvas);
  }

  // Scale context for crisp rendering
  ctx.scale(resolutionMultiplier, resolutionMultiplier);

  // Background fill
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Adjust as needed
  ctx.fillRect(0, 0, baseWidth, baseHeight);

  // Set text properties
  ctx.fillStyle = 'white';
  ctx.font = `${280 / resolutionMultiplier}px Burbank Big Condensed`; // Scale font size
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw text
  drawTextLayout(ctx, canvas, placement, username, points);

  // Create the texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = false; // Prevent upside-down texture
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;

  return texture;
}



export function createSecondCanvasTexture(placement: string, // E.g., "#1st"
  username: string,  // E.g., "LongUsernameThatNeedsTruncating"
  points: string ): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.height = 412;
  canvas.width = canvas.height * 6.16; // Higher resolution for sharp text
 
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Failed to get canvas rendering context.');
    return new THREE.CanvasTexture(canvas);
  }
 
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // White background with 0.01 opacity
  ctx.fillRect(0, 0, canvas.width, canvas.height);
 
  ctx.fillStyle = 'white'; // Black text
  ctx.font = '280px Burbank Big Condensed';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw the layout using the helper function
  drawTextLayout(ctx, canvas, placement, username, points);
 
 
  // Create texture
  const texture = new THREE.CanvasTexture(canvas);
   texture.flipY = false; // Fix the flipped Y-axis issue (vertical flip)
   texture.minFilter = THREE.LinearFilter; // Prevent blurry textures
   texture.magFilter = THREE.LinearFilter; // Prevent blurry textures
   texture.needsUpdate = true;
 
  return texture;
 }

 export function createThirdCanvasTexture(placement: string, // E.g., "#1st"
  username: string,  // E.g., "LongUsernameThatNeedsTruncating"
  points: string ): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.height = 412;
  canvas.width = canvas.height * 6.16; // Higher resolution for sharp text
 
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Failed to get canvas rendering context.');
    return new THREE.CanvasTexture(canvas);
  }
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // White background with 0.01 opacity
  ctx.fillRect(0, 0, canvas.width, canvas.height);
 
  ctx.fillStyle = 'white'; // Black text
  ctx.font = '280px Burbank Big Condensed';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';


  drawTextLayout(ctx, canvas, placement, username, points);

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
