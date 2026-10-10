import * as THREE from 'three';

type RGB = { r: number; g: number; b: number };

export type ParticleData = {
	positions: Float32Array;
	colors: Float32Array;
	sizes: Float32Array;
};

type ParticleTarget =
	| { type: 'sphere' }
	| { type: 'image'; imageUrl: string }
	| { type: 'text'; text: string };

type CanvasParticleOptions = {
	particleSpacing?: number;
	threshold?: number;
	maxParticles?: number;
	clusterIntensity?: number;
	densityVariation?: number;
	coordinateScale?: number;
};

type ParticleSample = {
	x: number;
	y: number;
	weight: number;
	size: number;
	color: RGB;
};

export async function imageToParticles(
	imageUrl: string,
	particleSpacing = 4,
	threshold = 128,
	maxParticles = 3000,
	clusterIntensity = 2,
	densityVariation = 1
): Promise<ParticleData> {
	const img = new Image();
	img.crossOrigin = 'anonymous';
	img.src = imageUrl;

	await new Promise<void>((resolve, reject) => {
		img.onload = () => resolve();
		img.onerror = () => reject(new Error(`Failed to load particle image: ${imageUrl}`));
	});

	const scale = 1.5;
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	if (!ctx) throw new Error('Could not get canvas context');

	canvas.width = img.width * scale;
	canvas.height = img.height * scale;
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

	return canvasToParticles(canvas, {
		particleSpacing,
		threshold,
		maxParticles,
		clusterIntensity,
		densityVariation,
		coordinateScale: scale
	});
}

export async function textToParticles(
	text: string,
	options: {
		maxParticles?: number;
		particleSpacing?: number;
		fontFamily?: string;
		color?: string;
	} = {}
): Promise<ParticleData> {
	if ('fonts' in document) {
		await document.fonts.ready;
	}

	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	if (!ctx) throw new Error('Could not get canvas context');

	const width = 1280;
	const height = 360;
	const padding = 72;
	const label = text.trim().toUpperCase();

	canvas.width = width;
	canvas.height = height;
	ctx.clearRect(0, 0, width, height);
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = options.color ?? '#f4f1de';
	ctx.strokeStyle = options.color ?? '#f4f1de';
	ctx.lineJoin = 'round';
	ctx.lineWidth = 7;

	let fontSize = 176;
	const fontFamily = options.fontFamily ?? 'Satoshi-Variable, Arial, sans-serif';

	while (fontSize > 72) {
		ctx.font = `900 ${fontSize}px ${fontFamily}`;
		if (ctx.measureText(label).width <= width - padding * 2) break;
		fontSize -= 8;
	}

	ctx.font = `900 ${fontSize}px ${fontFamily}`;
	ctx.strokeText(label, width / 2, height / 2 + fontSize * 0.04);
	ctx.fillText(label, width / 2, height / 2 + fontSize * 0.04);

	return canvasToParticles(canvas, {
		particleSpacing: options.particleSpacing ?? 5,
		threshold: 20,
		maxParticles: options.maxParticles ?? 6500,
		clusterIntensity: 0.35,
		densityVariation: 1,
		coordinateScale: 1
	});
}

