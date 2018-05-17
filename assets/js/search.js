document.write("<script type='text/javascript' src='assets/js/httpclient.js'></script>");
document.write("<script type='text/javascript' src='assets/js/NetworkManager.js'></script>");
document.write("<script type='text/javascript' src='assets/js/public.js'></script>");
document.write('<script src="https://cdn.bootcss.com/jquery-weui/1.2.0/js/jquery-weui.min.js"></script>');
var BASEURL = 'http://43.240.138.181:8081/';
var QUOTESURL = 'http://43.240.138.181:13081/';
shareList();
$(function () {
    //点击添加自选图片
    $('#content_search').delegate('#imgAdd', 'click',
        function () {
            var s = $.tmplItem(this);
            console.log(this.title);
            checkStatus(1);
            addOptionalStock(this.title);
        }
    );
    //询价
    $('#content_search').delegate('#xunjia', 'click',
        function () {
            var s = $.tmplItem(this);
            storageSet(CLICKCODE, s.data.stockCode);
            window.location.href = 'xunjia.html';
        });
});

function addOptionalStock(stockCode) {
    var keyName = "addOptionalStock";
    var map = new Map();
    map.set('stockCode', stockCode);
    map.set("stockType", 2);

    var json = getJsonFromMap(map, keyName);
    var successAction = function (data) {
        $.toast("添加自选成功");
    }
    parVolleyJsonResultNoLoading(json, successAction, APPTRANSCENTER + "/" + keyName);
}

function getData(url) {
    return $.ajax({
        url: url,
        dataType: "script",
        cache: "true",
        type: 'GET',
        timeout: 20000,         //超时时间设置，单位毫秒
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
}

//展示商品个股列表
function shareList() {
    var selelist = JSON.stringify({
        "reqVersion": "1.0.0",
        "reqTimeStamp": "1517880687600",
        "reqData": {
            "stockType": 2
        }
    })
    var seleUrl = BASEURL + "appRiskCenter/queryCommodity";
    return $.ajax({
        url: seleUrl,
        type: 'post',
        data: selelist,
        contentType: 'application/json;charset=UTF-8',
        dataType: 'json',
        success: function (data) {
            var dataList = data.retData;
            for (var i = 0; i < dataList.length; i++) {
                //名称代码
                var stockName = data.retData[i].rSockname;
                var stockCode = data.retData[i].rSockcode;
                var NameCode = stockName + "<br>" + stockCode;
                var newData = {};
                newData.stockCode = stockCode;
                newData.stockName = stockName;
                var url = QUOTESURL + "quotesCenter/serchNewPrice";
                sendRequestUtil(url, newData, function (data) {
                    // 最新价
                    var newPrice = data.retData[0].newPrice.split(",")[8];
                    // 涨幅度
                    var increase = (((data.retData[0].newPrice.split(",")[8] - data.retData[0].newPrice.split(",")[5]) / data.retData[0].newPrice.split(",")[8]) * 100).toFixed(2);
                    var zhangfu = increase + "%";
                    //获取商品列表页id
                    var content_search = document.getElementById("content_search");
                    //循环添加商品信息到页面
                    var ul = document.createElement("ul");
                    content_search.appendChild(ul);
                    ul.className = "newlist";


                    var liOne = document.createElement("li");
                    ul.appendChild(liOne);
                    liOne.innerHTML = "+";
                    liOne.className = "btnLiOne";
                    liOne.id = "imgAdd";
                    liOne.setAttribute("title", data.retData[0].stockCode);


                    var liTwo = document.createElement("li");
                    liTwo.innerHTML = data.retData[0].stockName + "<br>" + data.retData[0].stockCode;
                    ul.appendChild(liTwo);
                    liTwo.className = "liTwo";

                    var liThree = document.createElement("li");
                    liThree.innerHTML = newPrice;
                    ul.appendChild(liThree);

                    var liFour = document.createElement("li");
                    liFour.innerHTML = zhangfu;
                    ul.appendChild(liFour);

                    var liFive = document.createElement("li");
                    ul.appendChild(liFive);
                    liFive.innerHTML = "询价";
                    liFive.className = "btnLiFive";
                    liFive.id = "xunjia";
                });
            }
        },
        error: function (data) {
            console.log(data);
        }
    })
}