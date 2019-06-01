/*
* assets/js/demo.js
*/
'use strict'
const demo = (function(){

  const codemirror = (mode) => {
    const editor = CodeMirror.fromTextArea(
      document.querySelector(`textarea.${mode}`),
      { lineNumbers: false, mode:  mode }
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

  ac.add('name','Application Client Demo');
  ac.add('editor',codemirror);
  ac.add('converter',showdown);
  ac.add('backbone',backbone);
  ac.add('config',{
    modules : [
      'intro',
      'reference',
      'try_it_out'
    ],
    default : 'intro',
    main : 'section#mainContent',
    nav : 'nav#navMenu',
    template : 'pageLayout',
    style : 'border-top: 3px solid {color}'
  });

  return ac.init();
})()
