/*
* assets/js/demo.js
*/
'use strict'
const demo = (function(){
  const codemirror = () => {
    const editor = CodeMirror.fromTextArea(
      document.querySelector("textarea.code"),
      { lineNumbers: false, mode:  "javascript" }
    );

    return editor
  }


  application.add('name','Application Client Demo');
  application.add('editor',codemirror);
  application.add('config',{
    default : 'intro',
    main : 'section#mainContent',
    nav : 'nav#navMenu',
    template : 'pageLayout',
    style : 'border-top: 3px solid {color}'
  });
  application.init()
  return application.object;
})()
