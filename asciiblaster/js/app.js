
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
}

init()

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
