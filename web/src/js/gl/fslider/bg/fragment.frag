precision mediump float;
// uniform sampler2D u_t1; vec4 img = texture2D(u_t1, v_uv);

#include './pass.glsl'




void main() {

  gl_FragColor = vec4(v_uv, 1., 1.);
  // gl_FragColor = vec4(1., 0., 0., 1.);
}
