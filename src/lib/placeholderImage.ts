// Utility to generate a deterministic SVG placeholder based on a string (e.g., article ID)
export function generatePlaceholderImage(id: string, width = 400, height = 225) {
  // Simple hash function to seed PRNG
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Seeded pseudo-random number generator (LCG)
  function mulberry32(seed: number) {
    return function() {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(hash);

  // Generate 3-6 circles with random positions, radii, and pastel colors
  const numCircles = 3 + Math.floor(rand() * 4); // 3 to 6
  let circles = '';
  for (let i = 0; i < numCircles; i++) {
    const cx = Math.floor(rand() * width * 0.9 + width * 0.05);
    const cy = Math.floor(rand() * height * 0.9 + height * 0.05);
    const r = Math.floor(rand() * (height / 4) + height / 8);
    const hue = Math.floor(rand() * 360);
    const color = `hsl(${hue}, 70%, 85%)`;
    const opacity = 0.4 + rand() * 0.4; // 0.4 to 0.8
    circles += `<circle cx='${cx}' cy='${cy}' r='${r}' fill='${color}' fill-opacity='${opacity.toFixed(2)}'/>`;
  }

  // Optionally add a line for extra variety
  const lineX1 = Math.floor(rand() * width);
  const lineY1 = Math.floor(rand() * height);
  const lineX2 = Math.floor(rand() * width);
  const lineY2 = Math.floor(rand() * height);
  const lineColor = `hsl(${Math.floor(rand() * 360)}, 60%, 80%)`;
  const line = `<line x1='${lineX1}' y1='${lineY1}' x2='${lineX2}' y2='${lineY2}' stroke='${lineColor}' stroke-width='${2 + Math.floor(rand() * 3)}' stroke-opacity='0.5'/>`;

  // Background color
  const bgHue = Math.floor(rand() * 360);
  const bgColor = `hsl(${bgHue}, 70%, 95%)`;

  // SVG
  const svg = `<svg width='${width}' height='${height}' xmlns='http://www.w3.org/2000/svg'><rect width='100%' height='100%' fill='${bgColor}'/>${circles}${line}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
} 