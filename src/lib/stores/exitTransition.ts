// src/lib/stores/pageTransition.ts
import { writable } from 'svelte/store';

export const isNavigatingAway = writable(false);
export const targetRoute = writable<string | null>(null);
