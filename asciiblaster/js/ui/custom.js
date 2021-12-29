var custom = (function(){

  var exports = {}
  
  exports.clone = function (){
    var new_brush = brush.clone()
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
