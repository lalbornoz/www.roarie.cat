function Matrix (w, h, f) {
  this.f = f; this.focus_x = this.focus_y = 0;
  this.h = h; this.w = w;
  this.x = this.y = 0;
  this.initialize();
};

// {{{ Matrix.prototype.assign = function(mat)
Matrix.prototype.assign = function(mat) {
  var base = this;

  this.demolish(); this.h = mat.h; this.w = mat.w;
  this.initialize(function(x, y) {
    var el = mat.getCell(x, y).clone();
    el.build(); return el;
  });
  this.append(); this.bind();
  check_if_lost_focus();
  return this;
};
// }}}
// {{{ Matrix.prototype.bind = function() {}
Matrix.prototype.bind = function() {};
// }}}
// {{{ Matrix.prototype.build = function()
Matrix.prototype.build = function() {
  this.forEach(function(lex,x,y) { lex.build(); });
};
// }}}
// {{{ Matrix.prototype.focus = function(x, y)
Matrix.prototype.focus = function(x, y) {
  if (x === undefined) x = this.focus_x;
  if (y === undefined) y = this.focus_y;
  [x, y] = [mod(x, this.w), mod(y, this.h)]
  this.focus_x = x; this.focus_y = y;
  this.aa[y][x].focus();
};
// }}}
// {{{ Matrix.prototype.focusLex = function(y, x)
Matrix.prototype.focusLex = function(y, x) {
  if (x < 0) y -= 1;
  if (x > this.aa[0].length) y += 1;
  this.aa[mod(y,this.h)][mod(x,this.w)].focus();
};
// }}}
// {{{ Matrix.prototype.focus_add = function(x, y)
Matrix.prototype.focus_add = function(x, y) {
  this.focus(this.focus_x + x, this.focus_y + y);
};
// }}}
// {{{ Matrix.prototype.focus_clamp = function()
Matrix.prototype.focus_clamp = function() {
  this.focus_x = clamp(this.focus_x, 0, this.w - 1);
  this.focus_y = clamp(this.focus_y, 0, this.h - 1);
};
// }}}
// {{{ Matrix.prototype.initialize = function(f)
Matrix.prototype.initialize = function(f) {
  var f = f || this.f, h = this.h || 1, w = this.w || 1;
  var aa = new Array(h);

  for (var y = 0; y < h; y++) {
    aa[y] = new Array(w);
    for (var x = 0; x < w; x++) {
      aa[y][x] = f(x, y);
    };
  };
  this.aa = aa;
};
// }}}

// {{{ Matrix.prototype.append = function(wrapper)
Matrix.prototype.append = function(wrapper) {
  wrapper = this.wrapper = wrapper || this.wrapper;
  if (!this.wrapper) return;
  this.aa.forEach(function(row, y) {
    var div = document.createElement("div");
    row.forEach(function(lex, x) { div.appendChild(lex.span); });
    wrapper.appendChild(div);
  });
};
// }}}
// {{{ Matrix.prototype.rebuild = function()
Matrix.prototype.rebuild = function() {
  this.demolish(); this.initialize();
  this.append(); this.bind();
  this.generate && this.generate();
  this.focus_clamp();
  check_if_lost_focus();
};
// }}}
// {{{ Matrix.prototype.resize = function(w, h)
Matrix.prototype.resize = function(w, h) {
  var div = null, f = this.f, lex = null, row = null, wrapper = this.wrapper;
  var old_h = this.aa.length, old_w = this.aa[0].length;

  [h, w] = [max(h || canvas.h, 1), max(w || canvas.w, 1)];

  if (h < old_h) {
    for (var y = old_h; y > h; y--) {
      row = this.aa.pop();
      div = row[0].span.parentNode;
      row.forEach(function(lex, x) { lex.demolish(); });
      div.parentNode.removeChild(div);
    };
  } else if (h > old_h) {
    for (var y = old_h; y < h; y++) {
      div = document.createElement("div"); wrapper.appendChild(div);
      this.aa[y] = new Array(w);
      for (var x = 0; x < w; x++) {
        lex = this.aa[y][x] = f(x, y);
        div.appendChild(lex.span);
      };
    };
  };
  if (w < old_w) {
    this.aa.forEach(function(row, y) {
      while (row.length > w) {
        lex = row.pop(); lex.demolish();
      };
    });
  } else if (w > old_w) {
    this.aa.forEach(function(row, y) {
      div = row[0].span.parentNode;
      for (var x = row.length; x < w; x++) {
        lex = row[x] = f(x, y); div.appendChild(lex.span);
      };
    });
  };

  this.h = h; this.w = w; this.bind && this.bind(); this.focus_clamp();
  if (this.wrapper && (this.wrapper.parentNode !== document.body)) {
    this.resize_wrapper();
  };
};
// }}}
// {{{ Matrix.prototype.resize_wrapper = function()
Matrix.prototype.resize_wrapper = function() {
  var cell = canvas.aa[0][0].span;
  var ch = cell.offsetHeight, cw = cell.offsetWidth;
  var height = ch * this.aa.length, width = cw * this.aa[0].length;

  if (canvas.grid) {
    width++; height++
  };
  if (this.rotated) {
    this.wrapper.parentNode.classList.add("rotated");
    this.wrapper.parentNode.style.height = (width) + "px";
    this.wrapper.parentNode.style.width = (height) + "px";
    this.wrapper.style.top = (width/2) + "px";
  } else {
    this.wrapper.parentNode.classList.remove("rotated");
    this.wrapper.parentNode.style.height = "";
    this.wrapper.style.width = this.wrapper.parentNode.style.width = (width) + "px";
  };
};
// }}}

