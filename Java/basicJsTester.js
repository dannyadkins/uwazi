var xhttp = new XMLHttpRequest();
xhttp.responseType = 'json';
xhttp.open("POST", "http://localhost:8081/client-api", true);
xhttp.onload  = function() {
   var jsonResponse = xhttp.response;
   console.log(jsonResponse)
};

// requestStruct = {
//    id: '1',
//    jsonrpc: '2.0',
//    method: 'MakeEmm',
//    params: {}};

requestStruct = {
   id: '1',
   jsonrpc: '2.0',
   method: 'GenTokenUp',
   params: {
      password: 'abcd',
      keywords: ['hi', 'howdy', 'hello'],
      metadata: {
         title: 'Salutations',
         dateCreated: 'today',
         docId: 'abcd'
      }
   }};

requestBody = JSON.stringify(requestStruct)
xhttp.send(requestBody);