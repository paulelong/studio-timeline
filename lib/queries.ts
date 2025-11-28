export const TIMELINE_QUERY = `*[_type == "entry"] | order(date desc) {
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
      metadata
    }
  },
  relatedDocs[]->{
    _id,
    title,
    slug
  }
}`;
