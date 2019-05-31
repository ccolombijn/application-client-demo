const try_it_out = (function(){
  //let input,html

  const objs = {
    'application' : application,
    'application.object' : application.object,
    'application.config' : application.config,
    'application.element' : application.element,
    'utils' : utils
  },

  examples = [ 'updateHeader','addModule']
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
          if(application.endpoint()==='try_it_out'){
            if(editorJs.somethingSelected()) editorSelection()
            if($('div.output').html()!= obj.htmlinput) {
              obj.htmlinput = $('div.output').html()
              try{
                if(editorHtml && obj.htmlinput) editorHtml.setValue(obj.htmlinput);
              }catch(error){
                console.warn(`editorHtml.setValue error : ${error}`)
              }
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
        console.log('executeCode')
        try{
          let executeOutput = eval(editorJs.getValue());

          application.render();
          obj.htmlinput = $('div.output').html()
          editorHtml.setValue(obj.htmlinput)

          if(typeof executeOutput === 'object') executeOutput = JSON.stringify(executeOutput)
          if(typeof executeOutput === 'array') executeOutput = `[${executeOutput.join(',')}]`
          if(executeOutput === '') executeOutput = '// No output'
          if(!executeOutput) executeOutput = '// Output undefined'
          $('#output code').html(executeOutput)
        }catch(error){
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
        $.ajax({
          url : `js/examples/${example}.js.txt`,
          success : function(data){

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


    },
    template : 'try_it_out',
    color : 'Chocolate'
  })
})()
