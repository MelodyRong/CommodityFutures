document.write("<script type='text/javascript' src='assets/js/httpclient.js'></script>");
document.write("<script type='text/javascript' src='assets/js/NetworkManager.js'></script>");
document.write("<script type='text/javascript' src='assets/js/lib/weui.min.js'></script>");
$(function () {
    $('#content_optional').delegate('#xunjia', 'click',
        function () {
            var s = $.tmplItem(this);
            storageSet(CLICKCODE, s.data.stockCode);
            window.location.href = ('xunjia.html')
        }
    );

    $('#search').on('click', function () {
        window.location = ('search.html')
    });
});

function optionalStock() {
    //获取用户是否登录的信息  false/true
    var Login = storageGet(ISLOGIN);
    //先清空自选列表内容再添加新的自选列表内容
    $("#content_optional").empty();
    if (Login == "true") {
        var keyName = "optionalStock";
        var map = new Map();
        map.set('stockType', 2);
        var json = getJsonFromMap(map, keyName);

        var successAction = function (data) {
            var dataArr = JSON.parse(JSON.stringify(data.retData));
            var xinlangSrc = "http://43.240.138.181:13081/quotesCenter/newPrice";
            if (dataArr.length != 0) {
                for (var i = 0; i < dataArr.length; i++) {
                    var newPriceData = {
                        "stockCode": dataArr[i].stockCode,
                        "stockType": 2
                    }
                    sendRequestUtil(xinlangSrc, newPriceData, newPriceSuccess);
                }

                function newPriceSuccess(data) {
                    var retData = data.retData[0].stockCode;
                    var MoreDetail = data.retData[0].newPrice.split(",");
                    //添加商品名称编码最新价涨跌幅等信息
                    var NewUl = document.createElement("ul");
                    $("#content_optional").append(NewUl);
                    NewUl.className = "zxList";
                    NewUl.style.color = "#ccc";
                    NewUl.style.margin = 0;
                    NewUl.style.padding = 0;
                    // 商品名称和编码
                    var NewUl_liOne = document.createElement("li");
                    NewUl.append(NewUl_liOne);
                    NewUl_liOne.innerHTML = MoreDetail[16] + "主力" + "<br>" + retData;
                    NewUl_liOne.style.marginLeft = "10px";
                    NewUl_liOne.style.width = "90px";
                    // 最新价
                    var NewUl_liTwo = document.createElement("li");
                    NewUl.append(NewUl_liTwo);
                    NewUl_liTwo.innerHTML = MoreDetail[8];
                    // 涨跌
                    var NewUl_liThree = document.createElement("li");
                    NewUl.append(NewUl_liThree);
                    NewUl_liThree.innerHTML = (MoreDetail[8] - MoreDetail[5]).toFixed(2);

                    // 涨跌幅
                    var NewUl_liFour = document.createElement("li");
                    NewUl.append(NewUl_liFour);
                    NewUl_liFour.innerHTML = ((MoreDetail[8] - MoreDetail[5]) / MoreDetail[5]).toFixed(2) + "%";
                    //根据涨幅度大小改变颜色
                    if (NewUl_liThree.innerHTML > 0) {
                        NewUl_liOne.style.color = "red";
                        NewUl_liTwo.style.color = "red";
                        NewUl_liThree.style.color = "red";
                        NewUl_liFour.style.color = "red";

                    } else if (NewUl_liThree.innerHTML < 0) {
                        NewUl_liOne.style.color = "green";
                        NewUl_liTwo.style.color = "green";
                        NewUl_liThree.style.color = "green";
                        NewUl_liFour.style.color = "green";
                    }
                    else {
                        NewUl_liOne.style.color = "#ccc";
                        NewUl_liTwo.style.color = "#ccc";
                        NewUl_liThree.style.color = "#ccc";
                        NewUl_liFour.style.color = "#ccc";
                    }

                    // 操作
                    var NewUl_liFive = document.createElement("li");
                    NewUl.append(NewUl_liFive);
                    NewUl_liFive.innerHTML = "询价";
                    NewUl_liFive.className = "zxList_liFive";
                    NewUl_liFive.onclick = function () {
                        window.location.href = "xunjia.html";
                    }
                }
            }
        }
        parVolleyJsonResultNoLoading(json, successAction, APPTRANSCENTER + "/" + keyName);
    } else {
        return;
    }
}

function getData(url) {
    return $.ajax({
        url: url,
        dataType: "script",
        cache: "true",
        type: 'GET',
        timeout: 20000,          //超时时间设置，单位毫秒
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
}
