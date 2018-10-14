package com.jingu.IOT.util;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import java.io.*;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by weifengxu on 2018/9/17.
 */
public class CommonUtils {
    static void validUser() {

    }


    public static Date getDate(String date_srt, String patt) {
        if (patt == null)
            patt = "yyyy/MM/dd HH:mm:ss";

        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(patt);
        //必须捕获异常
        try {
            return simpleDateFormat.parse(date_srt);
        } catch (ParseException px) {
            px.printStackTrace();
        }
        return null;
    }

    public static long getDateLong(String date_srt, String patt) {
        if (patt == null)
            patt = "yyyy-MM-dd HH:mm:ss";

        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(patt);
        //必须捕获异常
        try {
            return simpleDateFormat.parse(date_srt).getTime();
        } catch (ParseException px) {
            px.printStackTrace();
        }
        return 0;
    }

    public static String getStrTime(Date date, String patt) {
        if (patt == null)
            patt = "yyyy-MM-dd HH:mm:ss";
        SimpleDateFormat sdf = new SimpleDateFormat(patt);

        return sdf.format(date);
    }

    public static String forFormatDate() {
        Date d = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return sdf.format(d);
    }

    public static String formatDate(long time) {
        Date d = new Date(time);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return sdf.format(d);
    }


    public static String timestampToString(Timestamp ts) {
        DateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

        return sdf.format(ts);
    }

    public static long str2Date(String date_str) {
        try {
            DateFormat format = new SimpleDateFormat("yyyy-MM-dd");
            Date date = format.parse(date_str);
            return date.getTime();
        } catch (Exception e) {

            e.printStackTrace();
            return 0;
        }

    }


