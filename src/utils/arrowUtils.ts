// Tangent angle helpers for quadratic bezier arrows

// Calculate tangent angle at end of quadratic bezier (from control to end)
export function calculateEndTangentAngle(control: { x: number; y: number }, end: { x: number; y: number }): number {
  const dx = end.x - control.x;
  const dy = end.y - control.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

// Calculate tangent angle at start of quadratic bezier (from start to control)
export function calculateStartTangentAngle(start: { x: number; y: number }, control: { x: number; y: number }): number {
  const dx = control.x - start.x;
  const dy = control.y - start.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}
