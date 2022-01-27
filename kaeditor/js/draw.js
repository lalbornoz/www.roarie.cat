var draw = (function() {
  let
      exports = {},
      last_point = [0, 0];

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

    undo.newUndo();
    for (let y_ = 0; y_ < B.h; y_++) {
      for (let x_ = 0; x_ < B.w; x_++) {
        if ((cell = A.getCell(x_ + x, y_ + y))) {
          let srcCell = B.aa[y_][x_];
          undo.push(
            srcCell.bg, srcCell.fg, srcCell.char,
            srcCell.underline, canvas, x_ + x, y_ + y);
          cell.assign(B.aa[y_][x_]);
        };
      };
    };

    A.build();
  };
  // }}}
  // {{{ exports.fill = function(lex, x, y, ignoreChar=false, withBg=false)
  exports.fill = function(lex, x, y, ignoreChar=false, withBg=false) {
    var canvasCell = null, cell = null;
    var fillColour = (withBg ? {"bg":lex.bg} : {"bg":lex.fg});
    var point = null, pointStack = [[y, x]], pointsDone = {};
    var testChar = canvas.aa[y][x].char;
    var testColour = {"bg":canvas.aa[y][x].bg, "fg":canvas.aa[y][x].fg};

    undo.newUndo();

    while (pointStack.length > 0) {
      point = pointStack.pop(); cell = canvas.aa[point[0]][point[1]];

      if ((((cell.bg === testColour.bg) && (ignoreChar ? true : cell.char === testChar))
      ||   ((cell.char === " ") && (cell.bg === testColour.bg))
      ||   ((cell.char === " ") && (cell.fg === 99) && (cell.bg === testColour.fg)))
      &&  (typeof(pointsDone[String(point)]) === "undefined")) {
        canvasCell = canvas.aa[point[0]][point[1]];
        if (withBg) {
          if (lex.bg === 99) {
            undo.push(lex.bg, lex.fg, canvasCell.char, canvasCell.underline, canvas, point[1], point[0]);
            [canvasCell.bg, canvasCell.fg] = [lex.bg, lex.fg];
          } else {
            undo.push(lex.fg, lex.bg, canvasCell.char, canvasCell.underline, canvas, point[1], point[0]);
            [canvasCell.bg, canvasCell.fg] = [lex.fg, lex.bg];
          };
        } else {
          if (lex.bg === 99) {
            undo.push(lex.fg, lex.bg, canvasCell.char, canvasCell.underline, canvas, point[1], point[0]);
            [canvasCell.bg, canvasCell.fg] = [lex.fg, lex.bg];
          } else {
            undo.push(lex.bg, lex.fg, canvasCell.char, canvasCell.underline, canvas, point[1], point[0]);
            [canvasCell.bg, canvasCell.fg] = [lex.bg, lex.fg];
          };
        };
        canvasCell.char = lex.char; canvasCell.underline = lex.underline;
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
  // {{{ exports.line = function(lex, a, b, erasing, allowTransparent=false, brush_=null, newUndo=true)
  exports.line = function(lex, a, b, erasing, allowTransparent=false, brush_=null, newUndo=true) {
    var bw = 1, i, x, y;
    var len = dist(a[0], a[1], b[0], b[1]);
    var w = canvas.w, h = canvas.h;

    if (newUndo) {
      undo.newUndo();
    };
    for (var i = 0; i <= len; i += bw) {
      x = lerp(i / len, a[0], b[0]);
      y = lerp(i / len, a[1], b[1]);
      exports.stamp(
        canvas, brush_ === null ? brush : brush_,
        x, y, erasing,
        allowTransparent=allowTransparent,
        newUndo=false);
    };
  };
  // }}}
  // {{{ exports.stamp = function(canvas, brush, x, y, erasing, allowTransparent=false, newUndo=true)
  exports.stamp = function(canvas, brush, x, y, erasing, allowTransparent=false, newUndo=true) {
    if (newUndo) {
      undo.newUndo();
    };

    for (let y_ = 0; y_ < brush.h; y_++) {
      for (let x_ = 0; x_ < brush.w; x_++) {
        let
            x__ = round(x_ + x - (brush.w / 2 | 0)),
            y__ = round(y_ + y - (brush.h / 2 | 0));

        if (((x__ >= 0) && (x__ < canvas.w))
        &&  ((y__ >= 0) && (y__ < canvas.h))
        &&  (!((brush.aa[y_][x_].bg === 99) && (brush.aa[y_][x_].char === " "))
        ||    ((brush.aa[y_][x_].bg === 99) && (brush.aa[y_][x_].fg === 99)))) {
          let
              brushCell = brush.aa[y_][x_],
              canvasCell = canvas.aa[y__][x__];

          undo.push(
            brushCell.bg, brushCell.fg,
            brushCell.char, brushCell.underline,
            canvas, x__, y__);

          [canvasCell.bg, canvasCell.fg] = [brushCell.bg, brushCell.fg];
          [canvasCell.char, canvasCell.underline] = [brushCell.char, canvasCell.underline];
          canvasCell.build();
        };
      };
    };
  };
  // }}}

  // {{{ exports.get_last_point = function()
  exports.get_last_point = function() {
    return last_point;
  };
  // }}}
  // {{{ exports.set_last_point = function(point)
  exports.set_last_point = function(point) {
    [last_point[0], last_point[1]] = [point[0], point[1]];
  };
  // }}}

  return exports;
})();

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
