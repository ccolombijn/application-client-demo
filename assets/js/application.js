'use strict'

/*
* Application Client 0.9.5
* assets/js/application.js
*/

const application = (function(){
  let config, // configuration object
      object = {}, // application object
      output, // private output
      position = 0, // private global position
      ready, // private ready state
      start,_start,
      finish,_finish,
      loadtime,_loadtime,
      loadModules,
      previous;//
       // previous object state
//..............................................................................

  const defaults = {
    template : 'pageLayout',
    templatePath : 'html/templates/{template}.html',
    modulesPath : 'js/modules/{module}.js'
  }

  const require = (name,callback) => {
      let require_start = new Date;
      $.get(`js/${name}.js`).done(() => {
        let require_end = new Date;
        let require_loadtime = require_end - require_start
        debug(`application.require : js/${name}.js load complete in ${require_loadtime} ms`)
        if(callback)callback()
      }).fail(()=>{
        console.error(`application.require : ${name} not available`)
      });

  }

  const route = () => // gets route from location.hash
    location.hash.slice(1).split('/');

  const endpoint = () => // gets default property of config if route not given
    route()[0] ? route()[0] : config.default;



  const element = {},
  elements = () => {
    const isElement = (property) =>
      (typeof config[property] === 'string')
      && config[property].includes('#');
    for(let property in config)
      if(isElement(property)) element[property] = $(config[property]);
    debug(`application.elements : ${Object.getOwnPropertyNames(element).join(',')}`);
    return element;
  },
//..............................................................................

  add = function(name,module) {
    //if(application.config.debug) console.log(`application.add : ${name}`);
    // adds property to application object
    module ? object[name] = module : require(name);
    if(module) return module;

  },

//..............................................................................

  remove = function(property) {
    // removes property from application object
    const obj = {}
    for(let _property in object)
      if(_property != property ) obj[_property] = _property;
    object = obj;
  },

  initRequire = (_require,callback) => {
    if(_require.length>0){
      for(let item of _require) {

        require(item,()=>{
          if(application.requireCallback) {
            application.requireCallback();
            application.requireCallback = undefined;
          }

        });
      }
      if(callback)callback();
    }else{
      require(_require,callback)
    }
  },
//..............................................................................
  initModules = () => {
    require(`modules/${config.modules[position]}`, () =>{ // async request
      debug(`application.initModules : modules/${config.modules[position]} loaded`);
      if(position === config.modules.length-1){
        finish = new Date
        loadtime = finish - start
        application.loadtime = loadtime
        debug(`application.initModules complete in ${loadtime} ms: init load`);
        load(()=>{

          _finish = new Date
          _loadtime =  _finish - _start
          application.object[endpoint()].loadtime = _loadtime


        }) // init load
        $(window).on( 'hashchange',()=>load(()=>{


        })); // event load

      } else {

        position++; // next position in modules array
        initModules();
      }
    });
  },
  initObj = (_application) => {
    if( _application && object ){ // checks if application object exists
      if(typeof _application === 'function'){
         _application()
      }else{
        for( let property in object){
          if(!object[property])
            object[property] = _application[property];
        }
      }

    } else if (_application) {
      object = _application; // use given object
    } else {
      // BUG:
      //object = application.object; // use existing object
    }
  },
//..............................................................................
  initConfig = (callback) => {

    $.get(`json/config.json`,(data) =>{
      config = data;
      object.config = config;
      //debug(`application.initConfig : json/config.json loaded`);
      //debug(config);
    }).done(() => {

    }).fail(() => {
      if(object.config){
        config = object.config; // get config object
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
    start = new Date;

      initObj(_application); // assigns given, existing or merged application object


      initConfig(()=>{ // initialize config object
        require('debug',()=>{ // load debug
          debug(`application.init : ${config.name}`);
          if(config.modules) {
            loadModules = new Set(config.modules).values();
            if(config.require){
              initRequire(config.require,()=>{ // load require if provided
                initModules(loadModules); // load modules if require is loaded
              })
            }else{
              initModules(loadModules); // // load modules
            }
          }else{
            // call load; calls page & module; application.oject should be ready & complete...
            // and in the right order... Let's wait 500 ms and hope everything is OK
            setTimeout( () => load(), 500)
            //load()
            window.addEventListener( 'hashchange', () => load() );
          }
          application.config = config; // set config object of application object
        })

      });
      return object

  })(),

//..............................................................................

  load = async function(callback) {
  //load = () => {
    // calls module with current route in callback of page call
    _start = new Date
    const _route = route();
    const _endpoint = endpoint();
    const _method = _route[1];
    const _argument = _route[2];
    if(modules().includes(_endpoint)){
      await ready
      if(!object[_endpoint]) // requested module does not exist
        throw `application.load : requested module ${_endpoint} undefined; modules loaded : ${modules().join(',')}`
      const _module = _method ? object[_endpoint][_method] // module method
          : object[_endpoint].default // module default

      page( function() {// call page
        //_module(_argument)
          debug(`application.load : ${_endpoint}`);
        if(typeof _module === 'function'){
          _module(_argument); // call module
          if(callback) callback();
        }else{
          throw `application.load  : ${typeof _module} ${_module} is not a function`;
        }
      });
    }
  },

//..............................................................................

  page = ( callback ) => {
    // displays page from template, execute callback and call render
    // view.main doesn't exist before first render

    $(config.main).fadeOut(400,() => { // page transition out
      template( () => { // load template file
        debug(`application.page : ${config.main} #${template()}`);
        if(callback) callback(); // callback (module)


          render('page'); // render document
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
      let template_load_start = new Date;
      $.get( `html/templates/${_template}.html`, function( data ) { // get file
        let template_load_end = new Date;
        let template_loadtime = template_load_end - template_load_start;
        debug(`application.template : html/templates/${_template}.html load complete in ${template_loadtime} ms`);
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


    return _template;
  },

//..............................................................................

  render = ( _this, callback ) => {
    let _route,_event = ''
    // updates page with module properties
    if(typeof _this === 'function' ) {
      callback = _this; // route argument as callback
      _route = endpoint();
    }else if(_this) {
      //console.log(`${_this} : ${typeof _this}`)
      _start = new Date
      if(_this.target){
        // event
        //console.log(_this)
        if(_this.target.id){
          _event = `(#${_this.target.id} ${_this.type} event)`
        }else if(_this.target.class){
          _event = `(.${_this.target.class} ${_this.type} event)`
        }

      }else{

        if(typeof _this === 'string') {
          _event = `(${_this})`
        }
      }
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
      for(let property in object[_route]){
        if(typeof object[_route][property] === 'string' ){
          // set values of properties of elements with corresponding class names
          $(`#${_template} .${property}`).html(str(object[_route][property])); // element html & parse with str
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
      _finish = new Date
      _loadtime =  _finish - _start
      thisObj.loadtime = _loadtime
      debug(`application.render ${_event}: ${_route} complete in ${_loadtime} ms`);
      if(config.debug) application.debugger()
    //}
    return application;
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
                  ${str(object[ item ].name)}
                </a>`);
        view.nav.append(menuItem);


    }
    let debugStr = modules().join(',').replace(endpoint(),`${endpoint()}(active)`)
    debug(`application.nav : ${debugStr}`);

    const active = `${config.nav} li#${endpoint()} a`;
    $( active ).addClass('active');
    if(config.style && object[endpoint()].color ) {
      $( active ).attr('style',`${str(config.style)}`);
    }
    return view.nav;
  },

//..............................................................................

  title = (route) => {
    // sets document title with name property
    if(!route) route = endpoint();

    let pageTitle = ( route === '') ?
    config.name
    : `${object[route].name} - ${config.name}`;
    $('title').html(pageTitle);
    debug(`application.title : ${pageTitle}`);
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
      object[property.split('.')[0]][property.split('.')[1]]
      : object[endpoint()][property];

      _element.val(target);
      callback = (event) => {
        property.includes('.') ?
        object[property.split('.')[0]][property.split('.')[1]] = event.target.value
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
    let id
    if(_element){
      id = _element.attr('id');

      _element.on(_event,(event) => {
        _start = new Date;
        callback(event);
        render(event); // event render
      });
    }

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
        let obj = object[property];
        if(typeof obj.default === 'function' ) _modules.push(property)
      }
    //}
    return _modules;
  },
  module = () => object[route()],


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
    object : object,
    model : model,
    modules : modules,
    module : module,
    config : config,
    require : require,
    requireCallback : undefined,
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
    title : title,
    debug : []
  }
})();
const ac = application;
