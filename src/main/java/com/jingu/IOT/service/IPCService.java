/** * 项目名称：IOT * <p> * 类名称：IPCService * <p> * 类描述： * <p> * 创建人：jianghu * <p> * 创建时间：2017年9月5日 下午3:01:46 * <p> * 修改人：jianghu * <p> * 修改时间：2017年9月5日 下午3:01:46 * <p> * 修改备注： 下午3:01:46 * * @version */package com.jingu.IOT.service;import java.util.ArrayList;import java.util.HashMap;import java.util.List;import java.util.Map;import com.jingu.IOT.dao.MainDeviceDao;import com.jingu.IOT.util.CommonUtils;import com.jingu.IOT.util.Types;import org.springframework.beans.factory.annotation.Autowired;import org.springframework.stereotype.Component;import org.springframework.transaction.annotation.Transactional;import com.jingu.IOT.dao.IPCDao;import com.jingu.IOT.dao.PointDao;import com.jingu.IOT.dao.SettingDao;import com.jingu.IOT.entity.HkSdkEx;import com.jingu.IOT.entity.IPCEntity;import com.jingu.IOT.entity.IPCPointEntity;import com.jingu.IOT.entity.IPCProxyEntity;import com.jingu.IOT.entity.PointEntity;import com.jingu.IOT.entity.VideoShemaBean;import com.jingu.IOT.requset.IPCPointRequset;import com.jingu.IOT.requset.IPCRequest;import com.jingu.IOT.response.IOTResult;import com.jingu.IOT.response.PointResult;import com.jingu.IOT.util.Client;import com.jingu.IOT.util.ToolUtil;/** * @author jianghu * @ClassName: IPCService * @Description: TODO * @date 2017年9月5日 下午3:01:46 */@Componentpublic class IPCService {    private IPCDao ipcDao;    private SettingDao settingDao;    private ToolUtil toolUtil;    private PointDao pointDao;    @Autowired    public IPCService(IPCDao ipcDao, SettingDao settingDao, ToolUtil toolUtil, PointDao pointDao) {        this.ipcDao = ipcDao;        this.settingDao = settingDao;        this.toolUtil = toolUtil;        this.pointDao = pointDao;    }    public int addIPCProxy(IPCProxyEntity ipcEntity) {        return ipcDao.addIPCProxy(ipcEntity);    }    public int updateIPCProxy(IPCProxyEntity ipcEntity) {        return ipcDao.updateIPCProxy(ipcEntity);    }    // 代理列表    public Map<String, Object> getCtrlProxy(IPCProxyEntity pe) {        List<Map<String, Object>> ctrlProxy = ipcDao.getCtrlProxy(pe);        if (ctrlProxy == null || ctrlProxy.isEmpty()) {            return null;        }        return ctrlProxy.get(0);    }//	public Map<String, Object> getVideoProxy(IPCProxyEntity pe){//		List<Map<String,Object>> ctrlProxy = ipcDao.getVideoProxy(pe);//		if(ctrlProxy==null || ctrlProxy.isEmpty()){//			return null;//		}//		return ctrlProxy.get(0);//				//	}    // 代理列表    public List<Map<String, Object>> listProxy(IPCProxyEntity pe) {        return ipcDao.listIPCProxy(pe);    }    // 获得代理    public Map<String, Object> getProxy(IPCProxyEntity pe) {        if (pe.getMapingDeviceId() != null) {            return getProxyByMid(pe);        }        List<Map<String, Object>> listIPCProxy = ipcDao.listIPCProxy(pe);        if (listIPCProxy == null || listIPCProxy.size() < 1) {            return null;        }        return listIPCProxy.get(0);    }    /**     * 根据mapingId查找代理     *     * @param pe     * @return     */    public Map<String, Object> getProxyByMid(IPCProxyEntity pe) {        List<Map<String, Object>> list = ipcDao.getProxyByMid(pe);        if (list == null || list.isEmpty()) return null;        return list.get(0);    }    @Transactional(value = "primaryTransactionManager")    public PointResult addIPC(IPCRequest ipcRequest) {        if (ipcRequest.getIpc() == null) ipcRequest.setIpc(new IPCProxyEntity());        IPCProxyEntity ipc = ipcRequest.getIpc();        ipc.setDeviceId(ipcRequest.getDeviceId());        // TODO  此处的deviceId 自动生成还是用户输入        String mapDID = generMapingDeviceId(ipcRequest.getDeviceId());        ipcRequest.setMapingDeviceId(mapDID);        String intVal2 = toolUtil.getIntVal(ToolUtil.PORT + ipcRequest.getPointEntity().getIp());        if (intVal2 == null || intVal2.equals("0")) {            toolUtil.setIntVal(ToolUtil.PORT + ipcRequest.getPointEntity().getIp(), 9000);        }        // 尽量封装        String intVal = toolUtil.getIntVal(ToolUtil.PROXY);        if (intVal == null || intVal.equals("0")) {            int maxProxyId = ipcDao.getMaxProxyId();            toolUtil.setIntVal(ToolUtil.PROXY, maxProxyId);        }        // 检查是否能代理上        Long port1 = toolUtil.incIntVal(ToolUtil.PORT + ipcRequest.getPointEntity().getIp());        ipc.setS_proxy(String.valueOf(port1));        ipc.setS_hostport(8000);        ipc.setS_host(ipcRequest.getS_ip());        ipc.setS_pwr(1);        // 查找代理id号和9000开始的端口号        Long proxyid1 = toolUtil.incIntVal(ToolUtil.PROXY);        ipc.setId(proxyid1.intValue());        ipc.setS_hostport(8000);        ipc.setS_proxy(String.valueOf(port1));        ipcRequest.setIpcProxyId(proxyid1.intValue());        ipc.setMapingDeviceId(ipcRequest.getMapingDeviceId());        ipc.setType(Types.IPC_2);        ipc.setS_pwr(ipcRequest.getS_power());        ipc.setS_pwrval(1);        ipc.setS_timeout(String.valueOf(180));        ipc.setUsername(ipcRequest.getS_username());        ipc.setPassword(ipcRequest.getS_password());        int addProxy1 = ipcDao.addIPCProxy(ipc);        Long proxyid2 = toolUtil.incIntVal(ToolUtil.PROXY);        Long port2 = toolUtil.incIntVal(ToolUtil.PORT + ipcRequest.getPointEntity().getIp());        ipc.setId(proxyid2.intValue());        ipc.setS_proxy(String.valueOf(port2));        ipc.setS_hostport(80);        ipc.setType(Types.IPC_1);//视频控制        ipcRequest.setIpcProxyId(proxyid2.intValue());        ipc.setMapingDeviceId(ipcRequest.getMapingDeviceId());        PointEntity pointEntity = ipcRequest.getPointEntity();        pointEntity.setTp_type(4);        String maxId = toolUtil.getMaxId(ToolUtil.TREEID);        if (maxId == null) {            int listMaxId = pointDao.listMaxId();            toolUtil.setMaxId(ToolUtil.TREEID, listMaxId);        }        Long maxIdInc = toolUtil.MaxIdInc(ToolUtil.TREEID);        pointEntity.setDeviceId(ipcRequest.getMapingDeviceId());        pointEntity.setTp_id(maxIdInc.intValue());        pointEntity.setTp_name(ipcRequest.getPointEntity().getTp_name());        ipcRequest.setName(ipcRequest.getPointEntity().getTp_name());        pointEntity.setTp_type(4);        ipcRequest.setId(maxIdInc.intValue());        pointEntity.setRole("");        pointEntity.setDeviceId(mapDID);        ipc.setMapingDeviceId(mapDID);        int addIPC = ipcDao.addIPC(ipcRequest);        pointEntity.setMax_ipc_id(addIPC);        int addProxy2 = ipcDao.addIPCProxy(ipc);        int addPoint = pointDao.addPoint(pointEntity);        if (addIPC > 0 && addProxy1 > 0 && addProxy2 > 0 && addPoint > 0) {            return new PointResult(true, pointEntity);        }        return new PointResult(false, pointEntity);    }    /**     * 生成唯一 mapingDeviceId     *     * @param deviceId     * @return     */    public String generMapingDeviceId(String deviceId) {        String top_id = null;        if (deviceId != null) {            List<Map<String, Object>> maps = ipcDao.getTopID(deviceId);            if (maps == null || maps.size() == 0) {                return deviceId + ".01";            }            Map mapingDeviceId = maps.get(0);            if (mapingDeviceId != null && mapingDeviceId.get("mapingDeviceId") != null) {                top_id = (String) mapingDeviceId.get("mapingDeviceId");                String index = top_id.substring(top_id.lastIndexOf(".") + 1);                int i = Integer.parseInt(index) + 1;                String tail = ".";                if (i < 10) {                    tail += "0" + i;                } else {                    tail += i;                }                return deviceId + tail;            }        }        throw new RuntimeException("自动生成MapingDeviceId失败");    }    public int updateIPC(IPCEntity ipcEntity) {        return ipcDao.updateIPC(ipcEntity);    }    public int updateIPC2(Integer id, Integer status) {        IPCEntity ipcEntity = new IPCEntity();        ipcEntity.setId(id);        ipcEntity.setStatus(status);        return ipcDao.updateIPC(ipcEntity);    }    @Transactional(value = "primaryTransactionManager")    public int deleteIPC(IPCRequest ipcEntity) {        List<Map<String, Object>> ps = pointDao.getPoint(4, ipcEntity.getMapingDeviceId());        int deletePoint = 0, deleteIPC = 0;        if (ps == null || ps.size() != 1) {            System.out.println("-------------------\n" + "未找到point");        } else {            Map m = ps.get(0);            PointEntity p = new PointEntity();            p.setTp_id((Integer) m.get("tp_id"));            deletePoint = pointDao.deletePoint(p);        }        deleteIPC = ipcDao.deleteIPC(ipcEntity);        //TODO 删除代理 @ xwf        if (deletePoint > 0 && deleteIPC > 0) {            return 1;        }        return 0;    }    // 查找vr1000下的ipc    public List<Map<String, Object>> listIPC(IPCEntity ipcEntity) {        return ipcDao.listIPC(ipcEntity);    }    public IPCEntity getIPCById(IPCEntity ipcEntity) {        return ipcDao.getIPCById(ipcEntity);    }    public IPCEntity getIPC(IPCEntity ipcEntity) {        List<IPCEntity> ipc = ipcDao.getIPC(ipcEntity);        if (ipc == null || ipc.isEmpty()) {            return null;        }        return ipc.get(0);    }    // 添加监视点    public int addIPCPoint(IPCPointEntity ipce) {        return ipcDao.addIPCPoint(ipce);    }    public int updateIPCPoint(IPCPointEntity ipce) {        return ipcDao.updateIPCPoint(ipce);    }//	public int updateAppIPCPoint(IPCPointEntity ipce){//		return ipcDao.updateAppIPCPoint(ipce);//	}    // 删除监视点    public int deleteIPCPoint(IPCPointEntity ipce) {        return ipcDao.deleteIPCPoint(ipce);    }    // 根据摄像头的 deviceId 删除检视点    public int deleteIPCPointByDeviceID(IPCPointEntity ipce) {        return ipcDao.deleteIPCPointByDeviceID(ipce);    }    public Map<String, Object> getIPCPoint(IPCPointEntity ipce) {        return ipcDao.getIPCPoint(ipce);    }    // 查找监视点    public List<Map<String, Object>> listIPCPoint(IPCPointEntity ipce) {        return ipcDao.listIPCPoint(ipce);    }    // 核查监视点    public List<Map<String, Object>> ckIPCPoint(IPCPointEntity ipce) {        return ipcDao.ckIPCPoint(ipce);    }    // 查看监视点图片    public List<Map<String, Object>> listIPCPointIMG(IPCPointEntity ipce) {        return ipcDao.listIPCPointIMG(ipce);    }    private IOTResult testProxy(IPCRequest ipcr) {        IPCProxyEntity ipc = ipcr.getIpc();        //String config = "s_host:192.168.0.234;s_rport:8000;s_lport:9001;s_pwr:1;s_pwrval:0;s_timeout:86400;";        String config = "s_host:" + ipc.getS_host() + ";s_rport:" + ipc.getS_hostport() + ";s_lport:" + ipc.getS_proxy() + ";s_pwr:" + ipc.getS_pwr() + ";s_pwrval:" + ipc.getS_pwrval() + ";s_timeout:120;";        //"s_host:192.168.0.234;s_rport:8000;s_lport:9090;s_pwr:1;s_pwrval:0;s_timeout:120;"        //"s_host:192.168.0.234;s_rport:8000;s_lport:9099;s_pwr:1;s_pwrval:0;s_timeout:60;";        //"s_host:192.168.0.234;s_rport:80;s_lport:9090;s_pwr:1;s_pwrval:0;s_timeout:120;"//		String config = "s_host:192.168.0.234;s_rport:80;s_lport:9099;s_pwr:1;s_pwrval:0;s_timeout:60;";        String setIpcProxyEx1 = Client.setIpcProxyEx1("add", config, ipc.getDeviceId(), ipcr.getPointEntity().getIp(), ipcr.getPointEntity().getPort());//		"admin", "12345", "192.168.0.168", "9001"//		String config = "s_host:192.168.0.234;s_rport:80;s_lport:9000;s_pwr:1;s_pwrval:0;s_timeout:86400;";//		String setIpcProxyEx1 = Client.setIpcProxyEx1("add", config, deviceId, ip, port);//		System.out.println(setIpcProxyEx1);//		System.out.println(ipcr.getS_username());//		System.out.println(ipcr.getS_password());        VideoShemaBean ipcAbility = HkSdkEx.getIpcAbility(ipcr.getS_username(), ipcr.getS_password(), ipcr.getPointEntity().getIp(), String.valueOf(ipc.getS_proxy()));        if (ipcAbility == null) {            return new IOTResult(false, "链接不到摄像头", null, 11);        }        return new IOTResult(true, "代理设置成功", null, 0);    }//	public static void main(String[] args) {//		Client.setIpcProxyEx(type, config, deviceId)//	}    public int listIPCPointIMGCount(IPCPointRequset ipcPointRequset) {        // TODO Auto-generated method stub        return ipcDao.listIPCPointIMGCount(ipcPointRequset);    }    /**     * 2017年11月19日     * <p>     * jianghu     *     * @param ipcRequest TODO     */    @Transactional(value = "primaryTransactionManager")    public PointResult addExitstIPC(IPCRequest ipcRequest) {        if (ipcRequest.getIpc() == null)            ipcRequest.setIpc(new IPCProxyEntity());        IPCProxyEntity ipc = ipcRequest.getIpc();        ipc.setDeviceId(ipcRequest.getDeviceId());        // TODO  此处的deviceId 自动生成还是用户输入        String mapDID = generMapingDeviceId(ipcRequest.getDeviceId());        ipcRequest.setMapingDeviceId(mapDID);        // 检查是否能代理上        ipcRequest.getIpc().setS_proxy("");        ipcRequest.getIpc().setS_hostport(8000);        ipc.setS_host(ipcRequest.getS_ip());        ipc.setS_pwr(1);        // 查找代理id号和9000开始的端口号        String intVal = toolUtil.getIntVal(ToolUtil.PROXY);        if (intVal == null || intVal.equals("0")) {            int maxProxyId = ipcDao.getMaxProxyId();            toolUtil.setIntVal(ToolUtil.PROXY, maxProxyId);        }        Long proxyid1 = toolUtil.incIntVal(ToolUtil.PROXY);        ipc.setId(proxyid1.intValue());        ipc.setS_hostport(8000);        ipc.setS_proxy("");        ipcRequest.setIpcProxyId(proxyid1.intValue());        ipc.setMapingDeviceId(ipcRequest.getMapingDeviceId());        ipc.setType(2);        ipc.setS_pwr(ipcRequest.getS_power());        ipc.setS_pwrval(1);        ipc.setS_timeout(String.valueOf(180));        ipc.setUsername(ipcRequest.getS_username());        ipc.setPassword(ipcRequest.getS_password());        ipc.setDeviceId(ipcRequest.getDeviceId());        int addProxy1 = ipcDao.addIPCProxy(ipc);        Long proxyid2 = toolUtil.incIntVal(ToolUtil.PROXY);        ipc.setId(proxyid2.intValue());        ipc.setS_proxy("");        ipc.setS_hostport(80);        ipc.setType(1);        ipcRequest.setIpcProxyId(proxyid2.intValue());        ipc.setMapingDeviceId(ipcRequest.getMapingDeviceId());        PointEntity pointEntity = ipcRequest.getPointEntity();        pointEntity.setTp_type(4);        String maxId = toolUtil.getMaxId(ToolUtil.TREEID);        if (maxId == null) {            int listMaxId = pointDao.listMaxId();            toolUtil.setMaxId(ToolUtil.TREEID, listMaxId);        }        Long maxIdInc = toolUtil.MaxIdInc(ToolUtil.TREEID);        pointEntity.setDeviceId(ipcRequest.getMapingDeviceId());        pointEntity.setTp_id(maxIdInc.intValue());        pointEntity.setTp_name(ipcRequest.getPointEntity().getTp_name());        ipcRequest.setName(ipcRequest.getPointEntity().getTp_name());        pointEntity.setTp_type(4);        pointEntity.setRole("");        ipcRequest.setId(maxIdInc.intValue());        pointEntity.setRole("");        pointEntity.setDeviceId(mapDID);        ipc.setMapingDeviceId(mapDID);        int addIPC = ipcDao.addIPC(ipcRequest);        int addProxy2 = ipcDao.addIPCProxy(ipc);        int addPoint = pointDao.addPoint(pointEntity);        if (addIPC > 0 && addProxy1 > 0 && addProxy2 > 0 && addPoint > 0) {            return new PointResult(true, pointEntity);        }        return new PointResult(false, pointEntity);    }    /**     * 2017年11月19日     * <p>     * jianghu     *     * @param ipcMonitor2 TODO     */    public int addIPCPointList(List<IPCPointEntity> ipce) {        return ipcDao.addIPCPointList(ipce);    }    /**     * 2017年12月23日     * <p>     * jianghu     *     * @param deviceId TODO     */    public int getMaxMonitorId(String deviceId) {        // TODO Auto-generated method stub        return ipcDao.getMaxMonitorId(deviceId);    }    /**     * 2017年12月23日     * <p>     * jianghu     *     * @param deviceId     * @param monitorId TODO     */    public int getIPCPointId(String deviceId, int monitorId) {        // TODO Auto-generated method stub        return ipcDao.getIPCPointId(deviceId, monitorId);    }    /**     * 2017年12月23日     * <p>     * jianghu     *     * @param ipcPointRequset TODO     */    public List<Map<String, Object>> getAppIPCPoint(IPCPointRequset ipcPointRequset) {        // TODO Auto-generated method stub        return ipcDao.getAppIPCPoint(ipcPointRequset);    }    public Map<String, Object> listLastIPCPointImg(String deviceId) {        try {            Map<String, Object> imgMap = ipcDao.listLastIPCPoint(deviceId);            return imgMap;        } catch (Exception e) {            // TODO Auto-generated catch block            return null;        }    }    public static List<IPCEntity> parse(String str) {        if (str == null || str.length() == 0)            return null;        str = str.substring(str.indexOf(";") + 1);        String[] aar = str.split("s_nod");        List<IPCEntity> ipcs = new ArrayList<>();        for (String s : aar) {            if (s != null && s.length() > 0) {                s = "s_nod" + s;                IPCEntity ipc = parseToIPC(s);                if (ipc != null) {                    ipcs.add(ipc);                }            }        }        return ipcs;    }    public static void main(String[] args) {        String str = "s_ipcnum:4;\n" +                "s_nod:11;s_power:1;s_ip:192.168.0.234;s_port:80;s_username:admin;s_password:12345;s_online:0;s_stream:0;\n" +                "s_nod:12;s_power:2;s_ip:10.10.21.27;s_port:44;s_username:cc;s_password:;s_online:0;s_stream:0;\n" +                "s_nod:1;s_power:2;s_ip:;s_port:0;s_username:;s_password:;s_online:0;s_stream:0;\n" +                "s_nod:3;s_power:0;s_ip:192.168.0.167;s_port:80;s_username:admin;s_password:vr123456;s_online:1;s_stream:0;";        List<IPCEntity> ipcs = parse(str);        for (IPCEntity ipc : ipcs)            System.out.println(ipc.toString());    }    private static IPCEntity parseToIPC(String s) {        try {            String[] ss = s.split(";");            Map m = new HashMap();            for (String pair : ss) {                if (pair != null && pair.length() > 2 && pair.indexOf(":") > 0) {                    String[] kv = pair.split(":");                    if (kv != null && kv.length == 2) {                        m.put(kv[0], kv[1]);                    }                }            }            if (m != null && !m.isEmpty()) {                IPCEntity ipc = new IPCEntity();                ipc.setS_nod(Integer.parseInt((String) m.get("s_nod")));                ipc.setS_power(Integer.parseInt((String) m.get("s_power")));                ipc.setS_ip((String) m.get("s_ip"));                ipc.setS_port(Integer.parseInt((String) m.get("s_port")));                ipc.setS_username((String) m.get("s_username"));                ipc.setS_password((String) m.get("s_password"));                ipc.setS_online(Integer.parseInt((String) m.get("s_online")));                ipc.setS_stream(Integer.parseInt((String) m.get("s_stream")));                return ipc;            }        } catch (Exception e) {            e.printStackTrace();            return null;        }        return null;    }    public boolean match(IPCEntity i, Map m) {        try {            if (Integer.parseInt((String) m.get("s_nod")) == i.getS_nod() &&                    m.get("s_ip").equals(i.getS_ip()) &&                    Integer.parseInt((String) m.get("s_port")) == i.getS_port()                    ) {                System.out.println("相同的IPC：s_nod:"+i.getS_nod()+"  s_ip:"+i.getS_ip()+"  s_port:"+i.getS_port());                m.put("s_power", i.getS_power());                m.put("s_username", i.getS_username());                m.put("s_password", i.getS_password());                m.put("s_online", i.getS_online());                m.put("s_stream", i.getS_stream());                return true;            }        } catch (Exception e) {            return false;        }        return false;    }    public void deleteById(IPCRequest ipc_r) {        ipcDao.deleteById(ipc_r);    }}