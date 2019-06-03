// assets/js/examples/addModule.js

application.controller('#addModuleBtn','click',()=>{
    const name = $('#nameInput').val();
    const consoleMsg = $('#consoleMsg').val();
    const title = $('#titleInput').val();
    const content = $('#contentInput').val();
    const color = $('#colorInput').val();
    application.add(name,{
      name : name,
      default : ()=>{
        console.log(consoleMsg);
      },
      content : content,
      color : color
    });
  });
// application.add('test',{name:'Test',content : 'Dit is content',default:()=>console.log('test')})
