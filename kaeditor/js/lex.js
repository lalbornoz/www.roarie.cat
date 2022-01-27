function Lex(x, y, defaultBg=99, defaultFg=10) {
  if (typeof(x) === "number") {
    this.x = x; this.y = y; this.span = document.createElement("span");
  } else {
    this.span = x;
  };

  this.bg = defaultBg; this.fg = defaultFg;
  this.char = " "; this.underline = false;
  this.defaultBg = defaultBg; this.defaultFg = defaultFg;
  this.focused = false;
};

// {{{ Lex.prototype.assign = function(lex)
Lex.prototype.assign = function(lex) {
  this.bg = lex.bg; this.fg = lex.fg;
  this.char = lex.char; this.underline = lex.underline;
  this.build();
};
// }}}
// {{{ Lex.prototype.blur = function()
Lex.prototype.blur = function() {
  focused = null;
  this.span && this.span.classList.remove("focused");
  this.focused = false;
  this.onBlur && this.onBlur();
};
// }}}
// {{{ Lex.prototype.build = function()
Lex.prototype.build = function() {
  if (isNaN(this.bg) || (this.bg == Infinity) || (this.bg == -Infinity)) this.bg = this.defaultBg;
  if (isNaN(this.fg) || (this.fg == Infinity) || (this.fg == -Infinity)) this.fg = this.defaultFg;
  this.span.className = this.css(); this.span.innerHTML = this.html();
  this.span.style.textDecoration = this.underline ? "underline" : "none";
};
// }}}
// {{{ Lex.prototype.key = function(char, keyCode)
Lex.prototype.key = function(char, keyCode) {
  if (!char) return;
  this.char = char; this.fg = brush.fg;
  this.build();
  return true;
};
// }}}

// {{{ Lex.prototype.clear = function()
Lex.prototype.clear = function() {
  this.bg = colors.black; this.fg = 0;
  this.char = " "; this.underline = false;
  this.build();
};
// }}}
// {{{ Lex.prototype.clone = function()
Lex.prototype.clone = function() {
  var lex = new Lex(0, 0); lex.assign(this); return lex;
};
// }}}
// {{{ Lex.prototype.demolish = function()
Lex.prototype.demolish = function() {
  if (this.span.parentNode) this.span.parentNode.removeChild(this.span);
  this.span = null;
};
// }}}
// {{{ Lex.prototype.sanitize = function()
Lex.prototype.sanitize = function() {
  switch (this.char) {
    case undefined:
    case "":  return " ";
    default:  return this.char;
  };
};
// }}}

// {{{ Lex.prototype.css = function()
Lex.prototype.css = function() {
   return (this.focused ? "focused " : "") +
          ((this.bg === 99)
            ? ((this.fg === 99) ? ("transparent") : ((this.char != " ") ? ("f" + color_alphabet[modi(this.fg, 16)]) : "transparent"))
            : (((this.fg === 99) ? ("") : ("f" + color_alphabet[modi(this.fg, 16)])) + " b" + color_alphabet[modi(this.bg, 16)]));
};
// }}}
// {{{ Lex.prototype.eqColor = function(lex)
Lex.prototype.eqColor = function(lex) {
  return lex && this.fg == lex.fg && this.bg == lex.bg;
};
// }}}
// {{{ Lex.prototype.focus = function()
Lex.prototype.focus = function() {
  if (focused) focused.blur()
  this.span.classList.add("focused"); this.focused = true; focused = this;
};
// }}}
// {{{ Lex.prototype.html = function()
Lex.prototype.html = function() {
  return (this.char == " ") ? "&nbsp;" : (this.char || "&nbsp;");
};
// }}}
// {{{ Lex.prototype.mirc = function()
Lex.prototype.mirc = function() {
  var char = this.char || " ", out = "";

  // PSA: IRC IS FTUPID AND FOR LOSERS
  if ((this.bg < 10) && !isNaN(parseInt(char))) {
    return out + "\x03" + this.fg + ",0" + this.bg + char;
  } else {
    return out + "\x03" + this.fg + "," + this.bg + char;
  };
};
// }}}
// {{{ Lex.prototype.read = function()
Lex.prototype.read = function() {
  this.char = this.span.innerHTML; return this.char;
};
// }}}

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
