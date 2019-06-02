'use strict'

/*
* Application Client 0.9.5
* assets/js/application.js
*/

const application = (function(){
  let config, // configuration object
      applicationObject = {}, // application object
      output, // private output
      position = 0, // private global position
      ready, // private ready state
      loadModules,
      previous; // previous object state

  const defaults = {
    template : 'pageLayout',
    templatePath : 'html/templates/{template}.html',

  }
  const route = () => // gets route from location.hash
    location.hash.slice(1).split('/');

  const endpoint = () => // gets default property of config if route not given
    route()[0] ? route()[0] : config.default,


  element = {},
  elements = () => {
    for(let property in config)
      if((typeof config[property] === 'string')
      && config[property].includes('#') ) element[property] = $(config[property]);
    if(config.debug) console.log(`application.elements`);
    return element
  },
//..............................................................................

  add = function(name,module) {
    //if(application.config.debug) console.log(`application.add : ${name}`);
    // adds property to application object
    if(module){
      const obj = applicationObject ? applicationObject : {}
      obj[name] = module;

      applicationObject = obj;
      application.object = applicationObject;
      return module;
    }else{
      require(name);
    }

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
require = (name,callback) => {
  if(config.debug) console.log(`application.require : ${name}`);
  $.get(`js/modules/${name}.js`).done(() => {
    if(callback)callback()
  }).fail(() => {
    $.get(`${name}.js`).done(() => {
      if(callback)callback()
    }).fail(()=>{
      console.error(`application.require : ${name} not available`)
    });
  });
},
//..............................................................................
  initModules = () => {
    require(config.modules[position], () =>{ // async request
      if(position === config.modules.length-1){
        if(config.debug) console.log(`application.initModules : ${config.modules[position]} loaded`);
        if(config.debug) console.log(`application.initModules complete : init load`);
        load() // init load
        $(window).on( 'hashchange', () => load() ); // event load
      } else {
        if(config.debug) console.log(`application.initModules : ${config.modules[position]} loaded`);
        position++; // next position in modules array
        initModules();
      }
    });
  },
//..............................................................................
  initConfig = (callback) => {

    $.get(`json/config.json`,(data) =>{
      config = data;
      applicationObject.config = config;
      if(config.debug) console.log(`initConfig : json/config.json loaded`);
      if(config.debug) console.log(config);
    }).done(() => {

    }).fail(() => {
      if(applicationObject.config){
        config = applicationObject.config; // get config object
      }else{
        throw 'initConfig : config not defined'
        return
      }

    }).always(()=>{
      if(callback)callback()
    })
  },
//..............................................................................
  init = (( _application ) => { // initialize application
    // assigns given, existing or merged application object
    if( _application && applicationObject ){ // checks if application object exists
      if(typeof _application === 'function'){
         _application()
      }else{
        for( let property in applicationObject){
          if(!applicationObject[property])
            applicationObject[property] = _application[property];
        }
      }

    } else if (_application) {
      applicationObject = _application; // use given object
    } else {
      // BUG:
      //applicationObject = application.object; // use existing object
    }
    //config = applicationObject.config; // get config object
    initConfig(()=>{
      if(config.modules) {
        loadModules = new Set(config.modules).values()
        initModules(loadModules); // async modules call with load in promise...
      }else{
        // call load; calls page & module; application.oject should be ready & complete...
        // and in the right order... Let's wait 500 ms and hope everything is OK
        setTimeout( () => load(), 500)
        //load()
        window.addEventListener( 'hashchange', () => load() );
      }
      application.config = config; // set config object of application object
      if(config.debug) console.log(`application.init : ${config.name}`);


    });
    return applicationObject

  })(),

//..............................................................................

  load = async function() {
  //load = () => {
    // calls module with current route in callback of page call
    const _route = route();
    const _endpoint = endpoint();
    const _method = _route[1];
    const _argument = _route[2];

    await ready
    if(!applicationObject[_endpoint]) // requested module does not exist
      throw `application.load : requested module ${_endpoint} undefined; modules loaded : ${modules().join(',')}`
    const _module = _method ? applicationObject[_endpoint][_method] // module method
        : applicationObject[_endpoint].default // module default

    if(config.debug) console.log(`application.load : ${_module}`);

    page( function() {// call page
      //_module(_argument)
      if(typeof _module === 'function'){
        _module(_argument); // call module
      }else{
        throw `application.load  : ${_module} is not a function`;
      }


    });
  },

//..............................................................................

  page = ( callback ) => {
    // displays page from template, execute callback and call render
    // view.main doesn't exist before first render
    if(config.debug) console.log(`application.page`);
    $(config.main).fadeOut(400,() => { // page transition out
      template( () => { // load template file
        if(callback) callback(); // callback (module)
        render(); // render document
        view.main.fadeIn(); // page transition in

      });
    });
    return output;
  },

//..............................................................................
  templates = {},
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
      if(!config.templatePath) config.templatePath = defaults.templatePath; // get filepath
      const templatePath = config.templatePath.replace('{template}',_template);
      if(config.debug) console.log(`application.template : ${_route}`);
      $.get( `html/templates/${_template}.html`, function( data ) { // get file
        templates[_template] = data; // add to templates object
        if(html) $(config.main).html(data); // view.main doesn't exist after first render

      }).done(() =>{ // callback in promise
        if(callback) callback();
      });
    }else{
      if(html) {
        _template = templates[_template]; // get template from templates object
        view.main.html(_template)
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

    let _template = template(_route); // get template
    //if(prev != application.object ){
      let thisObj = application.object[_route]
      $(`#${_template} h2`).html(thisObj.name); // set template header title

      title(_route); // set document title
      elements(); // set elements
      if(config.nav) nav(); // set navigation
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
      if(config.debug) console.log(`application.render : ${_route}`);
    //}
    return application
  },

//..............................................................................

  nav = () => {
    // creates/updates nav element

    const prefix = config.navMenuItemPrefix ?
    config.navMenuItemPrefix : '#';

    view.nav.html('');

    for( let item of modules()){

        let menuItem = $('<li></li>').attr('id',item)
          .html(`<a href="${prefix}${item}">
                  ${str(applicationObject[ item ].name)}
                </a>`);
        view.nav.append(menuItem);


    }
    if(config.debug) console.log(`application.nav : ${modules().join(',')}`);

    const active = `${config.nav} li#${endpoint()} a`;
    $( active ).addClass('active');
    if(config.style && applicationObject[endpoint()].color ) {
      $( active ).attr('style',`${str(config.style)}`);
    }
    return view.nav;
  },

//..............................................................................

  title = (route) => {
    // sets document title with name property
    if(!route) route = endpoint();
    if(config.debug) console.log(`application.title : ${route}`);
    let pageTitle = ( route === '') ?
    config.name
    : `${applicationObject[route].name} - ${config.name}`;
    $('title').html(pageTitle);
    return pageTitle;
  },

//..............................................................................

  event = (_element, _event, callback ) => {
    // adds event to events object
    if(typeof _element === 'string')
      element[_element] ?
      _element = element[_element]
      : _element = $(_element);
    if(typeof callback === 'string'){
      let property = callback;
      let target = property.includes('.') ?
      applicationObject[property.split('.')[0]]
        [property.split('.')[1]]
      : module()[property];
      _element.val(target);
      callback = (event) => {
        property.includes('.') ?
        applicationObject[property.split('.')[0]]
          [property.split('.')[1]] = event.target.value
        : module()[property] = event.target.value;
      }
    }else if (typeof callback === 'object') {
      const obj = callback
      callback = (event) => {
        if(obj.api){ // bind api request to event
          $.ajax(obj).done(()=>obj.callback());
        }
        if(event.target.class){
          const property = event.target.class;
          if(event.target.value) obj[property] = event.target.value;
        }
      }
    }
    let id = _element.attr('id');

    _element.on(_event,(event) => {
      callback(event);
      render(); // event render
    });

    let _events = id ?  events[id] : events
    return _events
  },
  events = {},

//..............................................................................

  modules = function(){
    // get modules as array
    let _modules
    //if(config.modules){
    //  _modules = config.modules
    //} else {
      _modules = [];
      for(let property of Object.getOwnPropertyNames(application.object)){
        let obj = applicationObject[property];
        if(typeof obj.default === 'function' ) _modules.push(property)
      }
    //}
    return _modules;
  },
  module = () => applicationObject[route()],


//..............................................................................

  str = (str) => {
    // replace {template} strings with module properties

    for(let item of Object.getOwnPropertyNames(application.object[endpoint()]))
      if(typeof application.object[endpoint()][item] === 'string' )
        str = str.replace(new RegExp(`{${item}}`, 'g'),application.object[endpoint()][item]);

    for(let property of Object.getOwnPropertyNames(defaults))
      str = str.replace(new RegExp(`{${property}}`, 'g'),defaults[property]);

    return str
  },
  model = {},
  view = element,
  controller = (_element, _event, callback ) => {
    event(_element, _event, callback )
  }


  // return public methods & variables
  return {
    route : route,
    endpoint : endpoint,
    object : applicationObject,
    model : model,
    modules : modules,
    module : module,
    config : config,
    require : require,
    add : add,
    remove : remove,
    init : init,
    load : load,
    event : event,
    controller : controller,
    render : render,
    page : page,
    nav : nav,
    element : element,
    view : view,
    template : template,
    templates : templates,
    title : title
  }
})();
const ac = application;
