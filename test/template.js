'use strict';

require('test');

function compress(text) {
    return trim(text.replace(/[ \n\v\f\r\t]+/g, " ") .replace(/<!--.*?-->/g, ''));
}

function trim(text) {
    if(String.prototype.trim && !String.prototype.trim.call("\uFEFF\xA0")) {
        return text == null ? "" : String.prototype.trim.call(text);
    } else {
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        return text == null ? "" : ( text + "" ).replace(rtrim, "");
    }
}

function isEChar(c) {
    return /\s/.test(c);
}

function stringify(code) {
    return '"' + code
        // 单引号与反斜杠转义
        .replace(/("|\\)/g, '\\$1')
        // 换行符转义(windows + linux)
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n') + '"';
}


var Tpl = Set.Class({
    constructor: function() {
        //this.mapFn = 'mapPhpCode';
    },
    isCompress: false,
    bound:{left:'{', right:'}'},
    boundChar: '%',
    command: {cond:1, str:1, echo:1, getv:1, code:1, for:0, foreach:0, if:3, elseif:3, else:3, html:0, block:0, head:0, body:0, phpend:0, script:1},
    mapFn: 'mapPhpTag',
    code: '',
    replaces: ["$out='';", "$out.=", ";\n", "$out"],
    jsReplaces: ''.trim ? ["$out='';", "$out+=", ";", "$out"] : ["$out=[];", "$out.push(", ");", "$out.join('')"],
    concat: ''.trim ? "if(content!==undefined){$out+=content;return content;}" : "$out.push(content);",

    compile: function(code) {
        this.code = code;
        var tokens = this.parseSyntax(code);
        return this.traversal(tokens[1]);
    },

    render: function (id, data) {
        var cache = template.get(id) || _debug({
            id: id,
            name: 'Render Error',
            message: 'No Template'
        });
        return cache(data);
    },
    mapPhpCode: function(gl, tpl) {
        var replaces = this.replaces,
            code = this.code;
        switch (gl.fn) {
/*            case 'str':
                tpl = compress(code.substring(gl.begin, gl.forward));
                break;*/
            case 'phpopen':
                tpl = tpl + "<?php\n" ;+ tpl
                break;
            case 'getv':
                tpl = replaces[1] + this.cmdBody(gl) + replaces[2];
                break;
            case 'echo':
                if(trim(code.substring(gl.begin, gl.forward))=='') tpl = '';
                else
                    tpl = replaces[1] + stringify(compress(code.substring(gl.begin, gl.forward))) + replaces[2];
                break;
            case 'for':
                tpl = "for(" + this.cmdBody(gl.tp.hp) + ') {' + tpl + "}";
                break;
/*            case 'cond':
                tpl = "(" + tpl +") {";
                break;*/
            case 'if':
                tpl = "if(" + this.cmdBody(gl.tp.hp) + ') {' + tpl + "}";
                break;
            case 'elseif':
                tpl = "else if(" + this.cmdBody(gl.tp.hp) + ') {' + tpl + "} ";
                break;
            case 'else':
                tpl = "else(" + this.cmdBody(gl.tp.hp) + ') {' + tpl + "} ";
                break;
            case 'url': break;
            case 'script':
                tpl = replaces[1] + stringify("<script>") + replaces[2] + tpl + replaces[1] + stringify("</script>") + replaces[2];
                break;
            case 'body':
                tpl = replaces[1] + stringify("<body>") + replaces[2] + tpl +  replaces[1] + stringify("</body>") + replaces[2];
                break;
            case 'head':
                tpl = replaces[1] + stringify("<head>") + replaces[2] + tpl + replaces[1] +stringify("</head>") + replaces[2];
                break;
            case 'html':
                tpl = replaces[1] + stringify("<html>") + replaces[2] + tpl + replaces[1] + stringify("</html>") + replaces[2];
                break;
            case 'script':
                tpl = replaces[1] + stringify("<script>") + replaces[2] + tpl + replaces[1] + stringify("</script>") + replaces[2];
                break;
            case 'block':
                break;
            case 'code':
                tpl = compress(this.cmdBody(gl));
                break;
            default : break;
        }

        return tpl;
    },
    map1cmd: function(gl, tpl) {
        var code = this.code;
        switch (gl.fn) {
            case 'str':
                tpl = code.substring(gl.begin, gl.forward) ;//+ tpl
                break;
            case 'cond':
                break;
            case 'block':
                break;
            default : break;
        }

        return tpl;
    },
    mapPhpTag: function(gl, tpl) {
        var replaces = this.replaces,
            code = this.code,
            end = this.end;
        switch (gl.fn) {
            case 'phpend':
                tpl = tpl + "?>" ;+ tpl
                break;
            case 'getv':
                tpl = "<?php echo " + this.cmdBody(gl) + "; ?>";
                break;
            case 'echo':
                tpl = code.substring(gl.begin, gl.forward) ;
                break;
            case 'for':
                tpl = "<?php for(" + this.cmdBody(gl.tp.hp) + ') { ?>' + tpl + "<?php } ?>";
                break;
            case 'if':
                //if(this.cmdBody(gl) != '') ;
                tpl = "<?php if(" + this.cmdBody(gl.tp.hp) + ') { ?>' + tpl + "<?php } ";
                if(end.call(this, gl)) tpl += '?>';
                break;
            case 'elseif':
                tpl = "else if(" + this.cmdBody(gl.tp.hp) + ') { ?>' + tpl + "<?php } ";
                if(end.call(this, gl)) tpl += '?>';
                break;
            case 'else':
                tpl = "else(" + this.cmdBody(gl.tp.hp) + ') { ?>' + tpl + "<?php } ";
                if(end.call(this, gl)) tpl += '?>';
                break;
            case 'url': break;
            case 'script':
                tpl = "<script>" + this.cmdBody(gl) + "</script>" ;
                break;
            case 'body':
                tpl = "<body>" + tpl + "</body>" ;
                break;
            case 'head':
                tpl = "<head>" + tpl + "</head>" ;
                break;
            case 'html':
                tpl = "<html>" + tpl + "</html>" ;
                break;
            case 'block':
                break;
            case 'code':
                tpl = "<?php" + this.cmdBody(gl) + "?>";
                break;
            default : break;
        }

        return tpl;
    },
    parseSyntax: function(code) {
        var boundChar = this.boundChar,
            leftBound = this.bound.left,
            rightBound = this.bound.right,
            command = this.command,
            NODETYPE_STR = 0, NODETYPE_OPEN = 1, NODETYPE_NODE = 2,

            tokens = [], begin = 0, forward = 0,
            forwardChar = '', func = '', codeLength = code.length,
            lastNode = null, currentNode = null, rightBoundBefore;

        while(forward < codeLength) { //每次吃进一个字符，只有边界和命令做为独立单元解析，其他统一当做普通字符串处理
            forwardChar = code.charAt(forward);
            if(forwardChar == leftBound) { //左边界
                forwardChar = code.charAt(++forward); //前进一个字符
                if(forwardChar == boundChar) { //如果左边界定位符匹配，进入命令解析
                    tokens.push({fn:'echo', begin:begin, forward:forward-1, nodeType:NODETYPE_STR}); //推入上一次结束边界到这次开始边界之间字符
                    begin = forward + 1; //起始指针位置加1
                    while(forwardChar = code.charAt(++forward)) {//这个循环寻找命令边界，找到结束，进行下一轮的正常扫描
                        if((isEChar(forwardChar) && trim(code.substring(begin, forward)) != '')
                            || (forwardChar == leftBound && code.charAt(forward+1) == boundChar)
                            || (forwardChar == boundChar && code.charAt(forward+1) == rightBound)) {
                            func = trim(code.substring(begin, forward));

                            if(command[func] == undefined || func == '') {
                                var rowNum = this.getLineNum(code.substring(0, forward)) + 1;
                                Set.Logger.error('function <' + func + '> not exists on <row:'+ rowNum +'>');
                                break;//抛出异常，函数不存在
                            }

                            tokens.push({fn:func, begin:begin, forward:forward, nodeType:NODETYPE_OPEN});
                            begin = forward;
                            forward --; //因为在总循环中forward要加1，所以这里要减去1，否则总循环扫描将错过一个字符
                            break;
                        }
                    }
                }
            } else if(forwardChar == rightBound) {//右边界
                forwardChar = code.charAt(forward - 1); //回溯匹配边界字符
                if(forwardChar == boundChar) {//碰到close边界出栈一个open边界，和边界之前的字符命令
                    rightBoundBefore = {fn:'echo', begin:begin, forward:forward-1, nodeType:NODETYPE_STR};
                    tokens.push(rightBoundBefore);
                    lastNode = currentNode = null;
                    while(currentNode = tokens.pop()) {
                        if(currentNode.nodeType == NODETYPE_OPEN) {
                            currentNode.tp = lastNode;
                            break;
                        } else {
                            currentNode.hp = lastNode;
                            lastNode = currentNode;
                        }
                    }

                    if(currentNode == null) {
                        var rowNum = this.getLineNum(code.substring(0, rightBoundBefore.forward)) + 1;
                        Set.Logger.error('open brace match error on <row:'+ rowNum +'>');
                    }
                    currentNode.nodeType = NODETYPE_NODE;
                    if(command[currentNode.fn] == NODETYPE_OPEN) {
                        rightBoundBefore.fn = 'str';
                    }
                    tokens.push(currentNode);
                    begin = forward + 1;
                }
            }
            forward++;
        }
        tokens.push({fn:'echo', begin:begin, forward:forward, nodeType:0});
        if(tokens.length>3) {
            var ln = tokens.length;
            while(ln-- >= 0) {
                if(tokens[ln].nodeType == NODETYPE_OPEN) {
                    var rowNum = this.getLineNum(code.substring(0, tokens[ln].forward)) + 1;
                    Set.Logger.error('close brace match error on <row:'+ rowNum +'>');
                }
            }
        }
        return tokens;
    },
    end: function(gl) {
        var end = true;
        while(gl = gl.hp) {
            if(this.command[gl.fn] == 3) {
                end = false;
            }
        }
        return end;
    },
    cmdBody: function(gl) {
        var mapFn = this.mapFn;
        this.mapFn = 'map1cmd';
        var tpl = this.traversal(gl.tp);
        this.mapFn = mapFn;
        return tpl;
    },
    traversal: function(gl) {
        if(!gl) return '';
        return this[this.mapFn](gl, this.traversal(gl.tp)) + this.traversal(gl.hp);
    },
    getLineNum: function(code) {
        var m = code.match(/\r\n/g);
        if(m) return m.length;
        return 0;
    }


});

var fs = require('fs');
fs.readFile('tmp.html', 'utf8', function (err, data) {
    if (err) throw err;
    var code = "{%block " + data + "%}";
    var cmp = new Tpl();


    fs.writeFile('message.html', cmp.compile(code), function (err) {
        if (err) throw err;
        console.log('It\'s saved!'); //文件被保存
    });
});

/**
 * 模板引擎
 * 若第二个参数类型为 String 则执行 compile 方法, 否则执行 render 方法
 * @name    template
 * @param   {String}            模板ID
 * @param   {Object, String}    数据或者模板字符串
 * @return  {String, Function}  渲染好的HTML字符串或者渲染方法
 */
var template = function (id, content) {
    return template[
        typeof content === 'string' ? 'compile' : 'render'
    ].apply(template, arguments);
};

template.isEscape = true;    // HTML字符编码输出开关
template.isCompress = false; // 剔除渲染后HTML多余的空白开关
var _cache = template.cache = {};
/**
 * 渲染模板
 * @name    template.render
 * @param   {String}    模板ID
 * @param   {Object}    数据
 * @return  {String}    渲染好的HTML字符串
 */
template.render = function (id, data) {
    var cache = template.get(id) || _debug({
        id: id,
        name: 'Render Error',
        message: 'No Template'
    });
    return cache(data);
};

/**
 * 编译模板
 * 2012-6-6 @TooBug: define 方法名改为 compile，与 Node Express 保持一致
 * @name    template.compile
 * @param   {String}    模板ID (可选，用作缓存索引)
 * @param   {String}    模板字符串
 * @return  {Function}  渲染方法
 */
template.compile = function (id, source) {
    var params = arguments;
    var anonymous = 'anonymous';
    
    if (typeof source !== 'string') {
        source = params[0];
        id = anonymous;
    }

    try {
        var Render = _compile(id, source); //编译时错误
    } catch (e) {
        e.id = id || source;
        e.name = 'Syntax Error';
        _debug(e);
        throw(e);
    }

    function render (data) {
        try {
            return new Render(data, id) + ''; //运行时错误捕捉
        } catch (e) {
            _debug(e)();
            throw(e);
        }
    }

    render.prototype = Render.prototype;
    render.toString = function () {
        return Render.toString();
    };

    if (id !== anonymous) {
        _cache[id] = render;
    }
    return render;
};

// 获取模板缓存
template.get = function (id) {
    var cache;
    if (_cache.hasOwnProperty(id)) {
        cache = _cache[id];
    } else if ('document' in global) {
        var elem = document.getElementById(id);
        if (elem) {
            var source = elem.value || elem.innerHTML;
            cache = template.compile(id, source.replace(/^\s*|\s*$/g, ''));
        }
    }
    return cache;
};

// 模板调试器
var _debug = function (e) {
    template.onerror(e);
    return function () {
        return '{Template Error}';
    };
};

var _compile = (function () {
    // 数组迭代
    return function (id, source) {
        var prototype = {};

        var isNewEngine = ''.trim;// '__proto__' in {}
        var replaces = isNewEngine
            ? ["$out='';", "$out+=", ";", "$out"]
            : ["$out=[];", "$out.push(", ");", "$out.join('')"];
        var concat = isNewEngine
            ? "if(content!==undefined){$out+=content;return content;}"
            : "$out.push(content);";

     /*
     * 需要增加include方法和print方法
     * */
        var code = source,
            tempCode = replaces[0],
            l = code.length,
            i = 0,
            currChar = '',
            currFunc = '',
            nfChar = '',
            setLBound = '(',
            setRBound = ')',
            setLBlock = '{',
            setRBlock = '}',
            lastC = 0,
            fTbl = {cond:1, echo:1, getv:1, code:1, for:0, foreach:0, if:0, elseif:0, else:0};
        while(i<l) {
            currChar = code.charAt(i);
            switch(currChar) {
                case setLBound:
                    if(!isEString(nfChar)) tempCode += mapping({f:'echo', v:nfChar, p:-1});
                    currFunc = getFunc(code, i);
                    tempCode += mapping(currFunc);
                    i = currFunc.p; nfChar = ''; break;
                case setRBound:
                    if(!isEString(nfChar)) tempCode += mapping({f:'echo', v:nfChar, p:-1});
                    tempCode += setRBlock; nfChar = ''; break;
                default: nfChar += currChar; break;
            }
            i++;
        }
        if(!isEString(nfChar)) tempCode += mapping({f:'echo', v:nfChar, p:-1});

        tempCode+='return new String(' + replaces[3] + ');';
        try {
            var Render = new Function("$data", "$id", tempCode);
            Render.prototype = prototype;
            return Render;
        } catch (e) {
            e.temp = "function anonymous($data,$id) {" + tempCode + "}";
            throw e;
        }

        function getFunc(input, pos) {//pos为 ( 的位置
            var func = '',
                fVal = '',
                currChar = '',
                stack = 1,
                end = 0;
            while(currChar=input.charAt(++pos)) {
                if(end) break;//在这步结束之前多扫了一个字符
                if(isEChar(currChar)&&trim(func)!='' || currChar=='(') {
                    func = trim(func);
                    if(fTbl[func]){//如果是终结作用，终结作用右侧不应该有作用
                        while(currChar=input.charAt(++pos)) {
                            if(currChar==setLBound){
                                stack++;
                            } else if(currChar==setRBound) {//终结作用集结束
                                stack--;
                            }
                            if(stack==0){//栈空结束
                                end = 1;
                                fVal = trim(fVal);
                                break;
                            }
                            fVal += currChar;
                        }
                    } else {
                        break;
                    }
                } else {
                    func += currChar;
                }
            }
            return {f:func, v:fVal, p:pos-1};
        }

        function mapping(func) {
            var partialTpl = '';
            switch(func.f) {
                case 'cond':
                    partialTpl = setLBound+ func.v +setRBound+setLBlock;
                    break;
                case 'echo':
                    partialTpl = template.isCompress ? partialTpl = compress(func.v) : func.v;
                    partialTpl = replaces[1]+ stringify(partialTpl) +replaces[2];
                    break;
                case 'getv':
                    partialTpl = replaces[1]+ func.v +replaces[2];
                    break;
                case 'code':
                    partialTpl = func.v;
                    break;
                case 'for':
                    partialTpl = 'for';
                    break;
                case 'foreach':
                    partialTpl = 'foreach';
                    break;
                case 'if':
                    partialTpl = 'if';
                    break;
                case 'elseif':
                    partialTpl = 'else if';
                    break;
                case 'else':
                    partialTpl = 'else';
                    break;
            }

            return partialTpl;

        }

        function trim(text) {
            if(String.prototype.trim && !String.prototype.trim.call("\uFEFF\xA0")) {
                return text == null ? "" : String.prototype.trim.call(text);
            } else {
                var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
                return text == null ? "" : ( text + "" ).replace(rtrim, "");
            }
        }

        function isEChar(c) {
            return /\s/.test(c);
        }

        function isEString(c) {
            return !/\S/.test(c);
        }

        function compress(text) {
            return text.replace(/[ \n\v\f\r\t]+/g, " ") .replace(/<!--.*?-->/g, '');
        }

        // 字符串转义
        function stringify (code) {
            return "'" + code
                // 单引号与反斜杠转义
                .replace(/('|\\)/g, '\\$1')
                // 换行符转义(windows + linux)
                .replace(/\r/g, '\\r')
                .replace(/\n/g, '\\n') + "'";
        };
    };
})();
    ////////////////////////////////////////////////////////////////////////
// 辅助方法集合
    var _helpers = template.helpers = {
        $include: template.render,
        $string: function (value, type) {
            if (typeof value !== 'string') {
                type = typeof value;
                if (type === 'number') {
                    value += '';
                } else if (type === 'function') {
                    value = _helpers.$string(value());
                } else {
                    value = '';
                }
            }
            return value;
        },

        $escape: function (content) {
            var m = {
                "<": "&#60;",
                ">": "&#62;",
                '"': "&#34;",
                "'": "&#39;",
                "&": "&#38;"
            };
            return _helpers.$string(content)
                .replace(/&(?![\w#]+;)|[<>"']/g, function (s) {
                    return m[s];
                });
        },

        $each: function (data, callback) {
            var isArray = Array.isArray || function (obj) {
                return ({}).toString.call(obj) === '[object Array]';
            };

            if (isArray(data)) {
                for (var i = 0, len = data.length; i < len; i++) {
                    callback.call(data, data[i], i, data);
                }
            } else {
                for (i in data) {
                    callback.call(data, data[i], i);
                }
            }
        }
    };

    /**
     * 模板错误事件
     * @name    template.onerror
     * @event
     */
    template.onerror = function (e) {
        var message = 'Template Error\n\n';
        for (var name in e) {
            message += '<' + name + '>\n' + e[name] + '\n\n';
        }
        if (global.console) {
            console.error(message);
        }
    };

// RequireJS && SeaJS
if (typeof define === 'function') {
    define(function() {
        return template;
    });

// NodeJS
} else if (typeof exports !== 'undefined') {
    module.exports = template;
}

global.template = template;


/*
* 模板放置位置
* 模板新增方法
* 模板管理
* 模板引入
* 模板加载
*
*
* */

