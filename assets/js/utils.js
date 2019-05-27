const utils = (function(){
  const getRandomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min,

  obj = (obj) => {
      return {
        properties : Object.getOwnPropertyNames(obj),
        values : Object.values(obj)
      }
  },

  params = (func) => {
        const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
        ARGUMENT_NAMES = /([^\s,]+)/g,
        fnStr = func.toString().replace(STRIP_COMMENTS, '');
        let result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
        if(result === null)
        result = [];
        return result;

  },
  elements = (args) => {
    const argsObj = obj(args);
    for(let item in argsObj.properties ){
      args[argsObj.properties[item]] = view.element(argsObj.values[item])
    }
    return args
  },
  format = (str) => {
    return str.replace(new RegExp('    ', 'g'), '<i></i>').replace(/(?:\r\n|\r|\n)/g, '<br>');
  },
  occurence = (str,find) => (str.match(new RegExp(`${find}`,'g')) || []).length,
  syntaxHighlight = (json) => {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
  }
  return{
    getRandomInt : getRandomInt,
    obj : obj,
    params : params,
    elements : elements,
    format : format,
    occurence : occurence,
    syntaxHighlight : syntaxHighlight
  }
})()
