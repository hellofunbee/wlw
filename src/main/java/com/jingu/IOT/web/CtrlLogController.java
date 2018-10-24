package com.jingu.IOT.web;

import com.jingu.IOT.entity.InputRequset;
import com.jingu.IOT.requset.StaticRequest;
import com.jingu.IOT.response.IOTResult;
import com.jingu.IOT.service.CtrlLogService;
import com.jingu.IOT.service.PointService;
import com.jingu.IOT.util.CheckUtil;
import com.jingu.IOT.util.PageData;
import com.jingu.IOT.util.ToolUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;


@RestController
public class CtrlLogController {
    @Autowired
    private CtrlLogService ctrlLogService;
    @Autowired
    ToolUtil toolUtil;
    @Autowired
    CheckUtil checkUtil;
    @Autowired
    PointService pointService;

    /**
     * 列表
     */
    @RequestMapping("/ctr_log/list")
    public IOTResult list(@RequestParam PageData params) {
        return ctrlLogService.list(params);
    }


    /**
     * 信息
     */
    @RequestMapping("/ctr_log/info")
    public IOTResult info(@RequestParam PageData params) {

        return ctrlLogService.findById(params);
    }

    /**
     * 保存
     */
    @RequestMapping("/save")

    public IOTResult save(@RequestBody PageData params) {


        return ctrlLogService.save(params);
    }

    /**
     * 修改
     */
    @RequestMapping("/update")

    public IOTResult update(@RequestBody PageData params) {


        return ctrlLogService.update(params);
    }

    /**
     * 删除
     */
    @RequestMapping("/delete")
    public IOTResult delete(@RequestBody PageData params) {
        return ctrlLogService.del(params);
    }

    /**
     * 施工分析
     * 以设备为单位
     * 时间为横坐标
     * 各开关开启时间*为纵坐标进行统计
     *
     * @param sRequest
     */
    @CrossOrigin
    @RequestMapping(value = "getLogCaldata", method = RequestMethod.POST)
    public IOTResult getCalData(@RequestBody InputRequset sRequest) throws UnsupportedEncodingException {
        return ctrlLogService.getCalData(sRequest);
    }

    @CrossOrigin
    @RequestMapping(value = "getLogCaldata_app", method = RequestMethod.POST)
    public IOTResult getCalData(@RequestBody StaticRequest sRequest) throws UnsupportedEncodingException {
        return ctrlLogService.getCalData_app(sRequest);
    }


    @RequestMapping(value = "testi", method = RequestMethod.GET)
    public void test() throws Exception {
        ctrlLogService.inserRandom();
    }


}
