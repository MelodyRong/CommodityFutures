var BASEURL = 'http://43.240.138.181:8081/';
var quotesUrl = 'http://43.240.138.181:13081/';
var gametype = 2;
var APPTRANSCENTER = "appTransCenter";
var APPRISKCENTER = "appRiskCenter";
var SESSION_STR = "sessionStr";
var server_code_error = '服务器错误';
var CLICKCODE = 'CLICKCODE';

var XUNJIA = 'XUNJIA';
//登录相关
var ISLOGIN = 'isLogin';
var SESSIONSTR = 'sessionId';
var FIRMCODE = 'firmCode';
var FIRMNAME = 'firmName';
var CompositeImpl = function () {
};
document.write("<script type='text/javascript' src='assets/js/lib/weui.min.js'></script>");
function ajax(data, url) {
    return $.ajax({
        url: BASEURL + url,
        contentType: 'application/json;charset=utf-8',
        type: 'POST',
        timeout: 20000,
        //超时时间设置，单位毫秒
        data: JSON.stringify(data),
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            $(".loading-img").remove();
        },
        beforeSend: function () {
            //动态生成加载动画
            var mask = '<div class="loading-img"><img src="assets/i/loading.gif"/></div>';
            $("body").append(mask);
        },
        complete: function () {
            //请求完成移除加载动画
            $(".loading-img").remove();
        }
    })
}
//获取行情信息
function getHangQing(stockCode, isIndex) {
    var st = stockCode.substring(0);
    return $.ajax({
        // var name = data.name,
        url: 'http://hq.sinajs.cn/list=' + st,
        dataType: "script",
        cache: "true",
        type: 'GET',
        timeout: 20000,
        //超时时间设置，单位毫秒
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
}

function parVolleyJsonResult(mJson, mcallback, url) {
    parVolleyJsonResultIfLoading(true, mJson, mcallback, url)
}

function parVolleyJsonResultNoLoading(mJson, mcallback, url) {
    parVolleyJsonResultIfLoading(false, mJson, mcallback, url)
}

function parVolleyJsonResultIfLoading(showloading, mJson, mcallback, url) {
    if (showloading) {
        var loading = weui.loading('');
    }
    ajax(mJson, url).done(function (data) {
        $(".loading-img").remove();
        if (showloading) {

            loading.hide(function () {
                mAction(mcallback, data);
            });
        } else {
            mAction(mcallback, data);
        }
    }).fail(function () {
        $(".loading-img").remove();
        if (showloading) {
            hideLoadingAndAlertServerError(loading);
        } else {
            mAlert(server_code_error);
        }
    })
}

function mAction(mcallback, data) {
    if (data.retCode == "0000") {
        mcallback(data);
    }
    else if (data.retCode == "9999") {
        sessionStorage.setItem("isLogin", false);
        $.toast(data.retMessage, "text", function () {
            window.location.href = "Login.html"
        });
    }
    else if (data.retCode == "3333") {
        return;
    }
    else {
        $.toast(data.retMessage, "text");
    }
}

function getJsonFromMap(mmap, keyName) {
    mmap.keySet();
    var jsonBody = {};
    for (var k of mmap) { //通过定义一个局部变量k遍历获取到了map中所有的key值
        var key = k[0];
        var value = mmap.get(key);
        jsonBody[key] = value;
    }
    return putOtherJson(jsonBody, keyName);
}

function putOtherJson(jsonBody, keyName) {
    if (keyName != "premiumProportionQuery") {
        jsonBody["reqSession"] = storageGet(SESSIONSTR);
        jsonBody["firmCode"] = storageGet(FIRMCODE);
    }
    var jsonRoot = {};
    var timestamp = (new Date()).valueOf();
    jsonRoot["reqVersion"] = "1.0.0";
    jsonRoot["reqTimeStamp"] = timestamp;
    jsonRoot["reqData"] = jsonBody;
    return jsonRoot;
}

Map.prototype.keySet = function () {
    var keyset = new Array();
    var count = 0;
    for (var key in this.container) {
        // 跳过object的extend函数
        if (key == 'extend') {
            continue;
        }
        keyset[count] = key;
        count++;
    }
    return keyset;
}

function mloading(text) {
    return weui.loading(text);
}

function hideLoadingAndAlert(loading, text) {
    loading.hide(function () {
        weui.topTips(text);
    });
}

function hideLoadingAndAlertServerError(loading, text) {
    hideLoadingAndAlert(loading, server_code_error);
}

function mAlert(text) {
    weui.topTips(text);//测试阶段 所有alert改为topTips,便于测试
}

function storageSet(key, text) {
    window.sessionStorage.setItem(key, text);
}

function storageGet(key) {
    return window.sessionStorage.getItem(key)
}

function storageDel(key) {
    return window.sessionStorage.removeItem(key)
}




