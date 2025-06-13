uniform float opacity;
uniform sampler2D tDiffuse;
varying vec2 vUv;

vec3 ACESFilm(vec3 color) {
    float A = 2.51;
    float B = 0.03;
    float C = 2.43;
    float D = 0.59;
    float E = 0.14;
    return clamp((color * (A * color + B)) / (color * (C * color + D) + E), 0.0, 1.0);
}


uniform float u_a_in;


void main() {
    vec4 tx = texture2D(tDiffuse, vUv);

    vec3 color = tx.rgb;
    color = mix(vec3(0.), color, u_a_in);

    gl_FragColor.rgb = color;
    gl_FragColor.a = tx.a;

    gl_FragColor = linearToOutputTexel(gl_FragColor);
    gl_FragColor.rgb = ACESFilm(gl_FragColor.rgb);
}
