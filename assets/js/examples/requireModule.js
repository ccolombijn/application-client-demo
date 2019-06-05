// assets/js/examples/requireModule.js
// Voegt module in assets/js/modules/test.js toe
application.require('modules/test',()=>location.hash='#test');
// Pas location.hash aan om application.load aan te roepen...
