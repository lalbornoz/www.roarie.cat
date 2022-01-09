var draw = (function() {
  var exports = {};
  var last_point = [0, 0];

  // {{{ function point()
  function point(A, withFg, x, y) {
    if (withFg) {
      if ((brush.char == "▓") || (brush.char === "▒") || (brush.char === "░")) {
        A.aa[y][x].bg = brush.bg; A.aa[y][x].fg = brush.fg; A.aa[y][x].char = brush.char;
      } else if (brush.char === " ") {
        A.aa[y][x].bg = brush.fg; A.aa[y][x].char = brush.char;
      } else {
        A.aa[y][x].bg = brush.bg; A.aa[y][x].fg = brush.fg; A.aa[y][x].char = brush.char;
      };
    } else {
      if ((brush.char == "▓") || (brush.char === "▒") || (brush.char === "░")) {
        A.aa[y][x].bg = 99; A.aa[y][x].char = " ";
      } else {
        A.aa[y][x].bg = brush.bg; A.aa[y][x].char = " ";
      };
    };
  };
  // }}}

  // {{{ exports.circle = function(A, lex)
  exports.circle = function(A, lex) {
    var hh = brush.h / 2, hw = brush.w / 2;
    var distance = distance_rect, ratio = hw / hh;

    if (brush.w === brush.h) {
      distance = distance_square; ratio *= ([3, 5].includes(brush.w) ? 1.2 : 1.05);
    };

    for (let y = 0; y < A.h; y++) {
      for (let x = 0; x < A.w; x++) {
        point(A, (distance(x - hw + 0.5, y - hh + 0.5, ratio) <= hw), x, y);
      };
    };

    A.build();
  };
  // }}}
  // {{{ exports.cross = function(A, lex)
  exports.cross = function(A, lex) {
    for (let y = 0; y < A.h; y++) {
      for (let x = 0; x < A.w; x++) {
        point(A, (((x + y) % 2) != 0), x, y);
      };
    };

    A.build();
  };
  // }}}
  // {{{ exports.square = function(A, lex)
  exports.square = function(A, lex) {
    for (let y = 0; y < A.h; y++) {
      for (let x = 0; x < A.w; x++) {
        point(A, true, x, y);
      };
    };

    A.build();
  };
  /// }}}

  // {{{ exports.copy_from = function(A, B, x, y)
  // copy the region of A beginning at x,y into B
  exports.copy_from = function(A, B, x, y) {
    var cell = null; x = x || 0; y = y || 0;

    for (let y_ = 0; y_ < B.h; y_++) {
      for (let x_ = 0; x_ < B.w; x_++) {
        if ((cell = A.getCell(x_ + x, y_ + y))) {
          B.aa[y_][x_].assign(cell);
        };
      };
    };

    B.build();
  };
  // }}}
  // {{{ exports.copy_to = function(A, B, x, y)
  exports.copy_to = function(A, B, x, y) {
    var cell = null; x = x || 0; y = y || 0;

    for (let y_ = 0; y_ < B.h; y_++) {
      for (let x_ = 0; x_ < B.w; x_++) {
        if ((cell = A.getCell(x_ + x, y_ + y))) {
          cell.assign(B.aa[y_][x_]);
        };
      };
    };

    A.build();
  };
  // }}}

  // {{{ exports.down = function(e, lex, point)
  exports.down = function(e, lex, point) {
    var brush_ = brush;
    var h = canvas.h, w = canvas.w;
    changed = true; erasing = (e.which == "3" || e.ctrlKey);

    if (e.button === 2) {
      [brush_.bg, brush_.fg] = [brush_.fg, brush_.bg]; brush_.mask(brush_);
    };

    if (e.shiftKey) {
      line(lex, last_point, point, erasing, allowTransparent=(brush_.bg === 99 ? true : false), brush_=brush_);
    } else {
      stamp(canvas, brush_, point[0], point[1], erasing, allowTransparent=(brush_.bg === 99 ? true : false));
    };
    last_point[0] = point[0]; last_point[1] = point[1];

    if (e.button === 2) {
      [brush_.bg, brush_.fg] = [brush_.fg, brush_.bg]; brush_.mask(brush_);
    };
  };
  // }}}
  // {{{ exports.fill = function(lex, x, y, ignoreChar=false, withBg=false)
  exports.fill = function(lex, x, y, ignoreChar=false, withBg=false) {
    var canvasCell = null, cell = null;
    var fillColour = (withBg ? {"bg":lex.bg} : {"bg":lex.fg});
    var point = null, pointStack = [[y, x]], pointsDone = {};
    var testChar = canvas.aa[y][x].char;
    var testColour = {"bg":canvas.aa[y][x].bg, "fg":canvas.aa[y][x].fg};

    while (pointStack.length > 0) {
      point = pointStack.pop(); cell = canvas.aa[point[0]][point[1]];

      if ((((cell.bg === testColour.bg) && (ignoreChar ? true : cell.char === testChar))
      ||   ((cell.char === " ") && (cell.bg === testColour.bg))
      ||   ((cell.char === " ") && (cell.fg === 99) && (cell.bg === testColour.fg)))
      &&  (typeof(pointsDone[String(point)]) === "undefined")) {
        canvasCell = canvas.aa[point[0]][point[1]];
        undo.save_lex(point[1], point[0], canvasCell);
        if (withBg) {
          if (lex.bg === 99) {
            [canvasCell.bg, canvasCell.fg] = [lex.bg, lex.fg];
          } else {
            [canvasCell.bg, canvasCell.fg] = [lex.fg, lex.bg];
          };
        } else {
          if (lex.bg === 99) {
            [canvasCell.bg, canvasCell.fg] = [lex.fg, lex.bg];
          } else {
            [canvasCell.bg, canvasCell.fg] = [lex.bg, lex.fg];
          };
        };
        canvasCell.char = lex.char; canvasCell.underline = lex.underline;
        canvasCell.opacity = lex.opacity;
        canvasCell.build();

        if (point[1] > 0) { pointStack.push([point[0], point[1] - 1]); };
        if (point[1] < (canvas.w - 1)) { pointStack.push([point[0], point[1] + 1]); };
        if (point[0] > 0) { pointStack.push([point[0] - 1, point[1]]); };
        if (point[0] < (canvas.h - 1)) { pointStack.push([point[0] + 1, point[1]]); };

        pointsDone[String(point)] = true;
      };
    };
  };
  // }}}
  // {{{ exports.move = function(e, lex, point)
  exports.move = function(e, lex, point) {
    var brush_ = brush, h = canvas.h, w = canvas.w;

    if (e.buttons === 2) {
      brush_ = brush.clone();
      brush_.draw_bg = brush_.draw_fg = brush_.draw_char = true;

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

    line(lex, last_point, point, erasing, allowTransparent=(brush_.bg === 99 ? true : false), brush_=brush_);
    last_point[0] = point[0]; last_point[1] = point[1];
  };
  // }}}
  // {{{ exports.set_last_point = function(e, point)
  exports.set_last_point = function(e, point) {
    [last_point[0], last_point[1]] = [point[0], point[1]];
  };
  // }}}

  // {{{ function line(lex, a, b, erasing, allowTransparent=false, brush_=null)
  function line(lex, a, b, erasing, allowTransparent=false, brush_=null) {
    var bw = 1, i, x, y;
    var len = dist(a[0], a[1], b[0], b[1]);
    var w = canvas.w, h = canvas.h;

    for (var i = 0; i <= len; i += bw) {
      x = lerp(i / len, a[0], b[0]);
      y = lerp(i / len, a[1], b[1]);
      stamp(canvas, brush_ === null ? brush : brush_, x, y, erasing, allowTransparent=allowTransparent);
    };
  };
  // }}}
  // {{{ function stamp(canvas, brush, x, y, erasing, allowTransparent=false)
  function stamp(canvas, brush, x, y, erasing, allowTransparent=false) {
    for (let y_ = 0; y_ < brush.h; y_++) {
      for (let x_ = 0; x_ < brush.w; x_++) {
        let x__ = round(x_ + x - (brush.w / 2 | 0)),
            y__ = round(y_ + y - (brush.h / 2 | 0));

        if ((x__ >= 0) && (x__ < canvas.w) && (y__ >= 0) && (y__ < canvas.h)) {
          if (!((brush.aa[y_][x_].bg === 99) && (brush.aa[y_][x_].char === " ")) || allowTransparent) {
            var aa = canvas.aa[y__][x__];
            undo.save_lex(x__, y__, aa); aa.stamp(brush.aa[y_][x_], brush);
          };
        };
      };
    };
  };
  // }}}

  return exports;
})();

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
