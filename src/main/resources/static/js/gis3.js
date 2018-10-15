$(function () {
    var index = 0;
    var isFocused = false;
    var d_procedure = 0;
    var all = [];//所有区域的中心点数组用于聚焦所有的点
    var polygon_item = [];//区域，以及数据item

    var marks = [];

    var mapEl = $("map3");
    var map1 = mapEl.data("map");
    if (!map1) {
        map1 = new BMap.Map("map3");
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
        console.log(d)
        var point = polygon.getBounds().getCenter();
        var v = d.province + d.city + d.district;
        var title = "";

        var time = d.data_time ? '<br/>' + d.data_time + "统计" : "";
        var ns = d.c_name ? '(' + d.c_name + ')' : '';
        var html = v + time + "<br/>" + ns + "生产分布比例";

        var lng = point.lng;
        var lat = point.lat;

        // map1.addOverlay(new BMap.Marker(point));
        if (zoom != false) {
            var pointArray = [];
            pointArray = pointArray.concat(polygon.getPath())
            map1.setViewport(pointArray);
        }

        var main = ' <div id="main' + d.d_id + '" style="width: 200px;height:120px;"></div>';

        //------------echart-------------------

        var item = {d_content: 1, d_value: 1000000};
        try {
            if (d.d_content && d.d_content.length > 0 && d.d_content[0]) {
                var i = d.d_content[0];

                if (i.d_content && i.d_value) {
                    item.d_content = parseInt(i.d_content);
                    item.d_value = parseInt(i.d_value);
                }

            }
        } catch (e) {
            console.log(e)
        }


        var option = {
            title: {
                text: '',
                subtext: '',
                x: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
             orient: 'vertical',
             left: 'left',
             data: ['已完成', '未完成']
             },
            series: [
                {
                    name: '完成比例',
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '60%'],
                    //标签
                    label: {
                        normal: {
                            show: true,
                            position: 'inside',
                            formatter: '{d}%',//模板变量有 {a}、{b}、{c}、{d}，分别表示系列名，数据名，数据值，百分比。{d}数据会根据value值计算百分比

                            textStyle: {
                                align: 'center',
                                baseline: 'middle',
                                fontFamily: '微软雅黑',
                                fontSize: 15,
                                fontWeight: 'bolder'
                            }
                        },
                    },

                    data: [
                        {value: item.d_content, name: '已完成'},
                        {value: item.d_value, name: '未完成'},

                    ],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };

        //------------echart-------------------


        var str = "";
        var str1 = "<p style='color: #115FAD;text-align: center;font-size:.14rem'>" + html + "</p>";
        str1 += main;
        /* var idx = 0;
         $(d.d_content).each(function (i, el) {
         var item = this;
         if (item.d_value && item.d_content) {
         str += "<p style='color: #115FAD;font-size: .14rem;'><span style='display: inline-block;width:20px'>" + ++idx + "</span> <span style='display: inline-block;width: 120px'>" + item.d_content + "</span><span>" + item.d_value + "</span></p>"
         }
         });*/
        var sContent = str1 + str;
        var point = new BMap.Point(lng, lat);
        // map1.centerAndZoom(point, 13);
        var opts = {width: 200, title: title, enableMessage: false, message: ""};
        var infoWindow = new BMap.InfoWindow(sContent, opts);

        EventWrapper.addListener(infoWindow, 'open', function (e) {
            var myChart = echarts.init(document.getElementById('main' + d.d_id));
            myChart.setOption(option)
        });
        EventWrapper.addListener(infoWindow, 'close', function (e) {
        });

        map1.openInfoWindow(infoWindow, point)


    }


    var distData = [];
    var constant = UI.getConstant();
    var renderMapData = function (d, t) {
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

                /*//TODO 后台获取默认点
                if (isFocused == false && ply) {
                    showInfo(ply, d)
                    isFocused = true;
                }*/

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


            // map1.setViewport(pointArray);

        })
    };
    $('#showall').on('click', function () {

        if (all.length == 0) {
            layer.msg('未发现任何区域');
        } else {
            /* if(all.length == 1 && polygon_item.length == 1){

             var pointArray = [];
             pointArray = pointArray.concat(polygon_item[0].polygon.getPath())
             map1.setViewport(pointArray);
             }else*/
            map1.setViewport(all);
        }
    });

    $('#gis3-search').on('click', function () {
        if ($(this).prev('input').val()) {
            reload();
        } else {
            layer.msg('请输入内容');
        }
    });

    //农事
    API.service("/listClass1", {c_type: 8, c_lev: 1}, function (data) {
        $('.d_procedure').empty();
        $(data.object).each(function (i, e) {

            var el = $('<dd value="' + e.c_id + '">' + e.c_name + '</dd>');
            UI.appendFieldTo(el, {}, $('.d_procedure')).data('data', e)
                .on('click', function () {
                    var item = $(this).data('data');
                    d_procedure = item.d_procedure;
                    $('.d_procedure').hide();
                    $('.d_procedure').prev().removeClass("on");
                    $('.d_procedure').prev().attr('value', item.c_id).html(item.c_name + '<em><i></i></em>').change();
                    console.log($(this).data('data'))
                    reload();
                });
        });


    });


    var reload = function () {

        API.service("/listDistribution",
            {
                isMap: 1,
                search: $('#gis3-search').prev('input').val(),
                d_type: 2,
                d_procedure: $('.d_procedure').prev().attr('value')
            },
            function (data) {
                distData = data.object;
                if (distData.length) {
                    all = [];
                    polygon_item = [];
                    map1.clearOverlays();
                    isFocused = false;
                    $(data.object).each(function (i, e) {

                        renderMapData(e, i)
                    });

                    // renderMapData(distData[0])
                }
            }
        )
        ;
    }
    reload();
    $(".sblb>h3").click(function () {
        $(this).next().toggle()
    });

    //省市县
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
                    return '<dd style="cursor: pointer;"' +
                        " onmouseover=\"this.style.backgroundColor='#ccc';\"" +
                        " onmouseout=\"this.style.backgroundColor='#fff'\"" +
                        ' value="' + d.value + '"' +
                        " onclick=\"$(this).parents('dl')" +
                        ".attr('value', $(this).attr('value'))" +
                        ".trigger('change')" +
                        ".prev('h3').html($(this).text()+" +
                        "'<em><i></i></em>').click()" +
                        '">' + d.name + "</dd>"
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
                                }, render, 1)
                            }
                        }, render, 1)
                    }
                }, render, 1);
                $(".topProvinceSel, .topCitySel, .topDistrictSel").css("max-height", "300px").css("overflow", "auto")
            }
        }
    });

    //layer content
    var layer_content = $('.layer-content').clone();

    $("#sjdl").click(function () {
        layer.open({
            type: 1,
            area: ["1000px", "670px"],
            title: "生产分布图信息管理",
            content: $(".xxx-layer"),
            skin: "mlayer",
            end: function () {
                layer.closeAll();
            },
            success: function (page) {
                page.find(".xxx-layer").empty();
                UI.appendFieldTo(layer_content, {}, page.find(".xxx-layer"));

                laydate.render(
                    {
                        elem: "#data_time",
                        format: 'yyyy-MM-dd'
                    }
                );

                var d_province = page.find('#gis2_provice').val();
                var d_city = page.find('#gis2_city').val();
                var d_district = page.find('#gis2_district').val();

                var dtype = 2;
                //城市
                var isClick_ct = true;
                UI.renderProvince("#gis2_provice", function () {
                    UI.renderCity("#gis2_city", $(this).val(), function () {
                        UI.renderDistrict("#gis2_district", $(this).val(), function () {
                            // reload2();
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


                //农事
                API.service("/listClass1", {c_type: 8, c_lev: 1}, function (data) {
                    page.find('#gis3_type').empty();
                    $(data.object).each(function (i, e) {
                        var el = $('<option value="' + e.c_id + '">' + e.c_name + '</option>');
                        UI.appendFieldTo(el, {}, page.find('#gis3_type')).data('data', e);

                    });
                    page.find('#gis3_type').val(0);

                    var isClick = true;
                    page.find('#gis3_type').on('change', function () {
                        if (isClick) {
                            isClick = false;
                            reload2();
                            setTimeout(function () {
                                isClick = true;
                            }, 1000);//一秒内不能重复点击
                        }

                    });


                });

                //设置参数
                function setParam() {

                    d_province = page.find('#gis2_provice').val();
                    d_city = page.find('#gis2_city').val();
                    d_district = page.find('#gis2_district').val();
                }

                page.find('#publish-file').on('change', function () {
                    page.find(".file-name").text($(this).val())
                });
                page.find('.upload-xls').on("click", function (e) {
                    page.find('#publish-file').click()
                });


                // 下载模板
                page.find('.download-model').click(function () {
                    var url = '/downLoadFile';
                    var cksid = sessionStorage.getItem("cksid");
                    var ckuid = sessionStorage.getItem("ckuid");
                    var data = {
                        ckuid: ckuid,
                        cksid: cksid,
                        file_name: 'model-2.xlsx'
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
                //上传文件

                page.find("#save-field").on('click', function () {
                    page.find(".file-name").text(page.find('#publish-file').val())
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
                    obj.d_procedure = page.find('#gis3_type').val();
                    obj.d_state = 1;
                    obj.d_province = page.find("#gis2_provice").val();
                    obj.d_city = page.find("#gis2_city").val();
                    obj.d_district = page.find("#gis2_district").val();
                    obj.data_time = page.find("#data_time").val();

                    // 验证
                    if (!obj.d_procedure || obj.d_procedure <= 0) {
                        layer.msg('请选择农事！')
                        return;
                    }
                    if (!obj.d_province || obj.d_province.length < 1) {
                        layer.msg('请选择省！')
                        return;
                    }
                    if (!obj.d_city || obj.d_city.length < 1) {
                        layer.msg('请选择市！')
                        return;
                    }
                    if (!obj.d_district || obj.d_district.length < 1) {
                        layer.msg('请选择区！')
                        return;
                    }

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
                function reload2(notShow) {
                    API.service("/listDistribution", {
                        d_type: dtype,
                        d_province: d_province,
                        d_city: d_city,
                        d_district: d_district,
                        d_procedure: page.find('#gis3_type').val()
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
                // reload2();

            }
        })
    });

    var mainIframe = $("#main_iframe");
    var mapEl = $("#map3");
    mapEl.height(Math.max(500, mainIframe.height() - 40));
    mainIframe.on("body-height", function () {
        var mf = $("#main_iframe");
        $("#map").height(Math.max(500, mf.height() - 40))
    })

});