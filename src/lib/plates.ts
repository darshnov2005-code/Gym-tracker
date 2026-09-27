/** Calculate plates per side for a barbell (kg). Assumes standard Olympic bar. */
export function calculatePlates(
  targetKg: number,
  barWeight = 20,
  availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25]
): { perSide: number[]; total: number; leftover: number } {
  if (targetKg <= barWeight) {
    return { perSide: [], total: barWeight, leftover: targetKg - barWeight }
  }
  let remaining = (targetKg - barWeight) / 2
  const perSide: number[] = []
  for (const plate of availablePlates) {
    while (remaining >= plate - 0.001) {
      perSide.push(plate)
      remaining -= plate
    }
  }
  const loaded = barWeight + perSide.reduce((a, b) => a + b, 0) * 2
  return {
    perSide,
    total: Math.round(loaded * 100) / 100,
    leftover: Math.round((targetKg - loaded) * 100) / 100
  }
}