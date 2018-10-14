/** * 项目名称：IOT * 类名称：AreaController * 类描述： * 创建人：jianghu * 创建时间：2017年9月30日 上午11:05:50 * 修改人：jianghu * 修改时间：2017年9月30日 上午11:05:50 * 修改备注： 上午11:05:50 * * @version */package com.jingu.IOT.web;import com.jingu.IOT.requset.AreaReq;import com.jingu.IOT.response.IOTResult;import com.jingu.IOT.service.AreaService;import com.jingu.IOT.util.CheckUtil;import com.jingu.IOT.util.ToolUtil;import org.springframework.beans.factory.annotation.Autowired;import org.springframework.web.bind.annotation.*;import java.util.List;import java.util.Map;/** * @author jianghu * @ClassName: AreaController * @Description: TODO * @date 2017年9月30日 上午11:05:50 * 地区 */@RestControllerpublic class AreaController {    private ToolUtil toolUtil;    private AreaService service;    @Autowired    CheckUtil checkUtil;    @Autowired    public AreaController(ToolUtil toolUtil, AreaService service) {        this.toolUtil = toolUtil;        this.service = service;    }    // 省    @CrossOrigin    @RequestMapping(value = "/listProvice", method = RequestMethod.POST)    public IOTResult listProvice(@RequestBody AreaReq a) {        IOTResult x = checkUtil.chckSession(a, AreaReq.class);        if (x != null) return x;        List<Map<String, Object>> listProvince = service.listProvince(a);        if (listProvince != null && listProvince.size() > 0) {            return new IOTResult(true, "查询成功", listProvince, 0);        }        return new IOTResult(false, "暂无相关信息", null, 0);    }    // 市    @CrossOrigin    @RequestMapping(value = "/listCity", method = RequestMethod.POST)    public IOTResult listCity(@RequestBody AreaReq a) {        IOTResult x = checkUtil.chckSession(a, AreaReq.class);        if (x != null) return x;        if (a.getAr_id().equals("710000") || a.getAr_id().equals("810000") || a.getAr_id().equals("910000")) {            return new IOTResult(true, "查询成功", null, 0);        }        List<Map<String, Object>> listProvince = service.listCity(a);        if (listProvince != null && listProvince.size() > 0) {            return new IOTResult(true, "查询成功", listProvince, 0);        }        return new IOTResult(false, "暂无数据", null, 0);    }    // 区    @CrossOrigin    @RequestMapping(value = "/listDistrict", method = RequestMethod.POST)    public IOTResult listDistrict(@RequestBody AreaReq a) {        IOTResult x = checkUtil.chckSession(a, AreaReq.class);        if (x != null) return x;        if (a.getAr_id().equals("710000") || a.getAr_id().equals("810000") || a.getAr_id().equals("910000")) {            return new IOTResult(true, "查询成功", null, 0);        }        List<Map<String, Object>> listProvince = service.listDistrict(a);        if (listProvince != null && listProvince.size() > 0) {            return new IOTResult(true, "查询成功", listProvince, 0);        }        return new IOTResult(false, "暂无数据", null, 0);    }}