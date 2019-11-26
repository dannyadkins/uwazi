/** @format */

import superagent from 'superagent';

import { actions as basicActions } from 'app/BasicReducer';
import { notificationActions } from 'app/Notifications';
import { selectSingleDocument, unselectAllDocuments } from 'app/Library/actions/libraryActions';
import * as metadata from 'app/Metadata';
import * as types from 'app/Uploads/actions/actionTypes';
import * as libraryTypes from 'app/Library/actions/actionTypes';
import uniqueID from 'shared/uniqueID';
import { RequestParams } from 'app/utils/RequestParams';

import { APIURL } from '../../config.js';
import api from '../../utils/api';

export function enterUploads() {
  return {
    type: types.ENTER_UPLOADS_SECTION,
  };
}

export function showImportPanel() {
  return dispatch => {
    dispatch(basicActions.set('showImportPanel', true));
  };
}

export function closeImportPanel() {
  return dispatch => {
    dispatch(basicActions.set('showImportPanel', false));
  };
}

export function closeImportProgress() {
  return dispatch => {
    dispatch(basicActions.set('importProgress', 0));
    dispatch(basicActions.set('importStart', false));
    dispatch(basicActions.set('importEnd', false));
    dispatch(basicActions.set('importError', {}));
  };
}

export function newEntity() {
  return (dispatch, getState) => {
    const newEntityMetadata = { title: '', type: 'entity' };
    dispatch(
      metadata.actions.loadInReduxForm(
        'uploads.sidepanel.metadata',
        newEntityMetadata,
        getState().templates.toJS()
      )
    );
    dispatch(selectSingleDocument(newEntityMetadata));
  };
}

export function createDocument(newDoc) {
  return dispatch =>
    api.post('documents', new RequestParams(newDoc)).then(response => {
      const doc = response.json;
      dispatch({ type: types.NEW_UPLOAD_DOCUMENT, doc: doc.sharedId });
      dispatch({ type: types.ELEMENT_CREATED, doc });
      return doc;
    });
}

export function importData([file], template) {
  return dispatch =>
    new Promise(resolve => {
      superagent
        .post(`${APIURL}import`)
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .field('template', template)
        .attach('file', file, file.name)
        .on('progress', data => {
          dispatch(basicActions.set('importUploadProgress', Math.floor(data.percent)));
        })
        .on('response', response => {
          dispatch(basicActions.set('importUploadProgress', 0));
          resolve(response);
        })
        .end();
    });
}

export function makeEmm() {
  new Promise(resolve => {
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
        method: 'MakeEmm',
        params: {},
      })
      .then(response => {
        resolve(JSON.parse(response.text).result);
      });
  });
}

export function genTokenUp(secret, keywords, title, dateCreated, docId) {
  console.log(keywords);
  console.log(
    'Generating tokenUp.\n Secret: ' + secret + '\n Keywords: ' + keywords + ' \n Title: ' + title
  );
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
        method: 'GenTokenUp',
        params: {
          password: secret,
          keywords: keywords,
          metadata: {
            title: title,
            dateCreated: dateCreated,
            docId: docId,
          },
        },
      })
      .then(response => {
        resolve(JSON.parse(response.text).result);
      });
  });
}

export function upload(docId, file, endpoint = 'upload') {
  return dispatch =>
    Promise.all([
      new Promise(resolve => {
        superagent
          .post(`${APIURL}import`)
          .set('Accept', 'application/json')
          .set('X-Requested-With', 'XMLHttpRequest')
          .field('template', template)
          .attach('file', file, file.name)
          .on('progress', data => {
            dispatch(basicActions.set('importUploadProgress', Math.floor(data.percent)));
          })
          .on('response', response => {
            dispatch(basicActions.set('importUploadProgress', 0));
            console.log('File uploaded.');
            resolve(response);
          })
          .end();
      }),
      new Promise(resolve => {
        genTokenUp(
          'secret',
          file.name.split('.pdf')[0].split(/\s+/),
          file.name,
          file.lastModified,
          docId
        ).then(response => {
          var tokenUp = response;
          console.log('TokenUp: ' + tokenUp);
          resolve(tokenUp);
          // TODO: use the tokenUp
        });
      }),
    ]);
}

