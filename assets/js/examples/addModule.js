// assets/js/examples/addModule.js

application.controller('#addModuleBtn','click',()=>{
    const name = $('#nameInput').val();
    const consoleMsg = $('#consoleMsg').val();
    const title = $('#titleInput').val();
    const content = $('#contentInput').val();
    application.add(name,{
      name : name,
      default : ()=>{
        console.log(consoleMsg);
      },
      content : content
    });
  });
// application.add('test',{name:'Test',content : 'Dit is content',default:()=>console.log('test')})
