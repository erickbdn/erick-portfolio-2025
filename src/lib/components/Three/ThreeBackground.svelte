<script lang="ts">
	import { TextureLoader } from 'three';
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import gsap from 'gsap';
	import { particleVertexShader } from '$lib/shaders/particleVertexShader';
	import { particleFragmentShader } from '$lib/shaders/particleFragmentShader';

	let container: HTMLDivElement;
	let animationFrame: number;

	const mouseTarget = new THREE.Vector2(0, 0);
	const mouseLerped = new THREE.Vector2(0, 0);

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

		const geometry = new THREE.BufferGeometry();
		const positions = new Float32Array(particleCount * 3);
		const seeds = new Float32Array(particleCount);
		const shapeIndices = new Float32Array(particleCount);

		for (let i = 0; i < particleCount; i++) {
			const phi = Math.acos(2 * Math.random() - 1);
			const theta = 2 * Math.PI * Math.random();
			const r = 1;

			positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
			positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
			positions[i * 3 + 2] = r * Math.cos(phi);

			seeds[i] = Math.random();
			shapeIndices[i] = Math.floor(Math.random() * atlasCount);
		}

		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));
		geometry.setAttribute('shapeIndex', new THREE.BufferAttribute(shapeIndices, 1));

		const material = new THREE.ShaderMaterial({
			vertexShader: particleVertexShader,
			fragmentShader: particleFragmentShader,
			transparent: true,
			uniforms: {
				uTime: { value: 0 },
				uSphereRadius: { value: 0.05 }, // Start small
				uMouse: { value: new THREE.Vector2() },
				uTexture: { value: texture },
				uAtlasCols: { value: atlasCols },
				uAtlasRows: { value: atlasRows }
			}
		});

		const particles = new THREE.Points(geometry, material);
		scene.add(particles);

		const clock = new THREE.Clock();
		let rotationMultiplier = 8.0; // Start fast

		// 🌀 Animate intro
		const tl = gsap.timeline();

		tl.to(renderer.domElement, {
			opacity: 1,
			duration: 1.8,
			ease: 'circ.out',
			delay: 0.2,
		});

		tl.to(
			material.uniforms.uSphereRadius,
			{
				value: 3.2, // Target radius
				duration: 3,
				ease: 'circ.inOut',
				delay: 0.4
			},
			0
		);

		tl.to(
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

		const animate = () => {
			const elapsed = clock.getElapsedTime();
			material.uniforms.uTime.value = elapsed;
			material.uniforms.uMouse.value.copy(mouseLerped);

			particles.rotation.y += 0.001 * rotationMultiplier;
			particles.rotation.x += 0.001 * rotationMultiplier;

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
			container.innerHTML = '';
		};
	});
</script>

<div bind:this={container} class="absolute inset-0 -z-50 opacity-50"></div>
