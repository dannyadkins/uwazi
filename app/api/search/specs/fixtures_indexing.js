/**
 * /* eslint-disable max-len
 *
 * @format
 */

import db from 'api/utils/testing_db';

const userId = db.id();
const batmanBegins = 'shared2';
const batmanFinishes = 'shared';
const metadataSnippets = 'metadataSnippets';

const template1 = db.id();
const template2 = db.id();
const templateMetadata1 = db.id();
const templateMetadata2 = db.id();
const countriesDictionaryID = db.id();

export default {
  entities: [
    {
      title: 'entity1',
      metadata: {
        thesauri_select: 'egyptId',
      },
    },
    {
      title: 'entity2',
      metadata: {
        thesauri_select: 'spainID',
      },
    },
  ],
  templates: [
    {
      _id: template1,
      properties: [
        { name: 'thesauri_select', type: 'select', content: countriesDictionaryID },
        // { name: 'multidaterange', type: 'multidaterange', filter: true },
      ],
    },
  ],
  dictionaries: [
    {
      _id: countriesDictionaryID,
      name: 'Contries Dcitionary',
      values: [
        {
          label: 'Egypt',
          id: 'egyptId',
        },
        {
          label: 'Chile',
          id: 'chileId',
        },
        {
          label: 'Egypto',
          id: 'EgyptoId',
        },
        {
          label: 'Europe',
          id: 'EuropeId',
          values: [{ label: 'Spain', id: 'spainID' }, { label: 'France', id: 'franceID' }],
        },
      ],
    },
  ],
};

export const ids = {
  batmanBegins,
  batmanFinishes,
  metadataSnippets,
  userId,
  template1: template1.toString(),
  template2: template2.toString(),
  templateMetadata1: templateMetadata1.toString(),
  templateMetadata2: templateMetadata2.toString(),
};