function canvasToParticles(
	canvas: HTMLCanvasElement,
	options: CanvasParticleOptions
): ParticleData {
	const ctx = canvas.getContext('2d');

	if (!ctx) throw new Error('Could not get canvas context');

	const width = canvas.width;
	const height = canvas.height;
	const particleSpacing = options.particleSpacing ?? 4;
	const threshold = options.threshold ?? 128;
	const maxParticles = options.maxParticles ?? 3000;
	const clusterIntensity = options.clusterIntensity ?? 2;
	const densityVariation = options.densityVariation ?? 1;
	const coordinateScale = options.coordinateScale ?? 1;

	const imgData = ctx.getImageData(0, 0, width, height);
	const data = imgData.data;
	const luminanceMap = new Float32Array(width * height);
	const colorMap: RGB[] = [];

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const i = (y * width + x) * 4;
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];
			const a = data[i + 3];

			if (a < threshold / 10) {
				luminanceMap[y * width + x] = -1;
				colorMap.push({ r: 0, g: 0, b: 0 });
				continue;
			}

			const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
			luminanceMap[y * width + x] = luminance;
			colorMap.push({ r: r / 255, g: g / 255, b: b / 255 });
		}
	}

	const particles: ParticleSample[] = [];
	const baseStep = Math.max(2, particleSpacing);

	for (let y = 0; y < height; y += baseStep) {
		for (let x = 0; x < width; x += baseStep) {
			const luminance = sampleLuminance(luminanceMap, x, y, width, height);

			if (luminance < 0) continue;

			let shouldPlace = true;

			if (luminance < 0.15) {
				shouldPlace = Math.random() < (0.4 + luminance * 2) * densityVariation;
			} else if (luminance < 0.5) {
				shouldPlace = Math.random() < (0.7 + luminance * 0.6) * densityVariation;
			}

			if (shouldPlace) {
				const jitterAmount = baseStep * (0.3 + Math.random() * 0.4);
				const finalX = x + (Math.random() - 0.5) * jitterAmount;
				const finalY = y + (Math.random() - 0.5) * jitterAmount;
				const finalLuminance = sampleLuminance(luminanceMap, finalX, finalY, width, height);
				const colorIndex = Math.floor(finalY) * width + Math.floor(finalX);

				if (finalLuminance >= 0 && colorIndex >= 0 && colorIndex < colorMap.length) {
					particles.push({
						x: finalX,
						y: finalY,
						weight: finalLuminance,
						size: 2 + finalLuminance * 12,
						color: colorMap[colorIndex]
					});
				}
			}
		}
	}

	const brightThreshold = 0.6;
	const clusterAttempts = Math.floor(maxParticles * 0.3);

	for (let i = 0; i < clusterAttempts; i++) {
		const x = Math.random() * width;
		const y = Math.random() * height;
		const luminance = sampleLuminance(luminanceMap, x, y, width, height);

		if (luminance > brightThreshold) {
			const clusterSize = Math.floor(1 + (luminance - brightThreshold) * clusterIntensity * 8);
			const clusterRadius = 8 + (luminance - brightThreshold) * 20;

			for (let j = 0; j < clusterSize; j++) {
				const angle = Math.random() * Math.PI * 2;
				const distance = Math.random() * clusterRadius;
				const clusterX = x + Math.cos(angle) * distance;
				const clusterY = y + Math.sin(angle) * distance;

				if (clusterX >= 0 && clusterX < width && clusterY >= 0 && clusterY < height) {
					const clusterLuminance = sampleLuminance(luminanceMap, clusterX, clusterY, width, height);
					const colorIndex = Math.floor(clusterY) * width + Math.floor(clusterX);

					if (clusterLuminance >= 0 && colorIndex >= 0 && colorIndex < colorMap.length) {
						particles.push({
							x: clusterX,
							y: clusterY,
							weight: clusterLuminance,
							size: 3 + clusterLuminance * 15,
							color: colorMap[colorIndex]
						});
					}
				}
			}
		}
	}

	const finalParticles = particles
		.filter(
			(particle) => particle.x >= 0 && particle.x < width && particle.y >= 0 && particle.y < height
		)
		.sort((a, b) => b.weight - a.weight || Math.random() - 0.5)
		.slice(0, maxParticles);

	const positions: number[] = [];
	const colors: number[] = [];
	const sizes: number[] = [];
	const halfW = width / 2;
	const halfH = height / 2;

	for (const particle of finalParticles) {
		positions.push(
			(particle.x - halfW) / coordinateScale,
			-(particle.y - halfH) / coordinateScale,
			0
		);
		colors.push(particle.color.r, particle.color.g, particle.color.b);
		sizes.push(particle.size);
	}

	return {
		positions: new Float32Array(positions),
		colors: new Float32Array(colors),
		sizes: new Float32Array(sizes)
	};
}

