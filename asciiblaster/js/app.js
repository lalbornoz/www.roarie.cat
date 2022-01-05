
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
var fd_divOrigSize = {};
var fd_isLeftDown = false;
var fd_isRightDown = false;
var fd_mousePosition = {};

var fd_original_mouse = [0, 0];
var fd_original_pos = [0, 0];
var fd_original_size = [0, 0];

// {{{ function initFloatableDivs()
function initFloatableDivs() {
  /*
   * XXX
   * https://jsfiddle.net/gcakuw50/2/
   * https://stackoverflow.com/questions/24050738/javascript-how-to-dynamically-move-div-by-clicking-and-dragging#
   */

  [
    "brush_container",
    "canvas_wrapper",
    "custom_block",
    "textarea_mode",
    "tools_block",
    "tools_wrapper",
  ].forEach(function (divName) {
    let div = document.getElementById(divName);
    let divSetting = localStorage.getItem("floatableDivs." + divName)

    div.style.border = "1px solid grey";
    div.style.margin = "4px";
    fd_divOrigPosition[divName] = [div.style.left, div.style.top];
    fd_divOrigSize[divName] = [div.offsetWidth, div.offsetHeight];

    if (divSetting === null) {
      div.style.position = "relative";
    } else {
      div.style.left = localStorage.getItem("floatableDivs." + divName + ".left")
      div.style.position = localStorage.getItem("floatableDivs." + divName + ".position")
      div.style.top = localStorage.getItem("floatableDivs." + divName + ".top")

      if (div.id !== "canvas_wrapper") {
        if (localStorage.getItem("floatableDivs." + divName + ".width") !== null) {
          div.style.width = localStorage.getItem("floatableDivs." + divName + ".width");
        };
        if (localStorage.getItem("floatableDivs." + divName + ".height") !== null) {
          div.style.height = localStorage.getItem("floatableDivs." + divName + ".height");
        };
      };
    };

    div.addEventListener("mousedown", function(e) {
      if ((e.button === 0) && e.ctrlKey && e.altKey) {
        let div = e.currentTarget;

        if (e.shiftKey) {
          localStorage.setItem("floatableDivs." + div.id + ".left", fd_divOrigPosition[div.id][0]);
          div.style.left = fd_divOrigPosition[divName][0];
          localStorage.setItem("floatableDivs." + div.id + ".position", "relative");
          div.style.position = "relative";
          localStorage.setItem("floatableDivs." + div.id + ".top", fd_divOrigPosition[div.id][1]);
          div.style.top = fd_divOrigPosition[divName][1];
        } else {
          fd_currentDiv = div; fd_isLeftDown = true;
          offset = [div.offsetLeft - e.clientX, div.offsetTop - e.clientY];
          div.setAttribute("data-offset", JSON.stringify(offset));
          document.body.style.cursor = "move";
        };
      } else if ((e.button === 2) && e.ctrlKey) {
        let div = e.currentTarget;

        if (div.id !== "canvas_wrapper") {
          if (e.altKey) {
            localStorage.setItem("floatableDivs." + div.id + ".width", fd_divOrigSize[div.id][0] + "px");
            div.style.width = fd_divOrigSize[div.id][0] + "px";
            localStorage.setItem("floatableDivs." + div.id + ".height", fd_divOrigSize[div.id][1] + "px");
            div.style.height = fd_divOrigSize[div.id][1] + "px";
          } else {
            fd_currentDiv = div; fd_isRightDown = true;

            fd_original_size[0] = parseFloat(getComputedStyle(div, null).getPropertyValue('width').replace('px', ''));
            fd_original_size[1] = parseFloat(getComputedStyle(div, null).getPropertyValue('height').replace('px', ''));
            fd_original_pos[0] = div.getBoundingClientRect().left;
            fd_original_pos[1] = div.getBoundingClientRect().top;
            fd_original_mouse[0] = e.pageX;
            fd_original_mouse[1] = e.pageY;

            document.body.style.cursor = "nwse-resize";
          };
        };
      };
    }, true);

    document.addEventListener("mouseup", function(e) {
      e.preventDefault();
      if (fd_isLeftDown && (e.button === 0)) {
        e.preventDefault(); fd_isLeftDown = false;
        document.body.style.removeProperty("cursor");
      } else if (fd_isRightDown && (e.button === 2)) {
        e.preventDefault(); fd_isRightDown = false;
        document.body.style.removeProperty("cursor");
      };
    }, true);

    document.addEventListener("contextmenu", function(e) {
      e.preventDefault();
    }, true);

    document.addEventListener("mousemove", function(e) {
      if (fd_currentDiv) {
        if (fd_isLeftDown) {
          e.preventDefault();

          fd_mousePosition = {x: event.clientX, y: event.clientY};
          const offset = JSON.parse(fd_currentDiv.getAttribute("data-offset"));

          localStorage.setItem("floatableDivs." + fd_currentDiv.id + ".left", (fd_mousePosition.x + offset[0]) + "px");
          fd_currentDiv.style.left = (fd_mousePosition.x + offset[0]) + "px";
          localStorage.setItem("floatableDivs." + fd_currentDiv.id + ".position", "absolute");
          fd_currentDiv.style.position = "absolute";
          localStorage.setItem("floatableDivs." + fd_currentDiv.id + ".top", (fd_mousePosition.y + offset[1]) + "px");
          fd_currentDiv.style.top = (fd_mousePosition.y + offset[1]) + "px";
          localStorage.setItem("floatableDivs." + fd_currentDiv.id, true);

          if (fd_currentDiv.id === "canvas_wrapper") {
            selection.reposition()
          };
        } else if (fd_isRightDown) {
          e.preventDefault();

          /*
           * XXX
           * https://medium.com/the-z/making-a-resizable-div-in-js-is-not-easy-as-you-think-bda19a1bc53d
           */

          const width = fd_original_size[0] + (e.pageX - fd_original_mouse[0]);
          const height = fd_original_size[1] + (e.pageY - fd_original_mouse[1])
          if (width > fd_divOrigSize[fd_currentDiv.id][0]) {
            localStorage.setItem("floatableDivs." + fd_currentDiv.id + ".width", width + "px");
            fd_currentDiv.style.width = width + "px";
          } else {
            localStorage.setItem("floatableDivs." + fd_currentDiv.id + ".width", fd_divOrigSize[fd_currentDiv.id][0] + "px");
          }
          if (height > fd_divOrigSize[fd_currentDiv.id][1]) {
            localStorage.setItem("floatableDivs." + fd_currentDiv.id + ".height", height + "px");
            fd_currentDiv.style.height = height + "px";
          } else {
            localStorage.setItem("floatableDivs." + fd_currentDiv.id + ".height", fd_divOrigSize[fd_currentDiv.id][1] + "px");
          }
        };
      };
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
  brush.bg = brush.fg = 10; brush.opacity = 1
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
  document.getElementById("custom_block").style.visibility = "hidden";
}

init()

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
