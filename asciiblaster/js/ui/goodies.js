var goodies = (function(){
  var goodies = {}

  goodies.build = () => {
    Object.keys(goodies.list).map(() => {
      goodies_rapper.appendChild(tool_canvas.el)
    })
  }

  goodies.list = {}

  goodies.list.choppy = {
    mode: 'brush',
    fn: `var char = choice("      abcdef      ")
        lex.bg = +choice("0124")
        lex.fg = +choice("01234")
        lex.char = char
        lex.opacity = char == " " ? 0 : 1`,
  }

  goodies.list.foggy = {
    mode: 'brush',
    fn: `var char = choice("      abcdef      ")
        lex.bg = choice([14,15])
        lex.fg = choice("367")
        lex.char = char
        lex.opacity = char == " " ? 0 : 1`,
  }
  // goodies.list.name = {
  //   fn: ``,
  // }
  // goodies.list.name = {
  //   fn: ``,
  // }
  // goodies.list.name = {
  //   fn: ``,
  // }
  // goodies.list.name = {
  //   fn: ``,
  // }

// >> mirror brush (up-down)

// NOTE: Animate this on the canvas, then draw:

// if (x > h/2) {
//   lex.assign( canvas.aa[h-y][x] )
// }



// >> rainbow stardust brush

// Uncheck BG and animate this to brush:

// lex.fg = hue(t)
// lex.char = choice("            ,'.,.','******    ")



// >> noise brushes, works on a black background:

// lex.bg = max(5, yellow(randint(t)))
// lex.opacity = lex.bg == colors.black ? 0 : 1



// >> simple rainbow:

// if (lex.bg != 1) lex.bg = randint(t)
// lex.opacity = lex.bg == colors.black ? 0 : 1



// >> self-erasing:

// if (lex.bg != 1) lex.bg = yellow(randint(t))
// lex.opacity = lex.bg == colors.black ? 0 : 1



// >> cycling rainbow brush

// if (lex.bg != 1) lex.bg = hue( all_color_hue_order.indexOf( color_names[ lex.bg ] ) + 1 )
// lex.opacity = lex.bg == colors.black ? 0 : 1



// >> "stars" brush.. set your brush to paint just the character "#"

// if (lex.char == "#") {
//   lex.fg = hue(randint(15))
//   lex.char = random() > 0.1 ? " " : "+@*.,\"+'*-"[randint(10)]
// }



// >> use fg char to mask mask what you're drawing on the bg

// if (lex.char != "/") { lex.bg = 1 }



// >> sharded glitch brush

// Use on a brush:

// lex.bg = t/y/x
// lex.opacity = lex.bg % 1 ? 0 : 1



// >> incremental brush

// Set your brush to be the ^ character, square, about 10x10
// Draw "char" only
// Then animate this shader on the canvas:

// if (lex.char=="^") {
//   lex.bg += 1
//   lex.char = " "
// }
// lex.bg += 1





  return goodies
})
