#include '../../glsl/constants.glsl'
// precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;



#include './pass.glsl'

uniform float u_a_view;


void main() {
  vec3 pos = position;

  
  pos.xy *= u_a_view ;
  

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  v_uv = uv;

  v_normal = normal;
}
