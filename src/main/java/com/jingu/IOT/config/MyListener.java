package com.jingu.IOT.config;

/**
 * Created by weifengxu on 2018/10/1.
 */

import com.jingu.IOT.entity.ControlEntity;
import com.jingu.IOT.response.IOTResult;
import com.jingu.IOT.service.ConstantService;
import com.jingu.IOT.service.RedisService;
import com.jingu.IOT.service.SettingService;
import com.jingu.IOT.util.PageData;
import com.jingu.IOT.util.ToolUtil;
import org.springframework.beans.factory.annotation.Autowired;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;
import java.util.Map;

/**
 *
 */
@WebListener
public class MyListener implements ServletContextListener {
    @Autowired
    RedisService redisService;
    @Autowired
    SettingService settingService;
    @Autowired
    ConstantService constantService;

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        System.out.println("启动成功 初始化数据资源");
        System.out.println(servletContextEvent.getServletContext().getServerInfo());

        //配置 智能控制、预约控制、报警
        redisService.resetMonitor();
        redisService.resetRuleList();
        redisService.resetAlarmList();

        //初始化控制状态
        ControlEntity ctrl = new ControlEntity();
        ctrl.setIs_running(2);
        settingService.updateControlSetting(ctrl);

        //初始化常量
        IOTResult result = constantService.list(new PageData());

        try {
            if (result.isSuccess()) {
                ToolUtil.TotalS = (int) ((Map) result.getObject()).get("total_seconds");
                System.out.println("TotalS:" + ToolUtil.TotalS);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }


    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        System.out.println("监听器销毁");
    }
}