/**
 * Created by weifengxu on 2018/10/7.
 */

/**
 *  开启audio 对讲
 */
function openTalk(onSuccess, onerror) {
    var szIP = sessionStorage.getItem('szIP');

    WebVideoCtrl.I_GetAudioInfo(szIP, {
        success: function (xmlDoc) {
            var oAudioChannels = $(xmlDoc).find("TwoWayAudioChannel");

            var cn = [];
            $.each(oAudioChannels, function () {
                var id = $(this).find("id").eq(0).text();
                cn.push(id);
            });

            if (cn.length == 0) {
                if (onerror) {
                    onerror(szIP + " " + "开始对讲失败！");
                }
            }

            var iAudioChannel = parseInt(cn[0], 10);
            var iRet = WebVideoCtrl.I_StartVoiceTalk(szIP, iAudioChannel);
            if (0 == iRet) {
                if (onSuccess) {
                    onSuccess(szIP + " " + "开始对讲成功");
                } else {
                    showOPInfo(szIP + " " + "开始对讲成功");
                }
            } else {
                if (onerror) {
                    onerror(szIP + " " + "开始对讲失败");
                } else {
                    showOPInfo(szIP + " " + "开始对讲失败");
                }
            }
        }, error: function () {
            if (onfail) {
                onfail();
            } else {
                showOPInfo(szIP + " 获取对讲通道失败！");
            }
        }

    });
}

function closeTalk(onSuccess, onerror) {
    var szIP = sessionStorage.getItem('szIP');
    var iRet = WebVideoCtrl.I_StopVoiceTalk();
    if (0 == iRet) {
        if (onSuccess) {
            onSuccess(szIP + " " + "停止对讲成功");
        } else {
            showOPInfo(szIP + " " + "停止对讲成功");
        }
    } else {
        if (onerror) {
            onerror(szIP + " " + "停止对讲失败");
        } else {
            showOPInfo(szIP + " " + "停止对讲失败");
        }
    }
}