/*
* assets/js/demo.js
*/
'use strict'
const demo = (function(){
  application.requireCallback = ()=>{
    //console.log('is fired when required from config.json')
  }
  const codemirror = (mode) => {
    const editor = CodeMirror.fromTextArea(
      document.querySelector(`textarea.${mode}`),
      { lineNumbers: false, indentUnit : 3,mode:  mode }
    );

    return editor
  }
  const showdown = () => {
    const converter = new showdown.Converter();
    return converter;
  }
  const backbone = () => {
    return Backbone;
  }

  return{
    editor : codemirror,
    converter : showdown
  }


})()
