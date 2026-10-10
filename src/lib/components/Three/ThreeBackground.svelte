<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import gsap from 'gsap';
	import { page } from '$app/stores';
	import { triggerExplosion, isContracting, particleTarget } from '$lib/stores/transition';
	import { particleVertexShader } from '$lib/shaders/particleVertexShader';
	import { particleFragmentShader } from '$lib/shaders/particleFragmentShader';
	import { ParticleMorpher } from '$lib/utils/imageToParticles';

	let container: HTMLDivElement;
	let animationFrame: number;

	const mouseTarget = new THREE.Vector2(0, 0);
	const mouseLerped = new THREE.Vector2(0, 0);

	let geometry: THREE.BufferGeometry;
	let particles: THREE.Points;
	let material: THREE.ShaderMaterial;
	let morpher: ParticleMorpher;
	let backgroundOpacity = 0.5;

	onMount(() => {
		const texture = new THREE.TextureLoader().load('/textures/atlas.png');

		function handlePointerMove(e: MouseEvent) {
			const rect = container.getBoundingClientRect();
			mouseTarget.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
			mouseTarget.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

			gsap.to(mouseLerped, {
				x: mouseTarget.x,
				y: mouseTarget.y,
				duration: 0.75,
				ease: 'none'
			});
		}

		window.addEventListener('pointermove', handlePointerMove);

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			45,
			container.clientWidth / container.clientHeight,
			0.1,
			100
		);
		camera.position.z = 12;

		const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		renderer.setSize(container.clientWidth, container.clientHeight);
		renderer.domElement.style.opacity = '0';
		container.appendChild(renderer.domElement);

		const atlasCols = 2;
		const atlasRows = 2;
		const atlasCount = atlasCols * atlasRows;
		const particleCount = 150;
		const baseSize = 8.0;

		geometry = new THREE.BufferGeometry();

		const positions = new Float32Array(particleCount * 3);
		const seeds = new Float32Array(particleCount);
		const shapeIndices = new Float32Array(particleCount);
		const colors = new Float32Array(particleCount * 3);
		const initialSizes = new Float32Array(particleCount);
		const baseColor = new THREE.Color('#f4f1de');

		initialSizes.fill(baseSize);

		for (let i = 0; i < particleCount; i++) {
			const phi = Math.acos(2 * Math.random() - 1);
			const theta = 2 * Math.PI * Math.random();
			const r = 3.2;

			positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
			positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
			positions[i * 3 + 2] = r * Math.cos(phi);

			seeds[i] = Math.random();
			shapeIndices[i] = Math.floor(Math.random() * atlasCount);
			colors[i * 3 + 0] = baseColor.r;
			colors[i * 3 + 1] = baseColor.g;
			colors[i * 3 + 2] = baseColor.b;
		}

		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));
		geometry.setAttribute('shapeIndex', new THREE.BufferAttribute(shapeIndices, 1));
		geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
		geometry.setAttribute('size', new THREE.BufferAttribute(initialSizes, 1));

		material = new THREE.ShaderMaterial({
			vertexShader: particleVertexShader,
			fragmentShader: particleFragmentShader,
			transparent: true,
			uniforms: {
				uTime: { value: 0 },
				uSphereRadius: { value: 0.05 },
				uMouse: { value: new THREE.Vector2() },
				uTexture: { value: texture },
				uAtlasCols: { value: atlasCols },
				uAtlasRows: { value: atlasRows },
				uSize: { value: 8.0 },
				uImageSize: { value: 8.0 },
				uIsImageMode: { value: 0.0 }
			},
			vertexColors: true
		});

		particles = new THREE.Points(geometry, material);
		scene.add(particles);

		morpher = new ParticleMorpher(
			geometry,
			{
				imageUrl: '/image/2.png',
				particleSpacing: 6,
				threshold: 10,
				scaleFactor: 0.0085,
				textScaleFactor: 0.0074,
				textParticleSpacing: 3,
				maxImageParticles: 15000,
				maxTextParticles: 16000,
				clusterIntensity: 2.4,
				densityVariation: 0.4,
				imageSizeMultiplier: 0.25,
				textSizeMultiplier: 0.18
			},
			{
				explosionDuration: 3.2,
				explosionEasing: gsap.parseEase('circ.inOut'),
				contractionDuration: 3.2,
				contractionEasing: gsap.parseEase('power4.out')
			}
		);

		const clock = new THREE.Clock();
		let rotationMultiplier = 20.0;

		const intro = gsap.timeline();
		intro.to(renderer.domElement, {
			opacity: 1,
			duration: 1.8,
			ease: 'circ.out',
			delay: 0.2
		});
		intro.to(
			material.uniforms.uSphereRadius,
			{
				value: 3.2,
				duration: 3,
				ease: 'circ.inOut',
				delay: 0.4
			},
			0
		);
		intro.to(
			{ speed: rotationMultiplier },
			{
				speed: 1.0,
				duration: 2.0,
				ease: 'circ.out',
				delay: 2.0,
				onUpdate() {
					rotationMultiplier = this.targets()[0].speed;
				}
			},
			0.4
		);
		intro.to(
			material.uniforms.uSize,
			{
				value: 6.0,
				duration: 3,
				ease: 'circ.inOut',
				delay: 0.4
			},
			0
		);

		const explosionTimeline = gsap.timeline({ paused: true });

		explosionTimeline.to(
			[material.uniforms.uSphereRadius, material.uniforms.uSize],
			{
				value: (i: number) => [0, 50][i],
				duration: 1.2,
				ease: 'circ.inOut'
			},
			0
		);

		explosionTimeline.to([material.uniforms.uSphereRadius, material.uniforms.uSize], {
			value: (i: number) => [3.2, 8.0][i],
			duration: 2.0,
			ease: 'power4.out',
			onStart: () => isContracting.set(true),
			onComplete: () => {
				isContracting.set(false);
				rotationMultiplier = 1.0;
			}
		});

		const unsubscribeExplosion = triggerExplosion.subscribe((value) => {
			if (value) {
				explosionTimeline.play(0);
			}
		});

		const unsubscribeParticleTarget = particleTarget.subscribe((target) => {
			morpher.setTarget(target);
		});

		const unsubscribePage = page.subscribe(($page) => {
			const path = $page.url.pathname;

			if (path === '/about') {
				backgroundOpacity = 0.5;
				particleTarget.set({ type: 'image', imageUrl: '/image/2.png' });
			} else if (path === '/skills') {
				backgroundOpacity = 0.88;
			} else if (path !== '/skills') {
				backgroundOpacity = 0.5;
				particleTarget.set({ type: 'sphere' });
			}
		});

		const animate = () => {
			const elapsed = clock.getElapsedTime();
			material.uniforms.uTime.value = elapsed;
			material.uniforms.uMouse.value.copy(mouseLerped);

			morpher.update(material);

			if (morpher.shouldRotate()) {
				particles.rotation.y += 0.001 * rotationMultiplier;
				particles.rotation.x += 0.001 * rotationMultiplier;
			} else {
				morpher.resetRotation(particles);
			}

			renderer.render(scene, camera);
			animationFrame = requestAnimationFrame(animate);
		};

		animate();

		const resize = () => {
			camera.aspect = container.clientWidth / container.clientHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(container.clientWidth, container.clientHeight);
		};

		window.addEventListener('resize', resize);

		return () => {
			cancelAnimationFrame(animationFrame);
			window.removeEventListener('resize', resize);
			window.removeEventListener('pointermove', handlePointerMove);
			unsubscribeExplosion();
			unsubscribeParticleTarget();
			unsubscribePage();
			explosionTimeline.kill();
			intro.kill();
			renderer.dispose();
			geometry.dispose();
			material.dispose();
			container.innerHTML = '';
		};
	});
</script>

<div bind:this={container} class="absolute inset-0 -z-50" style:opacity={backgroundOpacity}></div>
