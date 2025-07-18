import { createClient } from '@sanity/client'

export const sanity = createClient({
    projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
    dataset: import.meta.env.VITE_SANITY_DATASET,       // or 'development' if you changed it
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION,     // today’s date or Sanity's latest stable version
  useCdn: true,                 // enables caching (good for public content)
})