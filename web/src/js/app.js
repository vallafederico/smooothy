import { Slider } from "./slider";

const s1 = document.querySelector("[data-slider='1']");
if (s1) {
  const slider1 = new Slider(s1);
}

const s2 = document.querySelector("[data-slider='2']");
if (s2) {
  const slider2 = new Slider(s2, {
    infinite: false,
  });
}
