import entry from './entry';
import doc from './doc';
import room from './room';

export const schemaTypes = [entry, doc, room];

export default {
  name: 'default',
  title: 'Studio Timeline Schema',
  types: schemaTypes,
};
