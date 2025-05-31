// Vertex shader source code
export const vertexShaderSource = `#version 300 es
in vec2 a_position;
in vec3 a_color;
in float a_size;
out vec3 v_color;
uniform vec2 u_resolution;
uniform float u_pointSize;

void main() {
  // Convert from pixels to clip space
  vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  gl_PointSize = a_size * u_pointSize;
  v_color = a_color;
}
`;

// Fragment shader source code
export const fragmentShaderSource = `#version 300 es
precision highp float;

in vec3 v_color;
out vec4 fragColor;

void main() {
  // Create circular particles
  vec2 coord = gl_PointCoord - vec2(0.5);
  float distance = length(coord);
  if (distance > 0.5) {
    discard; // Discard pixels outside the circle
  }
  float alpha = 1.0 - smoothstep(0.5, 0.6, distance);

  float glow = exp(-distance * 3.0); // Glow effect
  vec3 finalColor = v_color + (v_color * glow * 0.5);

  fragColor = vec4(finalColor, alpha);
}
`;
