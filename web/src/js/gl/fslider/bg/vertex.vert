precision mediump float;
#include '../../glsl/constants.glsl'

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform vec3 u_random;

#include './pass.glsl'
#include '../../glsl/perlin3d.glsl'

uniform float u_a_view;
uniform float u_a_speed;
uniform float u_a_center;
uniform float u_a_in;



void main() {
  vec3 pos = position;
 
  pos.x += cos(pos.y * 3.14) * .09 * u_a_speed;

  pos.y -=.5;
  pos.y *= u_a_in;
  pos.y +=.5;

  // * scale to size
  float startAt = distance(uv, vec2(0.5));
  float prog = smoothstep(startAt, 1., u_a_view);
  vec2 scale = vec2(1. + prog);  
  pos.xyz = mix(
    pos.xyz * .9, 
    pos.xyz * .8, 
    prog
  );



  // pos.xy *= 1. - vec2(u_a_in) * .2;
  

  // * wave on move
  pos.z += 1. * sin(pos.x * 4. + pos.y * .2 + u_time * 4. + u_random.x) * (u_a_speed + u_random.z * .2) * .03;  

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  v_uv = uv;

  float ns = perlin3d(vec4(
    v_uv.x + u_a_speed * .3 * .8,
    v_uv.yx + u_random.yz * .8, 
    u_time + pos.x * 0.1
  ));


  v_normal = normal;
  v_ns = ns;
}
