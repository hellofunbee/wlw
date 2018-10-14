/** * 项目名称：IOT * <p> * 类名称：MessageService * <p> * 类描述： * <p> * 创建人：jianghu * <p> * 创建时间：2017年10月10日 上午11:13:37 * <p> * 修改人：jianghu * <p> * 修改时间：2017年10月10日 上午11:13:37 * <p> * 修改备注： 上午11:13:37 * * @version */package com.jingu.IOT.service;import com.jingu.IOT.dao.ClassDao;import com.jingu.IOT.dao.MessageDao;import com.jingu.IOT.entity.ClassEntity;import com.jingu.IOT.entity.MessageEntity;import com.jingu.IOT.requset.MessageRequset;import com.jingu.IOT.util.Types;import org.springframework.beans.factory.annotation.Autowired;import org.springframework.stereotype.Component;import java.util.ArrayList;import java.util.HashMap;import java.util.List;import java.util.Map;/** * @author jianghu * @ClassName: MessageService * @Description: TODO * @date 2017年10月10日 上午11:13:37 */@Componentpublic class MessageService {    private MessageDao messageDao;    private ClassDao classDao;    @Autowired    public MessageService(MessageDao messageDao, ClassDao classDao) {        this.messageDao = messageDao;        this.classDao = classDao;    }    public int addMessage(MessageEntity me) {        return messageDao.addMessage(me);    }    public int updateMessage(MessageEntity me) {        return messageDao.updateMessage(me);    }    public List<Map<String, Object>> listMessage(MessageEntity me) {        return messageDao.listMessage(me);    }    //预警信息    public List<Map> messageGroupByPlace(MessageEntity me) {        List<Map> result = new ArrayList<>();        List<Map<String, Object>> list = messageDao.messageGroupByPlace(me);        //去重        List<Object> places = new ArrayList<>();        for (Map<String, Object> map : list) {            if (places.indexOf(map.get("place")) == -1) {                places.add(map.get("place"));            }        }        //分组        for (Object place : places) {            Map obj = new HashMap();            obj.put("place", place);            List<Map> items = new ArrayList<>();            for (Map item : list) {                if (place.equals(item.get("place"))) {                    items.add(item);                    if (obj.get("province") == null)                        obj.put("province", item.get("province"));                    if (obj.get("city") == null)                        obj.put("city", item.get("city"));                    if (obj.get("district") == null)                        obj.put("district", item.get("district"));                }            }            obj.put("list", items);            result.add(obj);        }        return result;    }    public int deleteMessage(MessageEntity me) {        return messageDao.deleteMessage(me);    }    /**     * @param mr     * @return     */    public List<Map<String, Object>> listMessage1Bygroup(MessageRequset mr) {        ClassEntity classEntity = new ClassEntity();        MessageEntity messageEntity = new MessageEntity();        if (mr.getM_type() == Types.MT_SHOUYE) {            classEntity.setC_type(Types.CT_SHOUYE);        }        if (mr.getM_type() == Types.MT_ZHENGCE) {            classEntity.setC_type(Types.CT_ZHENGCE);            classEntity.setC_id(mr.getM_class());        }        classEntity.setC_id(mr.getC_id());        List<Map<String, Object>> back = new ArrayList<>();        messageEntity.setM_type(mr.getM_type());        messageEntity.setM_title(mr.getM_title());        //获取 class 一级分类        List<Map<String, Object>> listClass1 = classDao.listClass1(classEntity);        for (Map<String, Object> map : listClass1) {            String c_id = map.get("c_id").toString();            messageEntity.setM_class(Integer.parseInt(c_id));            List<Map<String, Object>> listMessage = messageDao.listMessage(messageEntity);            if (listMessage == null || listMessage.isEmpty()) {                continue;            } else {                map.put("list", listMessage);                back.add(map);            }        }        return back;    }    /**     * 首页 以及首页资讯管理的数据接口     *     * @param mr     * @return     */    public List<Map<String, Object>> listHomePageMessage(MessageRequset mr) {        ClassEntity c1 = new ClassEntity();        if (mr.getM_type() == 4) {            c1.setC_type(7);        } else {            return null;        }        c1.setC_id(mr.getM_class());        c1.setC_lev(1);        List<Map<String, Object>> back = new ArrayList<>();        List<Map<String, Object>> listClass1 = classDao.listClass1(c1);        for (Map<String, Object> class1 : listClass1) {            String c_id = class1.get("c_id").toString();            ClassEntity c = new ClassEntity();            c.setC_id(mr.getM_class2());            c.setC_rid(Integer.parseInt(c_id));            c.setC_lev(2);            List<Map<String, Object>> listClass2 = classDao.listClass2Byrid(c);            for (Map<String, Object> class2 : listClass2) {                String c_id2 = class2.get("c_id").toString();                MessageEntity msg = new MessageEntity();                msg.setM_author_id(mr.getM_author_id());                msg.setM_source(mr.getM_source());                msg.setM_type(4);                msg.setM_title(mr.getM_title());                msg.setM_class2(Integer.parseInt(c_id2));                List<Map<String, Object>> listMessage = messageDao.listMessage(msg);                if (listMessage == null || listMessage.size() == 0) {                    continue;                } else {                    back.add(class1);                    class2.put("messageList", listMessage);                }            }            class1.put("classList", listClass2);        }        return back;    }    // zuo + you -    public List<Map<String, Object>> getInstanceMessage() {        return messageDao.getInstanceMessage();    }    /**     * 2017年12月6日     * <p>     * jianghu     *     * @param c_id     * @return TODO     */    public int ckClass(int c_id) {        // TODO Auto-generated method stub        return messageDao.ckClass(c_id);    }}