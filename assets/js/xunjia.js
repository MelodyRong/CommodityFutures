document.write("<script type='text/javascript' src='assets/js/httpclient.js'></script>");
document.write("<script type='text/javascript' src='assets/js/NetworkManager.js'></script>");
document.write("<script type='text/javascript' src='assets/js/lib/weui.min.js'></script>");
document.write("<script type='text/javascript' src='assets/js/public.js'></script>");

var selected_week = -1;
var selected_premiumProportion = -1;
var selected_code = -1;
var selected_name = -1;
//新加标的数量
var selected_quantity = -1;
var rCycleType = -1;
var bSwitch = true;
var HQtimer;
$(function () {
    selectCommodity();
    showHistory();
    document.getElementById("mybj_money").innerHTML = ((window.sessionStorage.getItem("NEWPREICE")) * (document.getElementById("inp_quantity").value) * (window.sessionStorage.getItem("HUANSUANZHI"))).toFixed(2);
    jiajian();

    $("#checkProtocol").click(function () {
        if ($(this).prop("checked")) {
            $("#rengou").removeClass("noClick");
            bSwitch = true;
        } else {
            $("#rengou").addClass("noClick");
            bSwitch = false;
        }
    })
    $('#content_week').delegate('#demo_root', 'click', function () {
        $("#content_week li").each(function () {
            $(this).removeClass("btn_selected_marginleft");
            $(this).addClass("btn_unselected");
        });
        $(this).addClass("btn_selected_marginleft");
        var s = $.tmplItem(this);
        selected_week = s.data.rCycle;
        selected_premiumProportion = s.data.rPremiumRatio;
    });
    //检测INPUT 搜索框的输入
    $('#input_name').on('input', function () {
        var mChar = $(this).val();
        if (mChar == "") {
            cleartext();
            return;
        }
        stockSearch(mChar);
    });
    //检测INPUT 搜索框的输入
    $('#input_name').on('click', function () {
        cleartext();
    });

    $('#content_history').delegate('#tmpl_history_item', 'click',
        function () {
            $("#checkProtocol").prop("checked", "checked")
            $("#rengou").removeClass("noClick");
            rengou($.tmplItem(this));
        });
    window.sMessageOpen = function (s) {
        if (s) {
            $("#sMessage,#sMessage" + s).fadeIn(233, "swing");
            var w_h = $(window).height();
            if (w_h > $("#sMessage" + s).height()) {
                $("#sMessage" + s).css("marginTop", (w_h * 0.3) - ($("#sMessage" + s).height() * 0.3));
            }
        }
    }
    window.sMessageClose = function (s) {
        //点击取消隐藏询价弹框并显示询价列表
        if (s) {
            //隐藏弹框
            $("#sMessage,#sMessage" + s).hide();
        }
    }
    $('#input_bengjin').on('input', function () {
        $("#div_grids>a").each(function () {
            $(this).find("div").addClass("btn_unselected");
            $(this).find("div").removeClass("btn_selected_marginleft");
        })
    })

});


function selectCommodity() {
    var selejylist = JSON.stringify({
        "reqVersion": "1.0.0",
        "reqTimeStamp": "1517880687600",
        "reqData": {
            "stockType": 2
        }
    })
    var selejyUrl = BASEURL + "appRiskCenter/queryCommodity";
    return $.ajax({
        url: selejyUrl,
        type: 'post',
        data: selejylist,
        contentType: 'application/json;charset=UTF-8',
        dataType: 'json',
        success: function (data) {
            var datalist = data.retData;
            var jslist = document.getElementById("jylist");
            for (var i = 0; i < datalist.length; i++) {
                var newOption = document.createElement("option");
                newOption.value = datalist[i].rSockcode;
                newOption.text = datalist[i].rSockname + "(" + datalist[i].rSockcode + ")";
                jslist.appendChild(newOption);
                newOption.style.background = "#212a32";
                newOption.style.opacity = "0.5";
            }
            getHQ();
            setTimeout(function () {
                //事件处理
                Equivalent();
                setTimeout(function () {
                    mybj();
                    premiumProportionQuery();
                }, 200)
            }, 200)

            document.getElementById("jylist").onchange = function () {
                getHQ();
                setTimeout(function () {
                    //事件处理
                    Equivalent();
                    setTimeout(function () {
                        mybj();
                        premiumProportionQuery();
                    }, 200)
                }, 200)
            }
        },
        error: function (data) {
            console.log(data);
        }
    });
}