function sampleLuminance(
	luminanceMap: Float32Array,
	x: number,
	y: number,
	width: number,
	height: number
): number {
	const x1 = Math.floor(x);
	const y1 = Math.floor(y);
	const x2 = Math.min(x1 + 1, width - 1);
	const y2 = Math.min(y1 + 1, height - 1);

	if (x1 < 0 || y1 < 0 || x2 >= width || y2 >= height) return -1;

	const fx = x - x1;
	const fy = y - y1;
	const tl = luminanceMap[y1 * width + x1];
	const tr = luminanceMap[y1 * width + x2];
	const bl = luminanceMap[y2 * width + x1];
	const br = luminanceMap[y2 * width + x2];

	if (tl < 0 || tr < 0 || bl < 0 || br < 0) return -1;

	const top = tl + (tr - tl) * fx;
	const bottom = bl + (br - bl) * fx;

	return top + (bottom - top) * fy;
}

export interface MorphConfig {
	imageUrl?: string;
	particleSpacing?: number;
	threshold?: number;
	scaleFactor?: number;
	textScaleFactor?: number;
	textParticleSpacing?: number;
	sphereRadius?: number;
	atlasCount?: number;
	maxImageParticles?: number;
	maxTextParticles?: number;
	imageSizeMultiplier?: number;
	textSizeMultiplier?: number;
	clusterIntensity?: number;
	densityVariation?: number;
	textFontFamily?: string;
	textColor?: string;
}

export interface MorphState {
	targetPositions: Float32Array;
	targetColors: Float32Array;
	targetSizes: Float32Array;
	sourcePositions: Float32Array;
	sourceColors: Float32Array;
	sourceSizes: Float32Array;
	spherePositions: Float32Array;
	sphereColors: Float32Array;
	sphereSizes: Float32Array;
	capacityCount: number;
	visibleCount: number;
	baseCount: number;
	startVisibleCount: number;
	targetVisibleCount: number;
	morphCount: number;
	morphingToTarget: boolean;
	morphingToSphere: boolean;
	morphProgress: number;
	morphStartTime: number;
	modeValue: number;
	startModeValue: number;
	targetModeValue: number;
	currentlyShowingTarget: boolean;
	activeTargetKey: string;
}

export interface MorphTiming {
	explosionDuration: number;
	explosionEasing: (t: number) => number;
	contractionDuration: number;
	contractionEasing: (t: number) => number;
}

type ResolvedMorphConfig = Required<Omit<MorphConfig, 'imageUrl'>> & { imageUrl: string };

export class ParticleMorpher {
	private config: ResolvedMorphConfig;
	public state: MorphState;
	private geometry: THREE.BufferGeometry;
	private timing: MorphTiming;
	private requestId = 0;

	constructor(geometry: THREE.BufferGeometry, config: MorphConfig, timing?: MorphTiming) {
		this.geometry = geometry;
		this.timing = timing || {
			explosionDuration: 1.2,
			explosionEasing: (t) => t,
			contractionDuration: 2,
			contractionEasing: (t) => t
		};

		this.config = {
			imageUrl: '/image/2.png',
			particleSpacing: 3,
			threshold: 128,
			scaleFactor: 0.002,
			textScaleFactor: 0.006,
			textParticleSpacing: 4,
			sphereRadius: 3.2,
			atlasCount: 4,
			maxImageParticles: 800,
			maxTextParticles: 6500,
			imageSizeMultiplier: 0.4,
			textSizeMultiplier: 0.55,
			clusterIntensity: 2.5,
			densityVariation: 0.8,
			textFontFamily: 'Satoshi-Variable, Arial, sans-serif',
			textColor: '#f4f1de',
			...config
		};

		const positions = this.geometry.getAttribute('position').array as Float32Array;
		const colors = this.geometry.getAttribute('color').array as Float32Array;
		const sizes = this.geometry.getAttribute('size').array as Float32Array;
		const baseCount = positions.length / 3;

		this.state = {
			targetPositions: new Float32Array(),
			targetColors: new Float32Array(),
			targetSizes: new Float32Array(),
			sourcePositions: new Float32Array(),
			sourceColors: new Float32Array(),
			sourceSizes: new Float32Array(),
			spherePositions: positions.slice(),
			sphereColors: colors.slice(),
			sphereSizes: sizes.slice(),
			capacityCount: baseCount,
			visibleCount: baseCount,
			baseCount,
			startVisibleCount: baseCount,
			targetVisibleCount: baseCount,
			morphCount: baseCount,
			morphingToTarget: false,
			morphingToSphere: false,
			morphProgress: 0,
			morphStartTime: 0,
			modeValue: 0,
			startModeValue: 0,
			targetModeValue: 0,
			currentlyShowingTarget: false,
			activeTargetKey: 'sphere'
		};
	}

