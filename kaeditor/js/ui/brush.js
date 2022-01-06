var brush = (function() {
  var brush = new Matrix(5, 5, function(x,y) {
    var lex = new Lex(x, y); lex.build(); return lex
  })

  brush.bind = function() {
    var dragging = false, erasing = false, last_point = [0, 0]

    brush.forEach(function(lex, x, y) {
      var point = [x, y]
      lex.span.style.maxWidth = "8px"; if (lex.bound) return; lex.bound = true

      // {{{ lex.span.addEventListener('contextmenu', function(e)
      lex.span.addEventListener('contextmenu', function(e) {
        e.preventDefault()
      })
      // }}}
      // {{{ lex.span.addEventListener('mousedown', function(e)
      lex.span.addEventListener('mousedown', function(e) {
        e.preventDefault()
        current_canvas = brush
        brush.modified = true
        dragging = true
        erasing = (e.which == "3" || e.ctrlKey)
        if (erasing) {
          lex.clear()
        }
        else {
          fillColor = brush.bg
          lex.assign(brush)
        }
        brush.focus(x, y)
      })
      // }}}
      // {{{ lex.span.addEventListener('mousemove', function(e)
      lex.span.addEventListener('mousemove', function(e) {
        e.preventDefault()
        if (! dragging) {
          return
        }
        erasing = (e.which == "3" || e.ctrlKey)
        if (erasing) {
          lex.clear()
        }
        else {
          lex.assign(brush)
        }
        brush.focus(x, y)
      })
      // }}}
    })

    // {{{ window.addEventListener('mouseup', function(e)
    window.addEventListener('mouseup', function(e) {
      dragging = erasing = false
    })
    // }}}
  }

  // {{{ brush.contract = function(i)
  brush.contract = function(i) {
    brush.size_add(-i, -i)
  }
  // }}}
  // {{{ brush.expand = function(i)
  brush.expand = function(i) {
    brush.size_add(i, i)
  }
  // }}}
  // {{{ brush.generate = function()
  brush.generate = function() {
    brush.fill(brush); brush.mask(brush)
  }
  // }}}
  // {{{ brush.load = function(lex)
  brush.load = function(lex) {
    brush.char = lex.char
    brush.fg = lex.fg
    brush.bg = lex.bg
    brush.opacity = 1
  }
  // }}}
  // {{{ brush.resize = function(w, h)
  brush.resize = function(w, h) {
    w = this.w = clamp(w, this.min, this.max)
    h = this.h = clamp(h, this.min, this.max)
    brush.rebuild()
    ui.brush_w.char = "" + w
    ui.brush_w.build()
    ui.brush_h.char = "" + h
    ui.brush_h.build()
  }
  // }}}
  // {{{ brush.size_add = function(w, h)
  brush.size_add = function(w, h) {
    brush.resize(brush.w + w, brush.h + h)
  }
  // }}}

  brush.bg = 1; brush.fg = 0
  brush.char = " "; brush.opacity = 1
  brush.draw_bg = true; brush.draw_fg = true
  brush.draw_char = true
  brush.mask = ui.circle
  brush.max = 100; brush.min = 1
  brush.modified = false

  return brush
})()

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