    /**
     * 数字？
     *
     * @param o
     * @return
     */
    public static boolean isNumber(Object o) {
        try {
            if (o instanceof Integer)
                return true;
            Integer.parseInt(o.toString());
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public static boolean has(Object o) {
        if (o == null) {
            return false;
        }

        if ("".equals(o)) {
            return false;
        }

        if (o instanceof Integer) {
            if ((int) o > 0)
                return true;
            else
                return false;
        }

        return true;
    }

    /**
     * 以天为单位的平均值
     *
     * @param list
     * @return
     */
    public static List<Map<String, Object>> effectToDay(List<Map<String, Object>> list, String field, int span) {
        List<Map<String, Object>> back = new ArrayList<>();
        if (list == null || list.size() == 0)
            return back;

        Timestamp t;
        long day = 24 * 3600000;
        float sum = 0;
        float value;
        long now;
        long end = 0;
        int count = 0;
        for (Map m : list) {
            t = (Timestamp) m.get("infoDataTime");
            value = Float.parseFloat((String) m.get(field));

            now = t.getTime();
            if (end == 0) {
                end = now + day;
            }
            sum += value;
            count++;

            if (now >= end) {
                Map dv = new HashMap();
                dv.put("infoDataTime", end);
                dv.put(field, sum / count);
                back.add(dv);

                end += day;
                sum = 0;
                count = 0;
            }
        }

        return back;
    }


    /**
     * 以天为单位的峰值分析
     *
     * @param list
     * @return
     */
    public static List<Map<String, Object>> effectToMaxDay(List<Map<String, Object>> list, String field, boolean isMax, int span) {
        List<Map<String, Object>> back = new ArrayList<>();
        if (list == null || list.size() == 0)
            return back;

        List<Float> temp = new ArrayList<>();
        Timestamp t;
        long day = 24 * 3600000;
        float value;
        long now;
        long end = 0;
        for (Map m : list) {
            t = (Timestamp) m.get("infoDataTime");
            value = Float.parseFloat((String) m.get(field));
            now = t.getTime();

            if (end == 0) {
                end = now + day;
            }
            temp.add(value);

            if (now >= end) {
                Map dv = new HashMap();
                dv.put("infoDataTime", end);
                if (isMax)
                    dv.put(field, Collections.max(temp));
                else
                    dv.put(field, Collections.min(temp));
                back.add(dv);
                end += day;
                temp.clear();
            }
        }

        return back;
    }

    /**
     * 日、月度、年度 投入量分析
     *
     * @param list
     * @return
     */
    public static List<Map<String, Object>> effectByTime(List<Map<String, Object>> list, int span) {
        List<Map<String, Object>> back = new ArrayList<>();
        if (list == null || list.size() == 0)
            return back;

        long day = getInterval(span);
        float sum = 0;
        float value;
        long now;
        long end = 0;

        for (Map m : list) {
            now = str2Date((String) m.get("in_time"));
            if (now == 0)
                continue;
            value = Float.parseFloat((String) m.get("in_total"));
            if (end == 0) {
                end = now + day;
            }
            sum += value;
            if (now >= end) {
                Map dv = new HashMap();
                dv.put("in_time", end);
                dv.put("in_total", sum);
                back.add(dv);
                end += day;
                sum = 0;
            }
        }

        return back;
    }


    /**
     * 查找map 与list<Map>是否存在key为field的元相同素
     *
     * @param m
     * @param list
     * @param field
     * @return
     */
    public static boolean hasObj(Map m, List<Map<String, Object>> list, String field) {

        if (m == null || list == null || field == null)
            return false;
        for (Map src : list) {
            if (src.get(field) != null && src.get(field).equals(m.get(field))) {
                return true;
            }
        }

        return false;

    }

    public static java.util.Properties getProp(String path) {
        java.util.Properties p = new java.util.Properties();
        try {
            p.load(new FileInputStream(new File(path)));
            return p;
        } catch (IOException e) {
            e.printStackTrace();
        }


        return null;
    }


    /**
     * 把 控制的log数据 按照 每天[设定间隔]的开启时间做统计
     *
     * @param logs          某段时间、某个ctrl 的统计情况
     * @param interval_type 计算间隔 0，1，2： 日、月度、年度 投入量分析
     *                      主要参数：
     *                      ctrl_type 1、2 卷帘、继电器
     *                      ctrl_act:-1 、0 代表开关的开和关，1、2、3，代表卷帘的上升、下降、停止
     *                      ctrl_time:执行时间点
     * @return
     */
    public static List<Map<String, Object>> effect_Logs_By_Time(List<Map<String, Object>> logs, int interval_type) {
        List<Map<String, Object>> back = new ArrayList<>();
        if (logs == null || logs.size() == 0)
            return back;
        long span = getInterval(interval_type);
        long now;
        long end = 0;
        OffOn of = new OffOn();
        List<OffOn> ofs = new ArrayList<>();
        for (Map m : logs) {
            now = ((Timestamp) m.get("ctrl_time")).getTime();
            if (now == 0)
                continue;
            if (end == 0) {
                end = now + span;
            }
            int ctrl_act = (int) m.get("ctrl_act");
            int ctrl_type = (int) m.get("ctrl_act");
            //此处计算开启时间的和
            if (of.setV(ctrl_act, now)) {
                ofs.add(of);
                of = new OffOn();
            }

            if (now >= end) {
                Map dv = new HashMap();
                dv.put("time", end);
                dv.put("count", getSum(ofs));
                back.add(dv);
                end += span;
                ofs.clear();
            }
        }
        return back;
    }

    private static long getSum(List<OffOn> ofs) {
        long sum = 0;
        if (ofs == null || ofs.size() == 0)
            return 0;
        else {
            for (OffOn of : ofs) {
                sum += of.getTime();
            }
        }
        return sum;
    }

    /**
     * 获取间隔
     *
     * @param interval_type
     */
    private static long getInterval(int interval_type) {
        long day = 24 * 3600000;
        switch (interval_type) {
            case 0:
                break;
            case 1:
                day = day * 30;
                break;
            case 2:
                day = day * 360;
                break;
            default:
                break;
        }

        return day;
    }

    public static String getXml() throws IOException {
        String xmlString;
        byte[] strBuffer = null;
        int flen = 0;
        Resource resource = new ClassPathResource("hk.xml");
        File xmlfile = resource.getFile();
        try {
            InputStream in = new FileInputStream(xmlfile);
            flen = (int) xmlfile.length();
            strBuffer = new byte[flen];
            in.read(strBuffer, 0, flen);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        xmlString = new String(strBuffer);

        return xmlString;

    }

    static class OffOn {
        long s = 0;
        long e = 0;
        int ss;
        int ee;

        @Override
        public String toString() {
            return "OffOn{" +
                    "s=" + s +
                    ", e=" + e +
                    ", ss=" + ss +
                    ", ee=" + ee +
                    '}';
        }

        public boolean setV(int ctr_type, long t) {
            //只有在设置了s 才能去设置e
            //关闭
            if (ctr_type == 0 || ctr_type == 3) {
                if (s == 0) {
                    return false;
                } else {
                    e = t;
                    ee = ctr_type;
                    return true;
                }
                //开启
            } else {
                if (s == 0) {
                    s = t;
                    ss = ctr_type;
                }
                return false;
            }
        }

        public long getTime() {
            return e - s;
        }

    }
}
