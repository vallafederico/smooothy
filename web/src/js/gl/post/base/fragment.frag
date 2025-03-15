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




void main() {
    vec4 tx = texture2D( tDiffuse, vUv );
    gl_FragColor.rgb = tx.rgb;
    gl_FragColor.a = tx.a;

    // beauty pass
    gl_FragColor = linearToOutputTexel(gl_FragColor);
    gl_FragColor.rgb = ACESFilm(gl_FragColor.rgb);
}


/** post */
// gl_FragColor.a = 1.;
