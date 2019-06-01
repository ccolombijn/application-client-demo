// assets/js/examples/requireModule.js
// Laad en voer asset/js/modules/test.js uit
ac.require('test',()=> {
  console.log('test.js is geladen en uitgevoerd');
  console.log(test) // variabele test zit in test.js
});
