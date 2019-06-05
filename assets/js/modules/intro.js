/*
* modules/intro.js
*/
'use strict'
const intro = (function(){

  application.add('intro',{
    name : 'Intro',
    default : () => console.log('This is intro!'),
    content : 'This is content for intro!',
    color : 'SkyBlue',
    test : {
      name : 'Test',
      default : () => console.log('This is test!')
    }
  })
})()