function stockSearch(mChar) {
    var keyName = "stockSearch";
    var map = new Map();
    map.set('stockChar', mChar);
    var json = getJsonFromMap(map, keyName);
    var successAction = function (data) {
        if (data.retData.length == 0) {
            return;
        } else {
            $("#myUL").removeClass("hidden");
            $("#myUL").addClass("show");
            //清除现有数据
            $("#myUL").empty();
            $("#tmpl_search").tmpl(data.retData).appendTo('#myUL');
        }
    }
    parVolleyJsonResultNoLoading(json, successAction, APPRISKCENTER + "/" + keyName);
}

function cleartext() {
    $("#input_name").val("");
    $("#newprice").html("--");
    clearInterval(HQtimer)
}

function mclick(div, clickPosition) {
    if (clickPosition == 1) {
        window.location.href = 'xunjia.html';
    } else {
        window.location.href = 'myOrderListPage.html';
    }
}

function rengou(item) {
    var keyName = 'getStrategyOrder';
    var map = new Map();
    map.set("stockType", 2);

    var json = getJsonFromMap(map, keyName);
    var successAction = function (data) {
        console.log(data);
        item.data.strategyOrderKey = data.retData.strategyOrderKey;
        var callback = function () {
            if (bSwitch) {
                lijirengou(item.data);
            }
        }
        sPrompt(item.data, callback);
    }
    parVolleyJsonResultNoLoading(json, successAction, APPTRANSCENTER + "/" + keyName);
}

function lijirengou(item) {
    var mS = checkStatus(2);
    if (!mS) {
        return;
    }
    var keyName = "strategy";
    var map = new Map();
    map.set('stockCode', item.code);
    map.set('principal', item.bengjin);
    map.set('premium', item.premium);
    console.log(item.bengjin);
    map.set('transtype', "U");
    map.set('transway', "S");
    map.set("stockType", 2);
    map.set("haveNum", $("#inp_quantity").val() * window.sessionStorage.getItem("HUANSUANZHI"));
    map.set('strategyOrderKey', item.strategyOrderKey);
    if (item.week.indexOf('周') != -1) {
        map.set('weekType', "0");
    }
    else if (item.week.indexOf('月') != -1) {
        map.set('weekType', "1");
    }
    else if (item.week.indexOf('年') != -1) {
        map.set('weekType', "2");
    }
    else if (item.week.indexOf('天') != -1) {
        map.set('weekType', "3");
    }
    map.set('week', item.week.match(/\d+/g)[0]);
    map.set('premiumproportion', item.premiumProportion);
    map.set('tCurrentprice', $("#newprice").html());
    var json = getJsonFromMap(map, keyName);
    var successAction = function (data) {
        if (data.retCode == "0000") {
            $.toast("认购成功", "text", function () {
                window.location.href = "myOrderListPage.html";
            });
        }
    }
    parVolleyJsonResultNoLoading(json, successAction, APPTRANSCENTER + "/" + keyName);
}

function clickCharge(div, chargetype) {
    $("#div_grids div").each(function () {
        $(this).removeClass("btn_selected_marginleft");
        $(this).addClass("btn_unselected");
    });
    div.addClass("btn_selected_marginleft");
    $("#input_bengjin").val(chargetype);
}

function premiumProportionQuery() {
    document.getElementById("content_week").innerHTML = "";
    var keyName = "premiumProportionQueryQH";
    var jslist = document.getElementById("jylist").value;
    var map = new Map();
    map.set('stockType', 2);
    map.set('stockCode', jslist);
    var json = getJsonFromMap(map, keyName);

    parVolleyJsonResultNoLoading(json, successAction, APPRISKCENTER + "/" + keyName);
}

