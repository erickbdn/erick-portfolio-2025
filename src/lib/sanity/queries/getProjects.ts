import { sanity } from '../client';

export async function getProjects() {
	const query = `*[_type == "project" && defined(slug.current)] | order(_createdAt desc) {
		_id,
		title,
		"slug": slug.current,
		summary,
		description,
		technologies,
		images[]{
			asset->{
				url,
				metadata { dimensions }
			}
		}
	}`;

	return await sanity.fetch(query);
}
