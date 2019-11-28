/** @format */

import * as types from 'app/Library/actions/actionTypes';
import api from 'app/Search/SearchAPI';
import { notificationActions } from 'app/Notifications';
import { actions as formActions } from 'react-redux-form';
import { actions } from 'app/BasicReducer';
import { documentsApi } from 'app/Documents';
import { browserHistory } from 'react-router';
import rison from 'rison';
import referencesAPI from 'app/Viewer/referencesAPI';
import { api as entitiesAPI } from 'app/Entities';
import { toUrlParams } from 'shared/JSONRequest';
import { RequestParams } from 'app/utils/RequestParams';
import superagent from 'superagent';

export function enterLibrary() {
  return { type: types.ENTER_LIBRARY };
}

export function initializeFiltersForm(values = {}) {
  return Object.assign(values, { type: types.INITIALIZE_FILTERS_FORM });
}

export function selectDocument(doc) {
  return (dispatch, getState) => {
    let document = doc;
    if (doc.toJS) {
      document = doc.toJS();
    }
    if (
      getState().library.sidepanel.tab === 'semantic-search-results' &&
      !document.semanticSearch
    ) {
      dispatch(actions.set('library.sidepanel.tab', ''));
    }
    dispatch({ type: types.SELECT_DOCUMENT, doc: document });
  };
}

export function getAndSelectDocument(sharedId) {
  return dispatch => {
    entitiesAPI.get(new RequestParams({ sharedId })).then(entity => {
      dispatch({ type: types.SELECT_SINGLE_DOCUMENT, doc: entity[0] });
    });
  };
}

export function selectDocuments(docs) {
  return { type: types.SELECT_DOCUMENTS, docs };
}

export function unselectDocument(docId) {
  return { type: types.UNSELECT_DOCUMENT, docId };
}

export function selectSingleDocument(doc) {
  return { type: types.SELECT_SINGLE_DOCUMENT, doc };
}

export function unselectAllDocuments() {
  return { type: types.UNSELECT_ALL_DOCUMENTS };
}

export function updateSelectedEntities(entities) {
  return { type: types.UPDATE_SELECTED_ENTITIES, entities };
}

export function showFilters() {
  return { type: types.SHOW_FILTERS };
}

export function hideFilters() {
  return { type: types.HIDE_FILTERS };
}

export function setDocuments(docs) {
  return { type: types.SET_DOCUMENTS, documents: docs };
}

export function unsetDocuments() {
  return { type: types.UNSET_DOCUMENTS };
}

export function setTemplates(templates, thesauris) {
  return dispatch => {
    dispatch({ type: types.SET_LIBRARY_TEMPLATES, templates, thesauris });
  };
}

export function setPreviewDoc(docId) {
  return { type: types.SET_PREVIEW_DOC, docId };
}

export function setSuggestions(suggestions) {
  return { type: types.SET_SUGGESTIONS, suggestions };
}

export function hideSuggestions() {
  return { type: types.HIDE_SUGGESTIONS };
}

export function showSuggestions() {
  return { type: types.SHOW_SUGGESTIONS };
}

export function setOverSuggestions(boolean) {
  return { type: types.OVER_SUGGESTIONS, hover: boolean };
}

export function zoomIn() {
  return { type: types.ZOOM_IN };
}

export function zoomOut() {
  return { type: types.ZOOM_OUT };
}

export function filterIsEmpty(value) {
  if (value && value.values && !value.values.length) {
    return true;
  }

  if (Array.isArray(value) && !value.length) {
    return true;
  }

  if (typeof value === 'string' && !value) {
    return true;
  }

  if (typeof value === 'object') {
    const hasValue = Object.keys(value).reduce(
      (result, key) => result || Boolean(value[key]),
      false
    );
    return !hasValue;
  }

  return false;
}