	async setTarget(target: ParticleTarget): Promise<void> {
		const targetKey = this.getTargetKey(target);

		if (targetKey === this.state.activeTargetKey && !this.isMorphing()) return;

		const requestId = ++this.requestId;

		if (target.type === 'sphere') {
			this.startMorphToSphere();
			return;
		}

		const rawTarget =
			target.type === 'image'
				? await imageToParticles(
						target.imageUrl,
						this.config.particleSpacing,
						this.config.threshold,
						this.config.maxImageParticles,
						this.config.clusterIntensity,
						this.config.densityVariation
					)
				: await textToParticles(target.text, {
						maxParticles: this.config.maxTextParticles,
						particleSpacing: this.config.textParticleSpacing,
						fontFamily: this.config.textFontFamily,
						color: this.config.textColor
					});

		if (requestId !== this.requestId) return;

		const positionScale =
			target.type === 'image' ? this.config.scaleFactor : this.config.textScaleFactor;
		const sizeMultiplier =
			target.type === 'image' ? this.config.imageSizeMultiplier : this.config.textSizeMultiplier;

		this.startMorphToTarget(
			this.scaleParticleData(rawTarget, positionScale, sizeMultiplier),
			targetKey
		);
	}

	startMorphToImage(): void {
		this.setTarget({ type: 'image', imageUrl: this.config.imageUrl });
	}

	startMorphToSphere(): void {
		if (this.state.activeTargetKey === 'sphere' && !this.isMorphing()) return;

		this.requestId++;
		const morphCount = Math.max(this.state.visibleCount, this.state.baseCount);
		this.ensureCapacity(morphCount);
		this.captureSource(morphCount);

		this.state.targetPositions = this.state.spherePositions.slice(0, morphCount * 3);
		this.state.targetColors = this.state.sphereColors.slice(0, morphCount * 3);
		this.state.targetSizes = this.state.sphereSizes.slice(0, morphCount);
		this.state.startVisibleCount = this.state.visibleCount;
		this.state.targetVisibleCount = this.state.baseCount;
		this.state.morphCount = morphCount;
		this.state.morphingToTarget = false;
		this.state.morphingToSphere = true;
		this.state.morphProgress = 0;
		this.state.morphStartTime = performance.now();
		this.state.startModeValue = this.state.modeValue;
		this.state.targetModeValue = 0;
		this.state.activeTargetKey = 'sphere';
	}

