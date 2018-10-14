package com.jingu.IOT.service;

import com.jingu.IOT.entity.ControlEntity;
import com.jingu.IOT.entity.MotorHBM;
import com.jingu.IOT.entity.PointEntity;
import com.jingu.IOT.response.IOTResult;
import com.jingu.IOT.util.Client;
import com.jingu.IOT.util.PageData;
import com.jingu.IOT.util.ToolUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * 与设备交互（控制）的中间层
 */
@Component
public class ClientServie {
    @Autowired
    SettingService settingService;
    @Autowired
    PointService pointService;
    @Autowired
    ToolUtil toolUtil;
    @Autowired
    CtrlLogService ctrlLogService;

    @Autowired
    MainDeviceService mainDeviceService;


    //s_state  1 开启： 0 关闭  >1-100 开启度 [只有在自动控制中的卷帘才有值]
    //用到两个状态：s_state、is_running
    //s_state 是开关的固有状态 是开还是关
    //is_running 表示 现在程序正在对这个开关做出控制 ，当程序控制完成 is_running 状态改变

    private ScheduledExecutorService service = Executors.newSingleThreadScheduledExecutor();

    /***
     * @param ctrl
     * @return
     *

     */

    public IOTResult switchIt(Map ctrl, int sencond) {
        System.out.println(ctrl.toString());
        MotorHBM hbm = new MotorHBM();
        boolean has_next = (Boolean) ctrl.get("has_next");
        int ctrl_type = (Integer) ctrl.get("ctrl_type");
        int direction = (int) ctrl.get("direction");
        int distanceOrDuration = (int) ctrl.get("distanceOrDuration");


        //直流
        if (ctrl_type == 1) {
            hbm.setDirection(direction);//0x1：上升，0x2：下降，0x3:停止。
            hbm.setSkinGroupId((ctrl.get("ctrl_down_groupId").toString()));
            hbm.setSkinSwitchId((ctrl.get("ctrl_down_switchId").toString()));
            hbm.setPosSensorCH(Integer.parseInt(ctrl.get("ctrl_channel").toString()));//电机位置传感器通道号 1 ~ 16。
        }
        //电磁阀

        hbm.setCtrlType(Integer.parseInt(ctrl.get("ctrl_type").toString()));
        hbm.setRaiseGroupId((ctrl.get("ctrl_raise_groupId").toString()));
        hbm.setRaiseSwitchId((ctrl.get("ctrl_raise_switchId").toString()));
        hbm.setDistanceOrDuration(distanceOrDuration);// 0关  -1 常开


        PointEntity point = new PointEntity();
        point.setDeviceId((String) ctrl.get("ctrl_deviceId"));
        PointEntity devicePoint = pointService.getPoint(point);

        //获取代理
        Map ip_port = mainDeviceService.getIpPort((String) ctrl.get("ctrl_deviceId"));
        if (ip_port != null && !ip_port.isEmpty()) {
            point.setIp((String) ip_port.get("ip"));
            point.setPort((Integer) ip_port.get("port"));
        }
        //----------------------------------------------------------


        boolean result = Client.motorsCtrl2(devicePoint.getIp(), devicePoint.getPort(), devicePoint.getDeviceId(), hbm.toByteCmd(), (byte) 0x17);


        if (result) {

            //-----------save log-------------
            int ctrl_act = ctrl_type == 1 ? direction : distanceOrDuration;
            int ctr_from = (int) ctrl.get("ctr_from");
            saveCtrl_log((Integer) ctrl.get("ctrl_id"), ctrl_type, ctrl_act, ctr_from);
            //-----------save log  end -------------

            // 改变开关状态
            ControlEntity ctrl_bean = new ControlEntity();
            ctrl_bean.setCtrl_id((Integer) ctrl.get("ctrl_id"));
            if (ctrl_type == 1) {
                //只要不是关闭状态 就设置成正在执行
                if (direction == 0x3) {
                    ctrl_bean.setS_state(2);
                } else {
                    ctrl_bean.setS_state(1);
                }

                ctrl_bean.setOpen_lev(-1);
            }

            if (ctrl_type == 2) {
                //只要不是关闭状态 就设置成正在执行
                if (distanceOrDuration == 0) {
                    ctrl_bean.setS_state(2);
                } else {
                    ctrl_bean.setS_state(1);
                }

                ctrl_bean.setOpen_lev(-1);
            }
            if (has_next) {
                ctrl_bean.setIs_running(1);
            } else {
                ctrl_bean.setIs_running(2);
            }
            int status = settingService.updateControlSetting(ctrl_bean);

            System.out.println("has_next:" + has_next);

            if (has_next) {
                ctrl.put("has_next", false);
                if (ctrl_type == 1) {
                    ctrl.put("direction", 0x3);
                }
                if (ctrl_type == 2) {
                    if (distanceOrDuration == -1) {
                        ctrl.put("distanceOrDuration", 1);
                    } else {
                        ctrl.put("distanceOrDuration", -1);
                    }

                }
                exe(new Runnable() {
                    @Override
                    public void run() {
                        switchIt(ctrl, sencond);
                        System.out.println("执行完成..");
                    }
                }, sencond);
            }

            return new IOTResult(true, "执行成功", hbm, 1);
        } else {
            return new IOTResult(false, "socket 异常", null, 0);
        }
    }


