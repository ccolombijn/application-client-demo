// assets/js/examples/apiRequest.js

// Pas name property aan met waarde van input
application.controller('#updateHeader','change',{
  api : 'api', // verzoek aan api
  url : 'http://localhost:3001/api/name', // aan te roepen url
  method : 'POST',
  callback : (data) =>{
    // Doe iets als request voltooid is
  }
});
