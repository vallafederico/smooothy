precision mediump float;

#include './pass.glsl'

uniform vec3 COL_1;
uniform vec3 COL_2;
uniform vec3 COL_3;


vec3 gradientMix(vec3 color1, vec3 color2, vec3 color3, float t) {
    return mix(
        mix(color1, color2, smoothstep(0.0, 0.5, t)),
        mix(color2, color3, smoothstep(0.5, 1.0, t)),
        smoothstep(0.25, 0.75, t)
    );
}

vec3 saturate(vec3 color) {    
    float minVal = min(min(color.r, color.g), color.b);
    float maxVal = max(max(color.r, color.g), color.b);
    float delta = maxVal - minVal;

    vec3 saturated = vec3(
        color.r + (color.r - 0.5) * 0.5,
        color.g + (color.g - 0.5) * 0.5, 
        color.b + (color.b - 0.5) * 0.5
    );
    
    return clamp(saturated, 0.0, 1.0);
}



void main() {
    vec3 col = 1. * gradientMix(
        COL_1, 
        COL_2, 
        COL_3,
        v_ns
    );

    col = saturate(col);


    gl_FragColor.rgb = col;
    gl_FragColor.a = 1.0;

    
}
