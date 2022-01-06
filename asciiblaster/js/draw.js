var draw = (function() {
  var exports = {}
  var last_point = [0,0]

  // {{{ var distance_rect = function(x, y, ratio)
  var distance_rect = function(x, y, ratio) {
    return Math.sqrt((Math.pow(y * ratio, 2)) + Math.pow(x, 2))
  }
  // }}}
  // {{{ var distance_square = function(x, y, ratio)
  var distance_square = function(x, y, ratio) {
    return Math.sqrt((Math.pow(y * ratio, 2)) + Math.pow(x * ratio, 2))
  }
  // }}}

  // {{{ exports.circle = function(A, lex)
  exports.circle = function(A, lex) {
    var hw = brush.w/2, hh = brush.h/2
    var ratio, distance

    if (brush.w === brush.h) {
      distance = distance_square
      ratio = hw / hh * (brush.w === 3 || brush.w === 5 ? 1.2 : 1.05)
    } else {
      distance = distance_rect
      ratio = hw / hh
    }

    A.forEach(function(lex,x,y) {
      if (distance(x - hw + 0.5, y - hh + 0.5, ratio) > hw) {
        lex.clear()
      }
    })
  }
  // }}}
  // {{{ exports.copy_from = function(A, B, x, y)
  // copy the region of A beginning at x,y into B
  exports.copy_from = function(A, B, x, y) {
    x = x || 0 ; y = y || 0
    B.forEach(function(lex, u, v) {
      var cell = A.getCell(u+x, v+y)
      if (cell) {
        lex.assign(cell)
      }
    })
  }
  // }}}
  // {{{ exports.copy_to = function(A, B, x, y)
  exports.copy_to = function(A, B, x, y) {
    x = x || 0 ; y = y || 0
    B.forEach(function(lex, u, v) {
      var cell = A.getCell(u+x, v+y)
      if (cell) {
        cell.assign(lex)
      }
    })
  }
  // }}}
  // {{{ exports.cross = function(A, lex)
  exports.cross = function(A, lex) {
    A.forEach(function(lex,x,y) {
      if ((x+y)%2) {
        lex.clear()
      }
    })
  }
  // }}}
  // {{{ exports.invert = function(A, B, x, y)
  exports.invert = function(A, B, x, y) {
    x = x || 0 ; y = y || 0
    B.forEach(function(lex, u, v) {
      var cell = A.getCell(u+x, v+y)
      if (cell && lex.opacity > 0) {
        cell.fg = get_inverse(cell.fg)
        cell.bg = get_inverse(cell.bg)
      }
    })
  }
  // }}}
  // {{{ exports.inverted_cross = function(A, lex)
  exports.inverted_cross = function(A, lex) {
    // 1x1 brush should still draw something
    if (A.w == 1 && A.h == 1) {
      return
    }
    A.forEach(function(lex,x,y) {
      if (!((x+y)%2)) {
        lex.clear()
      }
    })
  }
  // }}}
  // {{{ exports.square = function(A, lex)
  exports.square = function(A, lex) {
    // i.e. no transparency
  }
  /// }}}

  // {{{ function down (e, lex, point)
  function down (e, lex, point) {
    var w = canvas.w, h = canvas.h
    erasing = (e.which == "3" || e.ctrlKey)
    changed = true
    if (e.shiftKey) {
      line (lex, last_point, point, erasing)
      if (mirror_x) {
        line(lex, [w-last_point[0], last_point[1]], [w-point[0], point[1]], erasing)
      }
      if (mirror_y) {
        line(lex, [last_point[0], h-last_point[1]], [point[0], h-point[1]], erasing)
      }
      if (mirror_x && mirror_y) {
        line(lex, [w-last_point[0], h-last_point[1]], [w-point[0], h-point[1]], erasing)
      }
    }
    else {
      stamp (canvas, brush, point[0], point[1], erasing)
      if (mirror_x) {
        stamp (canvas, brush, w-point[0], point[1], erasing)
      }
      if (mirror_y) {
        stamp (canvas, brush, point[0], h-point[1], erasing)
      }
      if (mirror_x && mirror_y) {
        stamp (canvas, brush, w-point[0], h-point[1], erasing)
      }
    }
    last_point[0] = point[0]
    last_point[1] = point[1]
  }
  // }}}
  // {{{ function fill (lex, x, y, withBg=false)
  function fill (lex, x, y, withBg=false) {
    var canvasCell = null, cell = null;
    var fillColour = (withBg ? lex.fg : lex.bg);
    var point = null, pointStack = [[y, x]], pointsDone = {};
    var testChar = canvas.aa[y][x].char;
    var testColour = {"bg":canvas.aa[y][x].bg, "fg":canvas.aa[y][x].fg};

    while (pointStack.length > 0) {
      point = pointStack.pop(); cell = canvas.aa[point[0]][point[1]];

      if ((((cell.bg === testColour.bg) && (cell.char === testChar))
      ||   ((cell.char === " ") && (cell.bg === testColour.bg)))
      &&  (typeof(pointsDone[String(point)]) === "undefined")) {
        canvasCell = canvas.aa[point[0]][point[1]];
        undo.save_lex(point[1], point[0], canvasCell);
        canvasCell.bg = canvasCell.fg = fillColour;
        canvasCell.char = lex.char;
        canvasCell.opacity = lex.opacity;
        canvasCell.underline = lex.underline;
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
  // {{{ function line (lex, a, b, erasing)
  function line (lex, a, b, erasing) {
    var len = dist(a[0], a[1], b[0], b[1])
    var bw = 1
    var x, y, i;
    for (var i = 0; i <= len; i += bw) {
      x = lerp(i / len, a[0], b[0])
      y = lerp(i / len, a[1], b[1])
      stamp (canvas, brush, x, y, erasing)
    }
  }
  // }}}
  // {{{ function move (e, lex, point)
  function move (e, lex, point) {
    var w = canvas.w, h = canvas.h
    line(lex, last_point, point, erasing)
    if (mirror_x) {
      line(lex, [w-last_point[0], last_point[1]], [w-point[0], point[1]], erasing)
    }
    if (mirror_y) {
      line(lex, [last_point[0], h-last_point[1]], [point[0], h-point[1]], erasing)
    }
    if (mirror_x && mirror_y) {
      line(lex, [w-last_point[0], h-last_point[1]], [w-point[0], h-point[1]], erasing)
    }

    last_point[0] = point[0]
    last_point[1] = point[1]
  }
  // }}}
  // {{{ function point (lex, x, y, erasing)
  function point (lex, x, y, erasing) {
    stamp (canvas, brush, x, y, erasing)
  }
  // }}}
  // {{{ function set_last_point (e, point)
  function set_last_point (e, point) {
    last_point[0] = point[0]
    last_point[1] = point[1]
  }
  // }}}
  // {{{ function stamp (canvas, brush, x, y, erasing)
  function stamp (canvas, brush, x, y, erasing) {
    brush.forEach(function(lex, s, t) {
      s = round(s + x - (brush.w/2|0)); t = round(t + y - (brush.h/2|0));
      if (s >= 0 && s < canvas.w && t >= 0 && t < canvas.h) {
        if (lex.opacity === 0 && lex.char === ' ' && lex.bg !== 99 && lex.fg !== 99) return;
        var aa = canvas.aa[t][s]
        undo.save_lex(s, t, aa)
        if (erasing) {
          aa.erase(lex)
        }
        else {
          aa.stamp(lex, brush)
        }
      }
    })
  }
  // }}}

  exports.down = down
  exports.fill = fill
  exports.move = move
  exports.set_last_point = set_last_point

  return exports
})()

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
