var clipboard = (function () {

  var exports = {
    format: "mirc",
    importing: false,
    visible: false,
    canvas: document.createElement("canvas"),
    canvas_r: document.createElement("canvas"),

    bind: function () {},
    setFormat: function (name) {},
    show: function () {},
    hide: function () {},
    focus: function () {},
    blur: function () {},

    import_colorcode: function (data, no_undo) {
    	if (data && data.preventDefault) {
				//data = import_textarea.value
    	}
    	else {
				//data = data || import_textarea.value
    	}
      
      var json = colorcode.to_json(data, {fg:0, bg:1})

      if (!no_undo) undo.new()
      if (!no_undo) undo.save_rect(0,0, canvas.w, canvas.h)
      if (json.w !== canvas.w || json.h !== canvas.h){
        if (!no_undo) undo.save_size(canvas.w, canvas.h)
        canvas.resize(json.w, json.h, true)
      }
      canvas.clear()

      for (var y = 0, line; line = json.lines[y]; y++){
        var row = canvas.aa[y]
        for (var x = 0, char; char = line[x]; x++){
          var lex = row[x]
          lex.char = String.fromCharCode(char.value)
          lex.underline = char.u
          lex.fg = char.fg
          lex.bg = char.bg
          lex.opacity = 1
          lex.build()
        }
      }

      current_filetool && current_filetool.blur()     
    },
    export_data: function () {
      return canvas.mirc({cutoff: 0})
    },
    
    rotate_canvas: function(){
      var cr = clipboard.canvas_r, c = clipboard.canvas
      cr.width = c.height
      cr.height = c.width
      var ctx = cr.getContext('2d')
      ctx.resetTransform()
      ctx.translate(0, cr.height)
      ctx.rotate(-Math.PI / 2)
      ctx.drawImage(c, 0, 0)
      return cr
    },

    export_canvas: function (done_fn) {
      var opts = {
        palette: 'mirc',
        font: canvas.pixels ? 'fixedsys_8x8' : 'fixedsys_8x15',
        fg: 0,
        bg: 1,
        canvas: clipboard.canvas
      }
      opts.done = function(){
        var c = canvas.rotated ? clipboard.rotate_canvas() : clipboard.canvas
        if (done_fn) done_fn(c)
      }

      var start = Date.now();
      colorcode.to_canvas(canvas.mirc(), opts)
      var total = Date.now() - start;
      console.log("took " + total)
    },
    
    filename: function () {
      return [ +new Date, "ascii", user.username ].join("-")
    },

    save_png: function () {
      var save_fn = function(canvas_out){
        var filename = clipboard.filename() + ".png"
        var blob = PNG.canvas_to_blob_with_colorcode(canvas_out, canvas.mirc())
        saveAs(blob, filename);
      }
      clipboard.export_canvas(save_fn)
    },
    
  }
 
  // http...?a=1&b=2&b=3 -> {a: '1', b: ['2', '3']}
  function parse_url_search_params(url){
    var params = {}
    url = url.split('?')
    if (url.length < 2) return params

    var search = url[1].split('&')
    for (var i = 0, pair; pair = search[i]; i++){
      pair = pair.split('=')
      if (pair.length < 2) continue
      var key = pair[0]
      var val = pair[1]
      if (key in params){
        if (typeof params[key] === 'string'){
          params[key] = [params[key], val]
        }
        else params[key].push(val)
      }
      else params[key] = val
    }
    return params
  }

  function get_filetype(txt){
    txt = txt.split('.')
    return txt[txt.length - 1].toLowerCase() 
  }

  function fetch_url(url, f, type){
    type = type || 'arraybuffer'
    url = "/cgi-bin/proxy?" + url
    //url = "http://198.199.72.134/cors/" + url
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.responseType = type
    xhr.addEventListener('load', function(){ f(xhr.response) })
    xhr.send()
  }

  function load_text(txt){
    clipboard.import_colorcode(txt, true)
  }

  function load_png(buf){
    var chunks = PNG.decode(buf)
    if (!chunks) return
    var itxt_chunks = []
    for (var i=0, c; c=chunks[i]; i++){
      if (c.type !== 'iTXt') continue
      var itxt = PNG.decode_itxt_chunk(c)
      if (!itxt.keyword || itxt.keyword !== 'colorcode') continue
      clipboard.import_colorcode(itxt.data, true)
    }
  }
  
  function sally_url_convert(url){
    var png_regex = /^https?:\/\/www\.roarie\.cat\/asciiblaster\/sallies\/([0-9]+)\/([^.]+)\.png$/
    var matches = url.match(png_regex)
    if (!matches) return url
    return 'http://www.roarie.cat/asciiblaster/den/sallies/' + matches[1] + '/raw-' + matches[2] + '?.txt'
    // txt suffix to force www.roarie.cat/asciiblaster proxy
  }

  exports.load_from_location = function(){
    var params = parse_url_search_params(window.location + '')
    if (!params.url) return
    var url = params.url
    url = sally_url_convert(url)
    var type = get_filetype(url)
    switch (type){
      case 'txt':
        fetch_url(url, load_text, 'text')
        break
      case 'png':
        fetch_url(url, load_png)
        break
    } 

  }
  
  return exports
  
})()


