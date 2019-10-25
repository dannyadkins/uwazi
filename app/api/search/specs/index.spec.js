/**
 * /* eslint-disable max-nested-callbacks
 *
 * @format
 */

import errorLog from 'api/log/errorLog';
import elasticIndexConfig from 'api/config/elasticIndexes';
import { search, elastic } from 'api/search';
import db from 'api/utils/testing_db';
import instanceElasticTesting from 'api/utils/elastic_testing';
import fixtures, { ids } from './fixtures_indexing';

describe('search', () => {
  const elasticTesting = instanceElasticTesting('search_index_test');
  const elasticIndex = elasticIndexConfig.index;

  beforeAll(async () => {
    await db.clearAllAndLoad(fixtures);
  });

  afterAll(async () => {
    await db.disconnect();
  });

  fit('should index resolved thesauri', async () => {
    const id1 = db.id().toString();
    const id2 = db.id().toString();
    const entities = [
      {
        _id: id1,
        title: 'entity1',
        template: ids.template1,
        metadata: {
          thesauri_select: 'egyptId',
        },
      },
      {
        _id: id2,
        title: 'entity2',
        template: ids.template1,
        metadata: {
          thesauri_select: 'chileId',
        },
      },
    ];

    spyOn(elastic, 'bulk').and.callThrough();

    await search.bulkIndex(entities);

    expect(elastic.bulk).toHaveBeenCalledWith({
      body: [
        { index: { _index: elasticIndex, _type: 'entity', _id: id1 } },
        {
          title: 'entity1',
          template: ids.template1,
          metadata: {
            thesauri_select: 'egyptId',
          },
          _metadata: {
            thesauri_select: 'Egypt',
          },
        },
        { index: { _index: elasticIndex, _type: 'entity', _id: id2 } },
        {
          title: 'entity2',
          template: ids.template1,
          metadata: {
            thesauri_select: 'chileId',
          },
          _metadata: {
            thesauri_select: 'Chile',
          },
        },
      ],
    });
  });

  describe('when language is not supported (korean in this case)', () => {
    it('should index the fullText as child as "other" language (so searches can be performed)', async () => {
      const entity = {
        _id: db.id(),
        sharedId: 'sharedIdOtherLanguage',
        type: 'document',
        title: 'Batman indexes',
        fullText: {
          1: '조',
          2: '선말',
        },
        language: 'en',
      };

      await search.bulkIndex([entity]);
      await elasticTesting.refresh();
      let snippets = await search.searchSnippets('조', entity.sharedId, 'en');
      expect(snippets.fullText.length).toBe(1);

      snippets = await search.searchSnippets('nothing', entity.sharedId, 'en');
      expect(snippets.fullText.length).toBe(0);
    });
  });

  describe('bulkIndex', () => {
    it('should update docs using the bulk functionality', async () => {
      spyOn(elastic, 'bulk').and.returnValue(Promise.resolve({ items: [] }));
      const toIndexDocs = [
        { _id: 'id1', title: 'test1', pdfInfo: 'Should not be included' },
        { _id: 'id2', title: 'test2', pdfInfo: 'Should not be included' },
      ];

      await search.bulkIndex(toIndexDocs);

      expect(elastic.bulk).toHaveBeenCalledWith({
        body: [
          { index: { _index: elasticIndex, _type: 'entity', _id: 'id1' } },
          { title: 'test1' },
          { index: { _index: elasticIndex, _type: 'entity', _id: 'id2' } },
          { title: 'test2' },
        ],
      });
    });

    describe('when docs have fullText', () => {
      it('should be indexed separatedly as a child of the doc', async () => {
        spyOn(elastic, 'bulk').and.returnValue(Promise.resolve({ items: [] }));
        const toIndexDocs = [
          {
            _id: 'id1',
            title: 'test1',
            fullText: { 1: 'this is an english test', 2: 'this is page2' },
          },
          { _id: 'id2', title: 'test2', fullText: { 1: 'text3[[1]]', 2: 'text4[[2]]' } },
        ];

        await search.bulkIndex(toIndexDocs, 'index');
        const bulkIndexArguments = elastic.bulk.calls.allArgs()[0][0];
        expect(bulkIndexArguments).toEqual({
          body: [
            { index: { _index: elasticIndex, _type: 'entity', _id: 'id1' } },
            { title: 'test1' },
            {
              index: {
                _index: elasticIndex,
                _type: 'fullText',
                parent: 'id1',
                _id: 'id1_fullText',
              },
            },
            { fullText_english: 'this is an english test\fthis is page2' },
            { index: { _index: elasticIndex, _type: 'entity', _id: 'id2' } },
            { title: 'test2' },
            {
              index: {
                _index: elasticIndex,
                _type: 'fullText',
                parent: 'id2',
                _id: 'id2_fullText',
              },
            },
            { fullText_other: 'text3[[1]]\ftext4[[2]]' },
          ],
        });
      });
    });

    describe('when there is an indexation error', () => {
      it('should log the error with the id of the document and the error message', async () => {
        spyOn(elastic, 'bulk').and.returnValue(
          Promise.resolve({
            items: [{ index: { _id: '_id1', error: 'something terrible happened' } }],
          })
        );
        spyOn(errorLog, 'error');
        const toIndexDocs = [{ _id: 'id1', title: 'test1' }];
        await search.bulkIndex(toIndexDocs, 'index');

        expect(errorLog.error).toHaveBeenCalledWith(
          'ERROR Failed to index document _id1: "something terrible happened"'
        );
      });
    });
  });

  describe('delete', () => {
    it('should delete the index', async () => {
      spyOn(elastic, 'delete').and.returnValue(Promise.resolve());

      const id = db.id();

      const entity = {
        _id: id,
        type: 'document',
        title: 'Batman indexes',
      };

      await search.delete(entity);
      expect(elastic.delete).toHaveBeenCalledWith({
        index: elasticIndex,
        type: 'entity',
        id: id.toString(),
      });
    });
  });

  describe('bulkdelete', () => {
    it('should delete documents in a bulk action', async () => {
      spyOn(elastic, 'bulk').and.returnValue(Promise.resolve({ items: [] }));
      const entities = [
        { _id: 'id1', title: 'test1', pdfInfo: 'Should not be included' },
        { _id: 'id2', title: 'test2', pdfInfo: 'Should not be included' },
      ];

      await search.bulkDelete(entities);
      expect(elastic.bulk).toHaveBeenCalledWith({
        body: [
          { delete: { _index: elasticIndex, _type: 'entity', _id: 'id1' } },
          { delete: { _index: elasticIndex, _type: 'entity', _id: 'id2' } },
        ],
      });
    });
  });

  describe('deleteLanguage', () => {
    it('should delete the index', async () => {
      spyOn(elastic, 'deleteByQuery').and.returnValue(Promise.resolve());

      await search.deleteLanguage('en');

      expect(elastic.deleteByQuery).toHaveBeenCalledWith({
        index: elasticIndex,
        body: { query: { match: { language: 'en' } } },
      });
    });
  });
});
