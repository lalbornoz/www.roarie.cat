var dither = {
  aa: '▓▒░ ',
  a: '▓',
  b: '▒',
  c: '░',
  d: ' ',
  p: function(n) {
    return dither.aa[Math.floor(Math.abs(n) % 4)]
  }
}

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