// {{{ Matrix.prototype.clear = function()
Matrix.prototype.clear = function() {
  this.forEach(function(lex, x, y) { lex.clear(); });
};
// }}}
// {{{ Matrix.prototype.clone = function()
Matrix.prototype.clone = function() {
  var base = this, clone = new Matrix(this.w, this.h, function(x, y) {
    return base.getCell(x,y).clone();
  });
  clone.f = this.f; return clone;
};
// }}}
// {{{ Matrix.prototype.demolish = function()
Matrix.prototype.demolish = function() {
  this.forEach(function(lex) { lex.demolish() });
  while (this.wrapper && this.wrapper.firstChild) {
    this.wrapper.removeChild(this.wrapper.firstChild);
  };
  this.aa.forEach(function(row) { row.length = 0; });
  this.aa.length = 0;
};
// }}}

// {{{ Matrix.prototype.forEach = function(f)
Matrix.prototype.forEach = function(f) {
  this.aa.forEach(function(row, y) {
    row.forEach(function(lex, x) {
      f(lex, x, y);
    });
  });
};
// }}}
// {{{ Matrix.prototype.get = function(x, y)
Matrix.prototype.get = function(x, y) {
  [y, x] = [floor(mod(y || 0, this.h)), floor(mod(x || 0, this.w))];
  if (this.aa[y] && this.aa[y][x]) {
    return this.aa[y][x];
  } else {
    return null;
  };
};
// }}}
// {{{ Matrix.prototype.getCell = function(x, y)
Matrix.prototype.getCell = function(x, y) {
  if (this.aa[y] && this.aa[y][x]) {
    return this.aa[y][x];
  } else {
    return null;
  };
};
// }}}
// {{{ Matrix.prototype.mirc = function(opts)
Matrix.prototype.mirc = function(opts) {
  var cutoff = false;
  var lines = this.aa.map(function(row, y) {
    var last, line = "", underline = false;
    row.forEach(function(lex, x) {
      if (lex.eqColor(last)) {
        if (lex.underline && !underline) {
          line += "\x1f"; underline = true;
        } else if (!lex.underline && underline) {
          line += "\x1f"; underline = false;
        }
        line += lex.sanitize();
      } else {
        if (lex.underline && !underline) {
          line += "\x1f"; underline = true;
        } else if (!lex.underline && underline) {
          line += "\x1f"; underline = false;
        }
        line += lex.mirc(); last = lex;
      };
    });
    return line;
  });

  var txt = lines.filter(function(line) { return line.length > 0; }).join("\n");
  if (cutoff) {
    txt = new String(txt); txt.cutoff = true;
  };
  return txt;
};
// }}}
// {{{ Matrix.prototype.region = function(w, h, x, y)
Matrix.prototype.region = function(w, h, x, y) {
  [w, h, x, y] = [w || 1, h || 1, x || 0, y = y || 0];
  var parent = this;
  var mat = new Matrix(w, h, function(x, y) {
    return parent.aa[y][x];
  });
  mat.f = this.f; return mat;
};
// }}}
// {{{ Matrix.prototype.setCell = function(lex, x, y)
Matrix.prototype.setCell = function(lex, x, y) {
  this.aa[y] && this.aa[y][x] && this.aa[y][x].assign(lex);
};
// }}}

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
