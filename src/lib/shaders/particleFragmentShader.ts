export const particleFragmentShader = `
precision mediump float;

uniform sampler2D uTexture;
uniform float uAtlasCols;
uniform float uAtlasRows;
uniform float uIsImageMode;

varying float vShapeIndex;
varying vec3 vColor;
varying float vAlpha;

void main() {
  // Calculate the atlas tile (column and row) from the index
  float col = mod(vShapeIndex, uAtlasCols);
  float row = floor(vShapeIndex / uAtlasCols);

  // Remap the gl_PointCoord to sample the correct sub-image from the atlas
  vec2 atlasUV = vec2(
    (gl_PointCoord.x + col) / uAtlasCols,
    (gl_PointCoord.y + row) / uAtlasRows
  );

  vec4 texColor = texture2D(uTexture, atlasUV);

  // Discard fragments outside the soft circular mask or low alpha
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5 || texColor.a < 0.1) discard;

  // In image mode, use the vertex color for depth shading
  // In sphere mode, use the original texture color
  vec3 finalColor = mix(texColor.rgb, vColor, uIsImageMode);
  
  // Enhanced alpha handling for organic clustering effect
  float baseAlpha = texColor.a;
  
  // Add subtle glow effect for organic feel
  float glow = 1.0 - d * 2.0; // d is already calculated above
  glow = pow(max(0.0, glow), 1.5);
  
  // Combine original alpha with organic variation
  float finalAlpha = baseAlpha * mix(1.0, vAlpha, uIsImageMode) * mix(0.9, 1.0, glow);
  
  gl_FragColor = vec4(finalColor, finalAlpha);
}
`;