export function publicSubmit(data, remote = false) {
  return dispatch =>
    new Promise(resolve => {
      const request = superagent
        .post(remote ? `${APIURL}remotepublic` : `${APIURL}public`)
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .field('captcha', data.captcha);

      if (data.file) {
        request.attach('file', data.file);
      }

      if (data.attachments) {
        data.attachments.forEach((attachment, index) => {
          request.attach(`attachments[${index}]`, attachment);
        });
      }
      request.field(
        'entity',
        JSON.stringify(
          Object.assign({}, { title: data.title, template: data.template, metadata: data.metadata })
        )
      );
      let completionResolve;
      let completionReject;
      const uploadCompletePromise = new Promise((_resolve, _reject) => {
        completionResolve = _resolve;
        completionReject = _reject;
      });
      request
        .on('progress', () => {
          resolve({ promise: uploadCompletePromise });
        })
        .on('response', response => {
          if (response.status === 200) {
            dispatch(notificationActions.notify('Success', 'success'));
            completionResolve(response);
            return;
          }
          if (response.status === 403) {
            dispatch(notificationActions.notify(response.body.error, 'danger'));
            completionReject(response);
            return;
          }
          completionReject(response);
          dispatch(notificationActions.notify('An error has ocurred', 'danger'));
        })
        .end();
    });
}

export function uploadCustom(file) {
  return dispatch => {
    const id = `customUpload_${uniqueID()}`;
    return upload(id, file, 'customisation/upload')(dispatch).then(response => {
      dispatch(basicActions.push('customUploads', response));
    });
  };
}

export function deleteCustomUpload(_id) {
  return dispatch =>
    api.delete('customisation/upload', new RequestParams({ _id })).then(response => {
      dispatch(basicActions.remove('customUploads', response.json));
    });
}

export function uploadDocument(docId, file) {
  return dispatch => upload(docId, file)(dispatch);
}

export function documentProcessed(sharedId, __reducerKey) {
  return dispatch => {
    dispatch({ type: types.DOCUMENT_PROCESSED, sharedId });
    api.get('entities', new RequestParams({ sharedId })).then(response => {
      const doc = response.json.rows[0];
      dispatch({ type: libraryTypes.UPDATE_DOCUMENT, doc, __reducerKey });
      dispatch({ type: libraryTypes.UNSELECT_ALL_DOCUMENTS, __reducerKey });
      dispatch({ type: libraryTypes.SELECT_DOCUMENT, doc, __reducerKey });
      dispatch(basicActions.set('entityView/entity', doc));
      dispatch(basicActions.set('viewer/doc', doc));
    });
  };
}

export function documentProcessError(sharedId) {
  return { type: types.DOCUMENT_PROCESS_ERROR, sharedId };
}

export function publishEntity(entity) {
  return dispatch =>
    api.post('entities', new RequestParams({ ...entity, published: true })).then(response => {
      dispatch(notificationActions.notify('Entity published', 'success'));
      dispatch({ type: types.REMOVE_DOCUMENT, doc: entity });
      dispatch(basicActions.set('entityView/entity', response.json));
      dispatch(unselectAllDocuments());
    });
}

export function publishDocument(doc) {
  return dispatch =>
    api.post('documents', new RequestParams({ ...doc, published: true })).then(response => {
      dispatch(notificationActions.notify('Document published', 'success'));
      dispatch({ type: types.REMOVE_DOCUMENT, doc });
      dispatch(basicActions.set('viewer/doc', response.json));
      dispatch(unselectAllDocuments());
    });
}

export function unpublishEntity(entity) {
  return dispatch =>
    api.post('entities', new RequestParams({ ...entity, published: true })).then(response => {
      dispatch(notificationActions.notify('Entity unpublished', 'success'));
      dispatch({ type: types.REMOVE_DOCUMENT, doc: entity });
      dispatch(basicActions.set('entityView/entity', response.json));
      dispatch(unselectAllDocuments());
    });
}

export function unpublishDocument(doc) {
  return dispatch =>
    api.post('documents', new RequestParams({ ...doc, published: false })).then(response => {
      dispatch(notificationActions.notify('Document unpublished', 'success'));
      dispatch({ type: types.REMOVE_DOCUMENT, doc });
      dispatch(basicActions.set('viewer/doc', response.json));
      dispatch(unselectAllDocuments());
    });
}

export function publish(entity) {
  return dispatch =>
    !entity.file ? dispatch(publishEntity(entity)) : dispatch(publishDocument(entity));
}

export function unpublish(entity) {
  return dispatch =>
    !entity.file ? dispatch(unpublishEntity(entity)) : dispatch(unpublishDocument(entity));
}

export function conversionComplete(docId) {
  return {
    type: types.CONVERSION_COMPLETE,
    doc: docId,
  };
}