export function processFilters(readOnlySearch, filters, limit) {
  const search = Object.assign({ filters: {} }, readOnlySearch);
  search.filters = {};

  filters.properties.forEach(property => {
    if (!filterIsEmpty(readOnlySearch.filters[property.name]) && !property.filters) {
      search.filters[property.name] = readOnlySearch.filters[property.name];
    }

    if (property.filters) {
      const searchFilter = Object.assign({}, readOnlySearch.filters[property.name]);
      property.filters.forEach(filter => {
        if (filterIsEmpty(searchFilter[filter.name])) {
          delete searchFilter[filter.name];
        }
      });

      if (Object.keys(searchFilter).length) {
        search.filters[property.name] = searchFilter;
      }
    }
  });

  search.types = filters.documentTypes;
  search.limit = limit;
  return search;
}

export function encodeSearch(search, appendQ = true) {
  Object.keys(search).forEach(key => {
    if (search[key] && search[key].length === 0) {
      delete search[key];
    }

    if (typeof search[key] === 'object' && Object.keys(search[key]).length === 0) {
      delete search[key];
    }

    if (search[key] === '') {
      delete search[key];
    }
  });

  return appendQ ? `?q=${rison.encode(search)}` : rison.encode(search);
}

function setSearchInUrl(searchParams) {
  const { pathname } = browserHistory.getCurrentLocation();
  const path = `${pathname}/`.replace(/\/\//g, '/');
  const query = browserHistory.getCurrentLocation().query || {};

  query.q = encodeSearch(searchParams, false);
  browserHistory.push(path + toUrlParams(query));
}

function genQueryToken(searchTerm) {
  return new Promise(resolve => {
    superagent
      .post('http://localhost:8081/client-api')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('X-Requested-With', 'XMLHttpRequest')
      .set('Access-Control-Allow-Credentials', 'true')
      .set('Access-Control-Allow-Origin', 'http://localhost:3000')
      .send({
        id: '1',
        jsonrpc: '2.0',
        method: 'GenQueryToken',
        params: {
          password: 'secret',
          keyword: searchTerm,
        },
      })
      .then(res => {
        console.log('Query token:');
        console.log(JSON.parse(res.text).result);
        resolve(JSON.parse(res.text).result);
      });
  });
}

const encryptedSearch = (searchBytes, user) => {
  console.log('Performing encrypted search.');

  if (!searchBytes) {
    return;
  }
  console.log(searchBytes);
  return new Promise(resolve => {
    superagent
      .post('http://localhost:8081/server-api')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('X-Requested-With', 'XMLHttpRequest')
      .set('Access-Control-Allow-Credentials', 'true')
      .set('Access-Control-Allow-Origin', 'http://localhost:3000')
      .send({
        id: '1',
        jsonrpc: '2.0',
        method: 'Query',
        params: {
          pathToEmm: 'EMMs/admin.out',
          searchToken: searchBytes,
        },
      })
      .then(res => {
        console.log('Encrypted search response:');
        console.log(JSON.parse(res.text).result);
        resolve(JSON.parse(res.text).result);
      })
      .catch(e => {
        console.log(e);
        resolve([]);
      });
  });
};

export function searchDocuments({ search, filters }, storeKey, limit = 30) {
  return (dispatch, getState) => {
    const state = getState()[storeKey];
    let currentFilters = filters || state.filters;
    currentFilters = currentFilters.toJS ? currentFilters.toJS() : currentFilters;

    const finalSearchParams = processFilters(search, currentFilters, limit);
    finalSearchParams.searchTerm = state.search.searchTerm;

    const currentSearchParams = rison.decode(
      decodeURIComponent(browserHistory.getCurrentLocation().q || '()')
    );
    if (
      finalSearchParams.searchTerm &&
      finalSearchParams.searchTerm !== currentSearchParams.searchTerm
    ) {
      finalSearchParams.sort = '_score';
    }

    if (search.userSelectedSorting) dispatch(actions.set(`${storeKey}.selectedSorting`, search));
    genQueryToken(finalSearchParams.searchTerm).then(queryToken => {
      var parsableQueryToken = finalSearchParams.searchTerm + 'ENC_SRCH@' + queryToken;
      var encryptedSearchDocs = encryptedSearch(queryToken, 'admin');
      console.log(encryptedSearchDocs);
      setSearchInUrl(finalSearchParams);
    });
  };
}

export function elementCreated(doc) {
  return { type: types.ELEMENT_CREATED, doc };
}

export function updateEntity(updatedDoc) {
  return { type: types.UPDATE_DOCUMENT, doc: updatedDoc };
}

export function updateEntities(updatedDocs) {
  return { type: types.UPDATE_DOCUMENTS, docs: updatedDocs };
}

export function searchSnippets(searchTerm, sharedId, storeKey) {
  return dispatch =>
    api.searchSnippets(new RequestParams({ searchTerm, id: sharedId })).then(snippets => {
      dispatch(actions.set(`${storeKey}.sidepanel.snippets`, snippets));
      return snippets;
    });
}

export function saveDocument(doc, formKey) {
  return dispatch =>
    documentsApi.save(new RequestParams(doc)).then(updatedDoc => {
      dispatch(notificationActions.notify('Document updated', 'success'));
      dispatch(formActions.reset(formKey));
      dispatch(updateEntity(updatedDoc));
      dispatch(actions.updateIn('library.markers', ['rows'], updatedDoc));
      dispatch(selectSingleDocument(updatedDoc));
    });
}

export function multipleUpdate(entities, values) {
  return dispatch => {
    const updatedEntities = entities.toJS().map(_entity => {
      const entity = { ..._entity };
      entity.metadata = Object.assign({}, entity.metadata, values.metadata);
      if (values.icon) {
        entity.icon = values.icon;
      }
      return entity;
    });

    const ids = updatedEntities.map(entity => entity.sharedId);
    return entitiesAPI.multipleUpdate(new RequestParams({ ids, values })).then(() => {
      dispatch(notificationActions.notify('Update success', 'success'));
      dispatch(updateEntities(updatedEntities));
    });
  };
}

export function saveEntity(entity, formModel) {
  return dispatch =>
    entitiesAPI.save(new RequestParams(entity)).then(updatedDoc => {
      dispatch(formActions.reset(formModel));
      dispatch(unselectAllDocuments());
      if (entity._id) {
        dispatch(notificationActions.notify('Entity updated', 'success'));
        dispatch(updateEntity(updatedDoc));
        dispatch(actions.updateIn('library.markers', ['rows'], updatedDoc));
      } else {
        dispatch(notificationActions.notify('Entity created', 'success'));
        dispatch(elementCreated(updatedDoc));
      }

      dispatch(selectSingleDocument(updatedDoc));
    });
}

export function removeDocument(doc) {
  return { type: types.REMOVE_DOCUMENT, doc };
}

export function removeDocuments(docs) {
  return { type: types.REMOVE_DOCUMENTS, docs };
}

export function deleteDocument(doc) {
  return dispatch =>
    documentsApi.delete(new RequestParams({ sharedId: doc.sharedId })).then(() => {
      dispatch(notificationActions.notify('Document deleted', 'success'));
      dispatch(unselectAllDocuments());
      dispatch(removeDocument(doc));
    });
}

export function deleteEntity(entity) {
  return dispatch =>
    entitiesAPI.delete(entity).then(() => {
      dispatch(notificationActions.notify('Entity deleted', 'success'));
      dispatch(unselectDocument(entity._id));
      dispatch(removeDocument(entity));
    });
}

export function loadMoreDocuments(storeKey, amount) {
  return (dispatch, getState) => {
    searchDocuments({ search: getState()[storeKey].search }, storeKey, amount)(dispatch, getState);
  };
}

export function getSuggestions() {
  return { type: 'GET_SUGGESTIONS' };
}

export function getDocumentReferences(sharedId, storeKey) {
  return dispatch =>
    referencesAPI.get(new RequestParams({ sharedId })).then(references => {
      dispatch(actions.set(`${storeKey}.sidepanel.references`, references));
    });
}
