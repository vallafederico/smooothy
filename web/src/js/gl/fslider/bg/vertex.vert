#include '../../glsl/constants.glsl'
// precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

#include './pass.glsl'

uniform float u_a_view;
uniform float u_a_speed;

void main() {
  vec3 pos = position;
  
  pos.x += cos(pos.y * 3.14) * .06 * u_a_speed;
  pos.xy *= u_a_view  - abs(u_a_speed) * .01;
  // pos.x *= 1. - abs(u_a_speed) * .1;

  

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  v_uv = uv;

  v_normal = normal;
}
