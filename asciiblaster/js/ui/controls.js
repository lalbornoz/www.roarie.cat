var controls = (function(){

  var controls = {}

  controls.cross = new Tool (cross_el)
  controls.cross.use = function(){
    if (brush.mask == blit.cross) {
      controls.cross.el.innerHTML = "ssoɹɔ"
      brush.mask = blit.inverted_cross
    }
    else {
      controls.cross.el.innerHTML = "cross"
      brush.mask = blit.cross
    }
    brush.generate()
    drawing = true
    brush.modified = false
  }
  controls.cross.done = function(){
    controls.cross.el.innerHTML = "cross"
    drawing = false
  }

  controls.circle = new Tool (circle_el)
  controls.circle.use = function(){
    brush.mask = blit.circle
    brush.generate()
    drawing = true
    brush.modified = false
  }
  controls.circle.done = function(){
    drawing = false
  }
  
  controls.square = new Tool (square_el)
  controls.square.use = function(){
    brush.mask = blit.square
    brush.generate()
    brush.modified = false
    drawing = true
  }
  controls.square.done = function(){
    drawing = false
  }
  
  controls.text = new Tool (text_el)
  controls.text.use = function(){
    current_filetool && current_filetool.blur()
  }

  controls.select = new Tool (select_el)
  controls.select.use = function(){
    selection.show()
  }
  controls.select.done = function(){
    selection.hide()
  }

  controls.rotate = new Tool (rotate_el)
  controls.rotate.use = function(){
    transform.set_mode('rotate')
  }
  controls.rotate.done = function(){
    transform.done()
  }

  controls.scale = new Tool (scale_el)
  controls.scale.use = function(){
    transform.set_mode('scale')
  }
  controls.scale.done = function(){
    transform.done()
  }

  controls.slice = new Tool (slice_el)
  controls.slice.use = function(){
    transform.set_mode('slice')
  }
  controls.slice.done = function(){
    transform.done()
  }

  controls.translate = new Tool (translate_el)
  controls.translate.use = function(){
    transform.set_mode('translate')
  }
  controls.translate.done = function(){
    transform.done()
  }

  controls.fill = new Tool (fill_el)
  controls.fill.use = function(){
    filling = true
    document.body.classList.add("bucket")
  }
  controls.fill.done = function(){
    filling = false
    document.body.classList.remove("bucket")
  }
 
  controls.undo = new BlurredTool (undo_el)
  controls.undo.use = function(){
    undo.undo()
  }

  controls.redo = new BlurredTool (redo_el)
  controls.redo.use = function(){
    undo.redo()
  }

  controls.clear = new BlurredTool (clear_el)
  controls.clear.use = function(){
    undo.new()
    undo.save_rect(0, 0, canvas.w, canvas.h)
    canvas.erase()
    current_filetool && current_filetool.blur()
  }

  controls.grid = new BlurredCheckbox (grid_el)
  controls.grid.memorable = true
  controls.grid.use = function(state){
  	state = typeof state == "boolean" ? state : ! document.body.classList.contains("grid")
    document.body.classList[ state ? "add" : "remove" ]('grid')
  	letters.grid = palette.grid = canvas.grid = state
  	canvas.resize_rapper()
  	palette.resize_rapper()
  	letters.resize_rapper()
    if (! selection.hidden) selection.reposition()
    this.update( state )
  }
  ClipboardTool = FileTool.extend({
    blur: function(){
      this.__blur()
      clipboard.hide()
    }
  })
  controls.save = new ClipboardTool (save_el)
  controls.save.use = function(){
    changed
    clipboard.show()
    clipboard.export_mode()
  }
  controls.load = new ClipboardTool (load_el)
  controls.load.use = function(){
    // console.log("use")
    clipboard.show()
    clipboard.import_mode()
  }
 
  controls.save_format = new RadioGroup(format_el)
  controls.save_format.name = 'save_format'
  controls.save_format.memorable = true
  var cs = controls.save_format.controls
  cs.mirc.use = function(){
    clipboard.export_data()
  }
  //

  controls.experimental_palette = new HiddenCheckbox (experimental_palette_toggle)
  controls.experimental_palette.memorable = true
  controls.experimental_palette.use = function(state){
    var state = palette.experimental(state)
    this.update(state)
  }

  
  controls.fg = new BlurredCheckbox (fg_checkbox)
  controls.fg.use = function(state){
    brush.draw_fg = state || ! brush.draw_fg
    this.update(brush.draw_fg)
  }

  controls.bg = new BlurredCheckbox (bg_checkbox)
  controls.bg.use = function(state){
    brush.draw_bg = state || ! brush.draw_bg
    this.update(brush.draw_bg)
  }

  controls.char = new BlurredCheckbox (char_checkbox)
  controls.char.use = function(state){
    brush.draw_char = state || ! brush.draw_char
    this.update(brush.draw_char)
  }
  
  //

//   controls.turn = new BlurredCheckbox (turn_checkbox)
//   controls.turn.memorable = true
//   controls.turn.use = function(state){
//     canvas.rotated = typeof state == "boolean" ? state : ! canvas.rotated
//     canvas.resize_rapper()
//     this.update(canvas.rotated)
//   }

  // controls.pixels = new BlurredCheckbox (pixels_checkbox)
  // controls.pixels.memorable = true
  // controls.pixels.use = function(state){
  //   canvas.pixels = typeof state == "boolean" ? state : ! canvas.pixels
  //   document.body.classList.toggle("pixels", canvas.pixels)
  //   this.update(canvas.pixels)
  // }
  
  controls.mirror_x = new BlurredCheckbox (mirror_x_checkbox)
  controls.mirror_x.use = function(state){
    window.mirror_x = typeof state == "boolean" ? state : ! window.mirror_x
    this.update(window.mirror_x)
  }
  controls.mirror_y = new BlurredCheckbox (mirror_y_checkbox)
  controls.mirror_y.use = function(state){
    window.mirror_y = typeof state == "boolean" ? state : ! window.mirror_y
    this.update(window.mirror_y)
  }

  //
  
  controls.vertical = new BlurredCheckbox (vertical_checkbox)
  controls.vertical.memorable = true
  controls.vertical.use = function(state){
    canvas.vertical = typeof state == "boolean" ? state : ! canvas.vertical
    controls.vertical.refresh()
  }
  controls.vertical.refresh = function(){
    if (canvas.vertical) {
      document.body.classList.add("vertical")
    }
    else {
      document.body.classList.remove("vertical")
    }
    palette.repaint()
    letters.repaint()
    this.update(canvas.vertical)
  }

  //
  
  controls.brush_w = new Lex (brush_w_el)
  controls.brush_h = new Lex (brush_h_el)
  controls.canvas_w = new Lex (canvas_w_el)
  controls.canvas_h = new Lex (canvas_h_el)

  // bind  
  
  controls.bind = function(){

    for (var n in controls){
      var control = controls[n]
      if (typeof control === 'object' && 'bind' in control){
        control.bind()
      }
    }

    [
      controls.brush_w,
      controls.brush_h,
      controls.canvas_w,
      controls.canvas_h
    ].forEach(function(lex){
      lex.span.addEventListener('mousedown', function(e){
        lex.focus()
        if (is_mobile) cursor_input.focus()
      })
    });

    controls.brush_w.key = keys.single_numeral_key(controls.brush_w, function(w){ brush.resize(w, brush.h) })
    controls.brush_w.raw_key = keys.arrow_key(function(w){ brush.size_add(w, 0) })

    controls.brush_h.key = keys.single_numeral_key(controls.brush_h, function(h){ brush.resize(brush.w, h) })
    controls.brush_h.raw_key = keys.arrow_key(function(h){ brush.size_add(0, h) })
    
    controls.canvas_w.key = keys.multi_numeral_key(controls.canvas_w, 3)
    controls.canvas_w.onBlur = keys.multi_numeral_blur(controls.canvas_w, function(w){ canvas.resize(w, canvas.h) })
    controls.canvas_w.raw_key = keys.arrow_key(function(w){ canvas.size_add(w, 0) })

    controls.canvas_h.key = keys.multi_numeral_key(controls.canvas_h, 3)
    controls.canvas_h.onBlur = keys.multi_numeral_blur(controls.canvas_h, function(h){ canvas.resize(canvas.w, h) })
    controls.canvas_h.raw_key = keys.arrow_key(function(h){ canvas.size_add(0, h) })
    
    add_custom_el.addEventListener("click", function(){
      custom.clone()
    })
    add_sel_custom_el.addEventListener("click", function(){
      custom.clone(true)
    })

  }

  return controls
})()
