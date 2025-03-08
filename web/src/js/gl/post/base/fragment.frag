uniform float opacity;
uniform sampler2D tDiffuse;
varying vec2 vUv;

void main() {
    vec4 tx = texture2D( tDiffuse, vUv );
    gl_FragColor.rgb = tx.rgb;
    gl_FragColor.a = tx.a;
}


/** post */
// gl_FragColor.rgb = ACESFilmicToneMapping(diff.rgb);
// gl_FragColor.a = 1.;
// gl_FragColor = linearToOutputTexel(gl_FragColor);