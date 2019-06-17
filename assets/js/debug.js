'use strict'

/*
* Application Client 0.12 Debugger 0.4.7
* assets/js/application.js
*/
const debugLog = [];
let _debugger;
const debuggerStatic = (callback) => {
  if(_debugger){
    $(`${application.object.config.main} #${application.template()}`)
      .append(_debugger);
      jshintSettings()
    callback();
  }else{
    $.get('html/debug/debugger.html',(response)=>{

      _debugger = $(response)
      
    }).done(()=>{
      $(`${application.object.config.main} #${application.template()}`)
        .append(_debugger); // append debugger html
      jshintSettings()

        callback()
    });

  }
}
const loadTimeColor = (time) => {
  let color
  if(time<500){
    color = 'LimeGreen'
  }else if (time<1000) {
    color = 'Goldenrod'
  }else if (time<1500) {
    color = 'OrangeRed'
  }else{
    color = 'red'
  }
  return color
}
const CDNs = []
const libRef = {
  jquery : { name : 'jQuery', docs : 'https://devdocs.io/jquery/' },
  bootstrap : { name : 'Bootstrap', docs : 'https://devdocs.io/bootstrap/' },
  popper : { name : 'Popper.js', docs : 'https://devdocs.io/bootstrap/' },
  underscore : { name : 'Underscore.js', docs : 'https://devdocs.io/underscore/' },
  backbone : { name : 'Backbone.js', docs : 'https://devdocs.io/backbone/' },
  react : { name : 'React', docs : 'https://devdocs.io/react/' },
  vue : { name : 'Vue', docs : 'https://devdocs.io/vue/' },
  angular : { name : 'Angular', docs : 'https://devdocs.io/angular/' },
  ace : { name : 'Ace Editor', docs : 'https://ace.c9.io/#nav=api' },
  showdown : { name : 'Showdown', docs : 'https://github.com/showdownjs/showdown/wiki' },
  codemirror : { name : 'CodeMirror', docs : 'https://codemirror.net/doc/manual.html'},
  jshint : { name : 'JSHint', docs : 'https://jshint.com/docs/'}
}
const getCDNs = () => {
  $('script').each(function(){
    const src = $(this).attr('src');
    if(src.includes('https')) {
      const element = $(this)
      //try{
        const srcArr = src.replace('https://','').split('/');
      //}catch(error){
      //  console.log(src)
      //}
      const integrity = element.attr('integrity')
      const cdn = srcArr[0]
      const script = srcArr[srcArr.length-1]
      if(libRef[script.split('.')[0].split('-')[0]]){
        const libRefItem = libRef[script.split('.')[0].split('-')[0]]
        let libItem = '<div class="card shadow" style="width:100%; margin:15px;background: linear-gradient(135deg, #fdffff 0%,#f7f7f7 100%); "><div class="row no-gutters"><div class="col-md-2">'
        libItem += `<img src="img/logos/${script.split('.')[0].split('-')[0]}.png" style="width:50px;margin-top:20px;margin-left:20px;" class="card-img" >`
        libItem += ' </div><div class="col-md-10"><div class="card-body">'
        libItem += `<h5 class="card-title">${libRefItem.name}</h5><p class="card-text"><small class="text-muted">Hosted on <span class="Inconsolata">${cdn}</span><br></small></p>`
        libItem += ` </div></div></div><div class="card-footer"><span class="btn-group"><a href="${libRefItem.docs}" class="btn btn-light btn-sm" target="_blank"><i class="fas fa-book"></i> Docs</a><a href="https://www.wappalyzer.com/technologies/${script.split('.')[0].split('-')[0]}" class="btn btn-light btn-sm" target="_blank"><i class="fas fa-external-link-alt"></i> Wappalyzer</a><a href="https://www.npmjs.com/package/${script.split('.')[0].split('-')[0]}" class="btn btn-light btn-sm" target="_blank"><i class="fab fa-npm"></i> npm</a></span></div></div>`
        $('#libraries').append(libItem)
      }
      CDNs.push({
        src : src,
        cdn : cdn,
        integrity : integrity,
        package : script,
        type : 'JavaScript'
      });
    }
  });
  $('link').each(function(){
    const href = $(this).attr('href');
    if(href.includes('https')) {
      const element = $(this);
      const hrefArr = href.replace('https://','').split('/');
      const integrity = element.attr('integrity');
      const cdn = hrefArr[0];
      const stylesheet = hrefArr[hrefArr.length-1];
      CDNs.push({
        src : href,
        cdn : cdn,
        integrity : integrity,
        package : stylesheet,
        type : 'CSS'
      });
    }
  });
  return CDNs;
}
const issues = [];
const getIssues = () => {

}
const jshint = (source) => {

  let options;
  if(application.object.config.jshint){
    options = application.object.config.jshint
    //console.log(options)
  }else{
    options = {
      undef: false,
      esversion : 6,
      asi : true
    }
    application.object.config.jshint = options
  }

  const predef = { foo : false}

  JSHINT(source, options, predef);

  //$('#ecmascriptVersion').val(JSHINT.data().options.)
  return JSHINT.data();
}
const jshintSettings = (options) => {
  const jsHintSettingsECMAScriptVersion = $('#jsHintSettingsECMAScriptVersion')
  const jsHintOptions = application.object.config.jshint

  jsHintSettingsECMAScriptVersion.val(jsHintOptions.esversion)
  application.controller(jsHintSettingsECMAScriptVersion,'change',function(event){
    console.log($('#jsHintSettingsECMAScriptVersion').val())
    application.object.config.jshint.esversion = $('#jsHintSettingsECMAScriptVersion').val();
    debugJSHint()
  })
  const jsHintSettingsSemicolons = $('#jsHintSettingsSemicolons')
  if(application.object.config.jshint.asi){
    jsHintSettingsSemicolons.attr('checked','checked')
  }else{
    jsHintSettingsSemicolons.attr('checked','')
  }
  jsHintSettingsSemicolons.on('change',function(){

      application.object.config.jshint.asi ? application.object.config.jshint.asi = false : application.object.config.jshint.asi = true
      debugJSHint()
  })
  const jsHintSettingsUndefined = $('#jsHintSettingsUndefined')
  if(application.object.config.jshint.undef){
    jsHintSettingsUndefined.attr('checked','checked')
  }else{
    jsHintSettingsUndefined.attr('checked','')
  }
  jsHintSettingsUndefined.on('change',function(){

      application.object.config.jshint.undef ? application.object.config.jshint.undef = false : application.object.config.jshint.undef = true
      debugJSHint()
  })
}
const debugJSHint = () => {

      const jshintModuleOutput = jshint(`application.object.${application.endpoint()}.default = ${application.object[application.endpoint()].default.toString()}`)
      const ECMAScriptVersion = jshintModuleOutput.options.esversion;

      const undef = jshintModuleOutput.options.undef ? ' not' : '';
      const asi = jshintModuleOutput.options.asi ? ' not' : ''

      $('#jshint #details').html(`ECMAScript ${ECMAScriptVersion}; Undefined variables${undef}  permitted, Semicolons(;)${asi} required`);
      $('#jshint #errors,jshint #code').html('');
      if(jshintModuleOutput.errors){
        $('#jshint #errors').append(`<h5 class="text-danger"><i class="fas fa-times"></i> Module <span class="Inconsolata">assets/js/modules/${application.endpoint()}.js</span> has ${jshintModuleOutput.errors.length} Errors;</h5>`)
      }else{
        $('#jshint #errors').html(`<h5 class="text-success"><i class="fas fa-check"></i> Module <span class="Inconsolata">assets/js/modules/${application.endpoint()}.js</span> has no errors</h5>`)
      }
      if(jshintModuleOutput.errors){
        $('.jshintErrorCount').html(jshintModuleOutput.errors.length)
      }else{
        $('.jshintErrorCount').html('')
      }

      for(let err in jshintModuleOutput.errors){
        $('#jshint #errors').append(`<div class="text-danger Inconsolata"><i class="fas fa-exclamation-triangle"></i> <a href="http://linterrors.com/js?q=${jshintModuleOutput.errors[err].code}" target="_blank">${jshintModuleOutput.errors[err].code}</a> : <code>${jshintModuleOutput.errors[err].evidence}</code> on line ${jshintModuleOutput.errors[err].line} : ${jshintModuleOutput.errors[err].raw}</div>`);
        console.error(`JSHint ${jshintModuleOutput.errors[err].code} : ${jshintModuleOutput.errors[err].evidence} on line ${jshintModuleOutput.errors[err].line} : ${jshintModuleOutput.errors[err].raw}`);
      }
      setCode(()=> aceEditor({
        id: 'code',
        mode : 'javascript',
        theme : 'ace/theme/github'
      }));
      $('#editorTheme').on('change',function(event){
        setCode(()=> aceEditor({
          id: 'code',
          mode : 'javascript',
          theme : $('#editorTheme').val()
        }));
      })

      $('#jshint #functions').html(``);
      if(jshintModuleOutput.functions) {

        $('#jshint .functionsHeader').html(`${jshintModuleOutput.functions.length} functions`);
        $('#jshint #info').html('<i class="fas fa-angle-right"></i>').append(`${jshintModuleOutput.functions.length} functions (${jshintModuleOutput.functions.filter(item=>item.name === '(empty)').length} anonymous); `)
        for(let item of jshintModuleOutput.functions){
          let functionItem = $(`<li class="list-group-item Inconsolata hover pointer text-muted"><i class="fas fa-cog"></i> ${item.name} (${item.line}:${item.character})</li>`)
            .on('click',function(){
              editor.moveCursorTo(item.line-1,item.character,false);
              $('#jshint #functions li').removeClass('active')
              $(this).addClass('active')
              //editor.selectLineStart()
            })
          $('#jshint #functions').append(functionItem )
        }
      }
      $('#jshint #implieds').html('')
      if(jshintModuleOutput.implieds) {
        $('#jshint #info').append(`${jshintModuleOutput.implieds.length} implieds; `)
        $('#jshint .impliedsHeader').html(`${jshintModuleOutput.implieds.length} implieds`);
        for(let item of jshintModuleOutput.implieds){
          let impliedItem = $(`<li class="list-group-item Inconsolata hover pointer text-muted"><i class="fas fa-cog"></i> <code>${item.name}</code> (${item.line})</li>`)
          $('#jshint #implieds').append(impliedItem )
        }
      }
      //console.log(jshintModuleOutput)

      if(jshintModuleOutput.globals) $('#jshint #info').append(`${jshintModuleOutput.globals.length} globals; `)
      //if(jshintModuleOutput.member) $('#jshint #info').append(`${jshintModuleOutput.member.length} member; `)
}
let editor,editorElement
const aceEditor = function(args){
  //setTimeout(()=>{
    if(editor) {
      editor.destroy()
      //editor.container.remove()
      //$('#editorCol').append(editorElement)
    }else{
      editorElement = $('#code')
    }
    editor = ace.edit(args.id);
    editor.setTheme(args.theme);
    editor.session.setMode(`ace/mode/${args.mode}`);
  //},500)

}
const setCode = function(callback){

  $('#jshint #code').html('').append(`<pre>application.object.${application.endpoint()}.default = ${application.module().default.toString()}</pre>`);
  if(callback) callback();
}
application.debugLog = debugLog;
application.debugger = (callback) => {

// TODO: cache debugger html in one ajax call... on each init is too expensive
  debuggerStatic((callback)=>{

    if(CDNs.length===0)getCDNs()
    let cdnsHtml = ''
    for(let item of CDNs){
      if(item) cdnsHtml += `<tr><td><code>${item.package}</code></td><td>${item.type}</td><td class="Inconsolata">${item.cdn}</td></tr>`
    }
    $('.cdnsCount').html(CDNs.length);
    $('#cdns_ table tbody').html(cdnsHtml);

    $('#jsHintSettingsBtn').on('click',)
    //application.render()
    $('#log').html(''); // clear log
    let module = application.module(),
        applicationLoadTimeColor,
        moduleLoadTimeColor;

    $('.stats').html(`<small><i class="fas fa-history"></i> Init load time : <span style="color:${loadTimeColor(application.loadtime)}">${application.loadtime} ms</span>; Module <b>${module.name}</b> rendered in<span style="color:${loadTimeColor(module.loadtime)}"> ${module.loadtime} ms</span> with navigator.userAgent : <span class="Inconsolata">${navigator.userAgent}</span></small>`)
    const logElement = $('#log')
    let line = 0;
    for(let item of debugLog){
      if(item.includes(' ms')){
        let loadtime = (item.split('in ')[1].split(' ms')[0])
        item = item.replace(`${loadtime} ms`,`<span style="color:${loadTimeColor(loadtime/1)}">${loadtime} ms</span>`)
      }else if (item.includes('Error')) {
        item = `<span class="text-danger"><i class="fas fa-exclamation-triangle"></i> ${item}</span>`
      }
      //item = item.replace('load','<b>load</b>')
      item = item.replace('complete','<i class="fas fa-check"></i><b>complete</b>')
      line++
      logElement.append($(`<div><span class="font-weight-lighter">${line}.</span> ${item}</div>`))
    }


    logElement.scrollTop(logElement.outerHeight()*100);

    $('.logCount').html(debugLog.length)
    $('#properties table tbody').html('')
    for(let item in application.module()){
      if(item!='default'){
        if(item === 'color'){
          $('#properties table tbody').append(`<tr><td><code>${item}</code></td><td class="Inconsolata" style="background:${application.object[application.endpoint()][item]};color:#fff;">${application.object[application.endpoint()][item]}</td></tr>`)
        }else if (item === 'loadtime') {
          $('#properties table tbody').append(`<tr><td><code>${item}</code></td><td class="Inconsolata" style="color:${loadTimeColor(application.object[application.endpoint()][item]/1)}">${application.object[application.endpoint()][item]} ms</td></tr>`)
        }else if( typeof application.module()[item] === 'object'){
          let propertiesObjectTable = '<table class="table"><tbody>'
          for(let property in application.module()[item]){
            propertiesObjectTable += `<tr><td><code>${property}</code></td><td class="Inconsolata">${application.module()[item][property]}</td></tr>`
          }
          propertiesObjectTable += '</tbody></table>'
          $('#properties table tbody').append(`<tr><td><code>${item}</code></td><td>${propertiesObjectTable}</td></tr>`);
        }else{
          $('#properties table tbody').append(`<tr><td><code>${item}</code></td><td class="Inconsolata">${application.module()[item]}</td></tr>`)
        }

      }
    }
    $('.moduleCount').html(Object.getOwnPropertyNames(application.module()).length)
    for(let item in application.object.config){
      /*if( typeof application.object.config[item] === 'object'){
        let configObjectTable = '<table class="table"><tbody>'
        for(let property in application.object.config[item]){
          configObjectTable += `<tr><td><code>${property}</code></td><td class="Inconsolata">${application.object.config[item][property]}</td></tr>`
        }
        configObjectTable += '</tbody></table>'
        $('#config table tbody').append(`<tr><td><code>${item}</code></td><td>${configObjectTable}</td></tr>`)
      }else{*/
      if( typeof application.object.config[item] === 'object'){
        $('#config table tbody').append(`<tr><td><code>${item}</code></td><td class="Inconsolata">${Object.getOwnPropertyNames(application.object.config[item]).join(',')}</td></tr>`)
      }else{
        $('#config table tbody').append(`<tr><td><code>${item}</code></td><td class="Inconsolata">${application.object.config[item]}</td></tr>`)

      }
      //}

    }
    $('.configCount').html(Object.getOwnPropertyNames(application.object.config).length)
    debugJSHint()

    let modal
    application.controller($('.modalswitch'),'click',function(){

        $('.modal-title').html($('#debugger .card-header').html());
        $('.modal-body').html($('#debugger .card-body').html());
        $('#modal').modal().show().on('show.bs.modal', () => {
          $('#debugger').hide()


        }).on('hide.bs.modal', () => {

          $('#debugger').show()

        });


    })
    application.controller($('.debugswitch'),'click',function(){
      if(application.object.config.debug){
        application.object.config.debug =false;
        $('#debugger').fadeOut()
        console.clear()
      }else{
        application.object.config.debug =true;
      }
    })
  })
}
let init
const debug = (fn,msg) => {
    let filter
    /*if(typeof config.debug === 'string'
    && modules().includes(config.debug.split('.')[0])
    && Object.getOwnPropertyNames(object).includes(config.debug.split('.')[0])){
      filter = config.debug.split('.')[0]


    }else if(typeof config.debug === 'array'){
      filter = utils.compare(config.debug,modules())

    }*/
    const log = (fn) =>{

      if(!init){
        init = true;
        console.info('Debugger is enabled with set debug property in assets/json/config.json')
      }
      console.log(fn)
      debugLog.push(fn)
    }
    const configVal = application.object.config.debug
    const logFilter = (fn)=>{
      if (typeof configVal === 'string') {
        if(fn.includes(configVal)) log(fn)

      }else if (configVal.length > 0) {
        for(let val in configVal){
          if(fn.includes(val)) log(fn)
        }
      }
    }

    configVal === true ? log(fn) : logFilter(fn)



        //fn = fn.split(' : ')[0]
        //msg = fn.split(' : ')[1]




    //debugLog.push({fn : fn,msg : msg})



}
