package com.jingu.IOT.service;

import com.jingu.IOT.entity.MessageEntity;
import com.jingu.IOT.imsg.WebSocketTemplate;
import com.jingu.IOT.util.CommonUtils;
import com.jingu.IOT.util.SendMsg_webchinese;
import com.jingu.IOT.util.ToolUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created by weifengxu on 2018/9/25.
 * 信息服务 发短信 和即时消息
 */
@Component
public class SMSService {
    @Autowired
    UserService userService;
    @Autowired
    WebSocketTemplate webs;
    @Autowired
    ClassService classService;

    /**
     * 根据用户类型发送信息
     *
     * @param userType
     */
    public void sendSMSByUserType(List<Integer> userType, MessageEntity message) {
        List<Map<String, Object>> list = userService.listUserInType(userType, message);

        if (list == null || list.size() == 0) {
            return;
        }
        Map class1 = classService.findById(message.getM_class());
        if (class1 == null || !CommonUtils.has(class1.get("c_name"))) {
            return;
        }
        String className = (String) class1.get("c_name");

        //过滤
        List<String> phones = new ArrayList<>();
        for (Map u : list) {
            String p = (String) u.get("tu_phone");
            if (p != null && p.length() > 1) {
                phones.add(p);
            }
        }
        //m_type 2,3 即时：预警

        //即时： 【物联网测控系统】{1}尊敬的用户您好：感谢您对我平台的使用，我们很荣幸的通知您：{2}
        //预警： 【物联网测控系统】{1}尊敬的用户您好：我平台将发布{2}预警，以下是预警内容:{3}，请做好防范工作。


        String content = message.getM_title() == null ? "" : "[" + message.getM_title() + "]" + message.getM_content();
        String[] msg = null;
        if (message.getM_type() == 2) {
            msg = new String[]{"【即时：" + className + "】", content};
            message.setSmsModelId(ToolUtil.smsNoDelaymId);

        } else if (message.getM_type() == 3) {
            msg = new String[]{"【预警】","【" + className + "】", content};
            message.setSmsModelId(ToolUtil.smsAlarmId);
        } else {
            return;
        }

        message.setSmsModel(msg);
        message.setUseModel(true);


        sendSMS(phones, message);

    }


    /**
     * 发送短信
     *
     * @param phones
     * @param message
     */

    public static void sendSMS(List<String> phones, MessageEntity message) {

        String[] smsC;
        String msg = "【" + message.getM_title() + "】\n" + message.getM_content();
        smsC = new String[]{msg};
        if (message.isUseModel() && message.getSmsModel() != null && message.getSmsModel().length > 0) {
            smsC = message.getSmsModel();
        }

        StringBuffer sb = new StringBuffer();
        for (int i = 0; i < phones.size(); i++) {
            String p = phones.get(i);
            sb.append(p);
            sb.append(",");

            if (i != 0 && i % 99 == 0 || i == phones.size() - 1) {
                String mobs = sb.substring(0, sb.length() - 1);
                SendMsg_webchinese.send_1(smsC, mobs, message.getSmsModelId());
                sb = new StringBuffer();
            }
        }
    }

    /**
     * 发送即时消息
     *
     * @param mr
     */
    public void sendimsg(MessageEntity mr) {
        webs.sendMessage(mr);

    }
}
