$(function () {

    var index = 0;
    var all = [];//所有区域的中心点数组用于聚焦所有的点
    var polygon_item = [];//区域，以及数据item

    var marks = [];
    var isFocused = false;

    var mapEl = $("map2");
    var map1 = mapEl.data("map");
    if (!map1) {
        map1 = new BMap.Map("map2");
        mapEl.data("map", map1)
    }
    map1.enableScrollWheelZoom();
    map1.enableKeyboard();
    map1.enableDragging();
    map1.enableDoubleClickZoom();

    var scaleControl = new BMap.ScaleControl({anchor: BMAP_ANCHOR_BOTTOM_LEFT});
    scaleControl.setUnit(BMAP_UNIT_IMPERIAL);
    map1.addControl(scaleControl);
    var navControl = new BMap.NavigationControl({anchor: BMAP_ANCHOR_TOP_LEFT, type: 0});
    map1.addControl(navControl);
    var overviewControl = new BMap.OverviewMapControl({anchor: BMAP_ANCHOR_BOTTOM_RIGHT, isOpen: false});
    map1.addControl(overviewControl);
    var allControl = new BMap.MapTypeControl({mapTypes: [BMAP_NORMAL_MAP, BMAP_HYBRID_MAP]});
    map1.addControl(allControl);

    map1.centerAndZoom(new BMap.Point(116.404, 39.915), 11);  // 初始化地图,设置中心点坐标和地图级别

    var city = "北京";
    if (UI.getConstant()) {

        city = UI.getConstant().city_;

    }
    map1.setCurrentCity(city);          // 设置地图显示的城市 此项是必须设置的

    map1.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放

    map1.addEventListener("zoomend", function (evt) {
        var point = map1.getCenter();
        var zoom = map1.getZoom();
        var offsetPoint = new BMap.Pixel(evt.offsetX, evt.offsetY);   //记录鼠标当前点坐标


        if (zoom <= 7) {

            if (polygon_item.length > 0) {
                $(polygon_item).each(function (i, e) {
                    var point = e.polygon.getBounds().getCenter()
                    var marker = new BMap.Marker(point);
                    marks.push(marker);
                    map1.addOverlay(marker);
                    marker.addEventListener("click", function () {
                        showInfo(e.polygon, e.item, false);

                    });

                });

            }

        } else {
            $(marks).each(function (i, e) {
                map1.removeOverlay(e)

            });
            marks = [];

        }

    });

    var showInfo = function (polygon, d, zoom) {
        var point = polygon.getBounds().getCenter();
        var v = d.province + d.city + d.district;
        var title = "";
        var time = d.data_time ? '<br/>' + d.data_time + "统计" : "";
        var html = v + time + "<br/>作物种植面积比例";


        var lng = point.lng;
        var lat = point.lat;

        // map1.addOverlay(new BMap.Marker(point));
        if (zoom != false) {
            var pointArray = [];
            pointArray = pointArray.concat(polygon.getPath())
            map1.setViewport(pointArray);
        }

        var str = "";
        var str1 = "<p style='color: #115FAD;text-align: center;font-size:.14rem'>" + html + "</p>";
        var idx = 0;
        $(d.d_content).each(function (i, el) {
            var item = this;
            if (item.d_value && item.d_content) {
                str += "<p style='color: #115FAD;font-size: .14rem;'><span style='display: inline-block;width:20px'>" + ++idx + "</span> <span style='display: inline-block;width: 120px'>" + item.d_content + "</span><span>" + item.d_value + "</span></p>"
            }
        });
        var sContent = str1 + str;
        var point = new BMap.Point(lng, lat);
        // map1.centerAndZoom(point, 13);
        var opts = {width: 200, title: title, enableMessage: false, message: ""};
        var infoWindow = new BMap.InfoWindow(sContent, opts);
        map1.openInfoWindow(infoWindow, point)

    }


    var distData = [];
    var constant = UI.getConstant();

    var renderMapData = function (d, index) {
        var v = d.province + d.city + d.district;
        var bdary = new BMap.Boundary;
        bdary.get(v, function (rs) {
            var count = rs.boundaries.length;
            if (count === 0) {
                console.log(v)
                // layer.msg("未能获取当前输入行政区域");
                return
            }
            // var pointArray = [];
            for (var i = 0; i < count; i++) {
                var ply = new BMap.Polygon(rs.boundaries[i], {
                    strokeWeight: 2,
                    strokeColor: "#ff0000",
                    fillColor: "#fff",
                    strokeOpacity: 1
                });
                map1.addOverlay(ply);

                all.push(ply.getBounds().getCenter());
                polygon_item.push({item: d, polygon: ply});


                //TODO 后台获取默认点

                if (isFocused == false && ply) {

                    if (constant && constant.city_ === d.city) {
                       console.log(constant.city_)
                        showInfo(ply, d)
                        isFocused = true;
                    }

                }

                ply.addEventListener("click", function () {
                    // console.log(this.Ou.Ol)
                    showInfo(this, d);


                });
                // pointArray = pointArray.concat(ply.getPath())
            }


        })
    };

    $('#showall').on('click', function () {
        if (all.length == 0) {
            layer.msg('未发现任何区域');
        } else {
            map1.setViewport(all);
        }
    });
    $('#gis2-search').on('click', function () {
        if ($(this).prev('input').val()) {
            reload();
        } else {
            layer.msg('请输入内容');
        }
    });
    var reload = function () {
        API.service("/listDistribution",
            {
                isMap: 1,
                d_type: 1,
                search: $('#gis2-search').prev('input').val(),
            },
            function (data) {
                distData = data.object;
                if (distData.length) {
                    all = [];
                    polygon_item = [];
                    isFocused = false;
                    $(data.object).each(function (i, e) {
                        renderMapData(e, i)
                    });


                }
            });
    }
    reload();
    $(".sblb>h3").click(function () {
        $(this).next().toggle()
    });
    $(".mx-top-select > h3").click(function () {
        var me = $(this);
        if (me.hasClass("on")) {
            me.removeClass("on");
            me.next().hide()
        } else {
            me.addClass("on");
            me.next().show();
            if (!me.data("init_select")) {
                me.data("init_select", true);
                var render = function (d) {
                    return '<dd style="cursor: pointer;"' + " onmouseover=\"this.style.backgroundColor='#ccc';\"" + " onmouseout=\"this.style.backgroundColor='#fff'\"" + ' value="' + d.value + '"' + " onclick=\"$(this).parents('dl')" + ".attr('value', $(this).attr('value'))" + ".trigger('change')" + ".prev('h3').html($(this).text()+'<em><i></i></em>').click()" + '">' + d.name + "</dd>"
                };
                UI.renderProvince(".topProvinceSel", function () {
                    if ($(this).attr("value")) {
                        $(".topCitySel").prev("h3").removeClass("on").addClass("on").next().show();
                        UI.renderCity(".topCitySel", $(this).attr("value"), function () {
                            if ($(this).attr("value")) {
                                $(".topDistrictSel").prev("h3").removeClass("on").addClass("on").next().show();
                                UI.renderDistrict(".topDistrictSel", $(this).attr("value"), function () {
                                    var val = $(this).attr("value");
                                    if (val) {
                                        val = parseInt(val);
                                        for (var i = 0; i < distData.length; i++) {
                                            if (parseInt(distData[i]["d_district"]) === val) {
                                                renderMapData(distData[i]);
                                                break
                                            }
                                        }
                                    }
                                }, render, 2)
                            }
                        }, render, 2)
                    }
                }, render, 2);
                $(".topProvinceSel, .topCitySel, .topDistrictSel").css("max-height", "300px").css("overflow", "auto")
            }
        }
    });
    var html = $('#xxx-content').clone().html();
    $("#sjdl").click(function () {

        layer.open({
            type: 1,
            area: ["1000px", "670px"],
            title: "物种分布信息管理",
            content: $(".xxx-layer"),
            skin: "mlayer",
            success: function (page, index) {
                page.find(".xxx-layer").empty().html(html)
                var d_province = page.find('#gis2_provice').val();
                var d_city = page.find('#gis2_city').val();
                var d_district = page.find('#gis2_district').val();
                laydate.render(
                    {
                        elem: "#data_time",
                        format: 'yyyy-MM-dd'
                    }
                );

                var dtype = 1;

                var isClick_ct = true;
                UI.renderProvince("#gis2_provice", function () {
                    UI.renderCity("#gis2_city", $(this).val(), function () {
                        UI.renderDistrict("#gis2_district", $(this).val(), function () {
                            // reload();
                            setParam();
                            if (isClick_ct) {
                                isClick_ct = false;
                                reload2();
                                setTimeout(function () {
                                    isClick_ct = true;
                                }, 1000);//一秒内不能重复点击
                            }

                        }, null, 4);
                    }, null, 4)
                }, null, 4);
                function setParam() {
                    d_province = page.find('#gis2_provice').val();
                    d_city = page.find('#gis2_city').val();
                    d_district = page.find('#gis2_district').val();
                }

                var file = page.find('#publish-file');
                var file_name = page.find(".file-name");

                page.find('.upload-xls').on("click", function (e) {
                    file.click()
                });
                file.on('change', function () {
                    file_name.text($(this).val())
                });


                page.find('.download-model').click(function () {
                    var url = '/downLoadFile';
                    var cksid = sessionStorage.getItem("cksid");
                    var ckuid = sessionStorage.getItem("ckuid");
                    var data = {
                        ckuid: ckuid,
                        cksid: cksid,
                        file_name: 'model-1.xls'
                    };
                    API.formDownlad({url: url, method: 'GET', data: data});

                });
                page.find('.btn-search').click(function () {
                    setParam();
                    reload2();
                });
                page.find('.btn-search-all').click(function () {
                    d_province = null;
                    d_city = null;
                    d_district = null;

                    reload2();
                });
                page.find("a.save").on('click', function () {
                    if (!$('#publish-file').val()) {
                        layer.msg('请先选择文件')
                        return;
                    }
                    var o = UI.getFieldValue(page.find('.add-field'));
                    if (!o)return false;
                    var obj = {};
                    obj.ckuid = sessionStorage.getItem("ckuid");
                    obj.cksid = sessionStorage.getItem("cksid");
                    obj.d_type = dtype;
                    obj.d_state = 1;
                    obj.d_province = page.find("#gis2_provice").val();
                    obj.d_city = page.find("#gis2_city").val();
                    obj.d_district = page.find("#gis2_district").val();
                    obj.data_time = page.find("#data_time").val();

                    startLoading();
                    uploadImg(obj,
                        '/addDistribution2',
                        'publish-file', '',
                        function (data) {
                            stopLoading();
                            layer.msg(data.msg)
                            reload2();

                            /*uploadFileEl.val("").change();*/
                        }, function (data) {
                            stopLoading();
                            layer.msg(data.msg)
                        });

                });

                /*listDistribute*/

                // reload();
                function reload2() {
                    API.service("/listDistribution", {
                        d_type: dtype,
                        d_province: d_province,
                        d_city: d_city,
                        d_district: d_district
                    }, function (rsp) {
                        var tpl =
                            '<tr class="file-tpl">' +
                            '<td field="d_originalname"></td>' +
                            '<td field="data_time"></td>' +
                            '<td><a href="#" class="btn-sm btn-fh delete">删除</a></td>' +
                            '</tr>';

                        /*var tpl = page.find('.file-tpl').clone();*/
                        var toEl = page.find('.mx-table5 tbody');
                        toEl.empty();
                        $(rsp.object).each(function (i, e) {
                            var el = UI.appendFieldTo(tpl, e, toEl).data('data', e);
                            el.find('.delete').on('click', function () {

                                var data = $(this).closest('tr').data('data');
                                var info = "确认删除"
                                if (data.d_originalname)
                                    info += data.d_originalname;


                                layer.alert(info, function (l) {

                                    API.service("/deleteDistribution", {
                                        d_id: data.d_id,
                                    }, function (result) {
                                        layer.msg(result.msg);
                                        layer.close(l);
                                        if (result.success) {
                                            reload2();
                                        }
                                    }, function (e) {
                                        layer.msg(e.msg);
                                        layer.close(l);
                                    });

                                });


                            });
                        });

                    }, function (m) {
                        var toEl = page.find('.mx-table5 tbody');
                        toEl.empty();
                        layer.msg(m.msg);
                    })
                };
            }
        })
    })


    var mainIframe = $("#main_iframe");
    var mapEl = $("#map2");
    mapEl.height(Math.max(500, mainIframe.height() - 40));
    mainIframe.on("body-height", function () {
        var mf = $("#main_iframe");
        $("#map").height(Math.max(500, mf.height() - 40))
    });

})
;