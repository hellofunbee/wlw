package com.jingu.IOT.web;

import com.jingu.IOT.response.IOTResult;
import com.jingu.IOT.service.ConstantService;
import com.jingu.IOT.util.PageData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * Created by weifengxu on 2018/9/26.
 */
@RestController
public class ConstantController {

    @Autowired
    ConstantService constantService;

    // 添加规则
    @CrossOrigin
    @RequestMapping(value = "/con/save", method = RequestMethod.POST)
    public IOTResult save(@RequestBody PageData pd) {

        return constantService.add(pd);
    }

    @CrossOrigin
    @RequestMapping(value = "/con/del", method = RequestMethod.POST)
    public IOTResult del(@RequestBody PageData pd) {

        return constantService.del(pd);
    }

    @CrossOrigin
    @RequestMapping(value = "/con/update", method = RequestMethod.POST)
    public IOTResult update(@RequestBody PageData pd) {

        return constantService.update(pd);
    }

    @CrossOrigin
    @RequestMapping(value = "/con/list", method = RequestMethod.POST)
    public IOTResult list(@RequestBody PageData pd) {

        return constantService.list(pd);
    }


}
