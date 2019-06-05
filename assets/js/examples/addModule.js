// assets/js/examples/addModule.js

application.controller('#addModuleBtn','click',()=>{
    const name = $('#nameInput').val();
    const consoleMsg = $('#consoleMsg').val();
    const title = $('#titleInput').val();
    const content = $('#contentInput').val();
    const color = $('#colorInput').val();
    application.add(name,{
      name : title,
      default : ()=>{
        console.log(consoleMsg);
      },
      content : content,
      color : color
    });
  });