function xunjia() {
    var item = {};
    var keyName = 'getStrategyOrder';
    var map = new Map();
    var json = getJsonFromMap(map, keyName);
    var successAction = function (data) {
        item.strategyOrderKey = data.retData.strategyOrderKey;
    }
    parVolleyJsonResultNoLoading(json, successAction, APPTRANSCENTER + "/" + keyName);
    var ss = $("#input_bengjin");
    var ssvalue = ss.val();
    var reg1 = /^(0|([1-9]\d*))(\.\d{1,2})?$/;
    var reg2 = /^[1-9]\d*$/;
    if ($('#input_name').val() == "") {
        $.toast("请选择期权", "text");
        return;
    }
    if (selected_week == -1) {
        $.toast("请选择行权周期", "text");
        return;
    }
    if ($("#mybj_money").html() < 1000000) {
        $.toast("名义本金需大于等于100万", "text");
        return;
    }
    //清除现有数据
    $("#content_history").empty();
    //先构建选择的数据
    item.code = $("#jylist option:selected").val();
    item.name = $("#jylist option:selected").text();
    $("#week").html(selected_week);
//	item.week=selected_week;
    item.week = $("#week").html();
    //最新价
    $("#price").html(window.sessionStorage.getItem("NEWPREICE"));

    item.newPrice = $("#price").html();

    //标的数量
    var number = $("#inp_quantity").val() * window.sessionStorage.getItem("HUANSUANZHI");
    $("#bengjin").html(number + "(" + window.sessionStorage.getItem("UNIT") + ")");
    item.bshu = $("#bengjin").html();
    console.log($("#bengjin").html());

    item.quantity = number;
    //权利金
    $("#premium").html(((number * window.sessionStorage.getItem("NEWPREICE") * selected_premiumProportion) * 0.01).toFixed(2));

    item.premium = $("#premium").html();

    //名义本金
    var benjin = (number * window.sessionStorage.getItem("NEWPREICE")).toFixed(2);
    console.log(benjin);

    item.bengjin = benjin;
    item.premium = $("#premium").html();
    item.premiumProportion = selected_premiumProportion;
    console.log(selected_premiumProportion);
    var premiumProportionfloat = parseFloat(item.premiumProportion);
    var array = [];
    var t1 = storageGet(XUNJIA);
    $("#checkProtocol").prop("checked", "checked")
    $("#rengou").removeClass("noClick");
    var callback = function () {
        if (bSwitch) {
            lijirengou(item);
        }
    }
    sPrompt(item, callback)
    if (t1 == null) {
        array.push(item);
        storageSet(XUNJIA, JSON.stringify(array));
    } else {
        var s = JSON.parse(t1);
        s.push(item);
        if (s.length > 5) {
            s.splice(0, 1);
        }
        storageSet(XUNJIA, JSON.stringify(s));
    }
    showHistory();
}

//询价记录
function showHistory() {
    var history = storageGet(XUNJIA);
    if (history == null) {
        return;
    }
    var s = JSON.parse(history);
    $("#tmpl_history").tmpl(s).appendTo('#content_history');
}

function sPrompt(entity, callback) {
    var jslist = document.getElementById("jylist").value;
    window.sPromptValue = "";
    sMessageOpen("Prompt");
    var bengjin = entity.bengjin;
    $("#name").html(entity.name);
    $("#bengjin").html(entity.bshu);
    $("#price").html(entity.newPrice);
    $("#week").html(entity.week);
    $("#premium").html(entity.premium);
    $("#premiumProportion").html(entity.premiumProportion + "%");
    var YUE = sessionStorage.getItem("ZhangHuYuE");
    if (YUE === null) {
        //
    } else {
        $("#yue").html(YUE);
    }
    //定义涨幅
    var a11 = parseFloat(0.2);
    var a21 = parseFloat(0.5);
    var a31 = parseFloat(1);
    //盈利金额=名义本金*(预期涨幅-权利金比例)
    var a13 = bengjin * (a11 - entity.premiumProportion / 100);
    var a23 = bengjin * (a21 - entity.premiumProportion / 100);
    var a33 = bengjin * (a31 - entity.premiumProportion / 100);
    //盈亏比例=盈利金额/权利金
    console.log(entity.premium);
    var a12 = a13 / (entity.premium);
    var a22 = a23 / (entity.premium);
    var a32 = a33 / (entity.premium);

    $("#11").html(a11 * 100 + "%");
    $("#21").html(a21 * 100 + "%");
    $("#31").html(a31 * 100 + "%");

    //盈利金额 = 名义本金*比例金 - 购入价格
    //售出价格 = 购入价格+（购入价格*预期涨幅）
    //盈亏比例 = (售出价格 - 购入价格)/购入价格
    //12 13 22 23 32 33
    $("#12").html((a12 * 100).toFixed(2) + "%");
    $("#22").html((a22 * 100).toFixed(2) + "%");
    $("#32").html((a32 * 100).toFixed(2) + "%");

    $("#13").html(a13.toFixed(2));
    $("#23").html(a23.toFixed(2));
    $("#33").html(a33.toFixed(2));
    $("#sMessagePrompt .sC span").one("click", function () {
        sMessageClose("Prompt");
    });
    if (typeof(callback) == "function") {
        $("#rengou").off("click").on("click", function () {
            var trengou = $("#rengou");
            callback();
        });
    }
    $("#qx_rengou").on("click", function () {
        $("#enquiry").css("display", "block");
        sMessageClose("Prompt");
    });
    $("#sMessagePrompt .sS input.txt").keyup(function (event) {
        window.sPromptValue = $(this).val();
        if (event.keyCode == 13) {
            $("#sMessagePrompt .sC span input.ok").trigger("click");
        }
    });
}

