require('Set');
require('classes/compile/Lexer.js');
require('classes/compile/PHP.js');
require('classes/compile/JS.js');

var fs = require('fs');
var data = fs.readFileSync('test.html', 'utf8');

var code = "{%block "+data+ "%}";
//console.log(code);

//var parser = New('classes.compile.Lexer', code, '--');
var parser = New('classes.compile.JS', code);
var text = parser.compile();

console.log(text);

