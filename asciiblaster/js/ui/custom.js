var custom = (function() {
  var exports = {}

  exports.clone = function(fromSelection=false,fromFile=null) {
    var new_brush = null

    if (fromFile !== null) {
      var max_width = 0
      var json = colorcode.to_json(fromFile, {fg:0, bg:1})
      for (var y = 0, line; line = json.lines[y]; y++) {
        max_width = max(max_width, line.length);
      }
      new_brush = new Matrix(max_width, json.lines.length, function(x,y) {
        var lex = new Lex(x, y)
        if (x < json.lines[y].length) {
          lex.bg = json.lines[y][x].bg; lex.fg = json.lines[y][x].fg
          lex.char = String.fromCharCode(json.lines[y][x].value)
          lex.opacity = 1
        } else {
          lex.bg = 99; lex.char = " "; lex.fg = 99; lex.opacity = 0
        }

        lex.underline = json.lines[y][x].u
        lex.build()
        lex.span.style.maxWidth = "8px"
        return lex
      })
    } else if (!fromSelection) {
      new_brush = brush.clone()
    } else {
      if (!(selection.a[0] === 0 && selection.a[1] === 0 && selection.b[0] === 0 && selection.b[1] === 0)) {
        new_brush = new Matrix((selection.b[0] + 1) - selection.a[0], (selection.b[1] + 1) - selection.a[1], function(x,y) {
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

    var wrapper = document.createElement("div")
    wrapper.className = "custom"
    new_brush.append(wrapper)
    custom_wrapper.appendChild(wrapper)

    // {{{ wrapper.addEventListener("click", function(e)
    wrapper.addEventListener("click", function(e) {
      if (!e.shiftKey) {
        // load this brush
        exports.load(new_brush)
      } else {
        while (wrapper && wrapper.firstChild) {
          wrapper.removeChild(wrapper.firstChild)
        }
        wrapper.parentNode.removeChild(wrapper)
      }
    })
    // }}}
  }

  // {{{ exports.load = function(new_brush)
  exports.load = function(new_brush) {
    brush.assign( new_brush )
  }
  // }}}

  return exports
})()

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