function getHQ() {
    var jslist = document.getElementById("jylist").value;
    //最新价
    var newData = {};
    newData.stockCode = jslist;
    newData.stockType = 2;
    var url = quotesUrl + "quotesCenter/newPrice";
    sendRequestUtil(url, newData, success);
}

//调用最新价成功回调
function success(data) {
    document.getElementById("newprice").innerHTML = data.retData[0].newPrice.split(",")[8];
    sessionStorage.setItem("NEWPREICE", document.getElementById("newprice").innerHTML);
}

function Equivalent() {
    var jslist = document.getElementById("jylist").value;
    var url = BASEURL + "appRiskCenter/commodityUnit";
    var newData = {};
    newData.stockType = 2;
    newData.stockCode = jslist;
    sendRequestUtil(url, newData, conversion);
}

//调取一手换算值成功回调
function conversion(data) {
    document.getElementById("shul").innerHTML = "可选择最大值为100手(一手等于" + data.retData.unitKey + data.retData.unitValue + ")";
    window.sessionStorage.setItem("HUANSUANZHI", data.retData.unitKey);
    window.sessionStorage.setItem("UNIT", data.retData.unitValue);

    //计算名义本金不能小于100万,100万/最新价/手数=多少手，小数点取整，
    var newPriceText = document.getElementById("newprice").innerHTML;//取到当前商品的最新价
    var unitKey = data.retData.unitKey;//取到当前商品一手等于多少吨

    var quzheng = 1000000 / newPriceText / unitKey;
    var inpText = Math.ceil(quzheng);
    document.getElementById("inp_quantity").value = inpText;
}

//名义本金
function mybj() {
    var inpValue = window.sessionStorage.getItem("NEWPREICE");
    var stockCode = window.sessionStorage.getItem("HUANSUANZHI");
    document.getElementById("mybj_money").innerHTML = (inpValue * (document.getElementById("inp_quantity").value) * stockCode).toFixed(2);
    window.sessionStorage.setItem("MINGYIBENJIN", document.getElementById("mybj_money").innerHTML);
}

//行权周期
function successAction(data) {
    var premiumListData = data.retData;
    if (premiumListData != null) {
        for (var i = 0; i < premiumListData.length; i++) {
            var num = premiumListData[i].rCycleType;
            switch (num) {
                case 0:
                    premiumListData[i].rCycle = premiumListData[i].rCycle + "周";
                    break;
                case 1:
                    premiumListData[i].rCycle = premiumListData[i].rCycle + "月";
                    break;
                case 2:
                    premiumListData[i].rCycle = premiumListData[i].rCycle + "年";
                case 3:
                    premiumListData[i].rCycle = premiumListData[i].rCycle + "天";
                    break;
            }
        }
        $("#demo").tmpl(premiumListData).appendTo('#content_week');
    }
}

function jiajian() {
    var subtract = document.getElementsByClassName("subtract")[0];
    var inp = document.getElementsByClassName("Number")[0].getElementsByClassName("inp")[0];
    var Plus = document.getElementsByClassName("plus")[0];
    var y12 = document.getElementById("12");
    var y22 = document.getElementById("22");
    var y32 = document.getElementById("32");
    subtract.onclick = function () {
        inp.value--;
        if (inp.value < 1) {
            inp.value = 1;
        }
        document.getElementById("mybj_money").innerHTML = ((window.sessionStorage.getItem("NEWPREICE")) * (document.getElementById("inp_quantity").value) * (window.sessionStorage.getItem("HUANSUANZHI"))).toFixed(2);
        console.log(document.getElementById("mybj_money").innerHTML);
    }
    Plus.onclick = function () {
        inp.value++;
        if (inp.value > 100) {
            inp.value = 100;
        }
        document.getElementById("mybj_money").innerHTML = ((window.sessionStorage.getItem("NEWPREICE")) * (document.getElementById("inp_quantity").value) * (window.sessionStorage.getItem("HUANSUANZHI"))).toFixed(2);
    }
}