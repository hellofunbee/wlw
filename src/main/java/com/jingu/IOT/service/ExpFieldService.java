package com.jingu.IOT.service;

import com.jingu.IOT.dao.ExpFieldDao;
import com.jingu.IOT.requset.ExpFieldRequest;
import com.jingu.IOT.response.IOTResult;
import com.jingu.IOT.util.ToolUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Created by weifengxu on 2018/9/26.
 */
@Component
public class ExpFieldService {
    @Autowired
    ExpFieldDao expFieldDao;
    ToolUtil toolUtil;

    @Autowired
    public ExpFieldService(ToolUtil toolUtil) {
        this.toolUtil = toolUtil;

    }

    private IOTResult ck(ExpFieldRequest a) {
        if (a.getCkuid() == null || a.getCkuid().trim().length() < 1 || a.getCksid() == null || a.getCksid().trim().length() < 1) {
            return new IOTResult(false, "信息不规范", null, 1);
        }
        String check = toolUtil.getCheck(ToolUtil.IOT + a.getCkuid());
        if (check == null || !check.equals(a.getCksid())) {
            return new IOTResult(false, "登录失效", null, 2);
        }
        return null;
    }

    public IOTResult listExpFields(ExpFieldRequest a) {
        IOTResult i = ck(a);
        if (i != null)
            return i;

        List<Map<String, Object>> fields = expFieldDao.listExpFields(a);
        if (fields != null && fields.size() > 0) {
            return new IOTResult(true, "查询成功", fields, 0);
        }
        return new IOTResult(false, "暂无相关信息", null, 0);

    }

    public IOTResult listExpByFields(ExpFieldRequest a) {
        IOTResult i = ck(a);
        if (i != null)
            return i;

        List<Map<String, Object>> fields = expFieldDao.listExpByFields(a);
        if (fields != null && fields.size() > 0) {
            return new IOTResult(true, "查询成功", fields, 0);
        }
        return new IOTResult(false, "暂无相关信息", null, 0);

    }

    public IOTResult add(ExpFieldRequest a) {

        IOTResult i = ck(a);
        if (i != null)
            return i;

        int fields = expFieldDao.add(a);
        if (fields > 0) {
            return new IOTResult(true, "添加成功", fields, 0);
        }
        return new IOTResult(false, "添加失败", null, 0);
    }

    public IOTResult batchAdd(ExpFieldRequest a) {

        IOTResult i = ck(a);
        if (i != null)
            return i;

        if (a.getCs() != null || !a.getCs().isEmpty()) {

            expFieldDao.delByTu_Id(a.getTu_id());
            for (int c_id : a.getCs()) {
                ExpFieldRequest ef = new ExpFieldRequest();
                ef.setC_id(c_id);
                ef.setTu_id(a.getTu_id());
                int fields = expFieldDao.add(ef);
            }
            return new IOTResult(true, "添加成功", 0, 0);

        }
        return new IOTResult(false, "添加失败", null, 0);
    }

    public IOTResult del(ExpFieldRequest a) {
        IOTResult i = ck(a);
        if (i != null)
            return i;

        int fields = expFieldDao.del(a);
        if (fields > 0) {
            return new IOTResult(true, "删除成功", fields, 0);
        }
        return new IOTResult(false, "删除失败", null, 0);
    }
}
