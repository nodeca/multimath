// Calculates 16-bit precision HSL lightness from 8-bit rgba buffer
//
export default function hsl_l16_js (img, width, height) {
  const size = width * height
  const out = new Uint16Array(size)
  let r, g, b, min, max
  for (let i = 0; i < size; i++) {
    r = img[4 * i]
    g = img[4 * i + 1]
    b = img[4 * i + 2]
    max = (r >= g && r >= b) ? r : (g >= b && g >= r) ? g : b
    min = (r <= g && r <= b) ? r : (g <= b && g <= r) ? g : b
    out[i] = (max + min) * 257 >> 1
  }
  return out
}
