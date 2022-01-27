var letters = (function() {
  var letters = new Matrix(1, 1, function(x, y) {
    var lex = new Lex(x, y); return lex;
  });

  var charsets = [
    "Basic Latin",
    "Latin-1 Supplement",
    "Box Drawing",
    "Block Elements",
  ];
  var UNICODE_BLOCK_LIST = [
    0x0020, 0x007F, "Basic Latin",
    0x0080, 0x00FF, "Latin-1 Supplement",
    0x2500, 0x257F, "Box Drawing",
    0x2580, 0x259F, "Block Elements",
  ];

  var charset, charset_index = 0, last_charset = "";
  var UNICODE_LOOKUP = {};

  // {{{ letters.repaint = function(charset)
  letters.repaint = function(charset) {
    letters.charset = charset = charset || last_charset; last_charset = charset;
    var b = UNICODE_LOOKUP[charset];
    var chars = range.apply(null, b).map(function(n) { return String.fromCharCode(n); });
    var i = 0;

    letters.charset = charset = charset || last_charset; last_charset = charset;
    if (chars[0] != " ") chars.unshift(" ");
    letters.resize(34, Math.ceil(chars.length / 34));

    letters.forEach(function(lex, x, y) {
      var char = chars[i++];
      [lex.bg, lex.fg] = [brush.bg, brush.fg];
      lex.char = char;
      lex.build();
    });
  };
  // }}}
  // {{{ letters.bind = function()
  letters.bind = function() {
    letters.forEach(function(lex,x,y) {
      if (lex.bound) return;

      lex.span.addEventListener("mousedown", function(e) {
        e.preventDefault();

        if (e.shiftKey) {
          charset_index = (charset_index + 1) % charsets.length;
          letters.repaint(charsets[charset_index]);
        } else {
          [brush.bg, brush.fg] = [lex.bg, lex.fg];
           brush.char = lex.char;
          if (!brush.modified) brush.mask(brush);
          palette.repaint();
        };
      });

      lex.span.addEventListener("contextmenu", function(e) {
        e.preventDefault();
      });
    });
  };
  // }}}

  for (let i = 0, len = UNICODE_BLOCK_LIST.length; i < len; i += 3) {
    UNICODE_LOOKUP[UNICODE_BLOCK_LIST[i + 2]] = [UNICODE_BLOCK_LIST[i], UNICODE_BLOCK_LIST[i + 1]];
  };
  return letters;
})();

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
