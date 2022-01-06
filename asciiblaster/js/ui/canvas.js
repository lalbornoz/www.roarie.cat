var canvas = current_canvas = (function() {
  var cols = 100, rows = 30
  var canvas = new Matrix(cols, rows, function(x, y) {
    var lex = new Lex(x, y)
    lex.build(); lex.span.style.maxWidth = "8px"; return lex
  })

  canvas.bind = function() {
    canvas.forEach(function(lex, x, y) {
      var point = [x,y]; if (lex.bound) return; lex.bound = true

      // {{{ lex.span.addEventListener('contextmenu', function(e)
      lex.span.addEventListener('contextmenu', function(e) {
        e.preventDefault()
      })
      // }}}
      // {{{ lex.span.addEventListener('mousedown', function(e)
      lex.span.addEventListener('mousedown', function(e) {
        if (!is_mobile) {
          e.preventDefault(); current_canvas = canvas; dragging = true;

          if (e.altKey) {
            if (e.shiftKey) {
              draw.copy_from(canvas, brush, floor(x - (brush.w / 2)), floor(y - (brush.h / 2)));
              brush.mask(brush); draw.set_last_point(e, point);
            } else {
              brush.load(lex); brush.generate(); dragging = false;
            }
            return;
          } else if (drawing) {
            undo.new(); draw.down(e, lex, point);
          } else if (selecting) {
            selection.down(e, lex, point);
          } else if (transforming) {
            transform.down(e, lex, point);
          } else if (filling) {
            undo.new(); draw.fill(brush, x, y, withBg=(e.button === 2));
          } else if (underlining) {
            lex.underline = !e.shiftKey; lex.build();
          };
          canvas.focus(x, y);
        };
      });
      // }}}
      // {{{ lex.span.addEventListener("mousemove", function(e)
      lex.span.addEventListener("mousemove", function(e) {
        mouse.x = x; mouse.y = y
        if (is_mobile || !dragging) return
        if (drawing) {
          draw.move(e, lex, point)
        } else if (selecting) {
          selection.move(e, lex, point)
        } else if (transforming) {
          transform.move(e, lex, point)
        } else if (underlining) {
          if (e.shiftKey) {
            lex.underline = false
          } else {
            lex.underline = true
          }
          lex.build()
        }
        canvas.focus(x, y)
      })
      // }}}
    })

    if (is_mobile) {
      // {{{ canvas.wrapper.addEventListener("touchmove", function(e)
      canvas.wrapper.addEventListener("touchmove", function(e) {
        e.preventDefault()
        var x, y, point, lex
        x = (e.touches[0].pageX - canvas.wrapper.offsetTop) / canvas.aa[0][0].span.offsetWidth
        y = (e.touches[0].pageY - canvas.wrapper.offsetTop) / canvas.aa[0][0].span.offsetHeight
        x = ~~clamp(x, 0, canvas.aa[0].length-1)
        y = ~~clamp(y, 0, canvas.aa.length-1)
        point = [x,y]
        lex = canvas.aa[y][x]
        if (! dragging) return
        if (drawing) {
          draw.move(e, lex, point)
        }
        canvas.focus(x, y)
      })
      // }}}
      // {{{ canvas.wrapper.addEventListener('touchstart', function(e)
      canvas.wrapper.addEventListener('touchstart', function(e) {
        e.preventDefault()
        var x, y, point, lex
        x = (e.touches[0].pageX - canvas.wrapper.offsetTop) / canvas.aa[0][0].span.offsetWidth
        y = (e.touches[0].pageY - canvas.wrapper.offsetTop) / canvas.aa[0][0].span.offsetHeight
        x = ~~clamp(x, 0, canvas.aa[0].length-1)
        y = ~~clamp(y, 0, canvas.aa.length-1)
        point = [x,y]
        lex = canvas.aa[y][x]
        dragging = true
        if (drawing) {
          undo.new(); draw.down(e, lex, point);
        } else if (filling) {
          undo.new(); draw.fill(brush, x, y, withBg=false);
        }
        canvas.focus(x, y)
      })
      // }}}
    }
  }

  // {{{ canvas.resize = function(w, h, no_undo)
  canvas.resize = function(w, h, no_undo) {
    var old_w = this.w, old_h = this.h
    w = this.w = clamp(w, this.min, this.max)
    h = this.h = clamp(h, this.min, this.max)
    if (old_w === w && old_h === h) return;

    if (!no_undo) {
      undo.new()
      undo.save_resize(w, h, old_w, old_h)
     }

    canvas.__proto__.resize.call(canvas, w, h)
    ui.canvas_w.char = "" + w; ui.canvas_w.build()
    ui.canvas_h.char = "" + h; ui.canvas_h.build()
  }
  // }}}
  // {{{ canvas.size_add = function(w, h)
  canvas.size_add = function(w, h) {
    canvas.resize(canvas.w + w, canvas.h + h)
  }
  // }}}

  canvas.max = 999; canvas.min = 1
  return canvas
})()

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
