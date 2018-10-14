package com.jingu.IOT.util;

import com.jingu.IOT.response.IOTResult;
import com.jingu.IOT.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

/**
 * Created by weifengxu on 2018/10/6.
 */
@Component
public class CheckUtil {
    @Autowired
    ToolUtil toolUtil;
    @Autowired
    UserService userService;


    public IOTResult chckSession(Object object, Class<?> srcClass) {
        try {
            Method getCkuid = srcClass.getMethod("getCkuid");

            Method getCksid = srcClass.getMethod("getCksid");
            String uid_ = (String) getCkuid.invoke(object);
            String sid_ = (String) getCksid.invoke(object);

            if (sid_ == null || sid_.trim().length() < 1 || uid_ == null || uid_ == null) {
                return new IOTResult(false, "信息不规范", null, 1);
            }
            // 注册登陆按照什么来????
            String check = toolUtil.getCheck(ToolUtil.IOT + uid_);
            if (check == null || !sid_.equals(check)) {
                return new IOTResult(false, "登陆失效", null, 2);
            }

            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return new IOTResult(false, "系统异常", null, 2);
        }


    }


    /**
     * 检查 用户名 和密码
     *
     * @return
     */

    public IOTResult CheckUP(Object object, Class<?> srcClass) {

        try {
            Method getTu_username = srcClass.getMethod("getTu_username");
            Method getTu_pwd = srcClass.getMethod("getTu_pwd");

            String userName = (String) getTu_username.invoke(object);
            String userPass = (String) getTu_pwd.invoke(object);

            if (userName == null || userName.trim().length() < 1) {
                return new IOTResult(false, "用户名不能为空", null, 1);
            }

            if (userPass == null || userPass.trim().length() < 1) {
                return new IOTResult(false, "密码不能为空", null, 2);
            }

            return null;

        } catch (Exception e) {
            e.printStackTrace();
            return new IOTResult(false, "系统异常", null, 2);
        }


    }

    /**
     * 校验管理员用户
     * @return
     */
    public IOTResult checkAdmin(Object object, Class<?> srcClass) {
        if (1 == 1)
            return null;

        try {
            Method getCkuid = srcClass.getMethod("getCkuid");
            Method getCksid = srcClass.getMethod("getCksid");
            String uid_ = (String) getCkuid.invoke(object);
            String sid_ = (String) getCksid.invoke(object);

            long uid = toolUtil.getbase_uidSid(uid_, sid_);
            int ckAdmin = userService.ckSuperAdmin(uid);
            if (ckAdmin == 0) {
                return new IOTResult(false, "权限不足", null, 111);
            }
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return new IOTResult(false, "系统异常", null, 2);
        }

    }


}