    private IOTResult exe(Runnable runnable, int second) {
        // 第二个参数为首次执行的延时时间，第三个参数为定时执行的间隔时间
        try {
            service.schedule(runnable,second, TimeUnit.SECONDS);
            return new IOTResult(true, "执行成功", null, 1);
        } catch (Exception e) {

            return new IOTResult(false, "执行异常", null, 0);
        }
    }


    /**
     * 自动控制 ---卷帘
     *
     * @param ctrl
     * @return
     */
    public IOTResult autoCtrl(PageData ctrl) {
        //auto_type;//1：上升 2：下降 3：开启度 4；关闭
        int auto_type = (int) ctrl.get("auto_type");

        Map c_ctrl = settingService.getControlSetting((Integer) ctrl.get("ctrl_id"));

        if (c_ctrl == null)
            return new IOTResult(false, "控制失败，没有发现控制", null, 0);
        else if (c_ctrl.get("is_running").equals(1)) {
            // TODO: 2018/10/2
//            service.shutdownNow();
        }
        //卷帘的参数
        int duation = 0;
        int direction = 0; //0x1：上升，0x2：下降，0x3:停止
        int distanceOrduration = Integer.parseInt(ctrl.get("distanceOrduration").toString());//开启度暂时不用，但仍作为参数上传

        MotorHBM hbm = new MotorHBM();
        switch (auto_type) {
            case 1:
                direction = 0x1;
                break;
            case 2:
                direction = 0x2;
                break;
            case 3:
                direction = 0x2;
                duation = (distanceOrduration * ToolUtil.TotalS) / 100;
                break;
            case 4:
                direction = 0x3;
                break;
            default:
                break;

        }

        hbm.setSkinGroupId((ctrl.get("ctrl_down_groupId").toString()));
        hbm.setSkinSwitchId((ctrl.get("ctrl_down_switchId").toString()));
        hbm.setPosSensorCH(Integer.parseInt(ctrl.get("ctrl_channel").toString()));//电机位置传感器通道号 1 ~ 16。
        hbm.setCtrlType(Integer.parseInt(ctrl.get("ctrl_type").toString()));
        hbm.setRaiseGroupId((ctrl.get("ctrl_raise_groupId").toString()));
        hbm.setRaiseSwitchId((ctrl.get("ctrl_raise_switchId").toString()));
        hbm.setDistanceOrDuration(duation);//此参数无效
        hbm.setDirection(direction);

        PointEntity point = new PointEntity();
        point.setDeviceId((String) ctrl.get("ctrl_deviceId"));
        PointEntity devicePoint = pointService.getPoint(point);

        //获取代理
        Map ip_port = mainDeviceService.getIpPort((String) ctrl.get("ctrl_deviceId"));
        if (ip_port != null && !ip_port.isEmpty()) {
            point.setIp((String) ip_port.get("ip"));
            point.setPort((Integer) ip_port.get("port"));
        }
        //----------------------------------------------------------


        boolean result = Client.motorsCtrl2(devicePoint.getIp(), devicePoint.getPort(), devicePoint.getDeviceId(), hbm.toByteCmd(), (byte) 0x17);

        if (result) {
            //-----------save log-------------
            saveCtrl_log((Integer) ctrl.get("ctrl_id"), 1, direction, 1);
            //-----------save log  end -------------

            ControlEntity ctrl_bean = new ControlEntity();
            ctrl_bean.setCtrl_id((Integer) ctrl.get("ctrl_id"));

            //只要不是关闭状态 就设置成正在执行
            if (direction != 0x3) {
                ctrl_bean.setIs_running(1);
                ctrl_bean.setS_state(1);
            } else {
                ctrl_bean.setS_state(2);
            }

            ctrl_bean.setOpen_lev(-1);

            int status = settingService.updateControlSetting(ctrl_bean);
            if (auto_type == 3) {
                System.out.println("【正在下拉】。。");
                //如果是开启度 则要在彻底关闭后再开启
                hbm.setDirection(0x1);
                boxRun(hbm, devicePoint, ctrl_bean, ToolUtil.TotalS, distanceOrduration);
            }
            return new IOTResult(true, "执行成功", hbm, 1);
        } else {
            return new IOTResult(false, "socket 异常", null, 0);
        }
    }

