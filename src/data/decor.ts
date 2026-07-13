// Fixed (deterministic) decorative shape positions for the background.
// Hardcoded rather than Math.random() so every rendered frame is consistent.
export const decorShapes: Array<{
  x: number;
  y: number;
  size: number;
  color: string;
  kind: 'circle' | 'star';
  speed: number;
  phase: number;
}> = [
  {x: 8, y: 15, size: 34, color: '#FFC93C', kind: 'circle', speed: 0.6, phase: 0},
  {x: 88, y: 12, size: 26, color: '#FF6F61', kind: 'star', speed: 0.5, phase: 1.2},
  {x: 92, y: 70, size: 40, color: '#00E6B8', kind: 'circle', speed: 0.4, phase: 2.1},
  {x: 5, y: 78, size: 30, color: '#7C5CFC', kind: 'star', speed: 0.55, phase: 0.7},
  {x: 15, y: 92, size: 22, color: '#FFC93C', kind: 'circle', speed: 0.7, phase: 3.0},
  {x: 80, y: 90, size: 18, color: '#FF6F61', kind: 'circle', speed: 0.65, phase: 1.8},
  {x: 50, y: 6, size: 20, color: '#00E6B8', kind: 'star', speed: 0.45, phase: 2.6},
  {x: 3, y: 45, size: 16, color: '#FFC93C', kind: 'circle', speed: 0.8, phase: 0.3},
  {x: 96, y: 40, size: 24, color: '#3A5DFF', kind: 'circle', speed: 0.5, phase: 1.5},
  {x: 25, y: 4, size: 14, color: '#FF6F61', kind: 'circle', speed: 0.9, phase: 2.9},
];
