const try_it_out = (function(){
  //let input,html

  const objs = {
    'application' : application,
    'application.object' : application.object,
    'application.config' : application.config,
    'application.element' : application.element,
    'utils' : utils
  },

  examples = [ 'updateHeader','addModule','apiRequest','requireScript','requireModule']
  let sync
  application.add('try_it_out',{
    name : 'Try it out',
    default : function try_editor(){

      //if(input) $('#codeInput').innerHTML = input
      //if(!input) input = $('#codeInput').val()
      //if(!html || html != $('div.output').html()) html = $('div.output').html()
      const obj = application.object.try_it_out;


      const editorJs = demo.editor('javascript');
      if(obj.input)editorJs.setValue(obj.input);

      const editorHtml = demo.editor('htmlmixed');
      if(!obj.htmlinput && $('div.output')) obj.htmlinput =$('div.output').html()
      if(obj.htmlinput)editorHtml.setValue(obj.htmlinput);
      let selection
      //if(!sync){
        if(sync) clearInterval(sync)
        sync = setInterval(() => {
          if(application.endpoint()[0]==='try_it_out'){
            if(editorJs.somethingSelected()) editorSelection()
            if($('div.output').html()!= obj.htmlinput) {

                $('#updateBtn').addClass('text-muted').html('<i class="fas fa-sync fa-spin"></i> Updaten...')
              obj.htmlinput = $('div.output').html()
              try{
                if(editorHtml && obj.htmlinput) editorHtml.setValue(obj.htmlinput);
              }catch(error){
                console.warn(`editorHtml.setValue error : ${error}`)
              }
              setTimeout(() => {

                  $('#updateBtn').removeClass('text-muted').html('<i class="fas fa-sync"></i> Update HTML')
              },1000)
            }
          }

       }, 500);
      //}
      const editorSelection = function(){

        if(selection != editorJs.getSelection()){
          selection = editorJs.getSelection();
          if(objs[selection]) editorSuggest(selection);
        }
      }

      const editorSuggest = function(selection){
        let select = $('<select class="form-control Inconsolata"></select>')

        for(let property of Object.getOwnPropertyNames(objs[selection])){
          let func = (typeof objs[selection][property] === 'function') ? '()' : ''
          let option = $('<option></option>').html(`${selection}.${property}${func}`)
          select.append(option)
        }
        select.on('change',function(event){
          editorJs.replaceSelection(`${event.target.value}`)
          $('#editorSuggest').html('')
        })
        $('#editorSuggest').append(select)
      }



      const executeCode = function(){

        const code = editorJs.getValue()
        try{
          let _require = code.includes('application.require')
          let executeOutput = eval(code);
          if(_require){
            setTimeout(()=>{
              if(application.object.config.debug)application.debugger()
              application.render('executeCode');
              obj.htmlinput = $('div.output').html()
              editorHtml.setValue(obj.htmlinput)
            },100)
          }else{
            if(application.object.config.debug)application.debugger()
            application.render('executeCode');
            obj.htmlinput = $('div.output').html()
            editorHtml.setValue(obj.htmlinput)
          }


          if(typeof executeOutput === 'object') executeOutput = JSON.stringify(executeOutput)
          if(typeof executeOutput === 'array') executeOutput = `[${executeOutput.join(',')}]`
          if(executeOutput === '') executeOutput = '// No output'
          if(!executeOutput) executeOutput = '// Output undefined'
          $('#output code').html(executeOutput)
        }catch(error){
          if(application.object.config.debug){
            debug('executeCode : '+error)
            const executCodejshint = jshint(code);

            application.debugger()
          }
          $('#output code').html(error)
        }
      }
      const executeBtn = $('#executeBtn').on('click',executeCode);
      const updateHTML = ()=> {
        obj.htmlinput = editorHtml.getValue()
        $('div.output').html(obj.htmlinput);
      }

      const updateBtn = $('#updateBtn').on('click',updateHTML);
      const examplesPanel = $('#examplesPanel')
      const insertExample = function(event){

        const example = event.target.id
        $('#examplesPanel li').removeClass('active')
        $('.exampleName').html(example)
        $.ajax({
          url : `js/examples/${example}.js`,
          dataType : 'html',
          success : function(data){
            $(`#examplesPanel #${example}`).addClass('active')
            editorJs.setValue(data.toString());
            $.get(`html/examples/${example}.html`,(data)=> {
              editorHtml.setValue(data) ;
              obj.htmlinput = data;
              $('div.output').html(data);
            })
          }

        });
        //$.get(`js/examples/${example}.js`, function(data){
        //  editorJs.setValue(data.toString());
        //});
      }

      for(let example of examples){
        example = $(`<li id="${example}" class="list-group-item Inconsolata hover pointer">${example}</li>`);
        example.on('click',(event) => {
          insertExample(event)
        })
        examplesPanel.append(example)

      }

      const expandCard = function(){
        const editor = $('.editor')
        const btn = $('.expand i')
        if(editor.hasClass('col-md-6')){
          editor.removeClass('col-md-6').addClass('col-md-12')
          btn.removeClass('fa-angle-double-right').addClass('fa-angle-double-left')
        }else{
          editor.removeClass('col-md-12').addClass('col-md-6')
          btn.removeClass('fa-angle-double-left').addClass('fa-angle-double-right')
        }

      }

      const expandBtn = $('button.expand').on('click',expandCard)
      const debugBtn = $('button.debugger').on('click',function(){
        application.object.config.debug = true;
        application.debugger()
        $('button.debugger').hide()
      })
      if(application.object.config.debug)$('button.debugger').hide()
    },
    template : 'try_it_out',
    color : 'SandyBrown'
  })
})()
