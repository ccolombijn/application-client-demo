const debugLog = []
application.debugLog = debugLog
application.debugger = (callback) => {
  if($('#debugger'))$('#debugger').remove()
  $.get('html/debug/debugger.html',(_debugger,callback)=>{
    _debugger = $(_debugger)


    $(`${application.object.config.main} #${application.template()}`).append(_debugger)
    //application.render()
    $('#log').html('')
    let module = application.object[application.endpoint()],
        applicationLoadTimeColor,
        moduleLoadTimeColor
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
    $('.stats').html(`<small><i class="fas fa-history"></i> Init load time : <span style="color:${loadTimeColor(application.loadtime)}">${application.loadtime} ms</span>; ${module.name} was loaded in<span style="color:${loadTimeColor(module.loadtime)}"> ${module.loadtime} ms</span></small>`)
    for(let item of debugLog){
      if(item.includes(' ms')){
        let loadtime = (item.split('in ')[1].split(' ms')[0])
        item = item.replace(`${loadtime} ms`,`<span style="color:${loadTimeColor(loadtime/1)}">${loadtime} ms</span>`)
      }
      //item = item.replace('load','<b>load</b>')
      item = item.replace('complete','<i class="fas fa-check"></i><b>complete</b>')

      $('#log').append($(`<div>${item}</div>`))
    }
    $('#properties table tbody').html('')
    for(let item in application.object[application.endpoint()])if(item!='default')$('#properties table tbody').append(`<tr><td><code>${item}</code></td><td>${application.object[application.endpoint()][item]}</td></tr>`)
    for(let item in application.object.config)$('#config table tbody').append(`<tr><td><code>${item}</code></td><td class="Inconsolata">${application.object.config[item]}</td></tr>`)


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
const debug = (fn,msg) => {
    let filter
    /*if(typeof config.debug === 'string'
    && modules().includes(config.debug.split('.')[0])
    && Object.getOwnPropertyNames(object).includes(config.debug.split('.')[0])){
      filter = config.debug.split('.')[0]


    }else if(typeof config.debug === 'array'){
      filter = utils.compare(config.debug,modules())

    }*/

    if(!msg){
      if(typeof fn === 'string'){
        if(application.object.config.debug)console.log(fn)
        //fn = fn.split(' : ')[0]
        //msg = fn.split(' : ')[1]

      }else if (typeof fn === 'object') {
        console.log(fn)
      }

    }
    //debugLog.push({fn : fn,msg : msg})
    debugLog.push(fn)




  }
