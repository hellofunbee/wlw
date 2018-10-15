package com.jingu.IOT.service;

import com.jingu.IOT.dao.ConstantDao;
import com.jingu.IOT.response.IOTResult;
import com.jingu.IOT.util.PageData;
import com.jingu.IOT.util.ToolUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Created by weifengxu on 2018/9/26.
 */
@Component
public class ConstantService {
    @Autowired
    ConstantDao constantDao;
    ToolUtil toolUtil;

    @Autowired
    public ConstantService(ToolUtil toolUtil) {
        this.toolUtil = toolUtil;

    }


    public IOTResult list(PageData a) {

        List<Map<String, Object>> fields = constantDao.list(a);
        if (fields != null && fields.size() > 0) {
            return new IOTResult(true, "查询成功", fields.get(0), 0);
        }
        return new IOTResult(false, "暂无相关信息", null, 0);

    }


    public IOTResult add(PageData a) {

        int fields = constantDao.save(a);
        if (fields > 0) {
            return new IOTResult(true, "添加成功", fields, 0);
        }
        return new IOTResult(false, "添加失败", null, 0);
    }

    public IOTResult update(PageData a) {

        int fields = constantDao.update(a);
        if (fields > 0) {
            return new IOTResult(true, "修改成功", fields, 0);
        } else {
            int status = constantDao.save(a);
            if (status > 0) {
                return new IOTResult(true, "修改成功", fields, 0);
            } else {
                return new IOTResult(false, "修改失败", null, 0);
            }
        }
    }

    public IOTResult del(PageData a) {

        int fields = constantDao.del(a);
        if (fields > 0) {
            return new IOTResult(true, "删除成功", fields, 0);
        }
        return new IOTResult(false, "删除失败", null, 0);
    }
}
