var canvas = current_canvas = (function() {
  var cols = 100, rows = 30;
  var canvas = new Matrix(cols, rows, function(x, y) {
    var lex = new Lex(x, y);
    lex.build(); lex.span.style.maxWidth = "8px"; return lex;
  });

  canvas.bind = function() {
    canvas.forEach(function(lex, x, y) {
      var point = [x,y]; if (lex.bound) return;

      // {{{ lex.span.addEventListener("contextmenu", function(e)
      lex.span.addEventListener("contextmenu", function(e) {
        e.preventDefault();
      });
      // }}}
      // {{{ lex.span.addEventListener("mousedown", function(e)
      lex.span.addEventListener("mousedown", function(e) {
        e.preventDefault(); current_canvas = canvas; dragging = true;

        if (e.altKey) {
          if (e.button === 2) {
            brush.bg = lex.bg; brush.mask(brush); dragging = false;
          } else {
            brush.fg = lex.bg; brush.mask(brush); dragging = false;
          };
        } else if (drawing) {
          undo.new(); draw.down(e, lex, point);
        } else if (selecting) {
          selection.down(e, lex, point);
        } else if (transforming) {
          transform.down(e, lex, point);
        } else if (filling) {
          undo.new(); draw.fill(brush, x, y, ignoreChar=e.ctrlKey, withBg=(e.button === 2));
        } else if (underlining) {
          lex.underline = !e.shiftKey; lex.build();
        };
        canvas.focus(x, y);
      });
      // }}}
      // {{{ lex.span.addEventListener("mousemove", function(e)
      lex.span.addEventListener("mousemove", function(e) {
        if (dragging) {
          [mouse.x, mouse.y] = [x, y];
          if (drawing) {
            draw.move(e, lex, point);
          } else if (selecting) {
            selection.move(e, lex, point);
          } else if (transforming) {
            transform.move(e, lex, point);
          } else if (underlining) {
            lex.underline = !e.shiftKey;
            lex.build();
          };
          canvas.focus(x, y);
        };
      });
      // }}}
    });
  };

  // {{{ canvas.resize = function(w, h, no_undo)
  canvas.resize = function(w, h, no_undo) {
    var old_h = this.h, old_w = this.w;
    h = this.h = clamp(h, this.min, this.max);
    w = this.w = clamp(w, this.min, this.max);
    if ((old_w !== w) || (old_h !== h)) {
      if (!no_undo) {
        undo.new(); undo.save_resize(w, h, old_w, old_h);
       }

      canvas.__proto__.resize.call(canvas, w, h);
      ui.canvas_h.char = "" + h; ui.canvas_h.build();
      ui.canvas_w.char = "" + w; ui.canvas_w.build();
    };
  };
  // }}}
  // {{{ canvas.size_add = function(w, h)
  canvas.size_add = function(w, h) {
    canvas.resize(canvas.w + w, canvas.h + h);
  };
  // }}}

  [canvas.max, canvas.min] = [999, 1];
  return canvas;
})();

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */