// src/lib/sanity/queries/getProjectPreviews.ts
import { sanity } from '../client'

export async function getProjectPreviews() {
  const query = `*[_type == "project" && highlight == true && defined(slug.current)] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    images[]{
      asset->{
        url,
        metadata { dimensions }
      }
    }
  }`

  return await sanity.fetch(query)
}
