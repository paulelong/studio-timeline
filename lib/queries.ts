export const TIMELINE_QUERY = `*[_type == "entry"] | order(date asc) {
  _id,
  title,
  date,
  excerpt,
  "slug": slug.current,
  tags,
  rooms,
  media[]{
    _type,
    asset->{
      _id,
      url,
      originalFilename,
      mimeType,
      metadata
    }
  },
  relatedDocs[]->{
    _id,
    title,
    slug
  }
}`;
