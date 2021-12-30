var ui = (function() {
  var ui = {}

  ui.bind = function() {
    for (var n in ui) {
      var control = ui[n]
      if (typeof control === 'object' && 'bind' in control) {
        control.bind()
      }
    }

    [ui.brush_w, ui.brush_h,
     ui.canvas_w, ui.canvas_h].forEach(function(lex) {
      lex.span.addEventListener('mousedown', function(e) {
        lex.focus()
        if (is_mobile) cursor_input.focus()
      })
    });

    ui.brush_w.key = keys.single_numeral_key(ui.brush_w, function(w) { brush.resize(w, brush.h) })
    ui.brush_w.raw_key = keys.arrow_key(function(w) { brush.size_add(w, 0) })
    ui.brush_h.key = keys.single_numeral_key(ui.brush_h, function(h) { brush.resize(brush.w, h) })
    ui.brush_h.raw_key = keys.arrow_key(function(h) { brush.size_add(0, h) })

    ui.canvas_w.key = keys.multi_numeral_key(ui.canvas_w, 3)
    ui.canvas_w.onBlur = keys.multi_numeral_blur(ui.canvas_w, function(w) { canvas.resize(w, canvas.h) })
    ui.canvas_w.raw_key = keys.arrow_key(function(w) { canvas.size_add(w, 0) })
    ui.canvas_h.key = keys.multi_numeral_key(ui.canvas_h, 3)
    ui.canvas_h.onBlur = keys.multi_numeral_blur(ui.canvas_h, function(h) { canvas.resize(canvas.w, h) })
    ui.canvas_h.raw_key = keys.arrow_key(function(h) { canvas.size_add(0, h) })

    add_custom_el.addEventListener("click", function() { custom.clone() })
    add_sel_custom_el.addEventListener("click", function() { custom.clone(fromSelection=true, fromFile=null) })
  }

  // {{{ ui.clear = new BlurredTool(clear_el)
  ui.clear = new BlurredTool(clear_el)
  ui.clear.use = function() {
    undo.new()
    undo.save_rect(0, 0, canvas.w, canvas.h)
    canvas.erase()
    current_filetool && current_filetool.blur()
    document.getElementById("filename_el").value = ""
  }
  // }}}
  // {{{ ui.experimental_palette = new HiddenCheckbox(experimental_palette_toggle)
  ui.experimental_palette = new HiddenCheckbox(experimental_palette_toggle)
  ui.experimental_palette.memorable = true
  ui.experimental_palette.use = function(state) {
    var state = palette.experimental(state)
    this.update(state)
  }
  // }}}

  // {{{ ui.circle = new Tool(circle_el)
  ui.circle = new Tool(circle_el)
  ui.circle.use = function() {
    brush.mask = draw.circle
    brush.generate()
    drawing = true
    brush.modified = false
  }
  ui.circle.done = function() {
    drawing = false
  }
  // }}}
  // {{{ ui.cross = new Tool(cross_el)
  ui.cross = new Tool(cross_el)
  ui.cross.use = function() {
    if (brush.mask == draw.cross) {
      ui.cross.el.innerHTML = "ssoɹɔ"
      brush.mask = draw.inverted_cross
    }
    else {
      ui.cross.el.innerHTML = "cross"
      brush.mask = draw.cross
    }
    brush.generate()
    drawing = true
    brush.modified = false
  }
  ui.cross.done = function() {
    ui.cross.el.innerHTML = "cross"
    drawing = false
  }
  // }}}
  // {{{ ui.fill = new Tool(fill_el)
  ui.fill = new Tool(fill_el)
  ui.fill.use = function() {
    filling = true
    document.body.classList.add("bucket")
  }
  ui.fill.done = function() {
    filling = false
    document.body.classList.remove("bucket")
  }
  // }}}
  // {{{ ui.save = new ClipboardTool(save_el)
  ui.save = new ClipboardTool(save_el)
  ui.save.use = function() {
    changed
    var filename = document.getElementById("filename_el").value || "mircart-" + Math.round((new Date()).getTime() / 1000) + "_" + Math.trunc(Math.random() * 1000);
    if (!filename.match(/\.txt$/)) { filename += ".txt" }
    var text = clipboard.export_data();
    var blob = new Blob([text], {type:'text/plain'});
    var link = document.createElement("a");
    link.download = filename;
    link.innerHTML = "Download File";
    link.href = window.URL.createObjectURL(blob);
    link.click();
  }
  function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      var contents = e.target.result;
      clipboard.import_colorcode(contents, true);
      document.getElementById("filename_el").value = file.name
    };
    reader.readAsText(file);
  }
  document.getElementById('file_input').addEventListener('change', readSingleFile, false);
  // }}}
  // {{{ ui.select = new Tool(select_el)
  ui.select = new Tool(select_el)
  ui.select.use = function() {
    selection.show()
  }
  ui.select.done = function() {
    selection.hide()
  }
  // }}}
  // {{{ ui.square = new Tool(square_el)
  ui.square = new Tool(square_el)
  ui.square.use = function() {
    brush.mask = draw.square
    brush.generate()
    brush.modified = false
    drawing = true
  }
  ui.square.done = function() {
    drawing = false
  }
  // }}}
  // {{{ ui.text = new Tool(text_el)
  ui.text = new Tool(text_el)
  ui.text.use = function() {
    current_filetool && current_filetool.blur()
  }
  // }}}
  // {{{ ui.underline = new Tool(underline_el)
  ui.underline = new Tool(underline_el)
  ui.underline.use = function() {
    underlining = true
  }
  ui.underline.done = function() {
    underlining = false
  }
  // }}}

  // {{{ ui.bg = new BlurredCheckbox(bg_checkbox)
  ui.bg = new BlurredCheckbox(bg_checkbox)
  ui.bg.use = function(state) {
    brush.draw_bg = state || ! brush.draw_bg
    this.update(brush.draw_bg)
  }
  // }}}
  // {{{ ui.fg = new BlurredCheckbox(fg_checkbox)
  ui.fg = new BlurredCheckbox(fg_checkbox)
  ui.fg.use = function(state) {
    brush.draw_fg = state || ! brush.draw_fg
    this.update(brush.draw_fg)
  }
  // }}}
  // {{{ ui.char = new BlurredCheckbox(char_checkbox)
  ui.char = new BlurredCheckbox(char_checkbox)
  ui.char.use = function(state) {
    brush.draw_char = state || ! brush.draw_char
    this.update(brush.draw_char)
  }
  // }}}

  // {{{ ui.brush_h = new Lex(brush_h_el)
  ui.brush_h = new Lex(brush_h_el)
  // }}}
  // {{{ ui.brush_w = new Lex(brush_w_el)
  ui.brush_w = new Lex(brush_w_el)
  // }}}
  // {{{ ui.canvas_h = new Lex(canvas_h_el)
  ui.canvas_h = new Lex(canvas_h_el)
  // }}}
  // {{{ ui.canvas_w = new Lex(canvas_w_el)
  ui.canvas_w = new Lex(canvas_w_el)
  // }}}

  // {{{ ui.grid = new BlurredCheckbox(grid_el)
  ui.grid = new BlurredCheckbox(grid_el)
  ui.grid.memorable = true
  ui.grid.use = function(state) {
    state = typeof state == "boolean" ? state : ! document.body.classList.contains("grid")
    document.body.classList[ state ? "add" : "remove" ]('grid')
    letters.grid = palette.grid = canvas.grid = state
    canvas.resize_wrapper()
    palette.resize_wrapper()
    letters.resize_wrapper()
    if (! selection.hidden) selection.reposition()
    this.update( state )
  }
  // }}}
  // {{{ ui.pixels = new BlurredCheckbox(pixels_checkbox)
  ui.pixels = new BlurredCheckbox(pixels_checkbox)
  ui.pixels.memorable = true
  ui.pixels.use = function(state) {
    canvas.pixels = typeof state == "boolean" ? state : ! canvas.pixels
    document.body.classList.toggle("pixels", canvas.pixels)
    this.update(canvas.pixels)
  }
  // }}}

  // {{{ ui.mirror_x = new BlurredCheckbox(mirror_x_checkbox)
  ui.mirror_x = new BlurredCheckbox(mirror_x_checkbox)
  ui.mirror_x.use = function(state) {
    window.mirror_x = typeof state == "boolean" ? state : ! window.mirror_x
    this.update(window.mirror_x)
  }
  // }}}
  // {{{ ui.mirror_y = new BlurredCheckbox(mirror_y_checkbox)
  ui.mirror_y = new BlurredCheckbox(mirror_y_checkbox)
  ui.mirror_y.use = function(state) {
    window.mirror_y = typeof state == "boolean" ? state : ! window.mirror_y
    this.update(window.mirror_y)
  }
  // }}}

  // {{{ ui.redo = new BlurredTool(redo_el)
  ui.redo = new BlurredTool(redo_el)
  ui.redo.use = function() {
    undo.redo()
  }
  // }}}
  // {{{ ui.undo = new BlurredTool(undo_el)
  ui.undo = new BlurredTool(undo_el)
  ui.undo.use = function() {
    undo.undo()
  }
  // }}}

  // {{{ ui.rotate = new Tool(rotate_el)
  ui.rotate = new Tool(rotate_el)
  ui.rotate.use = function() {
    transform.set_mode('rotate')
  }
  ui.rotate.done = function() {
    transform.done()
  }
  // }}}
  // {{{ ui.scale = new Tool(scale_el)
  ui.scale = new Tool(scale_el)
  ui.scale.use = function() {
    transform.set_mode('scale')
  }
  ui.scale.done = function() {
    transform.done()
  }
  // }}}
  // {{{ ui.slice = new Tool(slice_el)
  ui.slice = new Tool(slice_el)
  ui.slice.use = function() {
    transform.set_mode('slice')
  }
  ui.slice.done = function() {
    transform.done()
  }
  // }}}
  // {{{ ui.translate = new Tool(translate_el)
  ui.translate = new Tool(translate_el)
  ui.translate.use = function() {
    transform.set_mode('translate')
  }
  ui.translate.done = function() {
    transform.done()
  }
  // }}}
  // {{{ ui.turn = new BlurredCheckbox(turn_checkbox)
  ui.turn = new BlurredCheckbox(turn_checkbox)
  ui.turn.memorable = true
  ui.turn.use = function(state) {
    canvas.rotated = typeof state == "boolean" ? state : ! canvas.rotated
    canvas.resize_wrapper()
    this.update(canvas.rotated)
  }
  // }}}

  // {{{ function readSingleFileStamp(e)
  function readSingleFileStamp(e) {
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      var contents = e.target.result;
      custom.clone(fromSelection=false,fromFile=contents)
    };
    reader.readAsText(file);
  }
  // }}}

  document.getElementById('stamp_file_input').addEventListener('change', readSingleFileStamp, false);

  return ui
})()

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
