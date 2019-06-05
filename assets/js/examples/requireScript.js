// assets/js/examples/requireScript.js
// Voert assets/js/test.js uit
application.require('test',()=> {
  $('div.output').html('test.js is geladen en uitgevoerd');
  $('div#output code').html(test) // variabele test zit in test.js
});
