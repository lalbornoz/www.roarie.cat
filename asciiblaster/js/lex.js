function Lex(x ,y) {
  if (typeof x == "number") {
    this.x = x; this.y = y; this.span = document.createElement("span")
  } else {
    this.span = x
  }

  this.bg = colors.black; this.fg = colors.white; this.underline = false
  this.char = " "; this.opacity = 1
  this.focused = false
}

var fgOnly = false

// {{{ Lex.prototype.assign = function(lex)
Lex.prototype.assign = function(lex) {
  this.fg = lex.fg
  this.bg = lex.bg
  this.char = lex.char
  this.opacity = lex.opacity
  this.underline = lex.underline
  this.build()
}
// }}}
// {{{ Lex.prototype.blur = function()
Lex.prototype.blur = function() {
  focused = null
  this.span && this.span.classList.remove('focused')
  this.focused = false
  this.onBlur && this.onBlur()
}
// }}}
// {{{ Lex.prototype.build = function()
Lex.prototype.build = function() {
  if (isNaN(this.bg) || this.bg == Infinity || this.bg == -Infinity) this.bg = colors.black
  if (isNaN(this.fg) || this.fg == Infinity || this.fg == -Infinity) this.fg = colors.black
  this.span.className = this.css()
  this.span.innerHTML = this.html()
  if (this.underline) {
    this.span.style.textDecoration = "underline"
  } else {
    this.span.style.textDecoration = "none"
  }
}
// }}}
// {{{ Lex.prototype.key = function(char, keyCode)
Lex.prototype.key = function(char, keyCode) {
  if (! char) { return }
  this.char = char
  this.fg = brush.fg
  this.build()
  return true
}
// }}}

// {{{ Lex.prototype.clear = function()
Lex.prototype.clear = function() {
  this.bg = colors.black
  this.fg = 0
  this.char = " "
  this.opacity = 0
  this.underline = false
  this.build()
}
// }}}
// {{{ Lex.prototype.clone = function()
Lex.prototype.clone = function() {
  var lex = new Lex(0, 0); lex.assign(this); return lex
}
// }}}
// {{{ Lex.prototype.demolish = function()
Lex.prototype.demolish = function() {
  if (this.span.parentNode) { this.span.parentNode.removeChild(this.span) }
  this.span = null
}
// }}}
// {{{ Lex.prototype.erase = function()
Lex.prototype.erase = function() {
  this.bg = fillColor; this.fg = fillColor
  this.char = " "; this.opacity = 1
  this.build()
}
// }}}
// {{{ Lex.prototype.sanitize = function()
Lex.prototype.sanitize = function() {
  switch (this.char) {
//    case "%": return "%"
    case undefined:
    case "":  return " "
    default:  return this.char
  }
}
// }}}
// {{{ Lex.prototype.stamp = function(lex, brush)
Lex.prototype.stamp = function(lex, brush) {
  if (brush.draw_fg) this.fg = lex.fg
  if (brush.draw_bg && lex.opacity > 0) this.bg = lex.bg
  if (brush.draw_char) this.char = lex.char
  this.opacity = lex.opacity
  this.underline = lex.underline
  this.build()
}
// }}}

// {{{ Lex.prototype.css = function()
Lex.prototype.css = function() {
   return (
    this.focused ?
      "focused " : ""
  ) + (
    this.opacity === 0 ?
      "transparent f" + color_alphabet[modi(this.fg,16)] :
      "f" + color_alphabet[modi(this.fg,16)] + " b" + color_alphabet[modi(this.bg,16)]
  )
}
// }}}
// {{{ Lex.prototype.eq = function(lex)
Lex.prototype.eq = function(lex) {
  return lex && this.fg == lex.fg && this.bg == lex.bg && this.char == lex.char
}
// }}}
// {{{ Lex.prototype.eqColor = function(lex)
Lex.prototype.eqColor = function(lex) {
  return lex && this.fg == lex.fg && this.bg == lex.bg
}
// }}}
// {{{ Lex.prototype.focus = function()
Lex.prototype.focus = function() {
  if (focused) focused.blur()
  this.span.classList.add('focused')
  this.focused = true
  focused = this
}
// }}}
// {{{ Lex.prototype.html = function()
Lex.prototype.html = function() {
  return this.char == " " ? "&nbsp;" : this.char || "&nbsp;"
}
// }}}
// {{{ Lex.prototype.isClear = function()
Lex.prototype.isClear = function() {
  return this.bg == 1 && this.fg == 0 && this.char == " "
}
// }}}
// {{{ Lex.prototype.mirc = function()
Lex.prototype.mirc = function() {
  var char = this.char || " "
  var out = ""
  if (this.opacity > 0) {
    if (fgOnly) {
      return out + "\x03" + (this.fg&15) + char
    }
    if ((this.bg&15) < 10 && ! isNaN(parseInt(char))) {
      return out +"\x03" + (this.fg&15) + ",0" + (this.bg&15) + char
    }
    else {
      return out +"\x03" + (this.fg&15) + "," + (this.bg&15) + char
    }
  } else {
      return out + "\x0f" + char
  }
}
// }}}
// {{{ Lex.prototype.ne = function(lex)
Lex.prototype.ne = function(lex) {
  return ! this.eq(lex)
}
// }}}
// {{{ Lex.prototype.read = function()
Lex.prototype.read = function() {
  this.char = this.span.innerHTML
  return this.char
}
// }}}

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