	update(material: THREE.ShaderMaterial): boolean {
		if (!this.isMorphing()) return false;

		const now = performance.now();
		const isTargetMorph = this.state.morphingToTarget;
		const duration = isTargetMorph
			? this.timing.explosionDuration
			: this.timing.contractionDuration;
		const easing = isTargetMorph ? this.timing.explosionEasing : this.timing.contractionEasing;
		const rawProgress = Math.min((now - this.state.morphStartTime) / (duration * 1000), 1);

		this.state.morphProgress = easing(rawProgress);

		const positions = this.geometry.getAttribute('position').array as Float32Array;
		const colors = this.geometry.getAttribute('color').array as Float32Array;
		const sizes = this.geometry.getAttribute('size').array as Float32Array;

		for (let i = 0; i < this.state.morphCount; i++) {
			positions[i * 3 + 0] = this.lerp(
				this.state.sourcePositions[i * 3 + 0],
				this.state.targetPositions[i * 3 + 0],
				this.state.morphProgress
			);
			positions[i * 3 + 1] = this.lerp(
				this.state.sourcePositions[i * 3 + 1],
				this.state.targetPositions[i * 3 + 1],
				this.state.morphProgress
			);
			positions[i * 3 + 2] = this.lerp(
				this.state.sourcePositions[i * 3 + 2],
				this.state.targetPositions[i * 3 + 2],
				this.state.morphProgress
			);

			colors[i * 3 + 0] = this.lerp(
				this.state.sourceColors[i * 3 + 0],
				this.state.targetColors[i * 3 + 0],
				this.state.morphProgress
			);
			colors[i * 3 + 1] = this.lerp(
				this.state.sourceColors[i * 3 + 1],
				this.state.targetColors[i * 3 + 1],
				this.state.morphProgress
			);
			colors[i * 3 + 2] = this.lerp(
				this.state.sourceColors[i * 3 + 2],
				this.state.targetColors[i * 3 + 2],
				this.state.morphProgress
			);
			sizes[i] = this.lerp(
				this.state.sourceSizes[i],
				this.state.targetSizes[i],
				this.state.morphProgress
			);
		}

		this.geometry.attributes.position.needsUpdate = true;
		this.geometry.attributes.color.needsUpdate = true;
		this.geometry.attributes.size.needsUpdate = true;

		const visibleCount = Math.round(
			this.lerp(
				this.state.startVisibleCount,
				this.state.targetVisibleCount,
				this.state.morphProgress
			)
		);

		this.geometry.setDrawRange(0, Math.max(1, visibleCount));

		this.state.modeValue = this.lerp(
			this.state.startModeValue,
			this.state.targetModeValue,
			this.state.morphProgress
		);
		material.uniforms.uIsImageMode.value = this.state.modeValue;

		if (rawProgress >= 1) {
			this.state.morphingToTarget = false;
			this.state.morphingToSphere = false;
			this.state.visibleCount = this.state.targetVisibleCount;
			this.state.modeValue = this.state.targetModeValue;
			this.state.currentlyShowingTarget = this.state.targetModeValue > 0;
			this.geometry.setDrawRange(0, this.state.visibleCount);
			material.uniforms.uIsImageMode.value = this.state.modeValue;
		}

		return true;
	}

	handleAboutActiveChange(isAbout: boolean): void {
		this.setTarget(
			isAbout ? { type: 'image', imageUrl: this.config.imageUrl } : { type: 'sphere' }
		);
	}

	shouldRotate(): boolean {
		return !this.state.currentlyShowingTarget && !this.isMorphing();
	}

	resetRotation(particles: THREE.Points): void {
		if (this.state.modeValue > 0.01 || this.isMorphing()) {
			particles.rotation.set(0, 0, 0);
		}
	}

	private startMorphToTarget(target: ParticleData, targetKey: string): void {
		const targetCount = target.positions.length / 3;

		if (!targetCount) return;

		this.ensureCapacity(targetCount);
		this.captureSource(targetCount);

		this.state.targetPositions = target.positions;
		this.state.targetColors = target.colors;
		this.state.targetSizes = target.sizes;
		this.state.startVisibleCount = this.state.visibleCount;
		this.state.targetVisibleCount = targetCount;
		this.state.morphCount = targetCount;
		this.state.morphingToTarget = true;
		this.state.morphingToSphere = false;
		this.state.morphProgress = 0;
		this.state.morphStartTime = performance.now();
		this.state.startModeValue = this.state.modeValue;
		this.state.targetModeValue = 1;
		this.state.activeTargetKey = targetKey;
	}

	private captureSource(count: number): void {
		const positions = this.geometry.getAttribute('position').array as Float32Array;
		const colors = this.geometry.getAttribute('color').array as Float32Array;
		const sizes = this.geometry.getAttribute('size').array as Float32Array;

		this.state.sourcePositions = positions.slice(0, count * 3);
		this.state.sourceColors = colors.slice(0, count * 3);
		this.state.sourceSizes = sizes.slice(0, count);
	}

