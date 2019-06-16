'use strict'

/*
* Application Client 0.12
* assets/js/application.js
*/
// TODO:
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
      const requireStart = new Date;
      $.get(`js/${name}.js`).done(() => {
        const requireEnd = new Date;
        const requireLoadtime = requireEnd - requireStart
        debug(`application.require : js/${name}.js load complete in ${requireLoadtime} ms`)
        if(callback)callback()
      }).fail(()=>{
         throw `application.require : ${name} not available`
      });
  }

  const hash = () => location.hash.slice(1);
  const route = () => hash().split('/');
  const endpoint = () =>
    hash() ? getRoute().endpoint : config.default;

//..............................................................................

  const element = {},
  elements = () => {
    const isElement = (obj,property) =>
      (typeof obj[property] === 'string')
      && obj[property].includes('#');
    const setElements = (obj) => {
      for(let property in config)
        if(isElement(config,property)) element[property] = $(config[property]);
    }
    setElements(config)
    debug(`application.elements : ${Object.getOwnPropertyNames(element).join(',')}`);
    return element;
  },

//..............................................................................

  add = function(name,module) {
    //if(application.config.debug) console.log(`application.add : ${name}`);
    // adds property to application object
    if(name.includes('.')){
      name = name.split('.');
      if(name[1]){
        object[name[0]][name[1]] = module;
      }else {
        object[name[0]] = module;
      }

    }else{
      module ? object[name] = module : require(name);
    }
    if(module.route) {
      object.routes[module.route] = name;
    }else if (module) {
      object.routes[name.replace('.','/')] = name;
    }
    if(module) return module;

  },

//..............................................................................

  update = function(name,obj){
    for(let module in object){
      if(module === name ){
        for(let property in obj)
          object[module][property] = obj[property];
        break;
      }
    }
  },
//..............................................................................

  remove = function(name) {
    // removes property from application object
    const obj = {}
    for(let module in object)
      if(module != name ) obj[module] = module;
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
    require(`modules/${object.modules[position]}`, () =>{ // async request
      debug(`application.initModules : modules/${object.modules[position]} loaded`);
      if(position === object.modules.length-1){
        finish = new Date
        loadtime = finish - start
        application.loadtime = loadtime
        debug(`application.initModules complete in ${loadtime} ms: init load`);
        load(()=>{
          // init load
          _finish = new Date;
          _loadtime =  _finish - _start;
          application.object[getRoute().endpoint].loadtime = _loadtime;
        })
        $(window).on( 'hashchange',()=>load(()=>{
          // event load

        }));

      } else {

        position++; // next position in modules array
        initModules();
      }
    });
  },
//..............................................................................
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
      object.default = config.default;
      object.modules = config.modules
      object.routes = config.routes;
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
            console.warn('config.modules is undefined')
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
  getRoute = (_route) => {
    _route = _route ? _route : hash()
    if(!_route) _route = endpoint() // get config.default if hash route not provided

    let _parameter,_endpoint;
    const routesProps = Object.getOwnPropertyNames(object.routes);
    for(let route of routesProps){
      if(_route.includes(route)){ // match route with config.routes properties
        _parameter = _route != route ? _route.replace(`${route}/`,'') : null;
        _endpoint = object.routes[route].split('.'); // _endpoint array for module route
        break;
      }
    }
    return {
      parameter : _parameter,
      endpoint : _endpoint
    }
  },
  //..............................................................................
  moduleRouter = (_route) => {
    _start = new Date
    let callback
    if(typeof _route === 'function' ) {
      callback = _route;
      _route = getRoute();
    }
    if(!_route) _route = getRoute();
    const _endpoint = _route.endpoint;
    if(_endpoint){
      // module route

      const _module = _endpoint[1] ?
      object[_endpoint[0]][_endpoint[1]]
      : object[_endpoint[0]].default;
      if(endpoint[2]) _module = _endpoint[3] ?
      _module[_endpoint[2]][_endpoint[3]]
      : _module[_endpoint[2]].default;

      page(() => { // call page
        if(typeof _module === 'function'){
          _module(_route.parameter); // call module
        } else {
          throw `application.moduleRouter  : ${typeof module} ${module} is not a function`;
        }

        debug(`application.moduleRouter : #${hash()} > module:${_endpoint.join('.')}`);

      });
    }else{
      throw `application.moduleRouter : endpoint undefined`;
    }
    if(callback) callback();
  },
  load = moduleRouter,
//..............................................................................

  page = ( _module ) => {
    // displays page from template, execute callback and call render
    // view.main doesn't exist before first render
    // BUG:
    $(config.main).fadeOut(400,() => { // page transition out
      template( () => { // load template file
        debug(`application.page : ${config.main} #${template()}`);
        if(_module) _module(); // callback (module)
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
      _route = getRoute().endpoint;
      html = true;
    }
    if(!_route) _route = getRoute().endpoint;
    if(!config.template) config.template = defaults.template;
    let _template,obj = application.object[_route];
    // BUG: config reference
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
        // BUG:
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
      _route = getRoute().endpoint;
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
      _route = getRoute().endpoint;
    }
    if(!_route) _route = getRoute().endpoint;

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
          const selClassElement = $(`#${_template} .${property}`)
          if(selClassElement){
            selClassElement.html(str(object[_route][property])); // element html & parse with str
            if(selClassElement.length>0)
              debug(`application.render : updated ${selClassElement.length} elements with class .${property}`)
          }

          if($(`[data-property*='${property}']`)){
            $(`[data-property*='${property}']`).html(str(object[_route][property]));
          }

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

    let _endpoint = getRoute().endpoint
    let debugStr = modules().join(',').replace(_endpoint,`${_endpoint}(active)`)
    debug(`application.nav : ${debugStr}`);

    const active = `${config.nav} li#${_endpoint} a`;
    $( active ).addClass('active');
    if(config.style && object[_endpoint].color ) {
      $( active ).attr('style',`${str(config.style)}`);
    }
    return view.nav;
  },

//..............................................................................

  title = (route) => {
    // sets document title with name property
    if(!route) route = getRoute().endpoint;

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
      : object[getRoute().endpoint][property];

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
  module = (route) => route ?  object[route] : object[getRoute().endpoint],


//..............................................................................

  str = (str) => {
    // replace {template} strings with module properties
    const _endpoint = getRoute().endpoint;
    const objProps = Object.getOwnPropertyNames(application.object[_endpoint])
    for(let item of objProps)
      if(typeof application.object[_endpoint][item] === 'string' )
        str = str.replace(new RegExp(`{${item}}`, 'g'),application.object[_endpoint][item]);
    const defaultProps = Object.getOwnPropertyNames(defaults)
    for(let property of defaultProps)
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
const $a = application;
