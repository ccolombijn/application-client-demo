'use strict'
const fs = require('fs');
const path = require('path');
const create = function(name){
  return {
    application : () => {

    }
  }
}
const update = function(){
  return {
    application : () => {

    }
  }
}
const config = (function(){
  const actions = [
    { label : 'Create', name : '-c', function : create },
    { label : 'Update', name : '-u', function : update }
  ]

  return {
    actions : actions
  }
})()

const application = (function(){
  const run = ( endpoint ) => {
    if( !endpoint ) {
      endpoint = process.argv

    }
    if( isNode ) endpoint = endpoint.slice(2)
    let name = endpoint[0],
    action = endpoint[1],
    args = endpoint[2]
    for( let module of config.actions ){
      if( module.name === name ){
        try{
          module.function[ action ]( args )
        }catch( error ){
          console.error( `${module.module}[ ${action} ](${args}) error : ${error}` )
        }
      }
    }
  }
  const start = () => {
    console.log( 'Please choose a module & method to run;' )
    let path = process.argv[1].split('\\')
    let pos = path.length-1
    for( let action of config.actions ){

      for( let method of Object.getOwnPropertyNames( action.function ) ){
        console.log( `${action.label} : node ${path[pos]} ${action.name} ${method}` )
      }
    }
  }



  process.argv[2] ? run() : start()

})()
