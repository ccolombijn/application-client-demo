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
  application.add('name','Application Client Demo');
  application.add('editor',codemirror);
  application.add('config',{
    // modules : ['intro','reference','try_it_out'],
    default : 'intro',
    main : 'section#mainContent',
    nav : 'nav#navMenu',
    template : 'pageLayout',
    style : 'border-top: 3px solid {color}'
  });

  application.init(()=>{
    application.add('intro')
    application.add('reference')
    application.add('try_it_out')
    //application.add(['intro','reference','try_it_out'])

  })
  return application.object;
})()
