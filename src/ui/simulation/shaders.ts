// Vertex shader source code with camera support
export const vertexShaderSource = `#version 300 es
in vec2 a_position;
in vec3 a_color;
in float a_size;

out vec3 v_color;

uniform vec2 u_resolution;
uniform float u_pointSize;
uniform vec2 u_cameraPosition;
uniform float u_cameraZoom;

void main() {
  // Apply camera transformation
  vec2 cameraTransformed = (a_position - u_cameraPosition) * u_cameraZoom;
  
  // Center on screen
  vec2 centered = cameraTransformed + u_resolution * 0.5;
  
  // Convert from pixels to clip space
  vec2 clipSpace = (centered / u_resolution) * 2.0 - 1.0;
  
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  gl_PointSize = a_size * u_pointSize * u_cameraZoom;
  v_color = a_color;
}
`;

// Fragment shader source code (unchanged)
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
  
  // Smooth edges with anti-aliasing
  float alpha = 1.0 - smoothstep(0.4, 0.5, distance);
  
  // Glow effect
  float glow = exp(-distance * 3.0);
  vec3 finalColor = v_color + (v_color * glow * 0.3);
  
  fragColor = vec4(finalColor, alpha * 0.8);
}
`;
