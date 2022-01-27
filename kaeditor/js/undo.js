var undo = (function() {
  let
      diffLevel = 0,
      diffMax = 256 ** 1024,  // ~17M w/o list overhead = 256K * ~68 bytes ((4 * 8) + (1 * (4 * 8)) + (1 * 4))
      diffStack = [],
      exports = {};

  // {{{ function undoCell(diffCell, redo)
  function undoCell(diffCell, redo) {
    let
        x = diffCell[0],
        y = diffCell[1];

    canvas.aa[y][x].bg += (redo ? (diffCell[2] * -1) : diffCell[2]);
    canvas.aa[y][x].fg += (redo ? (diffCell[3] * -1) : diffCell[3]);
    canvas.aa[y][x].char = (redo ? diffCell[5] : diffCell[4]);
    canvas.aa[y][x].underline = (redo ? diffCell[7] : diffCell[6]);
    canvas.aa[y][x].build();
  };
  // }}}

  // {{{ let newUndo = function()
  let newUndo = function() {
    if (diffLevel > 0) {
      diffStack.splice(diffStack.length - diffLevel);
      diffLevel = 0;
    };
    if (diffStack.length >= diffMax) {
      diffStack.splice(0, ((diffMax - diffStack.length) + 1));
    };

    diffStack.push([]);
  };
  // }}}
  // {{{ let push = function(newBg, newFg, newChar, newUnderline, canvas, canvasX, canvasY)
  let push = function(newBg, newFg, newChar, newUnderline, canvas, canvasX, canvasY) {
    let
        canvasCell = canvas.aa[canvasY][canvasX],
        diffIdx = diffStack.length - 1;

    if (!(diffIdx >= 0)) {
      console.assert(false, "diffIdx >= 0");
      return false;
    } else {
      diffStack[diffIdx].push([
        canvasX, canvasY,
        canvasCell.bg - newBg,
        canvasCell.fg - newFg,
        canvasCell.char, newChar,
        canvasCell.underline, newUnderline,
      ]);
    };
  };
  // }}}
  // {{{ let resize = function(newHeight, newWidth, canvas)
  let resize = function(newHeight, newWidth, canvas) {
    newUndo();
    let
        diffIdx = diffStack.length - 1;

    if (!(diffIdx >= 0)) {
      console.assert(false, "diffIdx >= 0");
      return false;
    } else {
      diffStack[diffIdx].push([
        "resize",
        canvas.h, newHeight,
        canvas.w, newWidth,
      ]);
    };
  };
  // }}}
  // {{{ let undo = function(canvas, redo=false)
  let undo = function(canvas, redo=false) {
    if (diffStack.length === 0) {
      return false;
    } else if (!(diffLevel <= diffStack.length)) {
      console.assert(false, "diffLevel <= diffStack.length");
      diffLevel = diffStack.length;
      return false;
    } else if ((!redo && (diffLevel === diffStack.length)) || (redo && (diffLevel <= 0))) {
      return false;
    } else {
      let
          diffOffset = redo
            ? (diffLevel - 1)
            :  diffLevel,
          diffStack_ = diffStack[diffStack.length - diffOffset - 1];

      if (!redo) {
        if (diffStack_[0][0] === "resize") {
          // XXX restore cells
          canvas.resize(diffStack_[0][3], diffStack_[0][1], true);
        } else {
          diffStack_.reduceRight((_, diffCell) => undoCell(diffCell, redo), null);
        };
      } else {
        if (diffStack_[0][0] === "resize") {
          // XXX restore cells
          canvas.resize(diffStack_[0][4], diffStack_[0][2], true);
        } else {
          diffStack_.forEach(function(diffCell) { undoCell(diffCell, redo); });
        };
      };

      diffLevel = redo
        ? max(diffLevel - 1, -1)
        : min(diffLevel + 1, diffStack.length);
    };
  };
  // }}}

  exports.newUndo = newUndo;
  exports.push = push;
  exports.redo = function(canvas) { undo(canvas, redo=true); };
  exports.resize = resize;
  exports.undo = undo;

  return exports;
})();

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
