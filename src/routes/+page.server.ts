import { getProjectPreviews } from '$lib/sanity/queries/getProjectPreviews'

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  const projectPreviews = await getProjectPreviews()
  return { projectPreviews }
}
