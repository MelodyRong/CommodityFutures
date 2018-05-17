var layer = (function () {
    function init(msg, callBack) {
        var proHtml = '<div class="promptInfo"><div class="showLayer"></div><div class="proMsg"><p>' + msg + '</p><input type="button" id="clickBtn" value="取消" /><input class="goBtn" type="button" id="goBtn" value="去签约" /></div></div>'
        $("body").append(proHtml);
        $(".showLayer").css("height", $(document).height());
        $(".showLayer").css("width", $(document).width());
        var $height = $(".proMsg").height();
        $(".proMsg").css({"margin-top": -$height / 2});
        bindEvent(callBack);
    }

    function bindEvent(callBack) {
        $(document).delegate('#clickBtn', 'click', function () {
            hideMask();
            if (callBack != undefined) {
                callBack();
            }
        });
        $(document).delegate('#goBtn', 'click', function () {
            window.location.href = "myBankListPage.html"
        });
    }

    function hideMask() {
        $(".promptInfo").remove()
    }

    return {
        showMsg: init
    }
})();

