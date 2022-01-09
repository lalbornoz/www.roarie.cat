var brush = (function() {
  var brush = new Matrix(5, 5, function(x, y) {
    var lex = new Lex(x, y); lex.build(); return lex;
  })

  brush.bind = function() {
    var dragging = false, erasing = false, last_point = [0, 0];

    brush.forEach(function(lex, x, y) {
      var point = [x, y];
      lex.span.style.maxWidth = "8px";
      if (lex.bound) return;

      // {{{ lex.span.addEventListener("contextmenu", function(e)
      lex.span.addEventListener("contextmenu", function(e) {
        e.preventDefault();
      });
      // }}}
      // {{{ lex.span.addEventListener("mousedown", function(e)
      lex.span.addEventListener("mousedown", function(e) {
        e.preventDefault()
        current_canvas = brush; brush.modified = true; dragging = true;

        if ((erasing = (e.which == "3" || e.ctrlKey))) {
          lex.clear();
        } else {
          lex.assign(brush);
        };
        brush.focus(x, y);
      });
      // }}}
      // {{{ lex.span.addEventListener("mousemove", function(e)
      lex.span.addEventListener("mousemove", function(e) {
        e.preventDefault();
        if (!dragging) return;

        if ((erasing = (e.which == "3" || e.ctrlKey))) {
          lex.clear();
        } else {
          lex.assign(brush);
        }
        brush.focus(x, y);
      });
      // }}}
    });

    // {{{ window.addEventListener("mouseup", function(e)
    window.addEventListener("mouseup", function(e) {
      dragging = erasing = false;
    });
    // }}}
  };

  // {{{ brush.contract = function(i)
  brush.contract = function(i) {
    brush.size_add(-i, -i);
  };
  // }}}
  // {{{ brush.expand = function(i)
  brush.expand = function(i) {
    brush.size_add(i, i);
  };
  // }}}
  // {{{ brush.resize = function(w, h)
  brush.resize = function(w, h) {
    h = this.h = clamp(h, this.min, this.max);
    w = this.w = clamp(w, this.min, this.max);
    brush.rebuild(); brush.mask(brush);
    ui.brush_w.char = "" + w; ui.brush_w.build();
    ui.brush_h.char = "" + h; ui.brush_h.build();
  };
  // }}}
  // {{{ brush.size_add = function(w, h)
  brush.size_add = function(w, h) {
    brush.resize(brush.w + w, brush.h + h);
  };
  // }}}

  brush.bg = 1; brush.fg = 0;
  brush.char = " "; brush.underline = false;
  brush.draw_bg = brush.draw_fg = true; brush.draw_char = true;
  brush.mask = ui.circle;
  brush.opacity = 1;
  brush.max = 100; brush.min = 1;
  brush.modified = false

  return brush;
})()

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
