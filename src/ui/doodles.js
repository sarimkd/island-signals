import rough from "roughjs";

const SVG_NS = "http://www.w3.org/2000/svg";
const feline = new Set(["cat", "dog", "fox", "tiger", "lion"]);
const birds = new Set(["chick", "parrot", "penguin"]);
const hoofed = new Set(["cow", "deer", "hog", "pig", "polar", "panda", "koala", "beaver"]);

export function createNotebookDoodle(kind = "note", index = 0) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.classList.add("note-doodle");
  svg.setAttribute("viewBox", "0 0 64 58");
  svg.setAttribute("aria-hidden", "true");
  const sketch = rough.svg(svg);
  const baseSeed = 31 + index * 19;
  let seed = baseSeed;
  const options = (extra = {}) => ({ stroke: "#315e54", strokeWidth: 1.7, roughness: 1.25, bowing: 1.4, seed: seed++, ...extra });
  const add = (node) => svg.append(node);
  const line = (x1,y1,x2,y2,extra) => add(sketch.line(x1,y1,x2,y2,options(extra)));
  const ellipse = (x,y,w,h,extra) => add(sketch.ellipse(x,y,w,h,options(extra)));
  const path = (d,extra) => add(sketch.path(d,options(extra)));
  const polygon = (points,extra) => add(sketch.polygon(points,options(extra)));
  const fill = { fill: "rgba(77,139,115,.13)", fillStyle: "hachure", hachureGap: 3 };

  if (kind === "fish") {
    ellipse(29,29,31,18,fill); polygon([[44,29],[58,18],[57,39]],fill); ellipse(22,26,2.2,2.2,{fill:"#315e54",fillStyle:"solid"});
  } else if (kind === "bee") {
    ellipse(32,31,24,16,fill); ellipse(25,20,15,13); ellipse(39,20,15,13); line(27,24,27,38); line(34,23,34,39); line(41,25,41,36); line(25,16,20,10); line(39,16,44,10);
  } else if (kind === "crab") {
    ellipse(32,30,24,16,fill); [[20,34,10,42],[24,38,18,48],[44,34,54,42],[40,38,46,48]].forEach((p)=>line(...p)); path("M19 27 C10 22 9 14 16 14"); path("M45 27 C54 22 55 14 48 14");
  } else if (kind === "caterpillar") {
    [16,26,36,46].forEach((x,i)=>ellipse(x,32-i%2*2,14,14,{...fill,seed:seed++})); line(11,23,7,15); line(18,23,22,15);
  } else if (kind === "bunny") {
    ellipse(32,32,24,23,fill); ellipse(25,14,9,22); ellipse(39,14,9,22); ellipse(27,30,2,2,{fill:"#315e54",fillStyle:"solid"}); ellipse(37,30,2,2,{fill:"#315e54",fillStyle:"solid"});
  } else if (kind === "elephant") {
    ellipse(31,27,27,24,fill); ellipse(18,27,15,19); ellipse(44,27,15,19); path("M31 35 C31 48 38 49 39 42");
  } else if (kind === "giraffe") {
    ellipse(37,19,14,12,fill); path("M31 22 L26 48 L40 48 L40 23 Z",fill); line(33,12,30,6); line(40,12,44,6);
  } else if (birds.has(kind)) {
    ellipse(31,31,25,28,fill); polygon([[43,28],[55,32],[44,35]],fill); line(26,45,24,53); line(36,45,38,53); if(kind==="penguin") path("M23 25 C30 20 37 20 42 26");
  } else if (feline.has(kind)) {
    ellipse(32,31,27,25,fill); polygon([[20,23],[20,10],[27,20]],fill); polygon([[44,23],[44,10],[37,20]],fill); ellipse(27,29,2,2,{fill:"#315e54",fillStyle:"solid"}); ellipse(37,29,2,2,{fill:"#315e54",fillStyle:"solid"}); line(22,36,9,33); line(22,39,9,42); line(42,36,55,33); line(42,39,55,42);
  } else if (kind === "monkey") {
    ellipse(32,29,25,26,fill); ellipse(18,29,10,13); ellipse(46,29,10,13); ellipse(32,35,16,11); path("M24 46 C18 54 10 48 14 42");
  } else if (hoofed.has(kind)) {
    ellipse(30,31,30,19,fill); ellipse(46,26,16,15,fill); line(20,39,18,52); line(31,40,31,52); line(41,38,43,51); if(kind==="cow"||kind==="deer"){line(42,18,38,10);line(49,18,54,10);} if(kind==="pig"||kind==="hog") ellipse(51,29,7,5); if(kind==="beaver") polygon([[13,32],[5,27],[5,40]],fill);
  } else if (kind === "land" || kind === "ocean" || kind === "rain" || kind === "life") {
    path("M10 45 C20 38 27 48 35 39 C44 30 50 38 56 25"); line(10,49,56,49); if(kind==="rain"){path("M18 21 C20 12 36 12 39 21 C48 20 50 32 41 34 L18 34 C9 32 10 22 18 21"); [22,31,40].forEach(x=>line(x,38,x-3,45));}
  } else if (kind === "research" || kind === "person") {
    ellipse(32,19,15,15,fill); path("M17 49 C18 32 46 32 47 49",fill); line(23,42,41,42);
  } else {
    path("M8 12 C8 7 55 7 56 13 L55 39 C55 45 24 45 18 41 L8 49 L11 38 C8 33 8 18 8 12 Z",fill);
  }
  return svg;
}
