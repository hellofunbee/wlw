package com.jingu.IOT.util;


import com.cloopen.rest.sdk.CCPRestSmsSDK;

import java.util.HashMap;

/**
 * Created by weifengxu on 2018/9/26.
 */

public class SendMsg_webchinese {

    //用户名
    private static String Uid = "uid";

    //接口安全秘钥
    private static String Key = "key";

    //手机号码，多个号码如13800000000,13800000001,13800000002
    private static String smsMob = "13800000000";

    //短信内容
    private static String smsText = "验证码：8888";


    public static void main(String[] args) {

        HttpClientUtil client = HttpClientUtil.getInstance();

        //UTF发送
        int result = client.sendMsgUtf8(Uid, Key, smsText, smsMob);
        if (result > 0) {
            System.out.println("UTF8成功发送条数==" + result);
        } else {
            System.out.println(client.getErrorMsg(result));
        }
    }

    //webChinese
    public static int send(String smsText, String smsMob) {
        HttpClientUtil client = HttpClientUtil.getInstance();

        //UTF发送
        int result = client.sendMsgUtf8(Uid, Key, smsText, smsMob);
        if (result > 0) {
            System.out.println("UTF8成功发送条数==" + result);

        } else {
            System.out.println(client.getErrorMsg(result));
        }
        return result;

    }

    //容联云通信
    public static int send_1(String[] smsText, String smsMob,String smsModelId) {
        HashMap<String, Object> result = null;

        //初始化SDK
        CCPRestSmsSDK restAPI = new CCPRestSmsSDK();
        restAPI.init("app.cloopen.com", "8883");
        restAPI.setAccount("8aaf070866235bc501665746dc4714e5", "e47e12740d2847cb856b520d85125d5e");
        restAPI.setAppId("8aaf070866235bc501665746dca814ec");



        //******************************注释****************************************************************
        //*调用发送模板短信的接口发送短信                                                                  *
        //*参数顺序说明：                                                                                  *
        //*第一个参数:是要发送的手机号码，可以用逗号分隔，一次最多支持100个手机号                          *
        //*第二个参数:是模板ID，在平台上创建的短信模板的ID值；测试的时候可以使用系统的默认模板，id为1。    *
        //*系统默认模板的内容为“【云通讯】您使用的是云通讯短信模板，您的验证码是{1}，请于{2}分钟内正确输入”*
        //*第三个参数是要替换的内容数组。																														       *
        //**************************************************************************************************

        //**************************************举例说明***********************************************************************
        //*假设您用测试Demo的APP ID，则需使用默认模板ID 1，发送手机号是13800000000，传入参数为6532和5，则调用方式为           *
        //*result = restAPI.sendTemplateSMS("13800000000","1" ,new String[]{"6532","5"});																		  *
        //*则13800000000手机号收到的短信内容是：【云通讯】您使用的是云通讯短信模板，您的验证码是6532，请于5分钟内正确输入     *
        //*********************************************************************************************************************
        result = restAPI.sendTemplateSMS(smsMob, smsModelId, smsText);
        if ("000000".equals(result.get("statusCode"))) {
            //正常返回输出data包体信息（map）
            return 1;
        } else {
            //异常返回输出错误码和错误信息
            System.out.println("错误码=" + result.get("statusCode") + " 错误信息= " + result.get("statusMsg"));
            return 0;
        }
    }


}
