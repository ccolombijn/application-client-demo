/*
* modules/intro.js
*/
'use strict'
const reference = (function(){
  const objs = {
    'application' : application,
    'application.object' : application.object,
    'utils' : utils,
    'jQuery' : jQuery,
    'document' : document
  }
  //const obj = application.object.reference;
  const props = (obj) => {
    let propNames
      propNames = Object.getOwnPropertyNames(obj);
    return propNames
  }

  const content = $('div.content');
  const setAlert = (type,msg) => content.html(`<div class="alert alert-${type}" role="alert">${msg}</div>`);

  const getStr = (obj,property) => typeof obj[property] === 'function' ?
    utils.format(obj[property].toString())
    : utils.syntaxHighlight(JSON.stringify(obj[property], null, 2));

  const checkOccurence = function(obj,method){
    const occurenceObj = {};
    for(let property of props(obj)){
      let occurence = utils.occurence(getStr(obj,property),method);
      if(occurence>0 && method != property ) occurenceObj[property] = occurence;
    }
    return occurenceObj
  }

  const printObjTable = function(name,obj){
    const objProps = props(obj);
    let printObjTableHTML = `<h3>${objProps.length} properties in <span class="Inconsolata">${name}<span></h3>`;
    printObjTableHTML += `<table class="table table-hover" id="${name.replace('.','_')}Table"><thead>`;
    printObjTableHTML += `<tr><th>Property</th><th>Type</th><th>Arguments</th><th>Used in</th></tr></thead><tbody>`;
    for(let property of objProps){
      //if(typeof obj[property] === 'function'){
        let occurence =  props(checkOccurence(obj,property));
        let type = typeof obj[property];
        let params = type === 'function' ? utils.params(obj[property]).join(',') : '-'
        printObjTableHTML += `<tr class="Inconsolata" id="method_${property}"><td>${property}</td><td>${type}</td><td>${params}</td><td>${occurence.join(',')}</td></tr>`
      //}
    }
    printObjTableHTML += '</tbody></table>'
    $('div.content').html(printObjTableHTML)
    $(`table#${name.replace('.','_')}Table tr`).on('click',function(event){
      const method = event.target.parentElement.id.replace('method_','');
      $('.modal-title').html(method).addClass('Inconsolata');
      $('.modal-body').html(`<code>${getStr(obj,method)}</code>`);
      $('#modal').modal();
    });
  }


  application.add('reference',{
    name : 'Reference',
    default : () => {
      const objSelect = $('<select id="objSelect" class="form-control"></select>');
      for(let property of props(objs)){
        let objSelectItem = $(`<option>${property}</option>`)
        objSelect.append(objSelectItem)
      }
      objSelect.on('change', (event) => printObjTable(event.target.value,objs[event.target.value]));
      //application.event(objSelect,'change', (event) => printObjTable(event.target.value,objs[event.target.value]));
      objSelect.prepend($('<option selected disabled>Select Object to view properties...</option>'));
      $(application.config.main).prepend(objSelect)
    },
    color : 'SeaGreen'
  });

})()
