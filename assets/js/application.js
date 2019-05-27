'use strict'

/*
* Application Client 0.8.14
* assets/js/application.js
*/

const application = (function(){
  let config, // configuration object
      applicationObject, // application object
      output, // private output
      previous; // previous object state
  const defaults = {
    template : 'pageLayout',
    filepath : 'html/templates/{template}.html'
  }
  const route = () => // gets route from location.hash
    location.hash.slice(1).split('/');

  const endpoint = () => // gets default property of config if route not given
    route()[0] ? route()[0] : config.default,

  templates = {},
  element = {},

//..............................................................................

  add = function(name,module) {
    // adds property to application object
    const obj = applicationObject ? applicationObject : {}
    obj[name] = module;
    applicationObject = obj;
    application.object = applicationObject;
    return module;
  },

//..............................................................................

  remove = function(property) {
    // removes property from application object
    const obj = {}
    for(let _property in applicationObject)
      if(_property != property ) obj[_property] = _property;
    applicationObject = obj;
  },

//..............................................................................

  init = ( _application ) => { // initialize application
    // assigns given, existing or merged application object
    if( _application && applicationObject ){ // checks if application object exists
      for( let property in applicationObject){
        if(!applicationObject[property])
          applicationObject[property] = _application[property];
      }
    } else if (_application) {
      applicationObject = _application; // use given object
    } else {
      applicationObject = application.object; // use existing object
    }
    config = applicationObject.config; // get config object
    for(let property in config){
      if(config[property].includes('#')) element[property] = $(config[property])
    }
    element['content'] = $('div.content')
    application.config = config; // set config object of application object
    if(config.debug) console.log(`application.init : ${applicationObject.name}`);
    load(); // call load; calls page & module
    window.addEventListener( 'hashchange', () => load() ); // attach load to hashchange event

  },

//..............................................................................

  load = () => {
    // calls module with current route in callback of page call
    const _route = route();
    const _endpoint = endpoint();
    const _method = _route[1];
    const _argument = _route[2];
    const _module = _method ? applicationObject[_endpoint][_method] // module method
      : applicationObject[_endpoint].default // module default
    if(config.debug) console.log(`application.load : ${_route.join('/')}`);

    page( () => // call page
      _module(_argument) // call module
    );
  },

//..............................................................................

  page = ( callback ) => {
    // displays page from template, execute callback and call render

    element.main.fadeOut(400,() => { // page transition out
      //$(config.main).load(`html/templates/${template()}.html`,function() {
      template( () => { // load template file
        if(callback) callback(); // callback (module)
        render(); // render document
        element.main.fadeIn(); // page transition in

      });
    });
    return output;
  },

//..............................................................................

  template = (_route, html, callback) => {
    // gets template for given or current route

    if(typeof _route === 'function' ) {
      callback = _route; // route argument as callback
      _route = endpoint();
      html = true;
    }
    if(!_route) _route = endpoint();
    if(!config.template) config.template = defaults.template;
    let _template,obj = application.object[_route];

    obj.template ? _template = obj.template : _template = config.template

    if(!templates[_template]){ // template is not available in templates object
      if(!config.filepath) config.filepath = defaults.filepath; // get filepath
      const templatePath = config.filepath.replace('{template}',_template);
      if(config.debug) console.log(`application.page : ${_route}`);
      $.get( `html/templates/${_template}.html`, function( data ) { // get file
        templates[_template] = data; // add to templates object
        if(html) element.main.html(data);
        if(callback) callback();
      });
    }else{
      if(html) {
        _template = templates[_template]; // get template from templates object
        element.main.html(_template)
        if(callback) callback();
      }
    }


    return _template
  },

//..............................................................................

  render = ( _route, callback ) => {
    // updates page with module properties
    if(typeof _route === 'function' ) {
      callback = _route; // route argument as callback
      _route = endpoint();
    }
    if(!_route) _route = endpoint();

    let _template = template(_route);
    //if(prev != application.object ){
      let thisObj = application.object[_route]
      $(`#${_template} h2`).html(thisObj.name); // set template header title
      if(config.nav) nav(); // set navigation
      title(_route); // set document title

      for(let property in applicationObject[_route]){
        if(typeof applicationObject[_route][property] === 'string' ){
          // set values of properties of elements with corresponding class names
          $(`#${_template} .${property}`).html(str(applicationObject[_route][property])); // element html & parse with str
        }
      }
      //output = $(`#${template(_route)}`).html(str($(`#${template(_route)}`).html())); // parse with str
      output = $(`#${_template}`).html();
      //$(`#${_template}`).children().each(function(){
      //  if(this.innerHTML) this.innerHTML = str(this.innerHTML)
      //});
      previous = application.object
      if(callback) callback();
      for(let event in events) events[event]()
    //}
    return application
  },

//..............................................................................

  nav = () => {
    // creates/updates nav element

    const prefix = config.navMenuItemPrefix ? config.navMenuItemPrefix : '#';
    const added = [];
    element.nav.html('');
    for( let item of Object.getOwnPropertyNames(applicationObject)){
      if( typeof applicationObject[ item ] === 'object' &&  applicationObject[ item ].name ){
        let menuItem = $('<li></li>').attr('id',item)
          .html(`<a href="${prefix}${item}">${str(applicationObject[ item ].name)}</a>`);
        element.nav.append(menuItem);
        added.push(applicationObject[ item ].name);
      }
    }
    if(config.debug) console.log(`application.nav : ${added.join(',')}`);

    const active = `${config.nav} li#${endpoint()} a`;
    $( active ).addClass('active');
    if(config.style && applicationObject[endpoint()].color ) {
      $( active ).attr('style',`${str(config.style)}`);
    }
    return element.nav;
  },

//..............................................................................

  title = (route) => {
    // sets document title with name property
    if(!route) route = endpoint();
    if(config.debug) console.log(`application.title : ${route}`);
    let pageTitle = ( route === '') ?
    applicationObject.name
    : `${applicationObject[route].name} - ${applicationObject.name}`;
    $('title').html(pageTitle);
    return pageTitle
  },

//..............................................................................

  event = (_element, event, callback ) => {
    // adds event to events object
    if(typeof _element === 'string')
      element[_element] ? _element = element[_element] : _element = $(element);

    let id = _element.attr('id');
    if(!events[id]) events[id] = () => _element.on(event,callback)
    return events[id]
  },
  events = {},

//..............................................................................

  modules = function(){
    // get modules as array
    const arrModules = [];
    for(let module of Object.getOwnPropertyNames(application.object)){
      // check if application object property is module; exclude default module
      if(applicationObject[module].default && module != config.default){
        arrModules.push( module );
      }
    }
    return arrModules;
  },


//..............................................................................

  str = (str) => {
    // replace {template} strings with module properties
    const obj = application.object[endpoint()]
    for(let item of Object.getOwnPropertyNames(obj))
      if(typeof obj[item] === 'string' ){
        if(str) str = str.replace(`{${item}}`,obj[item]);
      }

    return str
  }


  // return public methods & variables
  return {
    route : route,
    endpoint : endpoint,
    object : applicationObject,
    modules : modules,
    config : config,
    add : add,
    remove : remove,
    init : init,
    load : load,
    event : event,
    render : render,
    page : page,
    nav : nav,
    element : element,
    template : template,
    templates : templates,
    title : title
  }
})();
