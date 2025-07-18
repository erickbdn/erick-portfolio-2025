import * as THREE from 'three';

export function createHalfCircle(radius = 1) {
  const shape = new THREE.Shape();
  shape.moveTo(-radius, 0);
  shape.absarc(0, 0, radius, Math.PI, 0, false);
  shape.lineTo(-radius, 0);
  return shape;
}

export function createQuarterCircle(radius = 1) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.absarc(0, 0, radius, Math.PI, Math.PI * 1.5, false);
  shape.lineTo(0, 0);
  return shape;
}

export function createCircle(radius = 1) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
  return shape;
}

export function createSquare(size = 1) {
  const shape = new THREE.Shape();
  shape.moveTo(-size / 2, -size / 2);
  shape.lineTo(size / 2, -size / 2);
  shape.lineTo(size / 2, size / 2);
  shape.lineTo(-size / 2, size / 2);
  shape.lineTo(-size / 2, -size / 2);
  return shape;
}
