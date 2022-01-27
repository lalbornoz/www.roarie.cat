var canvas = current_canvas = (function() {
  let
      cols = 100, rows = 30;
  let
      canvas = new Matrix(cols, rows, function(x, y) {
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
          (function(e, lex, point) {
            let
                brush_ = brush,
                h = canvas.h, w = canvas.w;

            changed = true; erasing = (e.which == "3" || e.ctrlKey);
            if (e.button === 2) {
              [brush_.bg, brush_.fg] = [brush_.fg, brush_.bg]; brush_.mask(brush_);
            };

            if (e.shiftKey) {
              draw.line(
                lex, draw.get_last_point(),
                point, erasing,
                allowTransparent=(brush_.bg === 99 ? true : false),
                brush_=brush_);
            } else {
              draw.stamp(
                canvas, brush_,
                point[0], point[1],
                erasing,
                allowTransparent=(brush_.bg === 99 ? true : false),
                newUndo=true);
            };
            draw.set_last_point(point);

            if (e.button === 2) {
              [brush_.bg, brush_.fg] = [brush_.fg, brush_.bg]; brush_.mask(brush_);
            };
          })(e, lex, point);
        } else if (selecting) {
          selection.down(e, lex, point);
        } else if (transforming) {
          transform.down(e, lex, point);
        } else if (filling) {
          draw.fill(brush, x, y, ignoreChar=e.ctrlKey, withBg=(e.button === 2));
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
            (function(e, lex, point) {
              let
                  brush_ = brush,
                  h = canvas.h, w = canvas.w;

              if (e.buttons === 2) {
                brush_ = brush.clone();
                for (let y = 0; y < brush_.h; y++) {
                  for (let x = 0; x < brush_.w; x++) {
                    if (brush_.aa[y][x].bg === brush.bg) {
                      [brush_.aa[y][x].bg, brush_.aa[y][x].fg] = [brush.fg, brush.bg];
                    } else {
                      [brush_.aa[y][x].bg, brush_.aa[y][x].fg] = [brush.bg, brush.fg];
                    };
                  };
                };
              };

              draw.line(
                lex, draw.get_last_point(),
                point, erasing,
                allowTransparent=(brush_.bg === 99 ? true : false),
                brush_=brush_,
                newUndo=false);
              draw.set_last_point(point);
            })(e, lex, point);
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
    let
        new_h = clamp(h, this.min, this.max),
        new_w = clamp(w, this.min, this.max),
        old_h = this.h, old_w = this.w;

    if ((old_w !== new_w) || (old_h !== new_h)) {
      if (!no_undo) {
        undo.resize(new_h, new_w, canvas);
      };

      [this.h, this.w] = [new_h, new_w];
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
