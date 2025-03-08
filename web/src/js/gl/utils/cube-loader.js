import { CubeTextureLoader, Math } from "three";
const tl = new CubeTextureLoader();

/*  ORDER IS: px, nx, py, ny, pz, nz
    const { px, nx, py, ny, pz, nz } = IMPORTEDPATH;
    const cbmarr = [px, nx, py, ny, pz, nz]
*/

export default function loadCube(arr) {
  return new Promise((resolve) => {
    tl.load(arr, (data) => {
      data.needsUpdate = true;
      // console.log(data);
      resolve(data);
    });
  });
}

// fragment using cubemap

/*
uniform samplerCube u_cube;

// ...

// cubemap
vec3 R = reflect(vec3(0, 0, 8), normalize(v_coords.xyz));
// vec3 smp = sampledBlur(0.5, u_cube, R, 10);

vec3 cube_map = 1. - textureCube(u_cube, v_coords.xyz).rgb;
vec3 cube_map_r = textureCube(u_cube, R).rgb;
float cube_map_l = (cube_map.r + cube_map.g + cube_map.b) / 3.;

// col *= 1. - cube_map_l * .5;
col *= 1. - cube_map_r * .1;

*/
