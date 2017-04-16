#include <stdint.h>
#include <stdbool.h>


#define R(x) ((uint8_t)(x))
#define G(x) ((uint8_t)((x) >> 8))
#define B(x) ((uint8_t)((x) >> 16))


void hsl_l16(int32_t width, int32_t height, bool write_for_BE)
{
  uint8_t  *memory = 0;

  uint32_t *src = (uint32_t *)memory;
  uint16_t *dst = (uint16_t *)memory;

  int32_t  i = width * height;
  uint32_t rgba;
  uint8_t  r, g, b;
  uint16_t l;

  while (i-- > 0) {
    rgba = *src;
    src++;

    r = R(rgba);
    g = G(rgba);
    b = B(rgba);

    l = (uint16_t)(((
      ((r >= g && r >= b) ? r : (g >= b && g >= r) ? g : b) +
      ((r <= g && r <= b) ? r : (g <= b && g <= r) ? g : b)
    ) * 257) >> 1);
    l = write_for_BE ? (((l & 0xff00) >> 8) | (l << 8)) : l;

    *dst = l;
    dst++;
  }
}
