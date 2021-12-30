var palette = (function() {
  var palette = new Matrix(34, 2, function(x, y) {
    var lex = new Lex(x, y); return lex
  })

  var palette_list = [all_hue, all_inv_hue, mirc_color, mirc_color_reverse]
  var palette_index = localStorage.getItem("ascii.palette") || 1
  var palette_fn = palette_list[palette_index]
  var use_experimental_palette = false

  palette.bind = function() {
    palette.forEach(function(lex, x, y) {
      if (lex.bound) return; lex.bound = true
      // {{{ lex.span.addEventListener('mousedown', function(e)
      lex.span.addEventListener('mousedown', function(e) {
        e.preventDefault()

        if (e.shiftKey) {
          palette_index = (palette_index+1) % palette_list.length
          localStorage.setItem("ascii.palette", palette_index)
          palette_fn = palette_list[palette_index]
          palette.repaint()
          return
        }

        if (e.ctrlKey || e.which == 3) return
        if (brush.char == " " && lex.char == " ") {
          brush.bg = lex.bg; brush.char = lex.char; brush.fg = lex.fg
        } else if (lex.char != " ") {
          brush.bg = lex.bg; brush.char = lex.char; brush.fg = lex.fg
        } else if (lex.char === " " && brush.char !== " ") {
          brush.bg = lex.bg; brush.char = lex.char; brush.fg = lex.fg
        } else {
          brush.bg = fillColor; brush.fg = lex.bg
        }

        brush.opacity = lex.opacity
        if (!brush.modified) brush.generate();
        if (filling || e.ctrlKey) fillColor = lex.bg;
        letters.repaint()
      })
      // }}}
      // {{{ lex.span.addEventListener('contextmenu', function(e)
      lex.span.addEventListener('contextmenu', function(e) {
        e.preventDefault()

        if (x <= 1) return;
        fillColor = y ? lex.fg : lex.bg
        palette.repaint()
        brush.char = lex.char; brush.fg = lex.fg; brush.opacity = lex.opacity
        brush.generate()
        brush_wrapper.style.borderColor = css_reverse_lookup[fillColor]
      })
      // }}}
    })
  }

  // {{{ palette.experimental = function(state)
  palette.experimental = function(state) {
    use_experimental_palette = typeof state == "boolean" ? state : ! use_experimental_palette
    use_experimental_palette ? palette.resize(34, 5) : palette.resize(34, 2)
    palette.repaint()
    return use_experimental_palette
  }
  // }}}
  // {{{ palette.repaint = function()
  palette.repaint = function() {
    var xw = use_experimental_palette ? 5 : 2
    palette.resize(34, xw)

    palette.forEach(function(lex,x,y) {
      if (x > 1) {
        x -= 2
        if (y < 2) {
          lex.bg = palette_fn(x>>1); lex.fg = palette_fn(x>>1)
        } else {
          lex.bg = fillColor; lex.fg = palette_fn(x>>1)
        }
        lex.char = palette.chars[y]; lex.opacity = 1
      } else {
        lex.bg = lex.fg = 99; lex.char = " "; lex.opacity = 0
      }
      lex.build()
      if (lex.char == "_") lex.char = " "
    })
  }
  // }}}

  brush_wrapper.style.borderColor = css_reverse_lookup[fillColor]
  palette.chars = "  " + dither.a + dither.b + dither.c
  palette.repaint()

  return palette
})()

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
