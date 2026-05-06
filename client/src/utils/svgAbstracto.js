// Genera un SVG abstracto único y determinístico basado en el id del evento

const PALETA = [
  '#c8f0d8', '#f5d0e8', '#d0e8f5', '#f5e8d0',
  '#e8d0f5', '#f5f0c8', '#d0f5e8', '#f5c8d0',
];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seeded(id, offset) {
  return hash(id + offset);
}

function pick(arr, n) {
  return arr[n % arr.length];
}

export function generarSVG(id, w = 400, h = 220) {
  const s = (offset, max) => seeded(id, offset) % max;

  const bg = pick(PALETA, s('bg', 8));
  const c1 = pick(PALETA.filter(c => c !== bg), s('c1', 7));
  const c2 = pick(PALETA.filter(c => c !== bg && c !== c1), s('c2', 6));

  const shapes = [];

  // 2-4 círculos grandes difusos
  const nCircles = 2 + s('nc', 3);
  for (let i = 0; i < nCircles; i++) {
    const cx = s(`cx${i}`, w);
    const cy = s(`cy${i}`, h);
    const r = 40 + s(`cr${i}`, 120);
    const color = i % 2 === 0 ? c1 : c2;
    const opacity = 0.4 + (s(`co${i}`, 40) / 100);
    shapes.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${opacity.toFixed(2)}"/>`);
  }

  // 1-3 rectángulos rotados
  const nRects = 1 + s('nr', 3);
  for (let i = 0; i < nRects; i++) {
    const x = s(`rx${i}`, w) - 50;
    const y = s(`ry${i}`, h) - 30;
    const rw = 60 + s(`rw${i}`, 180);
    const rh = 20 + s(`rh${i}`, 80);
    const rot = s(`rr${i}`, 60) - 30;
    const color = i % 2 === 0 ? c2 : c1;
    const opacity = 0.25 + (s(`ro${i}`, 30) / 100);
    shapes.push(`<rect x="${x}" y="${y}" width="${rw}" height="${rh}" fill="${color}" opacity="${opacity.toFixed(2)}" transform="rotate(${rot}, ${x + rw / 2}, ${y + rh / 2})"/>`);
  }

  // 2-4 líneas diagonales
  const nLines = 2 + s('nl', 3);
  for (let i = 0; i < nLines; i++) {
    const x1 = s(`lx1${i}`, w);
    const y1 = s(`ly1${i}`, h);
    const x2 = s(`lx2${i}`, w);
    const y2 = s(`ly2${i}`, h);
    const sw = 1 + s(`lw${i}`, 4);
    const color = i % 2 === 0 ? c1 : c2;
    shapes.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" opacity="0.35"/>`);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  ${shapes.join('\n  ')}
</svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
