/** @format */

import PDFJS from './PDFJS';
import superagent from 'superagent';
import CryptoJS from 'crypto-js';

function decrypt(transitmessage, pass) {
  var keySize = 256;
  var ivSize = 128;
  var iterations = 100;
  var salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
  var iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32));
  var encrypted = transitmessage.substring(64);

  var key = CryptoJS.PBKDF2(pass, salt, {
    keySize: keySize / 32,
    iterations: iterations,
  });

  var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  return decrypted.toString(CryptoJS.enc.Latin1);
}

function convertDataURIToBinary(raw) {
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for (var i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}

const PDFUtils = {
  extractPDFInfo: pdfFile =>
    new Promise(resolve => {
      PDFJS.getDocument(pdfFile).promise.then(pdf => {
        const pages = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          pages.push(pdf.getPage(pageNumber).then(PDFUtils.extractPageInfo));
        }

        return Promise.all(pages).then(result => {
          const count = {};
          result.forEach((length, index) => {
            count[index + 1] = {
              chars: length,
            };
            if (count[index]) {
              count[index + 1].chars += count[index].chars;
            }
          });
          resolve(count);
        });
      });
    }),

  extractEncryptedPDFInfo: pdfFile =>
    new Promise(resolve => {
      console.log('Extracting encrypted PDF data');
      superagent
        .get(pdfFile)
        .set('Accept', 'application/pdf')
        .set('X-Requested-With', 'XMLHttpRequest')
        .on('response', response => {
          console.log('RESPONSE:');
          var encryptedPdf = response.text;
          var decryptedPdf = decrypt(encryptedPdf, 'secret');
          console.log(decryptedPdf);
          var pdfAsArray = convertDataURIToBinary(decryptedPdf);

          PDFJS.getDocument({ data: decryptedPdf })
            .promise.then(pdf => {
              const pages = [];
              for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
                pages.push(pdf.getPage(pageNumber).then(PDFUtils.extractPageInfo));
              }

              return Promise.all(pages)
                .then(result => {
                  const count = {};
                  result.forEach((length, index) => {
                    count[index + 1] = {
                      chars: length,
                    };
                    if (count[index]) {
                      count[index + 1].chars += count[index].chars;
                    }
                  });
                  resolve(count);
                })
                .catch(e => {
                  console.log(e);
                });
            })
            .catch(e => {
              console.log(e);
            });
        })
        .end();
    }),

  extractPageInfo: page =>
    new Promise(resolve => {
      const textLayerDiv = document.createElement('div');
      textLayerDiv.className = 'textLayer';

      page.getTextContent({ normalizeWhitespace: true }).then(textContent => {
        const textLayer = PDFJS.renderTextLayer({
          textContent,
          container: textLayerDiv,
          viewport: page.getViewport({
            scale: 1,
          }),
        });

        textLayer.promise.then(() => {
          resolve(textLayerDiv.innerText.length);
        });
      });
    }),
};

export default PDFUtils;