    /**
     * 自动控制--开关
     *
     * @param ctrl
     * @return
     */
    public IOTResult autoCtrl_off_on(PageData ctrl) {
        //auto_type;//1：开启 2：关闭
        int auto_type = (int) ctrl.get("auto_type");
        int distanceOrDuration = 0;

        Map c_ctrl = settingService.getControlSetting((Integer) ctrl.get("ctrl_id"));

        if (c_ctrl == null)
            return new IOTResult(false, "控制失败，没有发现控制", null, 0);

        //继电器
        // -1一直开，0立即关

        MotorHBM hbm = new MotorHBM();
        switch (auto_type) {
            case 1:
                distanceOrDuration = -1;
                break;
            case 2:
                distanceOrDuration = 0;
                break;
            default:
                return new IOTResult(false, "执行失败", null, 0);
        }
        hbm.setCtrlType(Integer.parseInt(ctrl.get("ctrl_type").toString()));
        hbm.setRaiseGroupId((ctrl.get("ctrl_raise_groupId").toString()));
        hbm.setRaiseSwitchId((ctrl.get("ctrl_raise_switchId").toString()));
        hbm.setDistanceOrDuration(distanceOrDuration);


        PointEntity point = new PointEntity();
        point.setDeviceId((String) ctrl.get("ctrl_deviceId"));
        PointEntity devicePoint = pointService.getPoint(point);


        //获取代理
        Map ip_port = mainDeviceService.getIpPort((String) ctrl.get("ctrl_deviceId"));
        if (ip_port != null && !ip_port.isEmpty()) {
            point.setIp((String) ip_port.get("ip"));
            point.setPort((Integer) ip_port.get("port"));
        }
        //----------------------------------------------------------
        boolean result = Client.motorsCtrl2(devicePoint.getIp(), devicePoint.getPort(), devicePoint.getDeviceId(), hbm.toByteCmd(), (byte) 0x17);
        //-----------save log-------------
        saveCtrl_log((Integer) ctrl.get("ctrl_id"), 2, distanceOrDuration, 1);
        //-----------save log  end -------------

        if (result) {


            ControlEntity ctrl_bean = new ControlEntity();
            ctrl_bean.setCtrl_id((Integer) ctrl.get("ctrl_id"));

            //只要不是关闭状态 就设置成正在执行
            if (distanceOrDuration == -1) {
                System.out.println("【开启】。。");
                ctrl_bean.setS_state(1);
            } else {
                System.out.println("【关闭】。。");
                ctrl_bean.setS_state(2);
            }
            int status = settingService.updateControlSetting(ctrl_bean);

            return new IOTResult(true, "执行成功", hbm, 1);
        } else {
            return new IOTResult(false, "执行失败，socket 异常", null, 0);
        }
    }


