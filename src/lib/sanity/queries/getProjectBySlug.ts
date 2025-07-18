// src/lib/sanity/queries/getProjectBySlug.ts
import { sanity } from '../client'

export async function getProjectBySlug(slug: string) {
  const query = `*[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    summary,
    description,
    technologies,
    images[]{
      asset->{
        url,
        metadata { dimensions }
      }
    }
  }`

  return await sanity.fetch(query, { slug })
}
