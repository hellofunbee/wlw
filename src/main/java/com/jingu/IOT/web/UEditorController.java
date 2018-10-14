package com.jingu.IOT.web;


import com.baidu.ueditor.ActionEnter;
import com.jingu.IOT.util.ToolUtil;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * baidu-ueditor
 *
 * @author libo
 */
@Controller
public class UEditorController {

    @ResponseBody
    @RequestMapping(value = "/ueditorConfig", method = {RequestMethod.GET, RequestMethod.POST})
    public void editorUpload(HttpServletRequest request, HttpServletResponse response, String action) throws IOException {
        response.setContentType("application/json");
        // 配置路径，首先获取static根目录绝对路径
        //
        String rootPath = request.getSession().getServletContext().getRealPath("/");

        System.out.println(rootPath);
//        rootPath = "src/main/resources/static/";
        rootPath = ToolUtil.FILEPATH;
        // 将config.json放到与ueditor.config.js同一级的目录下。将ueditor所有文件放入到wapapp-static-ueditor下
        // 设置获取服务端配置文件地址修正路径，此路径同时作用于文件上传
        PrintWriter writer = null;
        request.getParameter("action");
        try {
            String exec = new ActionEnter(request, rootPath).exec();
            writer = response.getWriter();
            writer.write(exec);
            writer.flush();
        } catch (IOException e) {

        } finally {
            if (writer != null) {
                writer.close();
            }
        }

    }
}