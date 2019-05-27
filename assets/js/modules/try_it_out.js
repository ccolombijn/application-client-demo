const try_it_out = (function(){
  const objs = {
    'application' : application,
    'application.object' : application.object,
    'application.config' : application.config,
    'application.element' : application.element,
    'utils' : utils
  }
  application.add('try_it_out',{
    name : 'Try it out',
    default : () => {
      const editor = demo.editor();
      let selection
      const editorSelection = function(){

        if(selection != editor.getSelection()){
          selection = editor.getSelection();
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
          editor.replaceSelection(`${event.target.value}`)
        })
        $('#editorSuggest').append(select)
      }
      setInterval(() => {
        let editorSelected = editor.somethingSelected()
         editor.somethingSelected() ? editorSelection() : $('#editorSuggest').html('');
      }, 1000);

      //console.log(editor.getValue())


      const executeCode = function(){
        try{
          let executeOutput = eval(editor.getValue());
          application.render();
          if(typeof executeOutput === 'object') executeOutput = JSON.stringify(executeOutput)
          if(typeof executeOutput === 'array') executeOutput = `[${executeOutput.join(',')}]`
          if(executeOutput === '') executeOutput = '// No output'
          if(!executeOutput) executeOutput = '// No output'
          $('#output code').html(executeOutput)
        }catch(error){
          $('#output code').html(error)
        }
      }
      const executeBtn = $('#executeBtn').on('click',executeCode);
    },
    template : 'try_it_out',
    color : 'Chocolate'
  })
})()
