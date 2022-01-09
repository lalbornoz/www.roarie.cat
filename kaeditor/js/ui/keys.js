function check_if_lost_focus() {
  if (!window.focused || !window.focused.span) window.focused = canvas.aa[0][0];
};

var keys = (function() {
  var keys = {}

  keys.bind = function() {
    cursor_input.addEventListener("keydown", function(e) {
      if (e.altKey) document.body.classList.add("dropper");

      switch (e.keyCode) {
        // {{{ case 27: // esc
        case 27: // esc
          if (!selection.hidden && current_canvas === canvas) {
            selection.hide(); selection.show();
          } else if (focused) {
            focused.blur();
          };
          return;
        // }}}
      }
      if (window.focused && focused.raw_key) { focused.raw_key(e); return; };
      switch (e.keyCode) {
      // {{{ case 219: // [
      case 219: // [
        if (!e.ctrlKey) {
          if (current_tool.name != "text") {
            e.preventDefault();
            brush.contract(1); brush.modified = false;
            check_if_lost_focus();
          };
        } else if (current_tool.name != "text") {
          e.preventDefault();
          if (!e.altKey) {
            if (!e.shiftKey) {
              canvas.resize(canvas.w - 1, canvas.h, 0);
            } else {
              canvas.resize(canvas.w, canvas.h - 1, 0);
            };
          } else {
            canvas.resize(canvas.w - 1, canvas.h - 1, 0);
          };
          check_if_lost_focus();
        };
        break;
      // }}}
      // {{{ case 221: // ]
      case 221: // ]
        if (!e.ctrlKey) {
          if (current_tool.name != "text") {
            e.preventDefault();
            brush.expand(1); brush.modified = false;
            check_if_lost_focus();
          };
        } else if (current_tool.name != "text") {
          e.preventDefault();
          if (!e.altKey) {
            if (!e.shiftKey) {
              canvas.resize(canvas.w + 1, canvas.h, 0);
            } else {
              canvas.resize(canvas.w, canvas.h + 1, 0);
            }
          } else {
            canvas.resize(canvas.w + 1, canvas.h + 1, 0);
          }
          check_if_lost_focus();
        };
        break;
      // }}}

      // {{{ case  8: // backspace
      case  8: // backspace
        e.preventDefault();
        if (current_canvas === canvas) undo.new();
        current_canvas.focus_add(-1, 0);
        if (current_canvas === canvas) undo.save_focused_lex();
        focused.char = " "; focused.build();
        return;
      // }}}
      // {{{ case 13: // return
      case 13: // return
        e.preventDefault(); current_canvas.focusLex(focused.y, focused.x + 1);
        break;
      // }}}

      // {{{ case 40: // down
      case 40: // down
        e.preventDefault(); current_canvas.focus_add(0, 1); break;
      // }}}
      // {{{ case 37: // left
      case 37: // left
        e.preventDefault(); current_canvas.focus_add(-1, 0); break;
      // }}}
      // {{{ case 39: // right
      case 39: // right
        e.preventDefault(); current_canvas.focus_add(1, 0); break;
      // }}}
      // {{{ case 38: // up
      case 38: // up
        e.preventDefault(); current_canvas.focus_add(0, -1); break;
      // }}}

      // {{{ case 89: // y
      case 89: // y
        if (!e.ctrlKey && !e.metaKey) break;
        e.preventDefault(); undo.redo(); break;
      // }}}
      // {{{ case 90: // z
      case 90: // z
        if (!e.ctrlKey && !e.metaKey) break;
        e.preventDefault();
        if (e.shiftKey) undo.redo(); else undo.undo(); break;
      // }}}
      };
    });

    // {{{ cursor_input.addEventListener("input", function(e)
    cursor_input.addEventListener("input", function(e) {
      var char = cursor_input.value; cursor_input.value = "";

      if ((current_tool.name != "text") && !brush.modified) {
        brush.char = char; brush.rebuild(); brush.mask(brush);
      };

      if (focused && char) {
        var x = focused.x, y = focused.y;

        if (current_canvas === canvas) {
          undo.new(); undo.save_focused_lex();
        };
        var moving = focused.key(char, e.keyCode);
        if (!moving || !("y" in focused && "x" in focused)) return;
        current_canvas.focus_add(1, 0);
      };
    });
    // }}}
    // {{{ cursor_input.addEventListener("keyup", function(e)
    cursor_input.addEventListener("keyup", function(e) {
      if (!e.altKey) {
        document.body.classList.remove("dropper");
      };
    });
    // }}}
  };

  // {{{ keys.arrow_key = function(fn)
  keys.arrow_key = function(fn) {
    return function(e) {
      switch (e.keyCode) {
      case 38: // up
        e.preventDefault(); fn(1); break;
      case 40: // down
        e.preventDefault(); fn(-1); break;
      };
    };
  };
  // }}}
  // {{{ keys.int_key = function(f)
  keys.int_key = function(f) {
    return function(key, keyCode) {
      var n = parseInt(key);
      !isNaN(n) && f(n);
    };
  };
  // }}}
  // {{{ keys.left_right_key = function(fn)
  keys.left_right_key = function(fn) {
    return function(e) {
      switch (e.keyCode) {
      case 39: // right
        e.preventDefault(); fn(1); break;
      case 38: // up
      case 40: // down
        e.preventDefault(); fn(0); break;
      case 37: // left
        e.preventDefault(); fn(-1); break;
      };
    };
  };
  // }}}
  // {{{ keys.multi_numeral_blur = function(lex, fn)
  keys.multi_numeral_blur = function(lex, fn) {
    return function() {
      var n = parseInt(lex.char); if (isNaN(n)) return; fn(n);
    };
  };
  // }}}
  // {{{ keys.multi_numeral_key = function(lex, digits)
  keys.multi_numeral_key = function(lex, digits) {
    return keys.int_key(function(n, keyCode) {
      lex.read();
      if (lex.char.length < digits) {
        n = (parseInt(lex.char) * 10) + n;
      };
      lex.char = "" + n; lex.build();
    });
  };
  // }}}
  // {{{ keys.single_numeral_key = function(lex, fn)
  keys.single_numeral_key = function(lex, fn) {
    return keys.int_key(function(n, keyCode) {
      if (n == 0) n = 10; lex.blur(); fn(n);
    });
  };
  // }}}

  return keys
})()

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
