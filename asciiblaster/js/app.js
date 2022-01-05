
var changed = false
var dragging = false
var drawing = false
var erasing = false
var filling = false
var focused
var mirror_x = false
var mirror_y = false
var selecting = false
var transforming = false
var underlining = false

var canvas, tools, palette, ui, brush, mode
var current_tool, current_filetool, current_canvas
var mouse = { x: 0, y: 0 }

var fd_currentDiv = null;
var fd_divOrigPosition = {};
var fd_isDown = false;
var fd_mousePosition = {};

// {{{ function initFloatableDivs()
function initFloatableDivs() {
  /*
   * XXX
   * https://jsfiddle.net/gcakuw50/2/
   * https://stackoverflow.com/questions/24050738/javascript-how-to-dynamically-move-div-by-clicking-and-dragging#
   */

  [
    "brush_container",
    "textarea_mode",
    "tools_block",
    "tools_wrapper",
  ].forEach(function (divName) {
    let div = document.getElementById(divName);
    div.style.border = "1px solid grey";
    div.style.margin = "4px";
    div.style.position = "relative";
    fd_divOrigPosition[divName] = [div.style.left, div.style.top];

    div.addEventListener("mousedown", function(e) {
      if (e.ctrlKey) {
        let div = e.currentTarget;
        if (e.shiftKey) {
          div.style.left = fd_divOrigPosition[divName][0];
          div.style.position = "relative";
          div.style.top = fd_divOrigPosition[divName][1];
        } else {
          fd_currentDiv = div; fd_isDown = true;
          offset = [div.offsetLeft - e.clientX, div.offsetTop - e.clientY];
          div.setAttribute("data-offset", JSON.stringify(offset));
        };
      };
    }, true);

    document.addEventListener("mouseup", function(e) {
      fd_isDown = false;
    }, true);

    document.addEventListener("mousemove", function(e) {
      if (fd_isDown && fd_currentDiv) {
        e.preventDefault();

        fd_mousePosition = {x: event.clientX, y: event.clientY};
        const offset = JSON.parse(fd_currentDiv.getAttribute("data-offset"));

        fd_currentDiv.style.left = (fd_mousePosition.x + offset[0]) + "px";
        fd_currentDiv.style.position = "absolute";
        fd_currentDiv.style.top = (fd_mousePosition.y + offset[1]) + "px";
      }
    }, true);
  });
}
// }}}

function bind() {
  canvas.bind(); palette.bind(); letters.bind(); brush.bind(); ui.bind(); keys.bind()

  // {{{ window.addEventListener('mouseup', function(e)
  window.addEventListener('mouseup', function(e) {
    dragging = erasing = false
    var ae = document.activeElement
    if (ae.id === "filename_el") { return }
    if (is_desktop) cursor_input.focus()
    if (selecting) {
      selection.up(e)
    } else if (transforming) {
      transform.up(e)
    }
  })
  // }}}
  // {{{ window.addEventListener("touchend", function()
  window.addEventListener("touchend", function() {
    if (current_tool.name === "text") {
      if (is_desktop) cursor_input.focus()
    }
    dragging = false
  })
  // }}}
  // {{{ window.addEventListener('mousedown', function(e) {}
  window.addEventListener('mousedown', function(e) {})
  // }}}
  // {{{ document.addEventListener('DOMContentLoaded', function()
  document.addEventListener('DOMContentLoaded', function() {
    if (is_desktop) { cursor_input.focus() }
    document.body.classList.remove('loading')
  })
  // }}}
  // {{{ window.onbeforeunload = function()
  window.onbeforeunload = function() {
    if (changed) return "You have edited this drawing."
  }
  // }}}
}

function build() {
  canvas.append(canvas_wrapper); brush.append(brush_wrapper); palette.append(palette_wrapper)
  letters.append(letters_wrapper); letters.repaint("Basic Latin")

  ui.circle.focus()
  brush.bg = brush.fg = 99; brush.opacity = 0
  brush.generate(); brush.build()

  canvas.resize_wrapper()
}

function init() {
  document.body.classList.remove('loading_tmp')
  build(); bind()
  palette.experimental(true)
  ui.experimental_palette.update(true)
  document.getElementById("tools_block").style.width = ""
  document.getElementById('save_png_el').addEventListener('mousedown', function(e) {
    clipboard.save_png()
  })
  initFloatableDivs();
}

init()

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
