(function () {
    var Util = {Timer: function (delay, fn) {
        var isLive = false, currTimerId, startTime, stopTime;

        function getCurrTime() {
            return new Date().getTime()
        }

        return{delay: function () {
            return delay
        }, isRunning: function () {
            return isLive
        }, start: function () {
            var self = this;
            isLive = true;
            if (currTimerId) {
                clearTimeout(currTimerId)
            }
            currTimerId = setTimeout(function () {
                if (fn) {
                    fn()
                }
                self.start()
            }, delay);
            return this
        }, stop: function () {
            clearTimeout(currTimerId);
            isLive = false;
            return this
        }, setDelay: function (_delay) {
            delay = _delay
        }, reset: function () {
            currTimerId || this.start();
            return this
        }, startTiming: function () {
            startTime = getCurrTime();
            return this
        }, stopTiming: function () {
            stopTime = getCurrTime();
            return this
        }, getTimeM: function () {
            return stopTime - startTime
        }, getTimeS: function () {
            return Math.round((stopTime - startTime) / 1000)
        }, setCurrTimerId: function (timerId) {
            currTimerId = timerId
        }}
    }, extend: function () {
        var target = arguments[0], overrideAttr = true, i = 1, length = arguments.length, copy, options, name;
        if (typeof target === "boolean") {
            overrideAttr = target;
            target = arguments[1] || {};
            i = 2
        }
        if (length == i) {
            return target || {}
        }
        for (; i < length; i++) {
            options = arguments[i];
            for (name in options) {
                if (overrideAttr && (target[name] !== undefined)) {
                    continue
                }
                target[name] = options[name]
            }
        }
        return target
    }, send: function (url) {
        var img = new Image(1, 1);
        img.onload = img.onerror = img.onabort = function () {
            img.onload = img.onerror = img.onabort = null;
            img = null
        };
        img.src = url
    }, addParams: function (params) {
        var arr = [];
        for (var i in params) {
            arr.push(i + "=" + params[i])
        }
        return arr.join("&")
    }, getCookie: function (name) {
        var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
        if (arr != null) {
            return unescape(arr[2])
        }
        return""
    }, addCookie: function (e, t, i) {
        i = i || {};
        if (t === null) {
            t = "";
            i.expires = -1
        }
        var a = "";
        if (i.expires && (typeof i.expires == "number" || i.expires.toUTCString)) {
            var s;
            if (typeof i.expires == "number") {
                s = new Date;
                s.setTime(s.getTime() + i.expires * 24 * 60 * 60 * 1000)
            } else {
                s = i.expires
            }
            a = "; expires=" + s.toUTCString()
        }
        var n = i.path ? "; path=" + i.path : "";
        var o = i.domain ? "; domain=" + i.domain : "";
        var r = i.secure ? "; secure" : "";
        document.cookie = [e, "=", encodeURIComponent(t), a, n, o, r].join("")
    }, getBroswerUrl: function () {
        return encodeURIComponent(window.location.href)
    }, getUUID: function () {
        if (this.uuid != undefined) {
            return this.uuid
        }
        var uuid = "1" + String(new Date().getTime()).slice(4) + String(Math.random()).slice(-6);
        return this.uuid = uuid
    }, getLC: function () {
        var lc = Util.getCookie("tj_lc");
        if (lc == "") {
            var lc = "", i = 32;
            while (i--) {
                lc += Math.floor(Math.random() * 16).toString(16)
            }
            var t = new Date();
            t.setFullYear(t.getFullYear() + 20);
            Util.addCookie("tj_lc", lc, {expires: t, domain: ".letv.com", path: "/"})
        }
        return lc
    }, paramstr: function (d) {
        var arr = [];
        for (var p in d) {
            var item = p + "=" + d[p];
            arr.push(item)
        }
        var str = arr.join("&");
        return str
    }, checkParam: function (w) {
        if (w == undefined) {
            return""
        }
        var res = w;
        var wlen = w.length;
        var oneEmem = w.substr(wlen - 1, 1);
        var twoEmem = w.substr(wlen - 2, 2);
        if (oneEmem == "%") {
            res = 0
        } else {
            if (twoEmem == "px") {
                res = w.substr(0, wlen - 2)
            }
        }
        return res
    }};

    function initGlobalObj() {
        Query = GUELib.Query;
        Query.initQuery()
    }

    function isPcPlatform(ReviveSWF, GUELib, option) {
        var isPcPlatform = false, platformType = ReviveSWF, videoAble = !!document.createElement("video").canPlayType;
        if (!!option.type) {
            if (option.type == "video") {
                isPcPlatform = !1
            } else {
                if (option.type == "flash") {
                    isPcPlatform = !0
                }
            }
        } else {
            if (platformType.flashPlat.win) {
                isPcPlatform = navigator.userAgent.indexOf("WebView") > -1 || navigator.userAgent.indexOf("WPDesktop") > -1 ? false : true
            } else {
                if (platformType.flashPlat.mac) {
                    isPcPlatform = true
                } else {
                    if (GUELib.Support.linux) {
                        if (platformType.swfPlayEnable(10)) {
                            isPcPlatform = true
                        } else {
                            if (videoAble) {
                                isPcPlatform = false
                            }
                        }
                    } else {
                        isPcPlatform = false
                    }
                }
            }
        }
        if (Query.get("dbd") == "LETV") {
            isPcPlatform = false
        }
        if (window.letvcloud_player_conf && letvcloud_player_conf["dbd"] == "LETV") {
            isPcPlatform = false
        }
        return isPcPlatform
    }

    function getHtmlConf() {
        document.title = Query.get("title") || "乐视云";
        var option = {w: Query.get("width") || 750, h: Query.get("height") || 422, vu: Query.get("vu"), uu: Query.get("uu"), pu: Query.get("pu"), parentId: "player", autoplay: Query.get("auto_play"), version: 10, swf: null, flashvars: Query.getall("string")};
        if (Query.get("payer_name")) {
            option.payer_name = Query.get("payer_name")
        }
        if (Query.get("check_code")) {
            option.check_code = Query.get("check_code")
        }
        if (option.w == "100%") {
            option.w = 0
        }
        if (option.h == "100%") {
            option.h = 0
        }
        return option
    }

    function getJsConf() {
        var scripts = window.document.getElementsByTagName("script"), dScript = scripts[scripts.length - 1], depend = dScript.getAttribute("depend"), data = dScript.getAttribute("data"), option = null;
        if (data) {
            data = eval("(" + data + ")");
            option = {w: Util.checkParam(data.width), h: Util.checkParam(data.height), vu: data.vu, uu: data.uu, autoplay: data.auto_play, version: 10, swf: null, flashvars: Util.paramstr(data), parentId: "playerbox" + ("" + Math.random()).split(".")[1]};
            if (data.payer_name != undefined) {
                option.payer_name = data.payer_name
            }
            if (data.check_code != undefined) {
                option.check_code = data.check_code
            }
            if (data.callback != undefined) {
                option.callback = data.callback
            }
            if (data.type != undefined) {
                option.type = data.type
            }
        }
        return option
    }

    function getConf() {
        var conf = null;
        if (window.domainname == undefined) {
            option = getHtmlConf()
        } else {
            option = getJsConf()
        }
        option.cf = (GUELib.Support.ipad || GUELib.Support.ipod || GUELib.Support.iphone) ? "html5_ios" : "html5";
        option.url = "http://api.letvcloud.com/gpc.php?cf=" + option.cf + "&sign=signxxxxx&ver=2.1&format=jsonp&pver=html5_1.1.1&bver=" + encodeURIComponent(getBrowserVersion()) + "&uuid=" + Util.getUUID();
        var customPlayer = "http://yuntv.letv.com/bcloud.swf";
        if (typeof _user_defined != "undefined") {
            _user_defined[option.uu] && (customPlayer = _user_defined[option.uu][option.pu || "default"])
        }
        option.swf = customPlayer;
        return option
    }

    function play() {
        var option = getConf();
        if (option && !option.vu) {
            return alert("视频不存在")
        }
        var w = option.w ? option.w + "px" : "100%", h = option.h ? option.h + "px" : "100%";
        document.write('<div id="' + option.parentId + '" style="width:' + w + ";height:" + h + ';margin-right:auto;margin-left:auto;"></div>');
        if (window.ReviveSWF == undefined) {
            ReviveSWF = null
        }
        var checkTest = isPcPlatform(ReviveSWF, GUELib, option);
        if (checkTest) {
            ReviveSWF.echo(option.parentId, option)
        } else {
            initHTML5Player(GUELib, option)
        }
    }

    function initHTML5Player(GUELib, option) {
        var reportor = new Reportor();
        reportor.init();
        reportor.sendEnvInfo({});
        reportor.startTiming();
        var addParam = {vu: option.vu, uu: option.uu};
        if (typeof option.payer_name != "undefined" && typeof option.check_code != "undefined") {
            addParam = {vu: option.vu, uu: option.uu, payer_name: option.payer_name, check_code: option.check_code}
        }
        GUELib.GetJSON(option.url, addParam, function (reqData) {
            reportor.stopTiming();
            var ut = reportor.timer.getTimeM();
            if (reqData.code) {
                reportor.sendPlayAction({ac: "init", pt: 0, err: 1, ut: ut});
                if (option.callback) {
                    window[option.callback](null)
                }
                GUELib.Video.setup(option.parentId, [], option.w, option.h);
                return alert("不合法请求!")
            }
            reportor.initVideoInfo(reqData, option);
            reportor.sendPlayAction({ac: "init", pt: 0, err: 0, ut: ut});
            setupPlayer(reportor, option, reqData)
        })
    }

    function setupPlayer(reportor, option, reqData) {
        var videoData = reqData.data.video_info;
        var mediaInfo = videoData.default_play;
        var videoPlayer = GUELib.Video.setup(option.parentId, [], option.w, option.h, {"event": {"playing": function () {
            reportor.turnOnPlayingStatus();
            reportor.startTiming();
            if (reportor.firstPlay) {
                reportor.turnOffFirstPlaystatus();
                reportor.sendPlayAction({ac: "play", pt: 0, err: 0, ut: 1})
            }
            if (reportor.isEndedBefore) {
                reportor.emptyChunkQueue();
                reportor.stopTimer();
                reportor.startTimer();
                reportor.turnOffEndStatus()
            }
        }, "waiting": function () {
            reportor.setTimeChunkPaused()
        }, "seeking": function () {
            reportor.setTimeChunkPaused()
        }, "pause": function () {
            reportor.setTimeChunkPaused()
        }, "ended": function () {
            reportor.sendEndAction()
        }, "abort": function () {
            reportor.sendEndAction()
        }}});
        reportor.video = videoPlayer.video;
        var crtMain_url = videoData.media[mediaInfo].play_url.main_url;
        if (option.callback) {
            videoPlayer.source(BaseCode.decode(crtMain_url));
            reportor.sendPlay();
            window[option.callback](videoPlayer.video)
        } else {
            videoPlayer.getSource(videoData);
            var crtPoster = reqData.data.play_info.init_pic;
            if (crtPoster != "" || crtPoster != null) {
                videoPlayer.poster(crtPoster);
                videoPlayer.source(BaseCode.decode(crtMain_url))
            } else {
                if (option.autoplay != "0") {
                    videoPlayer.video.autoplay = "autoplay";
                    videoPlayer.play()
                } else {
                    videoPlayer.video.autoplay = ""
                }
            }
        }
    }

    function Reportor() {
        var uuid = Util.getUUID(), lc = Util.getLC(), config = {envUrl: "http://dc.letv.com/env/?", playUrl: "http://dc.letv.com/pl/?"};
        return{timer: null, timeChunkQueue: [], playStartTime: 0, actStartTime: 0, firstPlay: true, videoInfo: {vid: "", vlen: 0, ch: "", ap: 1}, video: null, isPlayingBefore: false, isEndedBefore: true, turnOnPlayingStatus: function () {
            this.isPlayingBefore = true
        }, turnOffPlayingStatus: function () {
            this.isPlayingBefore = false
        }, turnOffFirstPlaystatus: function () {
            this.firstPlay = false
        }, turnOnEndStatus: function () {
            this.isEndedBefore = true
        }, turnOffEndStatus: function () {
            this.isEndedBefore = false
        }, emptyChunkQueue: function () {
            this.timeChunkQueue = []
        }, init: function () {
            var self = this;
            this.timer = new Util.Timer(180000, function () {
                self.sendTimeAction()
            })
        }, startTimer: function () {
            var self = this;
            var timerId = setTimeout(function () {
                self.sendTimeAction();
                var vlen = self.getVideoLenM();
                if (vlen < 3) {
                    self.timer.setDelay(30000)
                } else {
                    if (vlen < 10) {
                        self.timer.setDelay(60000)
                    } else {
                        self.timer.setDelay(180000)
                    }
                }
                self.timer.start()
            }, 15000);
            this.timer.setCurrTimerId(timerId)
        }, stopTimer: function () {
            if (this.timer != null) {
                this.timer.stop()
            }
        }, startTiming: function () {
            this.timer.startTiming()
        }, stopTiming: function () {
            this.timer.stopTiming()
        }, setTimeChunkPaused: function () {
            this.setTimeChunk();
            this.turnOffPlayingStatus()
        }, setTimeChunk: function () {
            if (this.video && !this.video.paused) {
                this.isPlayingBefore = true
            }
            if (this.isPlayingBefore) {
                var time = this.timer.stopTiming().getTimeM();
                this.timeChunkQueue.push(time)
            }
            this.startTiming()
        }, initVideoInfo: function (reqData, option) {
            var ac = option.ac;
            if (ac == 0) {
                ac = 0
            } else {
                ac = 1
            }
            var videoList = reqData["data"]["video_info"];
            var vid = videoList["video_id"];
            var vlen = videoList["video_duration"];
            var ch = "bcloud_" + videoList["user_id"];
            var ap = 1;
            this.videoInfo = {vid: vid, vlen: vlen, ch: ch, ap: ap}
        }, getVideoLenM: function () {
            return Math.round(this.videoInfo.vlen / 60)
        }, getPlayTimeAHeartBeat: function () {
            this.setTimeChunk();
            var chunkQ = this.timeChunkQueue, l = chunkQ.length, time = 0;
            for (var i = 0; i < l; i++) {
                time += chunkQ[i]
            }
            this.emptyChunkQueue();
            return Math.round(time / 1000)
        }, sendPlay: function () {
            this.sendPlayAction({ac: "play", pt: 0, err: 0, ut: 1})
        }, sendPlayAction: function (option) {
            var videoInfo = this.videoInfo;
            var params = Util.extend({ver: "2.0", p1: 3, p2: 31, p3: "-", uid: "-", auid: "-", cid: 100, pid: "-", pv: "1.1", py: "-", url: Util.getBroswerUrl(), vid: videoInfo["vid"], vlen: videoInfo["vlen"], ch: videoInfo["ch"], ap: videoInfo["ap"], uuid: uuid, lc: lc}, option);
            Util.send(config.playUrl + Util.addParams(params));
            return this
        }, sendEnvInfo: function (obj) {
            var params = Util.extend({p1: 3, p2: 31, p3: "-", ip: "-", mac: "-", nt: "-", app: "1.1", lc: lc, uuid: uuid}, obj);
            Util.send(config.envUrl + Util.addParams(params))
        }, sendEndAction: function () {
            this.stopTimer();
            this.sendTimeAction();
            this.sendPlayAction({ac: "end", pt: 0, err: 0, ut: 0});
            this.turnOnEndStatus()
        }, sendTimeAction: function () {
            this.sendPlayAction({ac: "time", pt: this.getPlayTimeAHeartBeat(), err: 0, ut: 0})
        }}
    }

    function getBrowserVersion() {
        var browser = {};
        var userAgent = navigator.userAgent.toLowerCase();
        var s;
        (s = userAgent.match(/msie ([\d.]+)/)) ? browser.msie = s[1] : (s = userAgent.match(/firefox\/([\d.]+)/)) ? browser.firefox = s[1] : (s = userAgent.match(/360browser/)) ? browser.b360 = (s[1] ? s[1] : "-") : (s = userAgent.match(/qqbrowser\/([\d.]+)/)) ? browser.bqq = s[1] : (s = userAgent.match(/ucbrowser\/([\d.]+)/)) ? browser.buc = s[1] : (s = userAgent.match(/baidubrowser\/([\d.]+)/)) ? browser.bbaidu = s[1] : (s = userAgent.match(/sogoumobilebrowser\/([\d.]+)/)) ? browser.bsgm = s[1] : (s = userAgent.match(/liebaofast\/([\d.]+)/)) ? browser.blbfast = s[1] : (s = userAgent.match(/mb2345browser\/([\d.]+)/)) ? browser.b2345 = s[1] : (s = userAgent.match(/4g explorer\/([\d.]+)/)) ? browser.b4g = s[1] : (s = userAgent.match(/huohoubrowser\/([\d.]+)/)) ? browser.bhuohou = s[1] : (s = userAgent.match(/maxthon[\/ ]([\d.]+)/)) ? browser.maxthon = s[1] : (s = userAgent.match(/(opera)|(opr)\/([\d.]+)/)) ? browser.opera = s[3] : (s = userAgent.match(/chrome\/([\d.]+)/)) ? browser.chrome = s[1] : (s = userAgent.match(/version\/([\d.]+).*safari/)) ? browser.safari = s[1] : browser.other = "-";
        var version = "";
        for (var i in browser) {
            version = i + browser[i]
        }
        return version
    }

    initGlobalObj();
    play()
})();