import { getProjects } from '$lib/sanity/queries/getProjects';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const projects = await getProjects();

	return { projects };
}