    /**
     * 开启 duation 秒后 关闭
     * 开启度设置
     *
     * @param hbm
     * @param devicePoint
     * @param ctrl_bean
     * @param duation
     */
    private void boxRun( MotorHBM hbm,  PointEntity devicePoint,  ControlEntity ctrl_bean, int duation, int distanceOrduration) {

        Mrun pull_up = new Mrun(hbm, devicePoint, ctrl_bean, duation, distanceOrduration);

        pull_up.setOnFinishedL(new OnFinishedL() {
            @Override
//彻底 关闭之后 执行的逻辑
            void onFinished(boolean result, Mrun mrun) {
                if (result) {
                    System.out.println("【已完全关闭】正在上拉："+mrun.distanceOrduration);

                    //现在正在从最地位置上升
                    //-----------save log-------------
                    saveCtrl_log(mrun.ctrl_bean.getCtrl_id(), 2, mrun.hbm.getDirection(), 1);
                    //-----------save log  end -------------

                    mrun.ctrl_bean.setIs_running(1);
                    mrun.ctrl_bean.setS_state(1);
                    settingService.updateControlSetting(mrun.ctrl_bean);

                    //在 distanceOrduration 秒之后执行关闭

                    mrun.hbm.setDirection(0x3);//到时间后关闭

                    Mrun close = new Mrun(mrun.hbm, mrun.devicePoint, mrun.ctrl_bean, mrun.duation, mrun.distanceOrduration);
                    close.setOnFinishedL(new OnFinishedL() {
                        @Override
                        void onFinished(boolean result, Mrun mrun) {
                            if (result) {
                                //-----------save log-------------
                                saveCtrl_log(mrun.ctrl_bean.getCtrl_id(), 2, mrun.hbm.getDirection(), 1);
                                //-----------save log  end -------------
                                mrun.ctrl_bean.setIs_running(2);
                                mrun.ctrl_bean.setS_state(2);
                                mrun.ctrl_bean.setOpen_lev(mrun.distanceOrduration);
                                settingService.updateControlSetting(mrun.ctrl_bean);
                                System.out.println("【上拉完毕】开启度："+mrun.distanceOrduration);
                            }
                        }
                    });
                    exe(close, mrun.distanceOrduration);
                }
            }
        });
        exe(pull_up, duation);


    }


    /**
     * log 分析 保存
     *
     * @param ctrl_id
     * @param ctrl_type 1、2：卷帘、继电器
     * @param ctrl_act  -1、0：（继电器的）开：关；1、2、3：（卷帘）上升、下降、关闭
     * @param ctrl_from 1、2、3：自动、预约、智能
     */
    private void saveCtrl_log(int ctrl_id, int ctrl_type, int ctrl_act, int ctrl_from) {
        PageData pd = new PageData();
        pd.put("ctrl_id", ctrl_id);
        pd.put("ctrl_type", ctrl_type);
        pd.put("ctrl_act", ctrl_act);
        pd.put("ctrl_from", ctrl_from);

        ctrlLogService.save(pd);
    }


    class Mrun implements Runnable {
        MotorHBM hbm;
        PointEntity devicePoint;
        ControlEntity ctrl_bean;
        int duation;
        int distanceOrduration;
        private OnFinishedL onFinishedL;

        public Mrun(MotorHBM hbm, PointEntity devicePoint, ControlEntity ctrl_bean, int duation, int distanceOrduration) {
            this.hbm = hbm;
            this.devicePoint = devicePoint;
            this.ctrl_bean = ctrl_bean;
            this.duation = duation;
            this.distanceOrduration = distanceOrduration;
        }

        @Override
        public void run() {
            boolean result = Client.motorsCtrl2(devicePoint.getIp(), devicePoint.getPort(), devicePoint.getDeviceId(), hbm.toByteCmd(), (byte) 0x17);
            if (onFinishedL != null) {
                onFinishedL.onFinished(result, this);
            }
        }

        public void setOnFinishedL(OnFinishedL onFinishedL) {
            this.onFinishedL = onFinishedL;
        }
    }

    abstract class OnFinishedL {
        abstract void onFinished(boolean result, Mrun mrun);
    }


}