	private ensureCapacity(count: number): void {
		if (count <= this.state.capacityCount) return;

		const oldCapacity = this.state.capacityCount;
		const positions = this.geometry.getAttribute('position').array as Float32Array;
		const colors = this.geometry.getAttribute('color').array as Float32Array;
		const sizes = this.geometry.getAttribute('size').array as Float32Array;
		const seeds = this.geometry.getAttribute('seed').array as Float32Array;
		const shapeIndices = this.geometry.getAttribute('shapeIndex').array as Float32Array;
		const baseColor = new THREE.Color('#f4f1de');
		const baseSize = sizes[0] || 8;

		const newPositions = new Float32Array(count * 3);
		const newColors = new Float32Array(count * 3);
		const newSizes = new Float32Array(count);
		const newSeeds = new Float32Array(count);
		const newShapeIndices = new Float32Array(count);
		const newSpherePositions = new Float32Array(count * 3);
		const newSphereColors = new Float32Array(count * 3);
		const newSphereSizes = new Float32Array(count);

		newPositions.set(positions);
		newColors.set(colors);
		newSizes.set(sizes);
		newSeeds.set(seeds);
		newShapeIndices.set(shapeIndices);
		newSpherePositions.set(this.state.spherePositions);
		newSphereColors.set(this.state.sphereColors);
		newSphereSizes.set(this.state.sphereSizes);

		for (let i = oldCapacity; i < count; i++) {
			const spherePosition = this.createSpherePosition();

			newPositions[i * 3 + 0] = spherePosition.x;
			newPositions[i * 3 + 1] = spherePosition.y;
			newPositions[i * 3 + 2] = spherePosition.z;
			newSpherePositions[i * 3 + 0] = spherePosition.x;
			newSpherePositions[i * 3 + 1] = spherePosition.y;
			newSpherePositions[i * 3 + 2] = spherePosition.z;

			newColors[i * 3 + 0] = baseColor.r;
			newColors[i * 3 + 1] = baseColor.g;
			newColors[i * 3 + 2] = baseColor.b;
			newSphereColors[i * 3 + 0] = baseColor.r;
			newSphereColors[i * 3 + 1] = baseColor.g;
			newSphereColors[i * 3 + 2] = baseColor.b;

			newSizes[i] = baseSize;
			newSphereSizes[i] = baseSize;
			newSeeds[i] = Math.random();
			newShapeIndices[i] = Math.floor(Math.random() * this.config.atlasCount);
		}

		this.geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
		this.geometry.setAttribute('color', new THREE.BufferAttribute(newColors, 3));
		this.geometry.setAttribute('size', new THREE.BufferAttribute(newSizes, 1));
		this.geometry.setAttribute('seed', new THREE.BufferAttribute(newSeeds, 1));
		this.geometry.setAttribute('shapeIndex', new THREE.BufferAttribute(newShapeIndices, 1));

		this.state.spherePositions = newSpherePositions;
		this.state.sphereColors = newSphereColors;
		this.state.sphereSizes = newSphereSizes;
		this.state.capacityCount = count;
	}

	private scaleParticleData(
		data: ParticleData,
		positionScale: number,
		sizeMultiplier: number
	): ParticleData {
		const positions = new Float32Array(data.positions.length);
		const sizes = new Float32Array(data.sizes.length);

		for (let i = 0; i < data.positions.length; i += 3) {
			positions[i + 0] = data.positions[i + 0] * positionScale;
			positions[i + 1] = data.positions[i + 1] * positionScale;
			positions[i + 2] = data.positions[i + 2] * positionScale;
		}

		for (let i = 0; i < data.sizes.length; i++) {
			sizes[i] = data.sizes[i] * sizeMultiplier;
		}

		return {
			positions,
			colors: data.colors,
			sizes
		};
	}

	private createSpherePosition(): THREE.Vector3 {
		const phi = Math.acos(2 * Math.random() - 1);
		const theta = 2 * Math.PI * Math.random();
		const r = this.config.sphereRadius;

		return new THREE.Vector3(
			r * Math.sin(phi) * Math.cos(theta),
			r * Math.sin(phi) * Math.sin(theta),
			r * Math.cos(phi)
		);
	}

	private getTargetKey(target: ParticleTarget): string {
		if (target.type === 'image') return `image:${target.imageUrl}`;
		if (target.type === 'text') return `text:${target.text.trim().toUpperCase()}`;
		return 'sphere';
	}

	private isMorphing(): boolean {
		return this.state.morphingToTarget || this.state.morphingToSphere;
	}

	private lerp(a: number, b: number, t: number): number {
		return a + (b - a) * t;
	}
}
