// assets/js/examples/addModule.js
const addModule = function(name,module){
  module.default = () => console.log(module.default)
  application.add(name,module)
  console.log('addModule')
  return 'addModule executed'
}
const exampleModule = {
  name : 'Example',
  content : 'Content of example',
  default : 'This is a example'
}

addModule('example',exampleModule)
