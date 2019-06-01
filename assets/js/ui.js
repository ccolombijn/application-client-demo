const DOM = (function() {

  function create( tag, callback ){
    let isArray = ( arr ) => Array.isArray(arr);
    if ( !isArray( tag ) ) return make.call( this, Array.prototype.slice.call( arguments ) )
    let name = tag[0],
        attributes = tag[1],
        element = document.createElement( name ),
        start = 1

    if ( typeof attributes === 'object' && attributes !== null && !isArray( attributes ) ) {
      for ( let attribute in attributes ) element[ attribute ] = attributes[ attribute]
      start = 2
    }
    for ( let index = start; index < tag.length; index++ ) {
      if( isArray( tag[ index ] ) ){
        element.appendChild(DOM.create( tag[ index ] ) )
      } else {
        element.appendChild( document.createTextNode( tag[ index ] ) )
      }
    }
    if( callback ) callback()
    return element
  }

  function insert( content, callback ){
    let output, main = UI.main;
    content.output ? output = content.output : output = config.output;
    if( !typeof output === 'object'  ) output = main.querySelector( output )
    if ( typeof content === 'object'  ) {
      if( content.html ){
        if( content.append ) {
          output.appendChild( DOM.create( content.tag, { id : content.id }, content.html ) )
        }else {
            output.innerHTML = content.html
        }
      } else {
        output.innerHTML = ''
        output.appendChild( content )
      }
    } else {
      output.innerHTML = content
    }
    if( callback ) callback()
    return output
  }



  /* ---------------------------------------------------------------------------
  *
  */
  return {
    create : create,
    insert : insert

  }
})()
