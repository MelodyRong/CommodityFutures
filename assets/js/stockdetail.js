document.write("<script type='text/javascript' src='assets/js/httpclient.js'></script>");
document.write("<script type='text/javascript' src='assets/js/NetworkManager.js'></script>");
document.write("<script type='text/javascript' src='assets/js/public.js'></script>");
document.write('<script src="https://cdn.bootcss.com/jquery-weui/1.2.0/js/jquery-weui.min.js"></script>');
var setedZiXuan = false;
$(function () {

    //点击添加自选图片
    $('#content_search').delegate('#imgAdd', 'click',
        function () {
            var s = $.tmplItem(this);
            addOptionalStock(s.data.stockCode);
        }
    );
    $('#content_search').delegate('#mcolumn', 'click',
        function () {
            window.location.href = 'stockdetail.html';
        }
    );

    //检测INPUT 搜索框的输入
    $('.search').on('input', function () {
        var mChar = $(this).val();
        if (mChar == "") {
            return;
        }
        stockSearch(mChar);
    });

    $('#xunjia').click(function () {
            window.location.href = ('xunjia.html')
        }
    );


    $('#zixuan').click(function () {
            checkStatus(1);
            addOrDelOptionalStock();
        }
    );


});

function addOrDelOptionalStock() {
    var keyName;
    if (setedZiXuan) {
        keyName = "delOptionalStock";
    } else {
        keyName = "addOptionalStock";

    }
    console.log(keyName);
    var map = new Map();
    map.set('stockCode', sessionStorage.getItem("CLICKCODE"));
    var json = getJsonFromMap(map, keyName);
    var successAction = function (data) {
        $.toast("操作成功");
        panDuanZiXuan();
    }
    parVolleyJsonResultNoLoading(json, successAction, APPTRANSCENTER + "/" + keyName);
}

//判断当前商品是否加入自选,并设置相应文字
function panDuanZiXuan() {
    var keyName = "optionalStock";
    var map = new Map();
    map.set("stockType", 1);
    setedZiXuan = false;

    var json = getJsonFromMap(map, keyName);
    var successAction = function (data) {
        var currentCode = sessionStorage.getItem("CLICKCODE");
        for (var i = 0, l = data.retData.length; i < l; i++) {
            for (var key in data.retData[i]) {
                console.log(key + ':' + data.retData[i][key]);
                if (data.retData[i][key] == currentCode) {
                    setedZiXuan = true;
                }
            }
        }
        setZiXuanText();
    }
    parVolleyJsonResultNoLoading(json, successAction, APPTRANSCENTER + "/" + keyName);
}

function setZiXuanText() {
    if (setedZiXuan) {
        $("#zixuan").text("删除自选");
    } else {
        $("#zixuan").text("添加自选");
    }

}

function getTest() {
    var iframe = document.getElementById('miframe').contentWindow.document.body;


    $("#objid", document.frames('iframename').document)

}

function addOptionalStock(stockCode) {
    var keyName = "addOptionalStock";
    var map = new Map();
    map.set('stockCode', stockCode);

    var json = getJsonFromMap(map, keyName);
    var successAction = function (data) {
        $.toast("添加成功");

    }
    parVolleyJsonResultNoLoading(json, successAction, APPTRANSCENTER + "/" + keyName);
}

function mclick(div) {
    var _index = $(div).index() + 1
    $("#div_grids div").each(function () {
        $(this).removeClass("selected");
        $(this).addClass("unselected");
    });
    div.removeClass("unselected");
    div.addClass("selected");
    var map = new Map();
    setImg(_index);
}


