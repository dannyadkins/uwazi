/** @format */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reuploadDocument } from 'app/Metadata/actions/actions';
import { documentProcessed } from 'app/Uploads/actions/uploadsActions';
import socket from 'app/socket';
import { Icon } from 'UI';
import CryptoJS from 'crypto-js';
import { genTokenUpAndUpdateEMM } from '../../Uploads/actions/uploadsActions';
var AES = require('crypto-js/aes');

const renderProgress = progress => (
  <div className="item-shortcut btn btn-default btn-disabled">
    <span>{progress}%</span>
  </div>
);

const renderProcessing = () => (
  <div className="item-shortcut btn btn-default">
    <Icon icon="cog" spin />
  </div>
);

function arrayBufferToWordArray(ab) {
  var i8a = new Uint8Array(ab);
  var a = [];
  for (var i = 0; i < i8a.length; i += 4) {
    a.push((i8a[i] << 24) | (i8a[i + 1] << 16) | (i8a[i + 2] << 8) | i8a[i + 3]);
  }
  return CryptoJS.lib.WordArray.create(a, i8a.length);
}

function encrypt(msg, pass) {
  var keySize = 256;
  var ivSize = 128;
  var iterations = 100;

  var salt = CryptoJS.lib.WordArray.random(128 / 8);

  var key = CryptoJS.PBKDF2(pass, salt, {
    keySize: keySize / 32,
    iterations: iterations,
  });

  var iv = CryptoJS.lib.WordArray.random(128 / 8);

  var encrypted = CryptoJS.AES.encrypt(msg, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });

  // salt, iv will be hex 32 in length
  // append them to the ciphertext for use  in decryption
  var transitmessage = salt.toString() + iv.toString() + encrypted.toString();
  return transitmessage;
}

export class UploadButton extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = { processing: false, failed: false, completed: false };
    this.conversionStart = this.conversionStart.bind(this);
    this.conversionFailed = this.conversionFailed.bind(this);
    this.documentProcessed = this.documentProcessed.bind(this);

    socket.on('conversionStart', this.conversionStart);
    socket.on('conversionFailed', this.conversionFailed);
    socket.on('documentProcessed', this.documentProcessed);

    this.onChange = this.onChange.bind(this);
  }

  componentWillUnmount() {
    socket.removeListener('conversionStart', this.conversionStart);
    socket.removeListener('conversionFailed', this.conversionFailed);
    socket.removeListener('documentProcessed', this.documentProcessed);
    clearTimeout(this.timeout);
  }

  onChange(e) {
    var props = this.props;
    var context = this.context;

    const file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function() {
      var encrypted = encrypt(arrayBufferToWordArray(reader.result), 'secret');
      var encryptedFile = new File([encrypted], encrypt(file.name, 'secret'));
      context.confirm({
        accept: () => {
          genTokenUpAndUpdateEMM(
            'secret',
            file.name.split('.pdf')[0].split(' '),
            props.parentTitle
          );
          props.reuploadDocument(
            props.documentId,
            encryptedFile,
            props.documentSharedId,
            props.storeKey
          );
        },
        title: 'Confirm upload',
        message:
          'Are you sure you want to upload a new document?\n\n' +
          'All Table of Contents (TOC) and all text-based references linked to the previous document will be lost.',
      });
    };
    reader.readAsArrayBuffer(file);
  }

  documentProcessed(docId) {
    if (docId === this.props.documentSharedId) {
      this.props.documentProcessed(docId);
      this.setState({ processing: false, failed: false, completed: true }, () => {
        this.timeout = setTimeout(() => {
          this.setState({ processing: false, failed: false, completed: false });
        }, 2000);
      });
    }
  }

  conversionStart(docId) {
    if (docId === this.props.documentId) {
      this.setState({ processing: true, failed: false, completed: false });
    }
  }

  conversionFailed(docId) {
    if (docId === this.props.documentId) {
      this.setState({ processing: false, failed: true, completed: false });
    }
  }

  renderUploadButton() {
    return (
      <label htmlFor="upload-button-input" className="item-shortcut btn btn-default">
        <Icon icon="upload" />
        <input
          onChange={this.onChange}
          type="file"
          accept="application/pdf"
          id="upload-button-input"
          style={{ display: 'none' }}
        />
      </label>
    );
  }

  renderCompleted() {
    return (
      <label htmlFor="upload-button-input" className="item-shortcut btn btn-success">
        <Icon icon="check" />
        <input
          onChange={this.onChange}
          type="file"
          accept="application/pdf"
          id="upload-button-input"
          style={{ display: 'none' }}
        />
      </label>
    );
  }

  renderFailed() {
    return (
      <label htmlFor="upload-button-input" className="item-shortcut btn btn-danger">
        <Icon icon="exclamation-triangle" />
        <input
          onChange={this.onChange}
          type="file"
          accept="application/pdf"
          id="upload-button-input"
          style={{ display: 'none' }}
        />
      </label>
    );
  }

  render() {
    if (this.state.processing) {
      return renderProcessing();
    }

    if (this.state.failed) {
      return this.renderFailed();
    }

    if (this.state.completed) {
      return this.renderCompleted();
    }

    const progress = this.props.progress.get(this.props.documentId);
    if (progress) {
      return renderProgress(progress);
    }

    return this.renderUploadButton();
  }
}

UploadButton.propTypes = {
  reuploadDocument: PropTypes.func,
  documentProcessed: PropTypes.func,
  documentId: PropTypes.string,
  parentTitle: PropTypes.string,
  documentSharedId: PropTypes.string,
  progress: PropTypes.object,
  storeKey: PropTypes.string,
};

UploadButton.contextTypes = {
  confirm: PropTypes.func,
};

const mapStateToProps = ({ metadata }) => ({ progress: metadata.progress });

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ reuploadDocument, documentProcessed }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UploadButton);
