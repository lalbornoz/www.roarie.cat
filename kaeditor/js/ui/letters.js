var letters = (function() {
  var charset = ""
  var charsets = [
    'Basic Latin',
    'Latin-1 Supplement',
    'Box Drawing',
    'Block Elements',
  ]
  var charset_index = 0
  var last_charset = ""
  var letters = new Matrix(1, 1, function(x, y) { var lex = new Lex(x, y); return lex })
  var UNICODE_BLOCK_LIST = [
    0x0020, 0x007F, "Basic Latin",
    0x0080, 0x00FF, "Latin-1 Supplement",
    0x2500, 0x257F, "Box Drawing",
    0x2580, 0x259F, "Block Elements",
  ]
  var UNICODE_LOOKUP = {}
  for (var i = 0, len = UNICODE_BLOCK_LIST.length; i < len; i += 3) {
    UNICODE_LOOKUP[UNICODE_BLOCK_LIST[i + 2]] = [ UNICODE_BLOCK_LIST[i], UNICODE_BLOCK_LIST[i + 1]]
  }

  // {{{ letters.repaint = function(charset)
  letters.repaint = function(charset) {
    letters.charset = charset = charset || last_charset
    last_charset = charset
    var b = UNICODE_LOOKUP[charset]
    var chars = range.apply(null, b).map(function(n) { return String.fromCharCode(n) })

    if (chars[0] != " ") chars.unshift(" ")
    letters.resize( 34, Math.ceil( chars.length / 34 ) )

    var i = 0

    letters.forEach(function(lex,x,y) {
      var char = chars[i++]
      if (palette.chars.indexOf(brush.char) > 1) {
        lex.bg = brush.fg
        lex.fg = brush.bg
      }
      else {
        lex.bg = colors.black
        lex.fg = brush.fg == fillColor ? colors.black : brush.fg
      }
      lex.char = char
      lex.opacity = 1
      lex.build()
    })
  }
  // }}}
  // {{{ letters.bind = function()
  letters.bind = function() {
    letters.forEach(function(lex,x,y) {
      if (lex.bound) return
      lex.bound = true

      lex.span.addEventListener('mousedown', function(e) {
        e.preventDefault()
        if (e.shiftKey) {
          charset_index = (charset_index+1) % charsets.length
          letters.repaint(charsets[charset_index])
          return
        }
        else if (e.ctrlKey || e.which == 3) {
          brush.char = lex.char
          brush.bg = brush.fg
          brush.fg = fillColor
        }
        else {
          brush.char = lex.char
          if (lex.char == " ") {
            brush.bg = brush.fg
          }
          else if (brush.bg != fillColor) {
            brush.fg = brush.bg
            brush.bg = fillColor
          }
        }
        if (! brush.modified) {
          brush.generate()
        }
        palette.repaint()
      })
      lex.span.addEventListener('contextmenu', function(e) {
        e.preventDefault()
      })
    })
  }
  // }}}

  return letters
})()

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
