//1:判断是否登录 2判断是否登录+是否签约 3.判断是否登录+是否签约+是否设置出入金密码
function checkStatusGoPage(level, mPage) {
    var isLogin = sessionStorage.getItem('isLogin');
    if (isLogin == "true" && level >= 1) {
        if (level == 1) {
            if (mPage != "") {
                document.location.href = mPage;
            }
            return true;
        }
        var isSign = sessionStorage.getItem('isSign');
        if (isSign == "true" && level >= 2) {
            if (level == 2) {
                if (mPage != "") {
                    document.location.href = mPage;
                }
                return true;
            }
            var isPay = sessionStorage.getItem('isPay');
            if (isPay == "true" && level >= 3) {
                if (mPage != "") {
                    document.location.href = mPage;
                }
                return true;
            } else {
                if (mPage == "chongZhiPage.html") {
                    sessionStorage.setItem('pageName', "chongZhiPage.html");
                } else if (mPage == "tiXianPage.html") {
                    sessionStorage.setItem('pageName', "tiXianPage.html");
                }
                $.confirm("未设置支付密码,现在去设置支付密码？", function () {
                    document.location.href = "setPaymentPassword.html"
                })
                return false;
            }
        } else {
            $.confirm("账户未签约,现在去签约？", function () {
                document.location.href = "myBankListPage.html"
            })
            return false;
        }
    } else {
        $.confirm("未登录,现在去登录？", function () {
            document.location.href = "Login.html"
        })
        return false;
    }
}

function checkStatus(level) {
    return checkStatusGoPage(level, "");
}




