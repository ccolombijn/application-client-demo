const try_it_out = (function(){
  let input,html
  const objs = {
    'application' : application,
    'application.object' : application.object,
    'application.config' : application.config,
    'application.element' : application.element,
    'utils' : utils
  },
  examples = [ 'updateHeader','addModule']
  application.add('try_it_out',{
    name : 'Try it out',
    default : () => {
      //if(input) $('#codeInput').innerHTML = input
      if(!input) input = $('#codeInput').val()
      if(!html) html = $('div.output').html()
      const editorJs = demo.editor('javascript');
      editorJs.setValue(input);
      const editorHtml = demo.editor('htmlmixed');
      editorHtml.setValue(html);
      let selection
      const codeInput = $('#codeInput').on('change',function(event){
        input = editorJs.getValue()
      });
      if(input) $('#codeInput').innerHTML = input
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
      setInterval(() => {
         if(editorJs.somethingSelected()) editorSelection()
         input = editorJs.getValue()
         if($('div.output').html()!=html){
           $('#updateBtn').html('<i class="fas fa-sync fa-spin"></i> Updating...').addClass('text-muted')
           setTimeout(()=>$('#updateBtn').html('<i class="fas fa-sync"></i> Update HTML').removeClass('text-muted'),2000)
           html = $('div.output').html();
           editorHtml.setValue(html);
         }else{

         }
      }, 500);


      const executeCode = function(){
        console.log('executeCode')
        try{
          let executeOutput = eval(editorJs.getValue());

          application.render();
          editorHtml.setValue($('div.output').html())

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
      const updateHTML = ()=> $('div.output').html(editorHtml.getValue());
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
              html = data;
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
