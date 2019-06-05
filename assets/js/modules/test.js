const test = (function(){
  application.add('test',{
    name : 'Test',
    content : 'Content van test',
    default : () => console.log('Dit is test'),
    color : 'RedOrange'
  });
  application.requireCallback = () => 'Test is geladen en toegevoegd'
})();
