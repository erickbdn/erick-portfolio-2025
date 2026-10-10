// stores/transition.ts
import { writable } from 'svelte/store';

export type ParticleTarget =
	| { type: 'sphere' }
	| { type: 'image'; imageUrl: string }
	| { type: 'text'; text: string };

export const triggerExplosion = writable(false);
export const isContracting = writable(false);
export const aboutActive = writable(false);
export const particleTarget = writable<ParticleTarget>({ type: 'sphere' });

// Optional: Add more granular control
export const morphingToImage = writable(false);
export const morphingToSphere = writable(false);
export const isImageMode = writable(false);
