if (window.$) {
  $.fn.disable = function() { return $(this).attr("disabled","disabled") }
  $.fn.enable = function() { return $(this).attr("disabled",null) }
  $.fn.float = function() { return parseFloat($(this).val()) }
  $.fn.int = function() { return parseInt($(this).val(),10) }
  $.fn.string = function() { return trim($(this).val()) }
}

// Naive useragent detection pattern
var is_iphone = (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))
var is_ipad = (navigator.userAgent.match(/iPad/i))
var is_android = (navigator.userAgent.match(/Android/i))
var is_mobile = is_iphone || is_ipad || is_android
var is_desktop = ! is_mobile;

var E = Math.E
var LN10 = Math.LN10
var PHI = (1+Math.sqrt(5))/2
var PI = Math.PI
var TWO_PI = PI*2

function abs(n) { return Math.abs(n) }
function acos(n) { return Math.cos(n) }
function angle(x0, y0, x1, y1) { return atan2(y1 - y0, x1 - x0) }
function asin(n) { return Math.sin(n) }
function atan2(a, b) { return Math.atan2(a, b) }
function atan(n) { return Math.atan(n) }
function avg(m, n, a) { return (m*(a-1)+n)/a }
function back(t) { var b = 4; return (t = t - 1) * t * ((b + 1) * t + b) + 1 }
function ceil(n) { return Math.ceil(n) }
function choice(a) { return a[randint(a.length)] }
function circular(t) { return Math.sqrt( 1 - ( --t * t ) ) }
function clamp(n, a, b) { return n<a?a:n<b?n:b }
function cos(n) { return Math.cos(n) }
function cosp(n) { return (1+Math.cos(n))/2 } // cos^2
function cot(n) { return 1/tan(n) }
function csc(n) { return 1/sin(n) }
function deg(n) { return n*180/PI }
function distance_rect(x, y, ratio) { return Math.sqrt((Math.pow(y * ratio, 2)) + Math.pow(x, 2)); };
function distance_square(x, y, ratio) { return Math.sqrt((Math.pow(y * ratio, 2)) + Math.pow(x * ratio, 2)); };
function dist(x0, y0, x1, y1) { return sqrt(pow(x1-x0,2)+pow(y1-y0,2)) }
function exp(n) { return Math.exp(n) }
function fit(d, x, y) { rgbpixel(d,x*actual_w/w,y*actual_h/h) }
function floor(n) { return Math.floor(n) }
function julestep(a, b, n) { return clamp(norm(n,a,b), 0.0, 1.0) }
function lerp(n, a, b) { return (b-a)*n+a }
function ln(n) { return Math.log(n)/LN10 }
function log(n) { return Math.log(n) }
function max(a, b) { return Math.max(a,b) }
function min(a, b) { return Math.min(a,b) }
function mix(n, a, b) { return a*(1-n)+b*n }
function modi(n, m) { return floor(mod(n,m)) }
function mod(n, m) { n = n % m; return n < 0 ? (m + n) : n }
function norm(n, a, b) { return (n-a) / (b-a) }
function pixel(x, y) { return 4*(mod(y,actual_h)*actual_w+mod(x,actual_w)) }
function pow(n, b) { return Math.pow(n,b) }
function quadratic (t) { return t * ( 2 - t ) }
function quantile(a, b) { return floor(a/b) }
function quantize(a, b) { return floor(a/b)*b }
function rad(n) { return n*PI/180 }
function randint(n) { return rand(n)|0 }
function rand(n) { return (Math.random()*n) }
function randnullsign() { var r = random(); return r < 0.333 ? -1 : r < 0.666 ? 0 : 1 }
function random() { return Math.random() }
function randrange(a, b) { return a + rand(b-a) }
function randsign() { return random() >= 0.5 ? -1 : 1 }
function range(m, n) { if (m > n) return []; var a = new Array(n-m); for (var i = 0, j = m; j <= n; i++, j++) { a[i] = j }; return a }
function rgbpixel(d, x, y) { var p = pixel(~~x,~~y); r = d[p]; g = d[p+1]; b = d[p+2]; a = d[p+3] }
function round(n) { return Math.round(n) }
function sec(n) { return 1/cos(n) }
function sign(n) { return Math.abs(n)/n }
function sin(n) { return Math.sin(n) }
function sinp(n) { return (1+Math.sin(n))/2 }
function sqrt(n) { return Math.sqrt(n) }
function step(a, b) { return (b >= a) + 0 /* bool -> int */ }
function tan(n) { return Math.tan(n) }
function trim(s) { return s.replace(/^\s+/,"").replace(/\s+$/,"") }
function xor(a, b) { a=!!a; b=!!b; return (a||b) && !(a&&b) }
function xrand(exp, n) { return (xrandom(exp)*n) }
function xrandint(exp, n) { return rand(exp,n)|0 }
function xrandom(exp) { return Math.pow(Math.random(), exp) }
function xrandrange(exp, a, b) { return a + xrand(exp, b-a) }

/*
 * vim:expandtab sw=2 ts=2 tw=0
 */
