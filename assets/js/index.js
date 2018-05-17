var httpHeader = 'http://43.240.138.181:8081/';
$(function () {
    //获取地址栏参数
    function getUrl(para) {
        var paraArr = location.search.substring(1).split('&');
        for (var i = 0; i < paraArr.length; i++) {
            if (para == paraArr[i].split('=')[0]) {
                return paraArr[i].split('=')[1];
            }
        }
        return '';
    }
    var qrcode = getUrl("qrcode");
    if (qrcode != null) {
        window.sessionStorage.setItem("QRCODE", getUrl("qrcode"));
    }
    newState();
    newSeiper();
    // 首页最新商品轮播图
    function newSeiper() {
        var newCommodity = JSON.stringify({
            "reqVersion": "1.0.0",
            "reqTimeStamp": "1517880687600",
            "reqData": {
                "stockType": 2
            }
        });
        var newUrl = httpHeader + 'appRiskCenter/homeCommodity';
        $.ajax({
            url: newUrl,
            type: 'post',
            data: newCommodity,
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
            success: function (data) {
                NewCommodity(data);
            },
            error: function (data) {
                console.log(data);
            }
        });
    }

    //禁止选中文本
    if (typeof(document.onselectstart) != "undefined") {
        // IE下禁止元素被选取
        document.onselectstart = function (event) {
            if (event.target.tagName != "INPUT") {
                return false;
            }
        }
    } else {
        // firefox下禁止元素被选取的变通办法
        document.onmousedown = function (event) {
            if (event.target.tagName != "INPUT") {
                return false;
            }
        }
        document.onmouseup = function (event) {
            if (event.target.tagName != "INPUT") {
                return false;
            }
        }
    }

    //首页动态加载轮播图
    function NewCommodity(data) {
        var dataList = data.retData;
        var swiper_wrapper = document.getElementById("swiper-wrapper");
        for (var i = 0; i < dataList.length; i++) {
            if (i == 0) {
                newData = dataList[i].rStockCode;
            } else {
                newData = newData + "," + dataList[i].rStockCode;
            }

            var swiper_slider = document.createElement("div");
            swiper_wrapper.appendChild(swiper_slider);
            swiper_slider.className = "swiper-slide swiper-slide-prev";
            swiper_slider.style.width = "85px";
            swiper_slider.style.marginRight = "5px";

            var swiper_slider_ul = document.createElement("ul");
            swiper_slider.appendChild(swiper_slider_ul);
            swiper_slider_ul.style.margin = 0;
            swiper_slider_ul.style.padding = 0;
            swiper_slider_ul.index = i;

            var swiper_slider_ul_liOne = document.createElement("li");
            swiper_slider_ul.appendChild(swiper_slider_ul_liOne);
            swiper_slider_ul_liOne.style.color = "white";
            swiper_slider_ul_liOne.style.fontSize = "12px";
            swiper_slider_ul_liOne.id = "One" + dataList[i].rStockCode;
            swiper_slider_ul_liOne.innerHTML = dataList[i].rStockName;


            var swiper_slider_ul_liTwo = document.createElement("li");
            swiper_slider_ul.appendChild(swiper_slider_ul_liTwo);
            swiper_slider_ul_liTwo.style.fontSize = "12px";
            swiper_slider_ul_liTwo.id = dataList[i].rStockCode;

            var swiper_slider_ul_liThree = document.createElement("li");
            swiper_slider_ul.appendChild(swiper_slider_ul_liThree);
            swiper_slider_ul_liThree.style.fontSize = "18px";
            swiper_slider_ul_liThree.id = "Three" + dataList[i].rStockCode;


            // 点击进入行情
            var rStockCode = dataList[i].rStockCode;
            swiper_slider_ul.onclick = function () {
                var stockCode = dataList[this.index].rStockCode;
                sessionStorage.setItem('CLICKCODE', "index" + stockCode);
                window.location.href = "stockdetail.html";
            }
        }
        newHQ(newData);
    }
    //根据最新商品code码获取最新价等信息
    function newHQ(newData) {
        var data1 = JSON.stringify({
            "reqVersion": "1.0.0",
            "reqTimeStamp": "1517880687600",
            "reqData": {
                "stockType": 2,
                "stockCode": newData
            }
        });
        return $.ajax({
            type: "post",
            url: "http://43.240.138.181:13081/quotesCenter/newPrice",
            dataType: 'json',
            contentType: 'application/json;charset=UTF-8',
            data: data1,
            success: function (data) {
                newMoney(data);
            },
            error: function (data) {
                console.log(data);
            }
        });
    }

    //最新价请求成功回调函数
    function newMoney(data) {
        var newdatalist = data.retData;
        for (var i = 0; i < newdatalist.length; i++) {
            var newPrice = newdatalist[i].newPrice.split(",")[8];
            document.getElementById(newdatalist[i].stockCode).innerHTML = newPrice;
            //计算涨幅度
            var bfs = ((newdatalist[i].newPrice.split(",")[8] - newdatalist[i].newPrice.split(",")[5]) / newdatalist[i].newPrice.split(",")[5] * 100).toFixed(2);
            document.getElementById("Three" + newdatalist[i].stockCode).innerHTML = bfs + "%";
            //根据涨幅度区分颜色
            if (bfs < 0) {
                document.getElementById("One" + newdatalist[i].stockCode).style.color = "green";
                document.getElementById(newdatalist[i].stockCode).style.color = "green";
                document.getElementById("Three" + newdatalist[i].stockCode).style.color = "green";
            } else if (bfs > 0) {
                document.getElementById("One" + newdatalist[i].stockCode).style.color = "red";
                document.getElementById(newdatalist[i].stockCode).style.color = "red";
                document.getElementById("Three" + newdatalist[i].stockCode).style.color = "red";
            } else {
                document.getElementById("One" + newdatalist[i].stockCode).style.color = "#CCCCCC";
                document.getElementById(newdatalist[i].stockCode).style.color = "#CCCCCC";
                document.getElementById("Three" + newdatalist[i].stockCode).style.color = "#CCCCCC";
            }
        }
    }

//首页最新动态
    function newState() {
        var newStateData = JSON.stringify({
            "reqVersion": "1.0.0",
            "reqTimeStamp": new Date().getTime(),
            "reqData": {
                "stockType": 2,
                "count": 5
            }
        });
        $.ajax({
            type: "post",
            url: "http://43.240.138.181:8081/appTransCenter/getNewestSubscription",
            dataType: 'json',
            contentType: 'application/json;charset=UTF-8',
            data: newStateData,
            success: function (data) {
                newStateSuccess(data);
            },
            error: function (data) {
                console.log(data);
            }
        })
    }

    function newStateSuccess(data) {
        var retData = data.retData;
        for (var i = 0; i < retData.length; i++) {
            var newRecent = document.getElementById("new_recent");
            var parseLi = document.createElement("li");
            newRecent.appendChild(parseLi);
            parseLi.style.borderBottom = "1px solid #313a42";

            //   第一个ul
            var ulOne = document.createElement("ul");
            parseLi.appendChild(ulOne);
            ulOne.style.margin = 0;
            ulOne.style.padding = 0;
            ulOne.style.height = "35px";
            ulOne.style.lineHeight = "35px";
            ulOne.className = "clearfi";

            //	第一个ul中的第一个li——用户名
            var ulOne_liOne = document.createElement("li");
            ulOne.appendChild(ulOne_liOne);
            ulOne_liOne.innerHTML = retData[i].firmName;
            ulOne_liOne.style.color = "red";
            ulOne_liOne.style.fontSize = "12px";
            ulOne_liOne.style.float = "left";
            ulOne_liOne.style.lineHeight = "32px";


            //	第二个ul
            var ulTwo = document.createElement("ul");
            parseLi.appendChild(ulTwo);
            ulTwo.style.margin = 0;
            ulTwo.style.padding = 0;
            ulTwo.style.color = "#c1c5cf";
            ulTwo.style.fontSize = "12px";
            ulTwo.className = "clearfix";

            //	第二个ul中的第一个li——商品名称和编码
            var ulTwo_liOne = document.createElement("li");
            ulTwo.appendChild(ulTwo_liOne);
            ulTwo_liOne.style.float = "left";
            ulTwo_liOne.style.width = "6rem";
            ulTwo_liOne.innerHTML = retData[i].tStockName + "<br>" + retData[i].tStockCode;
            //	第二个ul中的第二个li——数量
            var ulTwo_liTwo = document.createElement("li");
            ulTwo.appendChild(ulTwo_liTwo);
            ulTwo_liTwo.style.float = "left";
            ulTwo_liTwo.style.width = "5rem";
            ulTwo_liTwo.innerHTML = retData[i].tHaveNum;
            //	第二个ul中的第三个li——名义本金
            var ulTwo_liThree = document.createElement("li");
            ulTwo.appendChild(ulTwo_liThree);
            ulTwo_liThree.style.float = "left";
            ulTwo_liThree.innerHTML = retData[i].tPremium;
            //	第二个ul中的第四个li——时间
            var ulTwo_liFour = document.createElement("li");
            ulTwo.appendChild(ulTwo_liFour);
            ulTwo_liFour.style.float = "right";
            ulTwo_liFour.style.marginRight = "10px";
            ulTwo_liFour.innerHTML = retData[i].tOpertaionTime;
        }
    }
})
