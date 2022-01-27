let transform = (function() {
  let
      copy = undefined,
      exports = {},
      mode = undefined,
      modes = {},
      p = [0, 0], q = [0, 0];

  // {{{ function done()
  function done() {
    transforming = false;
    copy && copy.demolish();
  };
  // }}}
  // {{{ function down(e, lex, point)
  function down(e, lex, point) {
    [p[0], p[1]] = [point[0], point[1]];
    [q[0], q[1]] = [e.pageX, e.pageY];
    undo.newUndo(); copy = canvas.clone();
    mode.init(e);
  };
  // }}}
  // {{{ function move(e, lex, point)
  function move(e, lex, point) {
    let
        dx = e.pageX - q[0], dy = e.pageY - q[1],
        h = canvas.h, w = canvas.w,
        pdx = point[0] - p[0], pdy = point[1] - p[1];

    mode.before(dx, dy, pdx, pdy, point);
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        lex = canvas.get(x, y)
        if (!mode.shade( copy, canvas, lex, x, y, w, h )) {
          lex.build();
        };
      };
    };

    changed = true;
  };
  // }}}
  // {{{ function set_mode(m)
  function set_mode(m) {
    if (m in modes) {
      mode = modes[m]; transforming = true;
    };
  };
  // }}}

  modes = {
    // {{{ rotate: {...}
    rotate: {
      init: function(e) {
        mode.theta = 0;
      },

      before: function(dx, dy) {
        let radius = dist(0, 0, dx, dy);
        if (radius >= 10) {
          mode.theta = angle(0, 0, dx, -dy);
        };
      },

      shade: function(src, dest, lex, x, y, w, h) {
        let
            ca = cos(mode.theta), sa = sin(mode.theta),
            copy = undefined,
            x_ = ((x / w) * 2) - 1, y_ = ((y / h) * 2) - 1;
        let
            a = (x_ * ca) - (y_ * sa), b = (x_ * sa) + (y_ * ca);

        [x_, y_] = [(a + 1) / 2 * w, (b + 1) / 2 * h]; copy = src.get(x_, y_)
        undo.push(copy.bg, copy.fg, copy.char, copy.underline, dest, x, y);
        lex.assign(copy);
        return true;
      },
    },
    // }}}
    // {{{ scale: {...}
    scale: {
      init: function(e) {
        mode.independent = e.shiftKey || e.altKey || e.metaKey;
        mode.x_scale = mode.y_scale = 0;
      },

      before: function(dx, dy, pdx, pdy) {
        if (mode.independent) {
          [mode.x_scale, mode.y_scale] = [
            Math.pow(2, -pdx / (canvas.w / 8)),
            Math.pow(2, -pdy / (canvas.h / 8)),
          ];
        } else {
          mode.x_scale = mode.y_scale = Math.pow(2, -pdx / (canvas.w / 8));
        }
      },

      shade: function(src, dest, lex, x, y, w, h) {
        let
            copy = undefined,
            x_ = (((x - p[0]) / w) * 2) - 1, y_ = (((y - p[1]) / h) * 2) - 1;

        x_ *= mode.x_scale; y_ *= mode.y_scale;
        x_ = ((x_ + 1) / 2) * w; y_ = ((y_ + 1) / 2) * h;
        copy = src.get(x_ + p[0], y_ + p[1]);
        undo.push(copy.bg, copy.fg, copy.char, copy.underline, dest, x, y);
        lex.assign(copy);
        return true;
      },
    },
    // }}}
    // {{{ slice: {...}
    slice: {
      init: function(e) {
        mode.direction = 0;
        mode.is_y = !(e.altKey || e.metaKey);
        mode.last_dd = -1;
        mode.position = 0;
        mode.reverse = !!(e.shiftKey);
      },

      before: function(dx, dy, pdx, pdy, point) {
        let
            dd = mode.is_y ? pdx : pdy,
            new_position = mode.is_y ? point[1] : point[0];

        if (mode.position !== new_position) {
          [mode.direction, mode.position] = [0, new_position];
        };
        if (mode.last_dd !== -1) {
          mode.direction = mode.last_dd - dd;
        };

        mode.last_dd = dd;
        copy.assign(canvas);
      },

      shade: function(src, dest, lex, x, y, w, h) {
        if (mode.is_y) {
          if ((y >= mode.position) || (mode.reverse && mode.position >= y)) {
            let copy = src.get(x + mode.direction, y);
            undo.push(copy.bg, copy.fg, copy.char, copy.underline, dest, x, y);
            lex.assign(copy);
          };
        } else if ((x >= mode.position) || (mode.reverse && mode.position >= x)) {
          let copy = src.get(x, y + mode.direction);
          undo.push(copy.bg, copy.fg, copy.char, copy.underline, dest, x, y);
          lex.assign(copy);
        };
        return true;
      },
    },
    // }}}
    // {{{ translate: {...}
    translate: {
      init: function(e) {
        mode.dx = mode.dy = 0;
      },

      before: function(dx, dy, pdx, pdy) {
        [mode.dx, mode.dy] = [-pdx, -pdy];
      },

      shade: function(src, dest, lex, x, y, w, h) {
        let copy = src.get(x + mode.dx, y + mode.dy);
        undo.push(copy.bg, copy.fg, copy.char, copy.underline, dest, x, y);
        lex.assign(copy);
        return true;
      },
    },
    // }}}
  };

  exports.done = done;
  exports.down = down;
  exports.move = move;
  exports.set_mode = set_mode;

  exports.modes = modes;

  return exports;
})()

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
