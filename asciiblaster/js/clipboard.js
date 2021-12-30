var clipboard = (function () {
  var exports = {
    canvas: document.createElement("canvas"),
    canvas_r: document.createElement("canvas"),

    // {{{ export_canvas: function(done_fn)
    export_canvas: function(done_fn) {
      var opts = {
        bg: 1,
        canvas: clipboard.canvas,
        fg: 0,
        font: canvas.pixels ? 'fixedsys_8x8' : 'fixedsys_8x15',
        palette: 'mirc',
      }
      opts.done = function () {
        var c = canvas.rotated ? clipboard.rotate_canvas() : clipboard.canvas
        if (done_fn) done_fn(c)
      }

      var start = Date.now();
      colorcode.to_canvas(canvas.mirc(), opts)
      var total = Date.now() - start;
      console.log("took " + total)
    },
    // }}}
    // {{{ export_data: function()
    export_data: function () {
      return canvas.mirc({cutoff: 0})
    },
    // }}}
    // {{{ import_colorcode: function (data, no_undo)
    import_colorcode: function (data, no_undo) {
      var json = colorcode.to_json(data, {fg:0, bg:1})

      if (!no_undo) undo.new()
      if (!no_undo) undo.save_rect(0,0, canvas.w, canvas.h)
      if (json.w !== canvas.w || json.h !== canvas.h) {
        if (!no_undo) undo.save_size(canvas.w, canvas.h)
        canvas.resize(json.w, json.h, true)
      }
      canvas.clear()

      for (var y = 0, line; line = json.lines[y]; y++) {
        var row = canvas.aa[y]
        for (var x = 0, char; char = line[x]; x++) {
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
    // }}}
    // {{{ rotate_canvas: function()
    rotate_canvas: function() {
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
    // }}}
    // {{{ save_png: function()
    save_png: function() {
      var save_fn = function(canvas_out) {
        // {{{ const b64toBlob = (b64Data, contentType='', sliceSize=512)
        // <https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript/16245768#16245768>
        const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
          const byteCharacters = atob(b64Data);
          const byteArrays = [];

          for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }

          const blob = new Blob(byteArrays, {type: contentType});
          return blob;
        }
        // }}}

        var filename = document.getElementById("filename_el").value || "mircart-" + Math.round((new Date()).getTime() / 1000) + "_" + Math.trunc(Math.random() * 1000);
        if (!filename.match(/\.png$/)) { filename += ".png" }
        var blob = b64toBlob(canvas_out.toDataURL().replace(/^.*base64,/, ""), "image/png")
        var link = document.createElement("a");
        link.download = filename;
        link.innerHTML = "Download File";
        link.href = window.URL.createObjectURL(blob);
        link.click();
      }
      clipboard.export_canvas(save_fn)
    },
    // }}}
  }

  return exports
})()

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