function setImg(clickPosition) {
    var stockCode = sessionStorage.getItem("CLICKCODE");
    var simble = stockCode.substr(0, 5);
    if (simble == "index") {
        stockCode = stockCode.substring(5);
    }
    else {
        //
    }

    var charType;
    var klineType;
    if (clickPosition == 1) {
        charType = "MiniKLine5m";
        klineType = "5分K";
    }
    if (clickPosition == 2) {
        charType = "MiniKLine15m";
        klineType = "15分K";
    }
    if (clickPosition == 3) {
        charType = "MiniKLine30m";
        klineType = "30分K";
    }
    if (clickPosition == 4) {
        charType = "MiniKLine60m";
        klineType = "时K";
    }
    if (clickPosition == 5) {
        charType = "DailyKLine";
        klineType = "日K";
    }
    var hqUrl = quotesUrl + "quotesCenter/kLine";
    // console.log(hqUrl);
    var hqData = JSON.stringify({
        "stockCode": stockCode,
        "klineType": charType
    })
    // console.log(hqData);
    $.ajax({
        url: hqUrl,
        type: 'post',
        data: hqData,
        contentType: 'application/json;charset=UTF-8',
        dataType: "json",
        success: function (data) {
            var NewData = JSON.parse(data.retData);
            // console.log(NewData);
            var dom = document.getElementById("kTu");
            var myChart = echarts.init(dom);
            var app = {};
            option = null;
            var upColor = 'red';
            var upBorderColor = '#8A0000';
            var downColor = '#00da3c';
            var downBorderColor = '#008F28';


            // 数据意义：开盘(open)，收盘(close)，最低(lowest)，最高(highest)
            var data0 = splitData(NewData);

            function splitData(rawData) {
                // console.log(rawData);
                rawData = (rawData);
                var categoryData = [];
                var values = [];
                // alert(rawData.length);
                for (var i = rawData.length - 1; i >= 0; i--) {

                    // console.log(rawData[i]);
                    var date = rawData[i].splice(0, 1);
                    var openPrice = rawData[i].splice(0, 1);
                    var hightPrice = rawData[i].splice(0, 1);
                    var lastPrice = rawData[i].splice(0, 1);
                    var closePrice = rawData[i].splice(0, 1);
                    categoryData.push(date);

                    var newData = [];
                    newData[0] = openPrice;
                    newData[1] = closePrice;
                    newData[2] = lastPrice;
                    newData[3] = hightPrice

                    values.push(newData);
                }
                return {
                    categoryData: categoryData,
                    values: values
                };
            }

            function calculateMA(dayCount) {
                var result = [];
                for (var i = 0, len = data0.values.length; i < len; i++) {
                    if (i < dayCount) {
                        result.push('-');
                        continue;
                    }
                    var sum = 0;
                    for (var j = 0; j < dayCount; j++) {
                        sum += data0.values[i - j][1];
                    }
                    result.push(sum / dayCount);
                }
                return result;
            }


            option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    },

                },
                legend: {
                    data: [klineType, 'MA5', 'MA10', 'MA20', 'MA30'],
                    textStyle: {
                        color: "white"
                    }
                },
                grid: {
                    left: '10%',
                    right: '10%',
                    bottom: '15%',
                    top: '12%',
                    show: true,
                    backgroundColor: "white"
                },
                xAxis: {
                    type: 'category',
                    data: data0.categoryData,
                    scale: true,
                    boundaryGap: false,
                    axisLine: {onZero: false},
                    splitLine: {show: false},
                    splitNumber: 20,
                    min: 'dataMin',
                    max: 'dataMax',
                    nameTextStyle: {
                        color: "white"
                    },
                    axisLine: {
                        lineStyle: {
                            color: "#ccc"
                        }
                    }
                },
                yAxis: {
                    scale: true,
                    splitArea: {
                        show: true
                    },
                    axisLine: {
                        lineStyle: {
                            color: "#ccc"
                        }
                    }
                },

                dataZoom: [
                    {
                        type: 'inside',
                        start: 50,
                        end: 100
                    },
                    {
                        show: true,
                        type: 'slider',
                        y: '90%',
                        start: 50,
                        end: 100
                    }
                ],
                series: [
                    {
                        name: klineType,
                        type: 'candlestick',
                        data: data0.values,
                        itemStyle: {
                            normal: {
                                color: upColor,
                                color0: downColor,
                                borderColor: upBorderColor,
                                borderColor0: downBorderColor
                            }
                        },
                        markPoint: {
                            label: {
                                normal: {
                                    formatter: function (param) {
                                        return param != null ? Math.round(param.value) : '';
                                    }
                                }
                            },
                            data: [

                                {
                                    name: 'highest value',
                                    type: 'max',
                                    valueDim: 'highest'
                                },
                                {
                                    name: 'lowest value',
                                    type: 'min',
                                    valueDim: 'lowest'
                                },
                                {
                                    name: 'average value on close',
                                    type: 'average',
                                    valueDim: 'close'
                                }
                            ],
                            tooltip: {
                                formatter: function (param) {
                                    return param.name + '<br>' + (param.data.coord || '');
                                }
                            }
                        },
                        markLine: {
                            symbol: ['none', 'none'],
                            data: [
                                [
                                    {
                                        name: 'from lowest to highest',
                                        type: 'min',
                                        valueDim: 'lowest',
                                        symbol: 'circle',
                                        symbolSize: 10,
                                        label: {
                                            normal: {show: false},
                                            emphasis: {show: false}
                                        }
                                    },
                                    {
                                        type: 'max',
                                        valueDim: 'highest',
                                        symbol: 'circle',
                                        symbolSize: 10,
                                        label: {
                                            normal: {show: false},
                                            emphasis: {show: false}
                                        }
                                    }
                                ],
                                {
                                    name: 'min line on close',
                                    type: 'min',
                                    valueDim: 'close'
                                },
                                {
                                    name: 'max line on close',
                                    type: 'max',
                                    valueDim: 'close'
                                }
                            ]
                        }
                    }
                    // {
                    //     name: 'MA5',
                    //     type: 'line',
                    //     data: calculateMA(5),
                    //     smooth: true,
                    //     lineStyle: {
                    //         normal: {opacity: 0.5}
                    //     }
                    // },
                    // {
                    //     name: 'MA10',
                    //     type: 'line',
                    //     data: calculateMA(10),
                    //     smooth: true,
                    //     lineStyle: {
                    //         normal: {opacity: 0.5}
                    //     }
                    // },
                    // {
                    //     name: 'MA20',
                    //     type: 'line',
                    //     data: calculateMA(20),
                    //     smooth: true,
                    //     lineStyle: {
                    //         normal: {opacity: 0.5}
                    //     }
                    // },
                    // {
                    //     name: 'MA30',
                    //     type: 'line',
                    //     data: calculateMA(30),
                    //     smooth: true,
                    //     lineStyle: {
                    //         normal: {opacity: 0.5}
                    //     }
                    // },

                ]
            };

            ;
            if (option && typeof option === "object") {
                myChart.setOption(option, true);
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })

