var requestUrl = "http://43.240.138.181:8081/";
document.write('<script src="https://cdn.bootcss.com/jquery-weui/1.2.0/js/jquery-weui.min.js"></script>');
/*	将目标(JSON)字符串转换为JSON*/
function tojsonstr(reqBody) {
    //  时间戳
    var timestamp = (new Date()).valueOf();
    //请求体
    var v = {};
    v.reqVersion = "1.0.0";
    v.reqTimeStamp = timestamp;
    v.reqData = reqBody;

    return JSON.stringify(v);
}

/***发送网络请求**************/
function sendRequestUtil(url, reqBody, successHandler) {
    var reqJson = tojsonstr(reqBody);
    $.ajax({
        url: url,                    //要访问的地址
        data: reqJson,               //向要发送请求的地址要发送的参数
        type: "POST",                //发请求的方式(GET or POST)
        timeout: 6000,                 //超时的最大时间
        dataType: "json",
        contentType: "application/json; charset=utf-8",              //传输的类型
        success: function (data) {//处理返回成功的回调函数
            if (data.retCode == "9999") {
                sessionStorage.setItem("isLogin", false);
                $.toast(data.retMessage, "text", function () {
                    window.location.href = "Login.html"
                });
            }
            successHandler(data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(XMLHttpRequest.readyState);
            console.log(XMLHttpRequest.status);
            $.toast('无法连接到网络，请稍后再试！', "text");
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
    });
}

/***********************************************************************************/

//退出登录
function get_Logout() {
    sessionStorage.setItem('isLogin', false);
    sessionStorage.setItem('sessionStr', '');
    sessionStorage.setItem('firmCode', "");
    sessionStorage.setItem('firmName', "");
    document.location.href = "personalPage.html";
}

/****登录***/
function get_Login() {
    var pwd = $('#LogpwdCode').val();
    var mobile = $('#LognameCode').val();
    var myreg = /^1[3|4|5|7|8][0-9]\d{4,8}$/;
    if (mobile == '') {
        $.toast('请输入手机号！', "text");
        return false;
    } else if (mobile.length != 11 || !myreg.test(mobile)) {
        $.toast('请输入有效的手机号！', "text");
        return false;
    }

    if (pwd == '') {
        $.toast('密码不能为空！', "text");
        return false;
    } else if (pwd.length < 6) {
        $.toast('密码不得少于6位！', "text");
        return false;
    }

    var reqData = {};
    reqData.mobile = mobile;
    reqData.pwd = pwd;

    var url = requestUrl + "appUserCenter/login";
    sendRequestUtil(url, reqData, login_success);
}

//连接登录成功回调函数
function login_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {
            sessionStorage.setItem('isLogin', true);
            sessionStorage.setItem('sessionStr', retData.sessionStr);
            sessionStorage.setItem('firmCode', retData.firmCode);
            sessionStorage.setItem('firmName', retData.firmName);
            sessionStorage.setItem('sessionId', retData.sessionId);
            //获取签约的银行信息
            get_my_Banks();
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

//连接后台获取银行信息
function get_my_Banks() {
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionStr;
    reqData.firmCode = sessionStorage.firmCode;

    var url = requestUrl + "appMoneyCenter/myBankName";
    sendRequestUtil(url, reqData, mBanks_success);
}

//获取银行信息成功函数
function mBanks_success(data) {
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData.length == 0) {
            sessionStorage.setItem('isSign', false);
        } else {
            sessionStorage.setItem('isSign', true);
        }
        //是否设置支付密码函数
        getIsPayPwd();


    }
    else {
        $.toast(retMessage, "text");
    }
}

//连接后台是否设置支付密码
function getIsPayPwd() {
    var reqData = {};
    reqData.firmCode = sessionStorage.firmCode;
    var url = requestUrl + "appUserCenter/getIsPayPwd";
    sendRequestUtil(url, reqData, getIsPayPwd_success);
}

//连接是否设置支付密码后台成功回调函数
function getIsPayPwd_success(data) {
    var retCode = data.retCode;
    var retMessage = data.retMessage;

    if (retCode == "0000") {
        var retData = data.retData
        if (retData.status) {
            sessionStorage.setItem('isPay', true);
        } else {
            sessionStorage.setItem('isPay', false);
        }
    }
    else if (retCode == "N010") {
        sessionStorage.setItem('isPay', false);
    }
    else {
        $.toast(retMessage, "text");
    }

    $.toast("登录成功", "text", function (data) {
        window.history.go(-1);
        // window.location.href = "personalPage.html";
    });
}

/****获取验证码***/
function get_VCode() {
    var mobile = $('#rgsMobile').val();
    var myreg = /^1[3|4|5|7|8][0-9]\d{4,8}$/;
    if (mobile == '') {
        $.toast('手机号不能为空！', "text");
        return false;
    } else if (mobile.length != 11 || !myreg.test(mobile)) {
        $.toast('请输入有效的手机号！', "text");
        return false;
    }
    var reqData = {};
    reqData.mobile = mobile;

    var url = requestUrl + "appUserCenter/sendVCode";
    sendRequestUtil(url, reqData, VCode_success);
}

//获取验证码成功回调函数
function VCode_success(data) {
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        $.toast(retMessage, "text");
        var retData = data.retData;
        if (retData != null) {
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****注册*** verifyCode :验证码* organizationalCode：机构代码*/
function get_RegisterUser() {
    var mobile = $('#rgsMobile').val();
    var pwd = $('#rgsPwd').val();
    var pwdA = $('#rgsPwdA').val();
    var VCode = $('#rgsVCode').val();
    var qrCode = $("#InviteCode").val();

    var myreg = /^1[3|4|5|7|8][0-9]\d{4,8}$/;
    if (mobile == '') {
        $.toast('手机号不能为空！', "text");
        return false;
    } else if (mobile.length != 11 || !myreg.test(mobile)) {
        $.toast('请输入有效的手机号！', "text");
        return false;
    }

    if (pwd == '') {
        $.toast('密码不能为空！', "text");
        return false;
    } else if (pwd.length < 6) {
        $.toast('密码不得少于6位！', "text");
        return false;
    }

    if (pwdA == '') {
        $.toast('请输入确认密码！', "text");
        return false;
    } else if (pwd != pwdA) {
        $.toast('密码输入不一致！', "text");
        return false;
    }

    if (VCode == '') {
        $.toast('请输入验证码！', "text");
        return false;
    }

    if (qrCode == '') {
        $.toast('请输入邀请码！', "text");
        return false;
    }

    var reqData = {};
    reqData.mobile = mobile;
    reqData.pwd = pwd;
    reqData.verifyCode = VCode;
    reqData.organizationalCode = qrCode;

    var url = requestUrl + "appUserCenter/register";
    sendRequestUtil(url, reqData, registerUser_success);
}

//注册成功回调函数
function registerUser_success(data) {
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        $.toast("注册成功", function () {
            window.location.href = "Login.html";
        });
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****最新交易动态****/
function get_NewestSubscription() {
    var reqData = {};
    reqData.count = "10";
    reqData.stockType = 2;

    var url = requestUrl + "appTransCenter/getNewestSubscription";
    sendRequestUtil(url, reqData, NewestSubscription_success);
}

function NewestSubscription_success(data) {
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
    }
    else {
        //
    }
}

/****搜索股票列表**** stockChar :股票代码或名称*/
function get_StockSearch() {
    var reqData = {};
    reqData.stockChar = "601398";

    var url = requestUrl + "appRiskCenter/stockSearch";
    sendRequestUtil(url, reqData, stockSearch_success);
}

function stockSearch_success(data) {
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****自选股列表**** stockChar :股票代码或名称*/
function get_OptionalStock() {
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionId;
    reqData.firmCode = sessionStorage.firmCode;
    reqData.stockType = 2;

    var url = requestUrl + "appTransCenter/optionalStock";
    sendRequestUtil(url, reqData, optionalStock_success);
}

function optionalStock_success(data) {
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****添加自选股**** stockCode :股票代码*/
function get_AddOptionalStock() {
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionId;
    reqData.firmCode = "47";
    reqData.stockCode = "601398";
    reqData.stockType = 2;

    var url = requestUrl + "appTransCenter/addOptionalStock";
    sendRequestUtil(url, reqData, addOptionalStock_success);
}

function addOptionalStock_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****删除自选股**** stockCode :股票代码*/
function get_DelOptionalStock() {
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionId;
    reqData.firmCode = "47";
    reqData.stockCode = "601398";
    reqData.stockType = 2;

    var url = requestUrl + "appTransCenter/delOptionalStock";
    sendRequestUtil(url, reqData, delOptionalStock_success);
}

function delOptionalStock_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****认购***
 * stockCode :股票代码
 * principal：名义本金
 * transtype：D:下跌，U：上涨
 * transway：交易方式：S市价，X：限价，J：均价
 * week：交易期限(周)
 * premium：权利金
 * premiumproportion：权利金比例
 */
function get_Strategy() {
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionId;
    reqData.firmCode = "47";

    reqData.stockCode = "600100";
    reqData.principal = "50000";
    reqData.transtype = "U";
    reqData.transway = "S";
    reqData.week = "2";
    reqData.premiumproportion = "0.2200";
    reqData.premium = "20000";
    reqData.stockType = 2;

    var url = requestUrl + "appTransCenter/strategy";
    sendRequestUtil(url, reqData, strategy_success);
}

function strategy_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****持仓中****/
function get_MyInPositions() {
    var Login = sessionStorage.getItem("isLogin");
    if (Login != "true") {
        return;
    }
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionId;
    reqData.firmCode = sessionStorage.firmCode;
    reqData.stockType = 2;

    var url = requestUrl + "appTransCenter/getMyInPositions";
    sendRequestUtil(url, reqData, myInPositions_success);
}
//连接后台获取持仓中信息成功后回调函数
function myInPositions_success(data) {
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {
            $("#myOrder_CCZ_li_div").empty();
            $("#myOrder_CCZ_li_script").tmpl(retData).appendTo('#myOrder_CCZ_li_div');
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****委托平仓**/
function get_addEntrustOrder(dic) {
    var price = $('#myOrde_CCZ_Input_price').val();
    var num = $('#myOrde_CCZ_Input_Num').val();
    var reg1 = /^(0|([1-9]\d*))(\.\d{1,2})?$/;
    var reg2 = /^[1-9]\d*$/;
    if (price == '') {
        $.toast('请输入价格！', "text");
        return false;
    }
    if (!reg1.test(price) && !reg2.test(price)) {
        $.toast('请输入有效金额', 'text');
        return;
    }
    if (num == '') {
        $.toast('请输入数量！', "text");
        return false;
    }
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionId;
    reqData.firmCode = sessionStorage.firmCode;
    reqData.tOpenId = dic.tOpenId;
    reqData.tEntrustNum = num;
    reqData.tEntrustPrice = price;
    reqData.stockType = 2;

    var url = requestUrl + "appTransCenter/addEntrustOrder";
    sendRequestUtil(url, reqData, addEntrustOrder_success);
}
//委托平仓成功函数
function addEntrustOrder_success(data) {
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        $.toast(retMessage, "text");
        CloseMyOrderDiv();
        var retData = data.retData;
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****已结算****/
function get_MyClosePositions() {
    var Login = sessionStorage.getItem("isLogin");
    if (Login != "true") {
        return;
    }
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionId;
    reqData.firmCode = sessionStorage.firmCode;
    reqData.stockType = 2;

    var url = requestUrl + "appTransCenter/getMyClosePositions";
    sendRequestUtil(url, reqData, myClosePositions_success);
}
//请求数据返回持仓已结算列表回调函数
function myClosePositions_success(data) {
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {
            $("#myOrder_YJS_li_div").empty();
            $("#myOrder_YJS_li_script").tmpl(retData).appendTo('#myOrder_YJS_li_div');
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****未完成订单****/
function get_holdUnfinish() {
    var Login = sessionStorage.getItem("isLogin");
    if (Login != "true") {
        return;
    }
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionId;
    reqData.firmCode = sessionStorage.firmCode;
    reqData.stockType = 2;
//未完成订单接口
    var url = requestUrl + "appTransCenter/getUnDonePositions";
    sendRequestUtil(url, reqData, holdUnfinish_success);
}
//未完成订单回调函数
function holdUnfinish_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {
            for (j = 0; j < retData.length; j++) {
                var Ttype = retData[j].tTranstype;
                var status = retData[j].tTransDown;
                if (Ttype == "U") {
                    retData[j].tTranstype = "上涨";
                }
                if (Ttype == "D") {
                    retData[j].tTranstype = "下跌";
                }
                if (status == 'F') {
                    retData[j].statusHtml = "已撤回";
                }
                else if (status == 'D') {
                    retData[j].statusHtml = "已驳回";
                }
                else if (status == 'T') {
                    retData[j].statusHtml = "撤回订单";
                }
            }
            $("#myOrder_WWC_li_div").empty();
            $("#myOrder_WWC_li_script").tmpl(retData).appendTo('#myOrder_WWC_li_div');
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****撤销订单***/
function get_updateTransDown(dic) {
    $.confirm("您确定要撤销订单吗？", function () {
        var reqData = {};
        reqData.reqSession = sessionStorage.sessionStr;
        reqData.firmCode = sessionStorage.firmCode;
        reqData.transId = dic.tTransid

        var url = requestUrl + "appTransCenter/updateTransDown";
        sendRequestUtil(url, reqData, updateTransDown_success);
    })
}
//撤销订单连接后台成功函数
function updateTransDown_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        $.toast(retMessage, "text");
        get_holdUnfinish();
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****获取用户余额***/
function get_yongHuYuE(data) {
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionId;
    reqData.firmCode = sessionStorage.firmCode;
    var url = requestUrl + "appMoneyCenter/selectAvailableBalance";
    sendRequestUtil(url, reqData, yongHuYuE_success);
}

//获取用户余额成功函数
function yongHuYuE_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData === null) {
            //
        } else {
            sessionStorage.setItem('ZhangHuYuE', retData.availableBalance);
            $("#myPage_YUE").html(retData.availableBalance.toFixed(2));
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****获取用户资金明细***/
function get_ZiJinMingXi() {
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionId;
    reqData.firmCode = sessionStorage.firmCode;
    var url = requestUrl + "appMoneyCenter/getFundWaterListByFirmId";
    sendRequestUtil(url, reqData, ZiJinMingXi_success);
}

function ZiJinMingXi_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {
            for (j = 0; j < retData.length; j++) {
                var Ttype = retData[j].mClearstatus;
                var type = retData[j].mFundstype;
                if (type == "I") {
                    retData[j].mFundstype = "入金"
                }
                if (type == "O") {
                    retData[j].mFundstype = "出金"
                }
                if (Ttype == "0") {
                    retData[j].mChagestatus = "未提交";
                }
                if (Ttype == "1") {
                    retData[j].mChagestatus = "审核中";
                }
                if (Ttype == "2") {
                    retData[j].mChagestatus = "已提交(市场端审核通过)";
                }
                if (Ttype == "3") {
                    retData[j].mChagestatus = "银行处理中";
                }
                if (Ttype == "5") {
                    retData[j].mChagestatus = "银行处理成功";
                }
                if (Ttype == "6") {
                    retData[j].mChagestatus = "市场端处理失败";
                }
                if (Ttype == "7") {
                    retData[j].mChagestatus = "银行端处理失败";
                }
                if (Ttype == "F") {
                    retData[j].mChagestatus = "审核拒绝";
                }
                if (Ttype == "N") {
                    retData[j].mChagestatus = "未处理";
                }
                if (Ttype == "P") {
                    retData[j].mChagestatus = "审批中";
                }
                if (Ttype == "S") {
                    retData[j].mChagestatus = "审核完成";
                }
                retData[j].mChangedate = retData[j].mChangedate + " " + retData[j].mChangetime;
            }
            $("#myZiJinMingXi_li_script").tmpl(retData).appendTo('#myZiJinMingXi_li_div');
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****设置支付密码*** verifyCode :短信验证码*/
function get_SetPayPwd() {
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionId;
    reqData.firmCode = sessionStorage.firmCode;

    reqData.pwd = "123456";
    reqData.verifyCode = "0013";

    var url = requestUrl + "appUserCenter/setPayPwd";
    sendRequestUtil(url, reqData, setPayPwd_success);
}

function setPayPwd_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****查询已签约银行信息***/
function get_myBankName() {
    var reqData = {};
    reqData.firmCode = sessionStorage.firmCode;

    var url = requestUrl + "appMoneyCenter/myBankName";
    sendRequestUtil(url, reqData, myBankName_success);
}

function myBankName_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData.length != 0) {
            for (var i = 0; i < retData.length; i++) {
                retData[i].account = "**** **** **** " + retData[i].account.substr(-4);
                if (retData[i].bankCode == "102" || retData[i].bankName == '102') {
                    retData[i].bankImg = "assets/i/bankLogo/bank-icon@1x.png";
                }
            }
            $("#go_contract,#add-sign-contract").hide();
            $("#get_contract_temp").empty();
            $("#dynamic_generation_bank_list").tmpl(retData).appendTo('#get_contract_temp');
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****查询签约银行信息***/
function get_mBanksList() {
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionStr;
    reqData.firmCode = sessionStorage.firmCode;

    var url = requestUrl + "appMoneyCenter/getmBanksList";
    sendRequestUtil(url, reqData, mBanksList_success);
}

function mBanksList_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {
            QYdata = retData;
            $("#can_contract_bank_list").empty();
            $("#can_contract_bank_temp").tmpl(retData).appendTo('#can_contract_bank_list');
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}


/****查询总行信息***/
function get_MBanks() {
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionStr;
    reqData.firmCode = sessionStorage.firmCode;

    var url = requestUrl + "appMoneyCenter/getMBanks";
    sendRequestUtil(url, reqData, MBanks_success);
}

function MBanks_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {
            $("#popupTitle").html("请选择发卡行");
            $("#popup-list").empty();
            $("#allBank_li_script").tmpl(retData).appendTo('#popup-list');
            ShowMyBankPopup();
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****查询省份***/
function get_MProvincesList() {
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionStr;
    reqData.firmCode = sessionStorage.firmCode;

    var url = requestUrl + "appMoneyCenter/getMPrvincesList";
    sendRequestUtil(url, reqData, MProvincesList_success);
}

function MProvincesList_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {
            $("#popupTitle").html("请选择省份");
            $("#popup-list").empty();
            $("#allProvinces_li_script").tmpl(retData).appendTo('#popup-list');
            ShowMyBankPopup();
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****查询省内城市***/
function get_MCityList(data) {
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionStr;
    reqData.firmCode = sessionStorage.firmCode;
    reqData.provinceCode = data.mProvincescode;

    var url = requestUrl + "appMoneyCenter/getMCityList";
    sendRequestUtil(url, reqData, MCityList_success);
}

function MCityList_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {
            $("#popupTitle").html("请选择城市");
            $("#popup-list").empty();
            $("#allCity_li_script").tmpl(retData).appendTo('#popup-list');
            ShowMyBankPopup();
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****查询分行数据***/
function get_MBranchList(banksData, cityData) {
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionId;
    reqData.firmCode = sessionStorage.firmCode;
    reqData.supBankId = banksData.mBankcode;
    reqData.cityId = cityData.citycode;
    reqData.bankName = "";

    var url = requestUrl + "appMoneyCenter/getMBranchList";
    sendRequestUtil(url, reqData, MBranchList_success);
}

function MBranchList_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {
            $("#popupTitle").html("请选择分行");
            $("#popup-list").empty();
            $("#allBranch_li_script").tmpl(retData).appendTo('#popup-list');
            ShowMyBankPopup();
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****获取签约短信验证码***/
function get_AuthenticationCode() {
    var mobileNum = $('#QY-mobileNum').val();
    var myreg = /^1[3|4|5|7|8][0-9]\d{4,8}$/;
    if (mobileNum == '') {
        $.toast('请输入手机号！', "text");
        return false;
    } else if (mobileNum.length != 11 || !myreg.test(mobileNum)) {
        $.toast('请输入有效的手机号！', "text");
        return false;
    }


    var QYBankArray = JSON.parse(sessionStorage.getItem('QYBanksData'));
    var reqData = {};
    reqData.firmCode = sessionStorage.firmCode;
    reqData.mobile = mobileNum;
    reqData.bankId = QYBankArray.mBankid;
    reqData.reqSession = sessionStorage.sessionId;

    var url = requestUrl + "appMoneyCenter/getAuthenticationCode";
    sendRequestUtil(url, reqData, AuthenticationCode_success);
}

function AuthenticationCode_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        $.toast("验证码发送成功", "text");
        var retData = data.retData;
        if (retData != null) {
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****签约***/

function get_marketSignInfo() {
    var bankCardNum = $('#bankCard-Num').val();
    var mobileNum = $('#QY-mobileNum').val();
    var SMS = $('#QY-SMSNum').val();
    var userName = $('#QY-userName').val();
    var IDNumber = $('#QY-IDNumber').val();

    var myreg = /^1[3|4|5|7|8][0-9]\d{4,8}$/;

    if (bankCardNum == '') {
        $.toast('请输入银行卡号！', "text");
        return false;
    }
    if (mobileNum == '') {
        $.toast('请输入手机号！', "text");
        return false;
    }
    else if (mobileNum.length != 11 || !myreg.test(mobileNum)) {
        $.toast('请输入有效的手机号！', "text");
        return false;
    }

    if (SMS == '') {
        $.toast('请输入验证码！', "text");
        return false;
    }

    if (userName == '') {
        $.toast('请输入姓名！', "text");
        return false;
    }
    if (IDNumber == '') {
        $.toast('请输入身份证号！', "text");
        return false;
    }

    var QYBankArray = JSON.parse(sessionStorage.getItem('QYBanksData'));
    var branchBinkData = JSON.parse(localStorage.getItem('selectedBranchDic'));
    var cityData = JSON.parse(localStorage.getItem('selectedCityDic'));

    var reqData = {};
    reqData.firmCode = sessionStorage.firmCode;
    reqData.reqSession = sessionStorage.sessionId;

    reqData.mobile = mobileNum;
    reqData.mBankid = QYBankArray.mBankid;
    reqData.mBankname = branchBinkData.mBankid;
    reqData.mSignbranch = branchBinkData.mbranchname;
    reqData.mSignbranchnum = branchBinkData.mBranchid;
    reqData.mSignprovince = cityData.parentcode;
    reqData.mSigncity = cityData.citycode;
    reqData.mSignaccountname = userName;
    reqData.mSignaccount = bankCardNum;
    reqData.mReservephone = mobileNum;
    reqData.mSignstatus = "F";
    reqData.m_ReserveFeildA = SMS;
    reqData.m_ReserveFeildB = IDNumber;

    var url = requestUrl + "appMoneyCenter/marketSignInfo";
    sendRequestUtil(url, reqData, marketSignInfo_success);
}

function marketSignInfo_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {

        }
        sessionStorage.setItem('isSign', true);

        // 签约成功跳回我的页面
        $.toast(retMessage, function () {
            document.location.href = "personalPage.html";
        });
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****查询可充值银行信息***/
function rechargeableBankName() {
    var reqData = {};
    reqData.firmCode = sessionStorage.firmCode;

    var url = requestUrl + "appMoneyCenter/myBankName";
    sendRequestUtil(url, reqData, rechargeable_success);
}

function rechargeable_success(data) {
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {
            $("#bank-name-list").empty();
            $("#rechargeable_bank_temp").tmpl(retData).appendTo('#bank-name-list');
            $("#sebank").html(retData[0].bankName);
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****查询充值金额档位**
 */
function top_up_amount_gear() {
    var reqData = {};
    reqData.firmCode = sessionStorage.firmCode;

    var url = requestUrl + "appRiskCenter/getRRechargeFile";
    sendRequestUtil(url, reqData, top_up_amount_gear_success);
}

function top_up_amount_gear_success(data) {
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {
            $("#top_up_amount_gear").empty();
            $("#top_up_amount_gear_temp").tmpl(retData).appendTo('#top_up_amount_gear');
            //$("#top_up_amount_gear li").eq(0).addClass("list-active");
            //$("#invest_money").val($(".invest-amount li.list-active").html());
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****充值*****/
function gold_entry() {
    var reqData = {};
    reqData.firmCode = sessionStorage.firmCode;
    reqData.mChangeMoney = sessionStorage.getItem("money");
    reqData.mFundsType = "I";
    reqData.mChangeType = "I";
    var url = requestUrl + "appMoneyCenter/marketChangeFunds";
    sendRequestUtil(url, reqData, gold_entry_success);
}

function gold_entry_success(data) {
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        $.toast("充值成功!", function () {
            window.location.href = "personalPage.html";
        });
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****查询可提现银行信息***/
function cashableBankName() {
    var reqData = {};
    reqData.firmCode = sessionStorage.firmCode;

    var url = requestUrl + "appMoneyCenter/myBankName";
    sendRequestUtil(url, reqData, cashable_success);
}

function cashable_success(data) {
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData;
        if (retData != null) {
            $("#cashable-bank-list").empty();
            $("#cashable_bank_temp").tmpl(retData).appendTo('#cashable-bank-list');
            $("#sebank").html(retData[0].bankName);
        }
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****提现*****/
function withdrawal_amount() {
    var reqData = {};
    reqData.firmCode = sessionStorage.firmCode;
    reqData.mChangeMoney = sessionStorage.getItem("money");
    reqData.mFundsType = "O";
    reqData.mChangeType = "D";
    var url = requestUrl + "appMoneyCenter/marketChangeFunds";
    sendRequestUtil(url, reqData, withdrawal_amount_success);
}

function withdrawal_amount_success(data) {
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        $.toast("提现成功!", function () {
            window.location.href = "personalPage.html";
        });
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****判断是否已设置支付密码*****/
function isSetPassword() {
    var reqData = {};
    reqData.firmCode = sessionStorage.firmCode;
    var url = requestUrl + "appUserCenter/getIsPayPwd";
    sendRequestUtil(url, reqData, isSetPassword_success);
}

function isSetPassword_success(data) {
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        var retData = data.retData
        if (retData.status) {
            var num = parseFloat($("#invest_money").val());
            sessionStorage.setItem('money', num);
            window.location.href = "enterPassword.html";
        }
    }
    else if (retCode == "N010") {
        $.toast(retMessage, "text", function () {
            window.location.href = "setPaymentPassword.html";
        });
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****设置支付密码*****/
function set_payment_pwd() {
    var pwd = $("#paymentpwd").val();
    var paymentpwdagain = $("#paymentpwdagain").val();
    var reg = /^[A-Za-z0-9]+$/;
    if (pwd == "") {
        $.toast("支付密码不能为空", "text");
        return false;
    }
    if (!reg.test(pwd)) {
        $.toast("支付密码只能包含数字或字母", "text");
        return false;
    }
    if (pwd != paymentpwdagain) {
        $.toast("两次输入的密码不一致", "text");
        return false;
    }
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionId;
    reqData.firmCode = sessionStorage.firmCode;
    reqData.pwd = pwd;
    reqData.verifyCode = "1111";

    var url = requestUrl + "appUserCenter/setPayPwd";
    sendRequestUtil(url, reqData, set_payment_pwd_success);
}

function set_payment_pwd_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        sessionStorage.setItem('isPay', true);
        $.toast("设置成功", function () {
            var url = sessionStorage.getItem('pageName');
            window.location.href = url;
        });
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****修改支付密码*****/
function change_payment_pwd() {
    var oldpwd = $("#oldPassword").val();
    var newpwd = $("#newPassword").val();
    var reg = /^[A-Za-z0-9]+$/;
    if (oldpwd == "") {
        $.toast("请输入旧密码", "text");
        return false;
    }
    if (newpwd == "") {
        $.toast("请输入新密码", "text");
        return false;
    }
    if (!reg.test(newpwd)) {
        $.toast("密码只能包含数字或字母", "text");
        return false;
    }
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionId;
    reqData.firmCode = sessionStorage.firmCode;
    reqData.oldpwd = oldpwd;
    reqData.newpwd = newpwd;
    reqData.vcode = "1111";

    var url = requestUrl + "appUserCenter/updatePayPwd";
    sendRequestUtil(url, reqData, change_payment_pwd_success);
}

function change_payment_pwd_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        $.toast("修改成功", function () {
            var url = sessionStorage.getItem('pageName');
            window.location.href = url;
        });
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****修改登录密码*****/
function modify_password() {
    var phoneNum = $("#ZHMMMobile").val();
    var oldPwd = $("#OLDpassword").val();
    var newPwd = $("#ZHMMPwd").val();
    var newPwdAgain = $("#ZHMMPwdA").val();
    var reg = /^1[3|4|5|7|8][0-9]\d{4,8}$/;
    if (phoneNum == "") {
        $.toast("请输入手机号", "text");
        return false;
    }
    if (!reg.test(phoneNum)) {
        $.toast("手机号格式不正确", "text");
        return false;
    }
    if (oldPwd == "") {
        $.toast("请输入旧密码", "text");
        return false;
    }
    if (newPwd == "") {
        $.toast("请输入新密码", "text");
        return false;
    }
    if (newPwd.length < 6) {
        $.toast('新密码不得少于6位！', "text");
        return false;
    }
    if (newPwdAgain == "") {
        $.toast("确认密码不能为空", "text");
        return false;
    }
    if (newPwd != newPwdAgain) {
        $.toast("两次输入的密码不一致", "text");
        return false;
    }
    var reqData = {};
    reqData.reqSession = sessionStorage.sessionId;
    reqData.firmCode = sessionStorage.firmCode;
    reqData.phone = phoneNum;
    reqData.oldPwd = oldPwd;
    reqData.newPwd = newPwd;

    var url = requestUrl + "appUserCenter/u_login_pwd";
    sendRequestUtil(url, reqData, modify_password_success);
}

function modify_password_success(data) {
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        $.toast("修改成功", function () {
            window.location.replace('Login.html')
        });
    }
    else {
        $.toast(retMessage, "text");
    }
}

/****找回登录密码*****/
function retrieve_password() {
    var phoneNum = $("#rgsMobile").val();
    var vCode = $("#ZHMMVCode").val();
    var newPwd = $("#ZHMMPwd").val();
    var newPwdAgain = $("#ZHMMPwdA").val();
    var reg = /^1[3|4|5|7|8][0-9]\d{4,8}$/;
    if (phoneNum == "") {
        $.toast("请输入手机号", "text");
        return false;
    }
    if (!reg.test(phoneNum)) {
        $.toast("手机号格式不正确", "text");
        return false;
    }
    if (vCode == "") {
        $.toast("请输入验证码", "text");
        return false;
    }
    if (newPwd == "") {
        $.toast("请输入新密码", "text");
        return false;
    }
    if (newPwd.length < 6) {
        $.toast('新密码不得少于6位！', "text");
        return false;
    }
    if (newPwdAgain == "") {
        $.toast("确认密码不能为空", "text");
        return false;
    }
    if (newPwd != newPwdAgain) {
        $.toast("两次输入的密码不一致", "text");
        return false;
    }
    var reqData = {};
    reqData.phone = phoneNum;
    reqData.newPwd = newPwd;
    reqData.vCode = vCode;

    var url = requestUrl + "appUserCenter/call_back_pwd";
    sendRequestUtil(url, reqData, retrieve_password_success);
}

function retrieve_password_success(data) {
    console.log(data);
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    if (retCode == "0000") {
        $.toast("重置成功", function () {
            window.location.replace('Login.html')
        });
    }
    else {
        $.toast(retMessage, "text");
    }
}

function wangjimima() {
    window.location.replace('zhaoHuiMiMa.html')
}

function replaceLogin() {
    window.location.replace('Login.html')
}

/****获取用户信息*****/
function getUserInformation() {
    var reqData = {};
    reqData.firmCode = sessionStorage.firmCode;
    reqData.reqSession = sessionStorage.sessionId;
    var url = requestUrl + "appUserCenter/s_firm_info";
    sendRequestUtil(url, reqData, getUserInformation_success);
}

//获取用户信息成功回调函数
function getUserInformation_success(data) {
    var retCode = data.retCode;
    var retMessage = data.retMessage;
    var retData = data.retData;
    if (retCode == "0000") {
        if (retData.firmName != null) {
            $("#sheZhi_YuE").html(retData.firmName);
        }
        $("#sheZhi-List-mobile").html(retData.phoneNum);
        $("#transaction-code").html(retData.firmCode);
    }
    else {
        $.toast(retMessage, "text");
    }
}