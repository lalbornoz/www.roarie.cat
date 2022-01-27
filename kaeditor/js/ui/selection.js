let selection = (function() {
  let
      a = [0, 0], b = [0, 0], c = [0, 0], d = [0, 0],
      creating = false, moving = false, copying = false,
      exports = {},
      selector_el = document.createElement("div");

  let
      selection_canvas = new Matrix(1, 1, function(x, y) {
        var lex = new Lex(x, y); lex.build();
        lex.span.style.maxWidth = "8px";
        return lex;
      });

  //
  // in selection mode..
  // - we start by clicking the canvas. this positions the selection, and copies
  //   the character
  // - then we drag down and to the right. this resizes the selection and pushes new
  //   rows and columns. each of these copies the character underneath.
  // - on mouseup, the selection is locked. then..
  // - drag the selection to move it -- this "cuts" it and leaves a blank space on the canvas.
  // - shift-drag the selection to copy it
  //

  // {{{ function {bottom,height,left,mag_{x,y},right,top,width}(a, b)
  function bottom(a, b) { return max(a[1], b[1]); };
  function height(a, b) { return abs(a[1] - b[1]) + 1; };
  function left(a, b) { return min(a[0], b[0]); };
  function mag_x(a, b) { return a[0] - b[0]; };
  function mag_y(a, b) { return a[1] - b[1]; };
  function right(a, b) { return max(a[0], b[0]); };
  function top(a, b) { return min(a[1], b[1]); };
  function width(a, b) { return abs(a[0] - b[0]) + 1; };
  // }}}

  // {{{ function contains(a, b, point)
  function contains(a, b, point) {
    let
        contains_x = (a[0] <= point[0]) && (point[0] <= b[0]),
        contains_y = (a[1] <= point[1]) && (point[1] <= b[1]);
    return (contains_x && contains_y);
  };
  // }}}
  // {{{ function down(e, lex, point)
  function down(e, lex, point) {
    if (!contains(a, b, point) ) {
      [copying, creating, moving] = [false, true, false];
      [a[0], a[1], b[0], b[1]] = [point[0], point[1], point[0], point[1]];
      reposition(a, b);
      selection.hidden = false; selector_el.classList.add("creating");
    } else {
      [copying, creating, moving] = [false, false, true];
      [c[0], c[1], d[0], d[1]] = [point[0], point[1], point[0], point[1]];
    };

    show(); selector_el.classList.remove("dragging");
  };
  // }}}
  // {{{ function hide()
  function hide() {
    reset();
    selector_el.style.height = selector_el.style.width = "0px";
    selector_el.style.left = selector_el.style.top = "-9999px";
    creating = moving = copying = selecting = false;
    selection.hidden = true;
  };
  // }}}
  // {{{ function move(e, lex, point)
  function move(e, lex, point) {
    if (creating) {
      [b[0], b[1]] = [point[0], point[1]];
      reposition(a, b);
    } else if (moving) {
      [d[0], d[1]] = [point[0], point[1]];
      let
          dx = -clamp(mag_x(c, d), b[0] - canvas.w + 1, a[0]),
          dy = -clamp(mag_y(c, d), b[1] - canvas.h + 1, a[1]);

      reposition(
        [a[0] + dx, a[1] + dy],
        [b[0] + dx, b[1] + dy]);
    };
  };
  // }}}
  // {{{ function orient(a, b)
  function orient(a, b) {
    [a[0], a[1]] = [left(a, b), top(a, b)];
    [b[0], b[1]] = [right(a, b), bottom(a, b)];
  };
  // }}}
  // {{{ function reposition(aa, bb)
  function reposition(aa, bb) {
    [aa, bb] = [aa || a, bb || b];
    let
        cell = canvas.aa[top(aa, bb)][left(aa, bb)].span,
        cell_height = cell.offsetHeight, cell_width = cell.offsetWidth,
        cell_left = cell.offsetLeft, cell_top = cell.offsetTop,
        h = height(aa, bb), w = width(aa, bb);

    cell_top += parseInt(document.getElementById("canvas_wrapper").style.top) || 0;
    cell_left += parseInt(document.getElementById("canvas_wrapper").style.left) || 0;
    selector_el.style.height = ((cell_height * h) + 1) + "px";
    selector_el.style.width = ((cell_width * w) + 1) + "px";
    selector_el.style.left = ((cell_left - 1) + 5) + "px"; // XXX obtain correct offset
    selector_el.style.top = ((cell_top - 1) + 5) + "px"; // XXX obtain correct offset
  };
  // }}}
  // {{{ function reset()
  function reset() {
    a[0] = a[1] = b[0] = b[1] = 0;
  };
  // }}}
  // {{{ function show()
  function show() {
    selecting = true;
  };
  // }}}
  // {{{ function up(e)
  function up(e) {
    if (creating) {
      orient(a, b);
      selection_canvas.resize(width(a, b), height(a, b));
      reposition(a,b);
      draw.copy_from(canvas, selection_canvas, a[0], a[1]);
      selection_canvas.build();
      selector_el.classList.remove("creating");
    };

    if (moving) {
      let
          dx = -clamp(mag_x(c, d), b[0] - canvas.w + 1, a[0]),
          dy = -clamp(mag_y(c, d), b[1] - canvas.h + 1, a[1]);

      a[0] += dx; a[1] += dy; b[0] += dx; b[1] += dy;
      draw.copy_to(canvas, selection_canvas, a[0], a[1]);
    };

    copying = creating = moving = false;
    selector_el.classList.remove("dragging");
  };
  // }}}

  selector_el.className = "selector_el";
  selection_canvas.append(selector_el);
  document.body.appendChild(selector_el);

  exports.a = a; exports.b = b;
  exports.canvas = selection_canvas;
  exports.down = down;
  exports.hidden = true;
  exports.hide = hide;
  exports.move = move;
  exports.reposition = reposition;
  exports.show = show;
  exports.up = up;

  return exports;
})();

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