//var imgSrc = "http://image.sinajs.cn/newchart/"+charType+"/n/"+stockCode+".gif";
//$("#char").attr("src",imgSrc); 
}

function stockSearch(mChar) {
    var keyName = "stockSearch";
    var map = new Map();
    // map.set('stockChar', $(".search").val());
    map.set('stockChar', mChar);

    var json = getJsonFromMap(map, keyName);
    var successAction = function (data) {
        if (data.retData.length == 0) {
            return;
        } else {
            //清除现有数据
            $("#content_search").empty();
        }

        $("#tmpl_search").tmpl(data.retData).appendTo('#content_search');

    }
    parVolleyJsonResultNoLoading(json, successAction, APPRISKCENTER + "/" + keyName);
}

function getHQ() {

//  var stockCode = storageGet(CLICKCODE);
    var stockCode = sessionStorage.getItem("CLICKCODE");
    var simble = stockCode.substring(0, 5);
    if (simble == "index") {
        $(".toBottom").hide();
        stockCode = stockCode.substring(5);
    }
    var s = getHangQing(stockCode, simble);
    s.done(function () {
        var hqSplit;
        for (var w in window) {
            if (w.substr(0, 6) == "hq_str") {
                var hq = w.split(",");
                var a = eval(w);
                hqSplit = a.split(",");
            }
        }

        if (simble == "index") {
//	  	console.log(hqSplit);
            $("#zuixin").text(parseFloat(hqSplit[6]).toFixed(2));
            //计算涨跌价
            //涨跌幅=(今日收盘价-昨日收盘价)/昨日收盘价*100%
            var zhangdiejia = parseFloat(hqSplit[8]) - parseFloat(hqSplit[5]);
            $("#zhangdiejia").text(zhangdiejia.toFixed(2));
            var zhangdiefu = zhangdiejia / parseFloat(hqSplit[5]) * 100;
            $("#zhangdiefu").text(zhangdiefu.toFixed(2) + "%");
            $("#zuoshou").text(parseFloat(hqSplit[5]).toFixed(2));
            $("#jinkai").text(parseFloat(hqSplit[2]).toFixed(2));
            $("#zuigao").text(parseFloat(hqSplit[3]).toFixed(2));
            $("#zuidi").text(parseFloat(hqSplit[4]).toFixed(2));
            //振幅 =(最高点的幅度-最低点的幅度)/昨天收盘价x100%
            var zhengfu = (parseFloat(hqSplit[4]) - parseFloat(hqSplit[5])) / parseFloat(hqSplit[2]) * 100;
            $("#zhenfu").text(zhengfu.toFixed(2) + "%");
            $("#neipan").text();
            $("#shiyinlv").text();
            var chengjiaoliang = parseFloat(hqSplit[8]) / 10000
            $("#chengjiaoliang").text(chengjiaoliang.toFixed(2) + "万");
            $("#waipan").text();
//			$("#shijinlv").text();
            var chengjiaoe = parseFloat(hqSplit[9]) / 100000000
            $("#chengjiaoe").text(chengjiaoe.toFixed(2) + "亿");
            $("#zongshizhi").text();
            $("#liutongshizhi").text();
            //结算值
            $("#jiesuan").text(parseFloat(hqSplit[9]).toFixed(2));
            //昨结价
            $("#zuojie").text(parseFloat(hqSplit[10]).toFixed(2));
            //买价
            $("#maijia1").text(parseFloat(hqSplit[8]).toFixed(2));
//			卖价
            $("#mai2jia").text(parseFloat(hqSplit[7]).toFixed(2));
        } else {
            $("#zuixin").text(parseFloat(hqSplit[3]).toFixed(2));
            //计算涨跌价
            //涨跌幅=(今日收盘价-昨日收盘价)/昨日收盘价*100%
            var zhangdiejia = parseFloat(hqSplit[3]) - parseFloat(hqSplit[2]);
            $("#zhangdiejia").text(zhangdiejia.toFixed(2));
            var zhangdiefu = zhangdiejia / parseFloat(hqSplit[2]) * 100;
            $("#zhangdiefu").text(zhangdiefu.toFixed(2) + "%");
            $("#zuoshou").text(parseFloat(hqSplit[2]).toFixed(2));
            $("#jinkai").text(parseFloat(hqSplit[1]).toFixed(2));
            $("#zuigao").text(parseFloat(hqSplit[4]).toFixed(2));
            $("#zuidi").text(parseFloat(hqSplit[5]).toFixed(2));
            //振幅 =(最高点的幅度-最低点的幅度)/昨天收盘价x100%
            var zhengfu = (parseFloat(hqSplit[4]) - parseFloat(hqSplit[5])) / parseFloat(hqSplit[2]) * 100;
            $("#zhenfu").text(zhengfu.toFixed(2) + "%");
            $("#neipan").text();
            $("#shiyinlv").text();
            var chengjiaoliang = parseFloat(hqSplit[8]) / 10000
            $("#chengjiaoliang").text(chengjiaoliang.toFixed(2) + "万");
            $("#waipan").text();
            $("#shijinlv").text();
            var chengjiaoe = parseFloat(hqSplit[9]) / 100000000
            $("#chengjiaoe").text(chengjiaoe.toFixed(2) + "亿");
            $("#zongshizhi").text();
            $("#liutongshizhi").text();
        }
        //设置颜色
        if (zhangdiejia < 0) {
            $("#zuixin").css({color: "green"});
            $("#zhangdiejia").css({color: "green"});
            $("#zhangdiefu").css({color: "green"});

        } else if (zhangdiejia > 0) {
            $("#zuixin").css({color: "red"});
            $("#zhangdiejia").css({color: "red"});
            $("#zhangdiefu").css({color: "red"});
        }
        else if (zhangdiejia = 0) {
            $("#zuixin").css({color: "black"});
            $("#zhangdiejia").css({color: "black"});
            $("#zhangdiefu").css({color: "black"});
        }
    }).fail(function () {

    })

}









