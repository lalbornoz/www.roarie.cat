var custom = (function(){

  var exports = {}
  
  exports.clone = function (fromSelection=false){
    console.log(selection.a)
    var new_brush = null
    if (!fromSelection) {
      new_brush = brush.clone()
    } else {
      if (!(selection.a[0] === 0 && selection.a[1] === 0 && selection.b[0] === 0 && selection.b[1] === 0)) {
        new_brush = new Matrix((selection.b[0] + 1) - selection.a[0], (selection.b[1] + 1) - selection.a[1], function(x,y){
          var cell = canvas.getCell(x + selection.a[0], y + selection.a[1]).clone()
          if (cell.fg === 99 && cell.bg === 99 && cell.opacity === 0) {
            cell.fg = 0; cell.bg = 1
          }
          return cell
        })
      } else {
        return false
      }
    }
    var rapper = document.createElement("div")
    rapper.className = "custom"
    new_brush.append(rapper)
    custom_rapper.appendChild(rapper)
    // store in localstorage?
    rapper.addEventListener("click", function(e){
      if (!e.shiftKey) {
        // load this brush
        exports.load(new_brush)
      } else {
        while (rapper && rapper.firstChild) {
          rapper.removeChild(rapper.firstChild)
        }
        rapper.parentNode.removeChild(rapper)
      }
    })
  }
  
  exports.load = function(new_brush){
    brush.assign( new_brush )
  }
  
  return exports

})()
