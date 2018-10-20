$(function () {
    var page = $("[page=system]");
    var treeEl = page.find("#treeDemo");
    var configEl = page.find("#cspz");
    var tblIpcList = page.find("table.tbl-ipc-list");
    var ipcTBody = tblIpcList.find("tbody");
    var ipcTHead = tblIpcList.find("thead");

    var lastSelectNode;
    var lastSettingData;

    /*ztree*/
    var onNodeSelect = function (node) {
        if (node && lastSelectNode && lastSelectNode === node)return;

        if (!node)node = lastSelectNode;

        if (!node)return;

        if (node.oriData["tp_type"] === 4) {
            var pNode = node.getParentNode();
            if (pNode) {
                treeEl.data("z-tree").selectNode(pNode);
                onNodeSelect(pNode);
                return
            }
        }


        //当点击父节点时，自动选择第一个设备
        if (node.oriData["tp_type"] < 3) {
            while (node && node.oriData["tp_type"] < 3) {

                var c = node.children;
                if (c && c.length > 0) {
                    node = c[0];
                    if (node && node.oriData["tp_type"] === 3) {
                        treeEl.data("z-tree").selectNode(node);
                        onNodeSelect(node);
                        return
                    }
                } else {
                    return;
                }
            }
        }

        lastSelectNode = node;
        page.trigger("node-change")
    };
    treeEl.on("z-tree-load", function () {

        // var nodes = $(this).data("z-tree").getNodes();
        // nodes && nodes.length > 0 && onNodeSelect(nodes[0]);


        // UI.findFirstDeviceOnTreeActive($(this).data("z-tree"), 3, onNodeSelect)
    });
    var loadConfigPanel = function () {
        if (!configEl.is(":visible"))return false;
        var node = lastSelectNode;
        treeEl.parents(".tree-cnt").hide();
        var name = node.oriData["tp_name"];
        var id = node.oriData["tp_id"];
        var ip = node.oriData["ip"];
        var port = node.oriData["port"];
        var deviceId = node.oriData["deviceId"];
        var parentNode = node.getParentNode();
        if (parentNode && parentNode.oriData) {
            name = parentNode.oriData["tp_name"] + " " + name
        }
        page.find(".sm-userInfo").text(name);
        page.find(".device-ip").text(ip);
        startLoading();

        /* 参数配置 加载*/
        API.service("/getMainDeviceSetting", {deviceId: deviceId, ip: ip, port: port}, function (d) {


            stopLoading();
            if (!d.success) {

                layer.msg(d.msg);
                configEl.find('input').each(function () {
                    configEl.find("input").val("");
                })
                lastSelectNode = null;
                return ;
            }

            var renders = {
                ip_port: function (el, v) {
                    var vs = v.split(":");
                    el.find("input").val("");
                    el.find("input:eq(0)").val(vs[0]);
                    el.find("input:eq(1)").val(vs[1] || "")
                }, time_str: function (el, v) {
                    var timers = v.split("~");
                    var pos = 0;
                    for (var i = 0; i < timers.length; i++) {
                        var timeStr = timers[el.attr("index")];
                        var find = el.find("input");
                        find.eq(0).val(timeStr.substring(0, 2) || "00");
                        find.eq(1).val(timeStr.substring(2, 4) || "00");
                        find.eq(2).val(timeStr.substring(4, 6) || "00")
                    }
                }
            };
            lastSettingData = d;
            for (var n in d.object) {
                var v = d.object[n];
                configEl.find('[field="' + n + '"]').each(function () {
                    var me = $(this);
                    if (me.attr("render")) {
                        renders[me.attr("render")](me, v)
                    } else if (me.is(".mx-checkbox")) {
                        me.removeClass("on");
                        if (v) {
                            me.addClass("on")
                        }
                    } else if (me.is("input") || me.is("select")) {
                        me.val(v)
                    } else if (me.is("img")) {
                        me.attr("src", v)
                    } else {
                        me.text(v)
                    }
                })
            }
        }, function (d) {

            layer.msg(d.msg);
            configEl.find('input').each(function () {
                configEl.find("input").val("");

            })
            lastSettingData = null;

        })
    };
    page.on("node-change", loadConfigPanel);
    page.find("a.load-config-panel").click(loadConfigPanel);

    UI.renderPointTree("#treeDemo", onNodeSelect);

    //重置参数
    page.find(".btn-cfg-reset").click(function (e) {
        var node = lastSelectNode;
        lastSelectNode = null;
        onNodeSelect(node);
        e.preventDefault();
        return false
    });
    /*保存参数*/
    page.find(".btn-cfg-save").click(function (e) {
        var rsp = lastSettingData;
        if (!rsp || !rsp.object) {
            layer.msg("未获取到原数据");
            return false;
        }
        var data = rsp.object;
        var node = lastSelectNode;
        var ip = node.oriData["ip"];
        var tpId = node.oriData["tp_id"];
        var tpType = node.oriData["tp_type"];
        var port = node.oriData["port"];
        var deviceId = node.oriData["deviceId"];
        var oldData = {
            s_deviceIdServIp: data["s_deviceIdServIp"].split(":")[0],
            s_deviceIdServPort: data["s_deviceIdServIp"].split(":")[1],
            s_logServIp: data["s_logServIp"].split(":")[0],
            s_logServPort: data["s_logServIp"].split(":")[1],
            s_imgServIP: data["s_imgServIP"].split(":")[0],
            s_imgServPort: data["s_imgServIP"].split(":")[1],
            s_alarmServIP: data["s_alarmServIP"].split(":")[0],
            s_alarmServPort: data["s_alarmServIP"].split(":")[1],
            s_timeServIP: data["s_timeServIP"].split(":")[0],
            s_timeServPort: data["s_timeServIP"].split(":")[1],
            s_repIpServIp1: data["s_repIpServIp1"].split(":")[0],
            s_repIpServPort1: data["s_repIpServIp1"].split(":")[1],
            s_adcServIp1: data["s_adcServIp1"].split(":")[0],
            s_adcServPort1: data["s_adcServIp1"].split(":")[1],
            s_repIpServIp2: data["s_repIpServIp2"].split(":")[0],
            s_repIpServPort2: data["s_repIpServIp2"].split(":")[1],
            s_adcServIp2: data["s_adcServIp2"].split(":")[0],
            s_adcServPort2: data["s_adcServIp2"].split(":")[1],
            s_repIpServIp3: data["s_repIpServIp3"].split(":")[0],
            s_repIpServPort3: data["s_repIpServIp3"].split(":")[1],
            s_adcServIp3: data["s_adcServIp3"].split(":")[0],
            s_adcServPort3: data["s_adcServIp3"].split(":")[1],
            s_dnsIP: data["s_dnsIP"],
            power_mode: data["power_mode"],
            nouse_ctrl: data["nouse_ctrl"],
            adc_cap_time: data["adc_cap_time"],
            use_light_ctrl: data["use_light_ctrl"],
            s_netmask: data["s_netmask"],
            s_gatewayIP: data["s_gatewayIP"],
            s_localIP: data["s_localIP"],
            use_time_ctrl: data["use_time_ctrl"]
        };
        var newData = $.extend({}, oldData);
        var ipPortNames = [["s_deviceIdServIp", "s_deviceIdServPort"], ["s_logServIp", "s_logServPort"], ["s_imgServIP", "s_imgServPort"], ["s_alarmServIP", "s_alarmServPort"], ["s_timeServIP", "s_timeServPort"], ["s_repIpServIp1", "s_repIpServPort1"], ["s_repIpServIp2", "s_repIpServPort2"], ["s_repIpServIp3", "s_repIpServPort3"], ["s_adcServIp1", "s_adcServPort1"], ["s_adcServIp2", "s_adcServPort2"], ["s_adcServIp3", "s_adcServPort3"]];
        for (var i = 0; i < ipPortNames.length; i++) {
            var ipPortName = ipPortNames[i];
            var deviceIpEl = configEl.find('[field="' + ipPortName[0] + '"]').find("input");
            newData[ipPortName[0]] = deviceIpEl.eq(0).val();
            newData[ipPortName[1]] = deviceIpEl.eq(1).val()
        }
        var inputFields = ["s_dnsIP", "power_mode", "nouse_ctrl", "adc_cap_time", "use_light_ctrl", "s_netmask", "s_gatewayIP", "s_localIP"];
        $(inputFields).each(function () {
            newData[this] = configEl.find('[field="' + this + '"]').val()
        });
        var userTimeCtrlEl = configEl.find('[field="use_time_ctrl"]');
        var userTimeCtrlVal = "";
        for (var x = 0; x < 2; x++) {
            var eq = configEl.find('[field="use_time_ctrl"][index="' + x + '"]');
            if (x === 1) {
                userTimeCtrlVal += "~"
            }
            eq.find("input").each(function (i) {
                var val = UI.preZero($(this).val(), 2, i === 0 ? 23 : 59);
                $(this).val(val);
                userTimeCtrlVal += val
            })
        }
        newData["use_time_ctrl"] = userTimeCtrlVal;
        var params = {
            ip: ip,
            tp_id: "" + tpId,
            tp_type: tpType,
            deviceId: deviceId,
            port: "" + port,
            oldconfig: oldData,
            config: $.extend({}, oldData, newData)
        };
        console.log(params)
        API.service("/setMainDeviceSetting", params, function (d) {
            layer.msg(d.msg)
        });
        e.preventDefault();
        return false
    });
    /*写入设备*/

    page.find(".btn-cfg-write").click(function (e) {
        /*if (!rsp || !rsp.object) {
            layer.msg("未获取到原数据");
            return false;
        }*/
        layer.confirm("确定写入设备配置信息吗？", function (idx) {
            layer.close(idx);
            var node = lastSelectNode;
            var ip = node.oriData["ip"];
            var port = node.oriData["port"];
            var deviceId = node.oriData["deviceId"];
            API.service("/writeMainDeviceSetting", {ip: ip, deviceId: deviceId, port: port}, function (d) {
                layer.msg(d.msg)
            })
        });
        e.preventDefault();
        return false
    });
    var uploadRomBtn = page.find("a.upload-rom");
    var uploadRomFileEl = $('<input style="float:left;left:0;top:0;opacity:0;cursor:pointer" type="file"/>');
    uploadRomFileEl.css({
        width: uploadRomBtn.width() + "px",
        height: uploadRomBtn.height() + "px",
        "margin-top": "-" + uploadRomBtn.height() + "px"
    });
    uploadRomBtn.append(uploadRomFileEl);
    uploadRomBtn.on("click", function (e) {
        $(this).removeAttr("data-href");
        if (uploadRomFileEl.val()) {
            uploadRomFileEl.val("")
        }
    });
    uploadRomFileEl.change(function () {
        var obj = new FormData;
        var node = lastSelectNode;
        var ip = node.oriData["ip"];
        var port = node.oriData["port"];
        var deviceId = node.oriData["deviceId"];
        var ckuid = sessionStorage.getItem("ckuid");
        obj.append("ckuid", ckuid);
        var cksid = sessionStorage.getItem("cksid");
        obj.append("cksid", cksid);
        obj.append("deviceId", deviceId);
        obj.append("ip", ip);
        obj.append("port", port);
        obj.append("file", uploadRomFileEl.get(0).files[0]);
        $.ajax({
            url: apiPre + "/updateSoftWare",
            type: "post",
            enctype: "multipart/form-data",
            processData: false,
            contentType: false,
            data: obj,
            cache: false,
            success: function (data) {
                if (data.state === 2) {
                    layer.confirm(data.msg, function (idx) {
                        top.location.href = "./login.html"
                    })
                } else {
                    layer.msg(data.msg)
                }
            },
            error: function (data) {
                layer.msg(data.msg || data.message || "系统出错了，请重试！")
            }
        })
    });
    var editConfig = function (item) {
        var node = lastSelectNode;
        var name = node.oriData["tp_name"];
        var tpId = node.oriData["tp_id"];
        var ip = node.oriData["ip"];
        var port = node.oriData["port"];
        var deviceId = node.oriData["deviceId"];
        var maxNo = 0;
        ipcTBody.find("tr").each(function () {
            var data = $(this).data("data");
            maxNo = Math.max(data["s_nod"], maxNo)
        });
        var params = "action=update&deviceId=" + item.mapingDeviceId +
            "&ip=" + ip +
            "&port=" + port +
            "&max_nod=" + maxNo +
            "&id=" + item.id +
            "&tp_id=" + tpId +
            "&name=" + encodeURIComponent(name);
        layer.open({
            type: 2,
            title: "摄像头参数配置",
            area: ["485px", "420px"],
            content: "tjsxt.html?" + params,
            skin: "mlayer"
        });
        return false
    };
    var updateHomeAndPort = function (item, name, type) {
        var oldValue = null;

        console.log(item)
        layer.open({
            title: "修改" + name + "代理参数",
            skin: "mlayer",
            area: ["500px", "300px"],
            content: '<div class="tjzsb">\n' +
            "<form>\n" +
            '<table class="mx-table">\n' +
            "<tr>\n" +
            "    <th>" + name + "设备地址</th>\n" +
            '    <td><input type="text" field="s_host" required valid-rule="ip"  class="text-blue"></td>\n' +
            "  </tr>\n" + "  <tr>\n" + "    <th>" + name + "设备端口</th>\n" +
            '    <td><input type="text" field="s_hostport"  required valid-rule="port"  class="text-blue"></td>\n' +
            "  </tr>\n" + "  <tr>\n" + "    <th>" +
            name + "映射端口</th>\n" +
            '    <td><input type="text" field="s_proxy"  required valid-rule="port" class="text-blue"></td>\n' + "  </tr>\n" + "</table>\n" + "</form>\n" +
            "</div>",
            btn: ["保存", "取消"],
            yes: function (idx, layero) {
                var fieldValue = UI.getFieldValue(layero);
                if (!fieldValue)return true;
                var ipc = $.extend({
                    deviceId: item.deviceId,
                    mapingDeviceId: item.mapingDeviceId,
                    type: type
                }, fieldValue);
                ipc.id = oldValue.id;
                API.service("/updateIPCProxy",
                    {
                        pointEntity: {},
                        ipc: ipc,
                        id: item.id
                    }, function (rsp) {

                        if (rsp.object && rsp.object > 0) {
                            if (type == 1) {
                                item.ipcProxyId = rsp.object;
                            } else {
                                item.ipcCtrlProxyId = rsp.object;
                            }
                        }
                        layer.msg(rsp.msg);
                        layer.close(idx)
                    });
                return true
            },
            success: function (layero, index) {

                var ipc_proxy_id;
                if (type == 1) {
                    ipc_proxy_id = item.ipcProxyId;
                } else {
                    ipc_proxy_id = item.ipcCtrlProxyId;
                }
                API.service("/getIPCProxy", {

                    ipc: {id: ipc_proxy_id}
                }, function (rsp) {
                    console.log(rsp)
                    UI.renderField(layero.find("table.mx-table"), rsp.object);
                    oldValue = rsp.object
                    if (!oldValue) {
                        oldValue = {id: 0}
                    }

                }, function (rsp) {
                    oldValue = {id: 0}
                    console.log(rsp)
                    UI.renderField(layero.find("table.mx-table"), null);
                });
            }
        });
        return false
    };
    var editVProxy = function (item) {
        return updateHomeAndPort(item, "视频", 1)
    };
    var editCProxy = function (item) {
        return updateHomeAndPort(item, "控制", 2)
    };
    var editVConfig = function (item) {
        layer.open({
            type: 2,
            area: ["450px", "600px"],
            skin: "mlayer",
            title: "修改摄像头参数",
            content: 'ipcedit.html?data=' + encodeURIComponent(JSON.stringify(item)),
            success: function (layero) {

            }
        });
        return false
    };
    var loadIpcList = function () {
        var node = lastSelectNode;
        var ip = node.oriData["ip"];
        var port = node.oriData["port"];
        var deviceId = node.oriData["deviceId"];
        var tbody = ipcTBody.empty();
        API.service("/listIPC", {
            pointEntity: {ip: ip, deviceId: deviceId, port: port},
            deviceId: deviceId
        }, function (e) {
            var tpl = "<tr>\n" + "  <td>\n" + '    <div class="mx-checkbox"><em></em></div>\n' + "  </td>\n" + '  <td field="id">1</td>\n' + '  <td field="deviceId">10.11.12.103</td>\n' + '  <td field="name">1号摄像头</td>\n' + '  <td field="s_ip">192.168.1.11</td>\n' + '  <td field="s_port">80</td>\n' + '  <td field="s_stream" render="stream_dict">主码流</td>\n' + "  <td>不控制</td>\n" + '  <td field="status" render="dict" dict="ipc_status"></td>\n' + '  <td field="s_online" render="dict" dict="ipc_online"></td>\n' + '  <td><a href="javascript:;" class="btn-sm btn-edit-config">编辑</a></td>\n' + '  <td><a href="javascript:;" class="btn-sm btn-edit-v-proxy">修改</a></td>\n' + '  <td><a href="javascript:;" class="btn-sm btn-edit-c-proxy">修改</a></td>\n' + '  <td><a href="javascript:;" class="btn-sm btn-edit-v-config">修改</a></td>\n' + "</tr>";
            $(e.object).each(function (i) {
                var item = this;
                console.log(item);
                var el = UI.appendFieldTo(tpl, item, tbody).data("data", item);
                el.find('[field="s_stream"]').text(API.dict.ipc_stream[item["s_stream"]])
            });
            tbody.find(".btn-sm").click(function () {

                var me = $(this);
                var item = me.parents("tr").data("data");
                if (me.hasClass("btn-edit-config")) {
                    return editConfig(item)
                } else if (me.hasClass("btn-edit-v-proxy")) {
                    return editVProxy(item)
                } else if (me.hasClass("btn-edit-v-config")) {
                    return editVConfig(item)
                } else if (me.hasClass("btn-edit-c-proxy")) {
                    return editCProxy(item)
                }
                e.preventDefault();
                return false
            })
        })
    };
    var kzsbEl = page.find("#kzsb-list").empty();
    var controlFormEl = page.find("div.control-form-box");
    var controlFormTpl = page.find("div.control-form-tpl");
    var ctrlControlBar = page.find(".ctrl-control-bar").hide();
    var lastChannels = false;

    var renderCtrlFormTpl = function () {
        var tpl = controlFormTpl.clone();
        var rcs = tpl.find(".render-channel").empty();


        $.each(lastChannels.listChannel, function (i) {
            var citem = this;
            rcs.each(function () {
                var rc = $(this);
                $("<option></option>").attr("value", citem.fieldName).text(citem.name).appendTo(rc)
            })
        });
        $.each(lastChannels.listPoint, function (i) {
            var citem = this;
            tpl.find(".render-point").each(function () {
                var rc = $(this);
                $("<option></option>").attr("value", citem.deviceId).text(citem.tp_name || citem.deviceId).appendTo(rc)
            })
        });
        return tpl
    };
    var loadControlForm = function (e) {
        kzsbEl.find("a.btn-device-item").removeClass("btn-df-blue");
        $(this).addClass("btn-df-blue");
        var itemData = $(this).data("data");
        var tpl = renderCtrlFormTpl().html();
        UI.appendFieldTo(tpl, itemData, controlFormEl.empty());
        ctrlControlBar.show();
        return false
    };
    var loadControlDev = function () {
        var node = lastSelectNode;
        var deviceId = node.oriData["deviceId"];
        kzsbEl.empty();
        controlFormEl.empty();
        ctrlControlBar.hide();
        lastChannels = false;
        API.service("/listChannel", {deviceId: node.oriData.deviceId, tp_pid: node.oriData["tp_id"]}, function (rsp) {
            lastChannels = rsp.object;
            API.service("/listControlSetting", {
                pointEntity: {
                    tp_id: node.oriData["tp_id"],
                    deviceId: deviceId
                }
            }, function (d) {
                $(d.object).each(function (idx) {
                    var item = this;
                    var itemEl = $('<a href="javascript:;" class="btn-lg btn-df-white btn-device-item">控温设备</a>').appendTo(kzsbEl).text(item["ctrl_name"]).data("data", item).click(loadControlForm)
                });
                kzsbEl.find("a.btn-device-item:eq(0)").click()
            }, function (r) {
                controlFormEl.html(r.msg);
                ctrlControlBar.hide()
            })
        })
    };
    var getValueObj = function (targetEl) {
        return UI.getFieldValue(targetEl || controlFormEl)
    };
    var saveControl = function () {
        var newVal = getValueObj();
        if (!newVal)return false;
        var defVal = kzsbEl.find("a.btn-device-item.btn-df-blue").data("data");
        var data = $.extend({}, defVal, newVal);
        data.pointEntity = {tp_id: lastSelectNode.oriData["tp_id"]};
        API.service("/updateControlSetting", data, function (d) {
            layer.msg(d.msg);
            kzsbEl.find("a.btn-device-item.btn-df-blue").data("data", data).click()
        })
    };
    var deleteControl = function (e) {
        var defVal = kzsbEl.find("a.btn-device-item.btn-df-blue").data("data");
        var data = {ctrl_id: defVal.ctrl_id};
        data.pointEntity = {tp_id: lastSelectNode.oriData["tp_id"]};
        layer.confirm("确定删除吗？", function (idx) {
            layer.close(idx);
            API.service("/deleteControlSetting", data, function (d) {
                layer.msg(d.msg);
                loadControlDev()
            })
        });
        return false
    };
    var addControl = function () {
        var content = renderCtrlFormTpl().html();
        var node = lastSelectNode;
        var ip = node.oriData["ip"];
        var port = node.oriData["port"];
        var deviceId = node.oriData["deviceId"];
        layer.open({
            area: ["900px", "460px"],
            skin: "mlayer",
            title: "添加控制设备",
            btn: ["保存", "取消"],
            yes: function (index, layo) {
                var obj = getValueObj(layo);
                if (!obj) {
                    return true
                }

                console.log(obj);
                obj.pointEntity = {tp_id: lastSelectNode.oriData["tp_id"]};
                obj["ctrl_deviceId"] = lastSelectNode.oriData["deviceId"];
                API.service("/addControlSetting", obj, function (d) {
                    layer.msg(d.msg);
                    if (d.msg === "添加成功") {
                        layer.close(index);
                        loadControlDev()
                    }
                })
            },
            no: function (index) {
                layer.close(index)
            },
            content: '<div class="main-body"></div>',
            success: function (layero) {
                var toEl = layero.find(".main-body");

                var ctl_el = UI.appendFieldTo(content, {}, toEl);

                ctl_el.find("[field=ctrl_name],[field=ctrl_nickname]").each(function () {

                    $(this).empty();
                    $('<input type="text" class="text-lg">').attr("required", "required").attr("field", $(this).attr("field")).appendTo($(this).removeAttr("field"))

                })

                var pass = ctl_el.find('[field=ctrl_deviceId]').empty();

                $('<input type="text" value="' + deviceId + '" class="text-lg" readonly="readonly">').attr("required", "required").attr("field", $(pass).attr("field")).appendTo($(pass).removeAttr("field"))


            }
        })
    };
    ctrlControlBar.find("a.btn-ctrl-save").click(saveControl);
    ctrlControlBar.find("a.btn-ctrl-delete").click(deleteControl);
    page.find("a.btn-ctrl-add").click(addControl);
    page.on("node-change", function () {
        if (page.find("table.tbl-ipc-list").is(":visible")) {
            loadIpcList()
        }
        if (controlFormEl.is(":visible")) {
            loadControlDev()
        }
    });
    page.find("a.ipc-list").click(loadIpcList);
    page.find("a.control-dev").click(loadControlDev);
    page.find("a.restart-main-device").click(function (e) {
        $(this).removeAttr("data-href");
        e.preventDefault();
        layer.confirm("是否确定重启设备[" + lastSelectNode.oriData["deviceId"] + "]？", function (idx) {
            layer.close(idx);
            var node = lastSelectNode;
            var ip = node.oriData["ip"];
            var port = node.oriData["port"];
            var deviceId = node.oriData["deviceId"];
            API.service("/restart", {
                ip: ip,
                deviceId: deviceId,
                port: port,
                pointEntity: {tp_id: node.oriData["tp_id"], tp_type: node.oriData["tp_type"]}
            }, function (e) {
                layer.msg(e.msg)
            })
        });
        return false
    });
    page.find("a.remove-main-device").click(function (e) {
        e.preventDefault();
        layer.confirm("是否确定删除主设备[" + lastSelectNode.oriData["deviceId"] + "]？", function (idx) {
            layer.close(idx);
            var node = lastSelectNode;
            var ip = node.oriData["ip"];
            var port = node.oriData["port"];
            var deviceId = node.oriData["deviceId"];
            API.service("/deleteMainDevice", {tp_id: node.oriData["tp_id"]}, function (e) {
                layer.msg(e.msg);
                UI.renderPointTree("#treeDemo", onNodeSelect)
            })
        });
        return false
    });
    page.find(".btn-camera-delete-all").click(function () {
        var checkBoxs = ipcTBody.find(".mx-checkbox.on");
        var mapperDeviceIds = [];
        if (checkBoxs.size() === 0) {
            layer.msg("请选择要删除的设备！");
            return false
        }
        layer.confirm("确定要删除选中的" + checkBoxs.length + "个设备吗？", function (idx) {
            checkBoxs.each(function (idx) {
                var tr = $(this).parents("tr");
                var data = tr.data("data");
                var node = lastSelectNode;
                var id = node.oriData["tp_id"];
                var deviceId = node.oriData["deviceId"];
                var json = {
                    id: data.id,
                    deviceId: deviceId,
                    _pointEntity: {ip: data.s_ip, port: data.s_port}
                };
                console.log(json);
                API.service("/deleteIPC", json, function (rsp) {
                    layer.msg(rsp.msg);
                    tr.fadeOut().remove()
                })
            });
            layer.close(idx)
        })
    });
    /*page.find(".btn-sync-config").click(function () {

     var checkBoxs = ipcTBody.find(".mx-checkbox.on");
     var mapperDeviceIds = [];
     if (checkBoxs.size() === 0) {
     layer.msg("请选择要同步的设备！");
     return false
     }
     checkBoxs.each(function (idx) {
     var data = $(this).parents("tr").data("data");
     mapperDeviceIds.push({
     _idx: idx,
     id: data.id,
     name: data.name,
     mapingDeviceId: data.mapingDeviceId,
     deviceId: data.deviceId,
     pointEntity: {ip: data.s_ip, port: data.s_port}
     })
     });
     var syncFun = function (obj) {
     if (!obj) {
     page.trigger("node-change");
     return
     }
     $.ajaxSetup({
     async: true
     });
     API.service("/autoSyn1", obj, function (d) {
     checkBoxs.eq(obj._idx).removeClass("on");
     layer.msg("同步[" + obj.name + "]" + d.msg);
     syncFun(mapperDeviceIds.pop())
     }, function (e) {
     stopLoading();
     layer.alert(e.msg || e.message || e.statusText || e.state || e.status || "同步失败，请重试！");
     page.trigger("node-change")
     })
     };
     syncFun(mapperDeviceIds.pop())
     });*/
    page.find(".btn-sync-config").click(function () {
        var node = lastSelectNode;
        var id = node.oriData["tp_id"];
        var deviceId = node.oriData["deviceId"];

        if (!deviceId) {
            layer.msg("请选择要同步的设备！");
            return false
        }
        ;
        var syncFun = function (obj) {

            $.ajaxSetup({
                async: true
            });
            API.service("/autoSyn1", {deviceId: deviceId,pointEntity:{tp_pid:id}}, function (d) {
                layer.msg(d.msg)
                loadIpcList();
            }, function (e) {
                stopLoading();
                layer.msg(e.msg || e.message || e.statusText || e.state || e.status || "同步失败，请重试！");
                page.trigger("node-change")
            })
        };
        syncFun()
    });
    $(".sblb >h3").click(function () {
        $(this).next().toggle()
    });
    $("#tjzsb").click(function () {
        var tpId = 0;
        var siteId = "1";
        var siteName = "s";
        var groupId = "1";
        var groupName = "vv";
        layer.open({
            type: 2,
            title: "添加主设备",
            area: ["1040px", "600px"],
            content1: "tjzsb.html",
            content: "xgzsb.html?action=add&tp_id=" + tpId + "&siteid=" + siteId + "&sitename=" + siteName + "&groupid=" + groupId + "&groupname=" + groupName,
            skin: "mlayer"
        })
    });
    $("#xgzsb").click(function () {
        var node = lastSelectNode;
        var tpId = node.oriData["tp_id"];
        var siteId = "1";
        var siteName = "s";
        var groupId = "1";
        var groupName = "vv";
        layer.open({
            type: 2,
            title: "修改主设备",
            area: ["1040px", "600px"],
            content: "xgzsb-edit.html?action=update&tp_id=" + tpId + "&siteid=" + siteId + "&sitename=" + siteName + "&groupid=" + groupId + "&groupname=" + groupName,
            skin: "mlayer"
        })
    });
    /*规格文件*/
    $("#ggwz").click(function () {
        var node = lastSelectNode;
        var id = node.oriData["tp_id"];
        var deviceId = node.oriData["deviceId"];
        layer.open({
            type: 2,
            title: "修改规格文件",
            area: ["1200px", "600px"],
            maxmin: true,
            scrollbar: false,
            content: "xgggwj.html?deviceId=" + deviceId + "&tp_id=" + id,
            skin: "mlayer"
        })
    });
    /*报警规则*/
    $("#bjsz").click(function () {
        var node = lastSelectNode;
        var id = node.oriData["tp_id"];
        var deviceId = node.oriData["deviceId"];
        layer.open({
            type: 2,
            title: "修改规格文件",
            area: ["1200px", "600px"],
            maxmin: true,
            scrollbar: false,
            content: "xgbjgz.html?deviceId=" + deviceId + "&tp_id=" + id,
            skin: "mlayer"
        })
    });
    /*摄像头*/
    $("#tjsxt").click(function () {
        var node = lastSelectNode;
        var name = node.oriData["tp_name"];
        var tpId = node.oriData["tp_id"];
        var ip = node.oriData["ip"];
        var port = node.oriData["port"];
        var deviceId = node.oriData["deviceId"];
        var maxNo = 0;
        ipcTBody.find("tr").each(function () {
            var data = $(this).data("data");
            maxNo = Math.max(data["s_nod"], maxNo)
        });
        var params = "deviceId=" + deviceId + "&ip=" + ip + "&port=" + port + "&max_nod=" + maxNo + "&tp_id=" + tpId + "&name=" + encodeURIComponent(name);
        layer.open({
            type: 2,
            title: "添加摄像头",
            area: ["485px", "520px"],
            content: "tjsxt-add.html?" + params,
            skin: "mlayer",
            cancel: function (layero) {
                page.trigger("node-change")
            }
        })
    });
    $("#znkzgz").click(function () {
        var node = lastSelectNode;
        var name = node.oriData["tp_name"];
        var id = node.oriData["tp_id"];
        var ip = node.oriData["ip"];
        var port = node.oriData["port"];
        var deviceId = node.oriData["deviceId"];
        var maxNo = 0;

        var defVal = kzsbEl.find("a.btn-device-item.btn-df-blue").data("data");

        var params = "ctrl_id=" + defVal.ctrl_id + "&type=" + 2 + "&deviceId=" + deviceId + "&tp_id=" + id;
        layer.open({
            type: 2,
            title: "智能控制规则",
            area: ["1000px", "600px"],
            content: "znkzgz.html?" + params,
            skin: "mlayer"
        })
    });


    /*预约规则*/
    $("#yygz").click(function () {
        var str = '<table class="mx-table2 mt10">' +
            '        <thead>' +
            '        <tr>' +
            '            <th width="3%" class="tc">' +
            '                <div class="mx-checkbox select-all"><em></em></div>' +
            '            </th>' +
            '            <th>规则名称</th>' +
            '            <th width="6%">循环周期</th>' +
            '            <th>状态</th>' +
            '            <th width="18%">开始时间</th>' +
            '            <th width="18%">结束时间</th>' +
            '            <th>执行时间</th>' +
            '            <th>执行时长</th>' +
            '            <th width="8%">操作</th>' +
            '        </tr>' +
            '        </thead>' +
            '        <tbody>' +
            '        </tbody>' +
            '    </table>' +
            '    <div class="clearfix mt20 tc">' +
            '<a href="javascript:;" class="btn-lg btn-df-red btn-delete-all">删除选中规则</a> ' +
            '<a href="javascript:;" id="closeParent" class="btn-lg btn-df-gray" onclick="layer.closeAll()">关闭窗口</a> ' +
            '<a href="javascript:;" class="btn-lg btn-df-blue btn-add-gz" id="xjgz">新建规则</a>' +
            '</div>';
        var tpl = '  <tr class="row-tpl">' +
            '            <td class="tc">' +
            '                <div class="mx-checkbox"><em></em></div>' +
            '            </td>' +
            '            <td field="r_name"  >规则名称1</td>' +
            '            <td field="cycleDay">1</td>' +
            '            <td field="ruleEnable" render="dict" dict="ruleEnable">启用</td>' +
            '            <td field="beginTime">2017-11-01 00:00:00</td>' +
            '            <td field="endTime">2017-11-01 00:00:00</td>' +
            '            <td field="execTime">15:00:00</td>' +
            '            <td field="duration" unit="秒">0.0秒</td>' +
            '            <td><a href="#" class="btn-sm btn-edit">编辑</a></td>' +
            '        </tr>' +

            $(".xxx-layer").html(str);

        layer.open({
            type: 1,
            title: "预约规则",
            area: ["1000px", "600px"],
            content: $(".xxx-layer"),
            success: function (layero) {
                var defVal = kzsbEl.find("a.btn-device-item.btn-df-blue").data("data");
                layero.on("click", ".mx-checkbox", function () {
                    var me = $(this);
                    var onAll = me.toggleClass("on").is(".select-all");
                    if (onAll) {
                        var checkBox = layero.find("tbody .mx-checkbox").removeClass("on");
                        if (me.is(".on")) {
                            checkBox.addClass("on")
                        }
                    }
                }).on("click", ".btn-edit", function () {
                    var item = $(this).parents("tr").data("data");
                    layer.open({
                        type: 2,
                        title: "修改规则",
                        area: ["800px", "600px"],
                        content: "xjgz.html?action=update&r_id=" + item.r_id,
                        skin: "mlayer",
                        end: function () {
                            qureyIt();
                        }

                    });
                    return false
                }).on("click", ".btn-delete-all", function () {
                    var checkBox = layero.find("tbody .mx-checkbox.on");
                    if (!checkBox.size()) {
                        layer.msg("请选择要删除的行");
                        return false
                    }
                    layer.confirm("确定删除选择的" + checkBox.size() + "行吗？", function (idx) {
                        checkBox.each(function () {
                            var itemTr = $(this).parents("tr");
                            var item = itemTr.data("data");
                            API.service("/deleteRule", {r_id: item.r_id}, function (d) {
                                layer.msg(d.msg);
                                itemTr.fadeOut().remove()
                            })
                        });
                        layer.close(idx)
                    })
                });


                qureyIt();
                function qureyIt() {
                    var tbody = layero.find("table.mx-table2>tbody").empty();

                    API.service("/listRule", {ctrl_id: "" + defVal.ctrl_id, type: "1"}, function (rsp) {

                        console.log(rsp.object)
                        $.each(rsp.object, function (i) {

                            var item = this;
                            UI.appendFieldTo(tpl, item, tbody).data("data", item)

                        });

                    });
                }

                $("#xjgz").click(function () {
                    layer.open({
                        type: 2,
                        title: "新建规则",
                        area: ["800px", "600px"],
                        content: "xjgz-add.html?action=add&ctrl_id=" + defVal.ctrl_id + "&type=1",
                        skin: "mlayer", end: function () {
                            qureyIt();
                        }
                    });
                });
            },
            skin: "mlayer",

        })
    });


    $(".sbgl-module>div:not(:first)").hide();
    $("#sbgl a").click(function () {
        var id = $(this).attr("data-href");
        if (!id)return;
        $(this).addClass("on").siblings().removeClass("on");
        $(id).show().siblings().hide()
    });
    $(".kzsb-module>div:not(:first)").hide();
    $("#kzsb-list a").click(function () {
        var id = $(this).attr("data-href");
        $(this).addClass("btn-df-blue").siblings().removeClass("btn-df-blue");
        $(id).show().siblings().hide()
    });
    $(".mx-switch").click(function () {
        var value = $(this).children("em").text();
        if (value == "开") {
            $(this).removeClass("on");
            $(this).children("em").text("关")
        } else {
            $(this).addClass("on");
            $(this).children("em").text("开")
        }
    });
    page.on("click", ".mx-checkbox", function (event) {
        $(this).toggleClass("on")
    });
    ipcTHead.find(".mx-checkbox").click(function () {
        if (!$(this).hasClass("on")) {
            ipcTBody.find(".mx-checkbox").addClass("on")
        } else {
            ipcTBody.find(".mx-checkbox").removeClass("on")
        }
    })
});