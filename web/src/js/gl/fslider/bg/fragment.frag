precision mediump float;
// uniform sampler2D u_t1; vec4 img = texture2D(u_t1, v_uv);

#include './pass.glsl'

// Define color constants
const vec3 NEON_PINK = vec3(1.0, 0.0, 0.8);
const vec3 NEON_CYAN = vec3(0.0, 1.0, 0.9);
const vec3 NEON_YELLOW = vec3(1.0, 0.8, 0.0);
const vec3 NEON_GREEN = vec3(0.6, 1.0, 0.0);

vec3 gradientMix(vec3 color1, vec3 color2, vec3 color3, vec3 color4, float t) {
    return mix(
        mix(color1, color2, smoothstep(0.0, 0.33, t)),
        mix(color3, color4, smoothstep(0.66, 1.0, t)),
        smoothstep(0.33, 0.66, t)
    );
}

void main() {
    vec3 col = 1. * gradientMix(
      NEON_PINK, 
      NEON_CYAN, 
      NEON_YELLOW, 
      NEON_GREEN, 
      v_ns
    );

    gl_FragColor.rgb = col;
    gl_FragColor.a = 1.0;

    
}
