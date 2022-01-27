var custom = (function() {
  var exports = {}

  exports.init = function() {
    var cellArray = null, customId = null, max_width = 0, new_brush = null;

    customId = localStorage.getItem("custom.first");
    if (customId === "0") {
      localStorage.removeItem("custom.first");
    } else {
      do {
        if (customId !== null) {
          cellArray = JSON.parse(localStorage.getItem("custom." + customId));
          exports.clone(fromArray=[customId, cellArray], fromSelection=false, fromFile=null, inhibitLocalStore=true);
        };
      } while ((customId !== null)
            && ((customId = localStorage.getItem("custom." + customId + ".next")) !== "0"));
    };
  };

  exports.clone = function(fromArray=null, fromSelection=false, fromFile=null, inhibitLocalStore=false) {
    var customId = null, json = null, max_width = null, new_brush = null;
    var customFirst = null, customLast = null, customNext = null, customPrev = null;

    if (fromArray !== null) {
      customId = fromArray[0]; fromArray = fromArray[1];

      for (var y = 0; y < fromArray.length; y++) {
        max_width = max(max_width, fromArray[y].length);
      };

      new_brush = new Matrix(max_width, fromArray.length, function(x, y) {
        var lex = new Lex(x, y);
        lex.bg = fromArray[y][x].bg; lex.fg = fromArray[y][x].fg;
        lex.char = fromArray[y][x].char;
        lex.underline = fromArray[y][x].underline;
        lex.build();
        lex.span.style.maxWidth = "8px";
        return lex;
      });
    } else if (fromFile !== null) {
      json = colorcode.to_json(fromFile, {fg:0, bg:1})
      for (var y = 0, line; line = json.lines[y]; y++) {
        max_width = max(max_width, line.length);
      };
      new_brush = new Matrix(max_width, json.lines.length, function(x,y) {
        var lex = new Lex(x, y)

        if (x < json.lines[y].length) {
          lex.bg = json.lines[y][x].bg; lex.fg = json.lines[y][x].fg
          lex.char = String.fromCharCode(json.lines[y][x].value)
          lex.underline = json.lines[y][x].u
        } else {
          lex.bg = 99; lex.char = " "; lex.fg = 99; lex.underline = false
        }

        lex.build()
        lex.span.style.maxWidth = "8px"
        return lex
      });
    } else if (!fromSelection) {
      new_brush = brush.clone()
    } else {
      if (!(selection.a[0] === 0 && selection.a[1] === 0 && selection.b[0] === 0 && selection.b[1] === 0)) {
        new_brush = new Matrix((selection.b[0] + 1) - selection.a[0], (selection.b[1] + 1) - selection.a[1], function(x,y) {
          var cell = canvas.getCell(x + selection.a[0], y + selection.a[1]).clone()
          cell.span.style.maxWidth = "8px";
          return cell
        })
      } else {
        return false
      }
    }

    if (inhibitLocalStore === false) {
      var cellArray = new Array(new_brush.h).fill(0).map(() => new Array(new_brush.w).fill(null));

      customId = Math.round((new Date()).getTime() / 1000) + "_" + Math.trunc(Math.random() * 1000);
      for (var y = 0; y < new_brush.h; y++) {
        for (var x = 0; x < new_brush.w; x++) {
          cellArray[y][x] = {
            "bg":new_brush.aa[y][x].bg,
            "char":new_brush.aa[y][x].char,
            "fg":new_brush.aa[y][x].fg,
            "underline":new_brush.aa[y][x].underline,
          };
        };
      };

      localStorage.setItem("custom." + customId, JSON.stringify(cellArray));
      if ((customLast = localStorage.getItem("custom.last")) === null) {
        localStorage.setItem("custom." + customId + ".prev", 0);
        localStorage.setItem("custom.last", customId);
      } else {
        localStorage.setItem("custom." + customId + ".prev", customLast);
        localStorage.setItem("custom." + customLast + ".next", customId);
        localStorage.setItem("custom.last", customId);
      };
      if ((customFirst = localStorage.getItem("custom.first")) === null) {
        localStorage.setItem("custom.first", customId);
      };
      localStorage.setItem("custom." + customId + ".next", 0);
    };

    var wrapper = document.createElement("div")
    wrapper.className = "custom"
    wrapper.setAttribute("customId", customId);
    new_brush.append(wrapper)
    custom_wrapper.appendChild(wrapper)
    document.getElementById("custom_block").style.visibility = "visible";

    // {{{ wrapper.addEventListener("click", function(e)
    wrapper.addEventListener("click", function(e) {
      if (!e.shiftKey) {
        // load this brush
        exports.load(new_brush)
      } else {
        while (wrapper && wrapper.firstChild) {
          wrapper.removeChild(wrapper.firstChild)
        }
        wrapper.parentNode.removeChild(wrapper)
        if (document.getElementById("custom_wrapper").children.length === 0) {
          document.getElementById("custom_block").style.visibility = "hidden";
        }

        let customId = wrapper.getAttribute("customId");
        customFirst = localStorage.getItem("custom.first");
        customLast = localStorage.getItem("custom.last");
        customNext = localStorage.getItem("custom." + customId + ".next");
        customPrev = localStorage.getItem("custom." + customId + ".prev");

        if ((customNext !== null) && (customNext !== "0")) {
          localStorage.setItem("custom." + customNext + ".prev", customPrev);
        };
        if ((customPrev !== null) && (customPrev !== "0")) {
          localStorage.setItem("custom." + customPrev + ".next", customNext);
        };
        if ((customFirst !== null) && (customFirst == customId)) {
          localStorage.setItem("custom.first", customNext); customFirst = customNext;
        };
        if ((customLast !== null) && (customLast == customId)) {
          localStorage.setItem("custom.last", customPrev); customLast = customPrev;
        };

        if (localStorage.getItem("custom.first") === "0") {
          localStorage.removeItem("custom.first");
        };
        if (localStorage.getItem("custom.last") === "0") {
          localStorage.removeItem("custom.last");
        };
        localStorage.removeItem("custom." + customId);
        localStorage.removeItem("custom." + customId + ".next");
        localStorage.removeItem("custom." + customId + ".prev");
      }
    })
    // }}}
  };

  // {{{ exports.load = function(new_brush)
  exports.load = function(new_brush) {
    brush.assign( new_brush )
  }
  // }}}

  return exports
})()

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
