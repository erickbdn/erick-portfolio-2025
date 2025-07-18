export const particleFragmentShader = `
precision mediump float;

uniform sampler2D uTexture;
uniform float uAtlasCols;
uniform float uAtlasRows;

varying float vShapeIndex;

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

  gl_FragColor = texColor;
}
`;
