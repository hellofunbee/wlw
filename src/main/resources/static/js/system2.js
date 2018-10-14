$(function () {
    var page = $('[page="system2"]');
    var classDefines = [{
        name: "站点分类",
        value: -1,
        bigName: "站点",
        subName: "分组",
        subFieldName: "组名",
        serviceList: "/listPointGroup",
        subField: "list",
        valueField: "tp_id",
        nameField: "tp_name",
        serviceDelete: "/deletePoint",
        serviceAdd: "/addPoint",
        serviceUpdate: "/updatePoint",
        readonly: true,
        getAddParam: function (val, parentId) {
            return {tp_pid: parentId || 0, tp_type: parentId ? "2" : "1", tp_name: val}
        },
        getUpdateParam: function (id, val) {
            return {tp_type: "1", tp_id: id, tp_name: val}
        },
        getDeleteParam: function (id) {
            return {tp_id: id}
        },
        orderField: "tp_index",
        param: {}
    }, {name: "作物分类", value: 1, bigName: "作物种类", subName: "作物品种"}, {
        name: "农资分类",
        value: 2,
        bigName: "农资分类",
        subName: "农资产品"
    }, {name: "政策信息分类", value: 4, bigName: "政策分类"}, {name: "即时信息分类", value: 5, bigName: "即时信息分类"}, {
        name: "预警信息分类",
        value: 3,
        bigName: "预警信息分类"
    }, {name: "专家分类", value: 6, bigName: "专家分类"}, {
        name: "首页资讯分类",
        value: 7,
        bigName: "资讯一级分类",
        subName: "二级分类"
    }, {name: "生产阶段分类", value: 8, bigName: "生产阶段分类", className: "last"}];
    var renderSubItemRow = function (navItem, r, subItemContainerEl, define, parentId) {
        $("<tr>" + '<td class="first" width="150px" >' + (define.subFieldName || define.bigName) + "</td>\n" + '<td class="blue name">' + r[define.nameField || "c_name"] + "</td>\n" + '<td class="tc" width="200px"><a href="javascript:;" class="xt-btn 5 btn-edit">修改</a><a href="javascript:;" class="xt-btn xt-btn-r btn-delete">删除</a>\n' + "</td>" + " </tr>").appendTo(subItemContainerEl).attr("c_id", r[define.valueField || "c_id"]).data("data", r).find(".btn-delete").click(function (e) {
            e.preventDefault();
            var tr = $(this).parents("tr");
            layer.confirm("确定删除[" + tr.find(".name").text() + "]吗?", function (i) {
                layer.close(i);
                var data = {c_id: tr.attr("c_id")};
                if (define.getDeleteParam) {
                    data = define.getDeleteParam(tr.attr("c_id"))
                }
                API.service(define.serviceDelete || "/deleteClass", data, function (d) {
                    layer.msg(d.msg);
                    navItem.click()
                })
            });
            return false
        }).end().find(".btn-edit").click(function (e) {
            e.preventDefault();
            var oldTr = $(this).parents("tr");
            var cId = oldTr.attr("c_id");
            var editRowTr = $('<tr class="edit-row">' + '<td class="first" width="150px">' + (define.subFieldName || define.bigName || define.name) + "</td>\n" + '<td class="blue"><input type="text" value="" placeholder="请输入' + (define.subFieldName || define.bigName || define.name) + '"></td>\n' + '<td class="tc" width="200px"> <a href="javascript:;" class="xt-btn 5 btn-save">保存</a><a href="javascript:;" class="xt-btn xt-btn-r btn-remove">取消</a>\n' + "</td>\n" + "</tr>");
            oldTr.hide().after(editRowTr);
            var inputEl = editRowTr.find("input").focus();
            inputEl.val(oldTr.data("data")[define.nameField || "c_name"]);
            editRowTr.find(".btn-remove").click(function (e) {
                editRowTr.remove();
                oldTr.show()
            }).end();
            editRowTr.find(".btn-save").click(function (e) {
                e.preventDefault();
                var inputEl = editRowTr.find("input");
                if (!inputEl.val()) {
                    layer.msg(inputEl.attr("placeholder"));
                    inputEl.focus();
                    return
                }
                var data = {c_id: cId, c_name: inputEl.val()};
                if (define.getUpdateParam) {
                    data = define.getUpdateParam(cId, inputEl.val())
                }
                API.service(define.serviceUpdate || "/updateClass", data, function (rsp) {
                    layer.msg(rsp.msg);
                    navItem.click()
                });
                return false
            }).end();
            return false
        })
    };
    var renderSubItem = function (navItem, btnAddSub, subItemContainerEl, define, parentId) {
        btnAddSub.click(function () {
            if (subItemContainerEl.find(".new-row").size()) {
                return
            }
            var newRowTr = $('<tr class="new-row">' + '<td class="first" width="150px">' + (define.subName || define.name) + "</td>\n" + '<td class="blue"><input type="text" placeholder="请输入' + (define.subName || define.name) + '"></td>\n' + '<td class="tc" width="200px"> <a href="javascript:;" class="xt-btn 5 btn-save">保存</a><a href="javascript:;" class="xt-btn xt-btn-r btn-remove">取消</a>\n' + "</td>\n" + "</tr>").appendTo(subItemContainerEl);
            newRowTr.find(".btn-remove").click(function (e) {
                newRowTr.remove()
            }).end();
            newRowTr.find(".btn-save").click(function (e) {
                e.preventDefault();
                var inputEl = newRowTr.find("input");
                if (!inputEl.val()) {
                    layer.msg(inputEl.attr("placeholder"));
                    inputEl.focus();
                    return
                }
                var paramInfo = {c_lev: 1, c_name: inputEl.val(), c_type: define.value};
                if (parentId) {
                    paramInfo.c_rid = parentId;
                    paramInfo.c_lev = 2
                }
                if (define.getAddParam) {
                    paramInfo = define.getAddParam(inputEl.val(), parentId)
                }
                API.service(define.serviceAdd || "/addClass", paramInfo, function (rsp) {
                    layer.msg(rsp.msg);
                    navItem.click()
                });
                return false
            }).end();
            newRowTr.find("input").focus();
            setTimeout(function () {
                $.scrollTo(newRowTr.find("input"))
            }, 100)
        })
    };
    var menu = page.find(".little-menu").empty();
    var flgl = page.find(".flgl-module").empty();
    $(classDefines).each(function () {
        var navItem = $('<li><a href="#"></a></li>').appendTo(menu).addClass(this.className || "").find("a").data("define", this).text(this.name);
        navItem.click(function (e) {
            e.preventDefault();
            $(this).parents("li").addClass("on").siblings().removeClass("on");
            var define = $(this).data("define");
            var html = [];
            if (define.subName) {
                var addBigItem = function (r, define) {
                    var isNew = !r[define.valueField || "c_id"] && !r[define.nameField || "c_name"];
                    var bigEl = $('<div class="mx-collapse">\n' + '<div class="mx-colla-tit clearfix">\n' + '<h3 class="fl"><span field="bigName"></span><small field="c_name" class="class_name"></small></h3>\n' + '<a href="javascript:;" class="xt-btn xt-btn-r mt2 fr btn-delete-big">删除</a>\n' + '<a href="javascript:;" class="xt-btn fr mt2 mr15  btn-edit-big">修改</a>\n' + '<a href="javascript:;" class="xt-btn fr mt2 mr15  btn-cancel-big" style="display: none">取消</a>\n' + '<a href="javascript:;" class="xt-btn xt-btn-r mt2 fr btn-save-big"style="display: none">保存</a>\n' + (isNew ? "" : '<a href="javascript:;" class="close">收起</a>\n') + "</div>" + '<div class="mx-colla-cnt">' + '<div><a href="#" class="btn-lg btn-df-blue btn-df-lg-blue btn-add-new">新增<span field="subName"></span></a></div>\n' + '<table class="mx-table3 mt10">\n' + "</table>" + "</div>" + "</div>").appendTo(bigTbl);
                    var subItemContainerEl = bigEl.find(".mx-table3").empty();
                    var btnAddSub = bigEl.find(".btn-add-new");
                    renderSubItem(navItem, btnAddSub, subItemContainerEl, define, r[define.valueField || "c_id"]);
                    bigEl.find('[field="bigName"]').text(define.bigName).end().find('[field="subName"]').text(define.subName).end().find('[field="c_name"]').text(r[define.nameField || "c_name"]).end();
                    bigEl.attr("c_id", r[define.valueField || "c_id"]).data("data", r).find(".btn-save-big").click(function (e) {
                        e.preventDefault();
                        var oldTr = $(this).parents("div.mx-colla-tit");
                        var inputEl = oldTr.find("input");
                        var cId = oldTr.parents(".mx-collapse").attr("c_id");
                        if (!inputEl.val()) {
                            layer.msg(inputEl.attr("placeholder"));
                            inputEl.focus();
                            return
                        }
                        var paramData = {};
                        paramData[define.valueField || "c_id"] = cId;
                        if (isNew && define.value) {
                            paramData["c_type"] = define.value;
                            paramData["c_lev"] = 1
                        }
                        paramData[define.nameField || "c_name"] = inputEl.val();
                        if (isNew) {
                            if (define.getAddParam) {
                                paramData = define.getAddParam(inputEl.val())
                            }
                        } else {
                            if (define.getUpdateParam) {
                                paramData = define.getUpdateParam(cId, inputEl.val())
                            }
                        }
                        if (isNew) {
                            API.service(define.serviceAdd || "/addClass", paramData, function (rsp) {
                                layer.msg(rsp.msg);
                                if (rsp.msg === "修改失败")return;
                                navItem.click()
                            })
                        } else {
                            API.service(define.serviceUpdate || "/updateClass", paramData, function (rsp) {
                                layer.msg(rsp.msg);
                                if (rsp.msg === "修改失败")return;
                                var nameEl = oldTr.find(".class_name").text(inputEl.val()).show();
                                inputEl.remove();
                                var normalBtns = oldTr.find(".btn-delete-big,.btn-edit-big").show();
                                var activeBtns = oldTr.find(".btn-save-big,.btn-cancel-big").hide()
                            })
                        }
                        return false
                    }).end().find(".btn-cancel-big").click(function (e) {
                        e.preventDefault();
                        var oldTr = $(this).parents("div.mx-colla-tit");
                        if (isNew) {
                            oldTr.parent().remove();
                            return false
                        }
                        var nameEl = oldTr.find(".class_name").show();
                        var inputEl = oldTr.find("input").remove();
                        var normalBtns = oldTr.find(".btn-delete-big,.btn-edit-big").show();
                        var activeBtns = oldTr.find(".btn-save-big,.btn-cancel-big").hide();
                        return false
                    }).end().find(".btn-delete-big").click(function (e) {
                        e.preventDefault();
                        var tr = $(this).parents("div.mx-collapse");
                        layer.confirm("确定删除[" + tr.find("h3>[field=c_name]").text() + "]吗?", function (i) {
                            layer.close(i);
                            API.service(define.serviceDelete || "/deleteClass", define.getDeleteParam ? define.getDeleteParam(tr.attr("c_id")) : {c_id: tr.attr("c_id")}, function (d) {
                                layer.msg(d.msg);
                                navItem.click()
                            })
                        });
                        return false
                    }).end().find(".btn-edit-big").click(function (e) {
                        e.preventDefault();
                        var oldTr = $(this).parents("div.mx-colla-tit");
                        var nameEl = oldTr.find(".class_name");
                        var inputEl = $('<input style="margin-left: 75px;" type="text" value="" placeholder="请输入' + define.name + '">');
                        nameEl.hide().after(inputEl);
                        inputEl.val(nameEl.text()).focus();
                        var normalBtns = oldTr.find(".btn-delete-big,.btn-edit-big").hide();
                        var activeBtns = oldTr.find(".btn-save-big,.btn-cancel-big").show();
                        return false
                    }).end();
                    var tarEl = bigEl.find(".mx-table3");
                    $(r[define.subField || "list"]).each(function (si) {
                        var item = this;
                        renderSubItemRow(navItem, item, subItemContainerEl, define)
                    });
                    if (isNew) {
                        bigEl.find(".btn-edit-big").click()
                    }
                };
                var contentHasSubTpl = '<div><a href="#" class="btn-lg btn-df-blue btn-df-lg-blue btn-add-big">新增{bigName}</a></div>\n' + '<div class="big-reps"></div>';
                contentHasSubTpl = contentHasSubTpl.replace(/{bigName}/gi, define["bigName"]).replace(/{subName}/gi, define["subName"]);
                html.push(contentHasSubTpl);
                flgl.empty().html(html.join(""));
                var addBtnBig = flgl.find(".btn-add-big");
                addBtnBig.click(function (e) {
                    addBigItem({}, define);
                    return false
                });
                var bigTbl = flgl.find(".big-reps");
                API.service(define.serviceList || "/listClass1", define.param || {c_type: define.value}, function (rsp) {
                    $(rsp.object).each(function (idx) {
                        var r = this;
                        addBigItem(r, define)
                    });
                    bigTbl.find(".mx-colla-tit .close").click(function () {
                        var text = $(this).text();
                        if (text === "收起") {
                            $(this).text("展开").addClass("open");
                            $(this).parent().next(".mx-colla-cnt").hide()
                        } else {
                            $(this).text("收起").removeClass("open");
                            $(this).parent().next(".mx-colla-cnt").show()
                        }
                    });
                    if (define.readonly) {
                        bigTbl.find(".btn-edit-big,.btn-edit").remove()
                    }
                }, function (e) {
                    if (e.msg === "登录失效") {
                        layer.alert(e.msg, function () {
                            location.href = "login.html"
                        })
                    } else {
                        layer.msg(e.msg)
                    }
                })
            } else {
                var contentTpl = '<div><div><a href="#" class="btn-lg btn-df-blue btn-df-lg-blue btn-add-new">新增{bigName}</a></div>\n' + '<table class="mx-table3 mt10"></table></div>';
                html.push(contentTpl.replace(/{bigName}/gi, define["bigName"]).replace(/{subName}/gi, define["subName"]));
                var ctlEl = flgl.empty().html(html.join(""));
                var subItemContainerEl = ctlEl.find(".mx-table3");
                var btnAddSub = ctlEl.find(".btn-add-new");
                renderSubItem(navItem, btnAddSub, subItemContainerEl, define);
                if (define.value > 0) {
                    API.service(define.serviceList || "/listClass1", define.param || {c_type: define.value}, function (rsp) {
                        $(rsp.object).each(function (idx) {
                            var r = this;
                            renderSubItemRow(navItem, r, subItemContainerEl, define)
                        });
                        if (define.readonly) {
                            bigTbl.find(".btn-edit-big,.btn-edit").remove()
                        }
                    }, function (e) {
                        if (e.msg === "登录失效") {
                            layer.alert(e.msg, function () {
                                location.href = "login.html"
                            })
                        } else {
                            layer.msg(e.msg)
                        }
                    })
                }
            }
            return false
        })
    });
    setTimeout(function () {
        menu.find("li:eq(0)").find("a").click()
    }, 100)
});