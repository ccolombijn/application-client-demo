/*
* application.main.js
*/
'use strict'
const main = (function(){
  requirejs([
    'application',
    'utils',
    'modules/intro',
    'modules/reference',

    'demo'
  ],()=> {
    try{
      application.init();
    }catch(e){
      location.reload();
    }



  });
})();
