import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Studio Timeline')
    .items([
      S.documentTypeListItem('entry').title('Timeline Entries'),
      S.documentTypeListItem('room').title('Rooms'),
      S.documentTypeListItem('doc').title('Documents'),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['entry', 'room', 'doc'].includes(item.getId()!),
      ),
    ])
