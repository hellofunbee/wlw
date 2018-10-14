package com.jingu.IOT.service;

import com.jingu.IOT.dao.CtrlLogDao;
import com.jingu.IOT.entity.InputRequset;
import com.jingu.IOT.response.IOTResult;
import com.jingu.IOT.util.CheckUtil;
import com.jingu.IOT.util.CommonUtils;
import com.jingu.IOT.util.PageData;
import com.jingu.IOT.util.ToolUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author zhiqiu
 * @email fei6751803@163.com
 * @date 2018-10-04 11:48:42
 */
@Component
public class CtrlLogService {
    @Autowired
    CtrlLogDao ctrlLogDao;
    @Autowired
    ToolUtil toolUtil;
    @Autowired
    CheckUtil checkUtil;
    @Autowired
    PointService pointService;
    @Autowired
    private SettingService settingService;

    public IOTResult save(PageData pd) {
        int back = ctrlLogDao.save(pd);

        if (back > 0)
            return new IOTResult(true, "保存成功", back, 0);
        return new IOTResult(false, "保存失败", null, 0);

    }

    public IOTResult del(PageData pd) {
        int back = ctrlLogDao.del(pd);
        if (back > 0)
            return new IOTResult(true, "删除成功", back, 0);
        return new IOTResult(false, "删除失败", null, 0);
    }

    public IOTResult update(PageData pd) {
        int back = ctrlLogDao.update(pd);
        if (back > 0)
            return new IOTResult(true, "修改成功", back, 0);
        return new IOTResult(false, "修改失败", null, 0);
    }

    public IOTResult list(PageData pd) {
        List<Map<String, Object>> back = ctrlLogDao.list(pd);

        if (back != null && back.size() > 0)
            return new IOTResult(true, "查看成功", back, 0);
        return new IOTResult(false, "暂无数据", null, 0);

    }

    public IOTResult findById(PageData params) {
        List<Map<String, Object>> back = ctrlLogDao.findById(params);

        if (back != null && back.size() > 0)
            return new IOTResult(true, "查看成功", back.get(0), 0);
        return new IOTResult(false, "暂无数据", null, 0);
    }


    public IOTResult getCalData(InputRequset sRequest) {
        IOTResult x = checkUtil.chckSession(sRequest, InputRequset.class);
        if (x != null) return x;

        if (sRequest.getCkdata() == 1) {
            if (sRequest.getBeginTime().compareTo(sRequest.getEndTime()) > 0) {
                return new IOTResult(false, "输入的日期有误", null, 3);
            }
            return new IOTResult(true, "日期输入正确", null, 0);
        }

        List<Integer> tp_ids = sRequest.getTp_ids();//设备节点
        List<Integer> c_ids = sRequest.getC_ids();//控制ids
        int interval_type = sRequest.getInterval_type();//时间间隔

        List<Map> result = new ArrayList<>();
        for (Integer tp_id : tp_ids) {
            Map cmap = new HashMap();

            List<Map> ctrls = new ArrayList<>();
            Map dv = pointService.findById(tp_id);
            if (dv == null || dv.get("tp_name") == null)
                continue;

            for (int c_id : c_ids) {

                PageData pd = new PageData();
                pd.put("ctrl_id", c_id);
                pd.put("ts", sRequest.getBeginTime());
                pd.put("te", sRequest.getEndTime());
                List<Map<String, Object>> logs = ctrlLogDao.list(pd);// 要找的数据

                logs = CommonUtils.effect_Logs_By_Time(logs, interval_type);//数据处理

                Map ctrl = settingService.getControlSetting(c_id);
                if (ctrl == null) {
                    continue;
                }

                Map d = new HashMap();
                d.put("list", logs);
                d.put("ctrl_id", ctrl.get("ctrl_id"));//ctrl_id
                d.put("ctrl_name", ctrl.get("ctrl_name"));//ctrl_name
                ctrls.add(d);

            }
            cmap.put("data", ctrls);
            cmap.put("tp_id", dv.get("tp_id"));
            cmap.put("tp_name", dv.get("tp_name"));
            result.add(cmap);
        }
        if (result.isEmpty()) {
            return new IOTResult(false, "暂无相关信息", null, 0);
        }
        return new IOTResult(true, "查看成功", result, 0);
    }

    public void inserRandom() throws Exception {
        ctrlLogDao.inserRandom();
    }
}
