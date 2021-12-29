var custom = (function(){

  var exports = {}
  
  exports.clone = function (fromSelection=false,fromFile=null){
    var new_brush = null
    if (fromFile !== null) {
      var max_width = 0
      var json = colorcode.to_json(fromFile, {fg:0, bg:1})
      for (var y = 0, line; line = json.lines[y]; y++){
        max_width = max(max_width, line.length);
      }
      new_brush = new Matrix(max_width, json.lines.length, function(x,y){
        var lex = new Lex(x, y)
	if (x < json.lines[y].length) {
          lex.char = String.fromCharCode(json.lines[y][x].value)
          lex.fg = json.lines[y][x].fg
          lex.bg = json.lines[y][x].bg
          lex.opacity = 1
	} else {
          lex.char = " "
          lex.fg = 99
          lex.bg = 99
          lex.opacity = 0
	}
        lex.build()
        return lex
      })
    } else if (!fromSelection) {
      new_brush = brush.clone()
    } else {
      if (!(selection.a[0] === 0 && selection.a[1] === 0 && selection.b[0] === 0 && selection.b[1] === 0)) {
        new_brush = new Matrix((selection.b[0] + 1) - selection.a[0], (selection.b[1] + 1) - selection.a[1], function(x,y){
          var cell = canvas.getCell(x + selection.a[0], y + selection.a[1]).clone()
          if (cell.fg === 99 && cell.bg === 99 && cell.opacity === 0) {
            cell.fg = 0; cell.bg = 1
          }
          return cell
        })
      } else {
        return false
      }
    }
    var rapper = document.createElement("div")
    rapper.className = "custom"
    new_brush.append(rapper)
    custom_rapper.appendChild(rapper)
    // store in localstorage?
    rapper.addEventListener("click", function(e){
      if (!e.shiftKey) {
        // load this brush
        exports.load(new_brush)
      } else {
        while (rapper && rapper.firstChild) {
          rapper.removeChild(rapper.firstChild)
        }
        rapper.parentNode.removeChild(rapper)
      }
    })
  }
  
  exports.load = function(new_brush){
    brush.assign( new_brush )
  }
  
  return exports

})()
