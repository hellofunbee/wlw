$(function () {
    var page = $("[page=gis4]");
    var selEl = page.find(".mx-top-search");
    var map = new BMap.Map("map4");
    var overlays = [];
    var controls = [];

    var isFocused = false;
    var focus_one = false;
    var all = [];//所有区域的中心点数组用于聚焦所有的点
    var polygon_item = [];//区域，以及数据item

    var marks = [];


    var map1 = map;
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
    controls.push(allControl);
    controls.push(scaleControl);
    controls.push(navControl);
    controls.push(overviewControl);

    var city = "北京";
    if (UI.getConstant()) {
        city = UI.getConstant().city_;
    }
    map1.setCurrentCity(city);

    var cleanMapAreas = function () {
        map.reset();
        $(overlays).each(function () {
            map.removeOverlay(this)
        });
        map.clearOverlays();
        $(controls).each(function () {
            map.removeControl(this)
        });
        controls = [];
        overlays = []
    };

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

    /**
     * 显示infowindow
     * @param polygon 地区的polygon
     * @param d item
     * @param zoom 是否调整视野
     */
    var showInfo = function (polygon, messages, zoom) {
        console.log(messages)
        var point = polygon.getBounds().getCenter();

        // var v = d.province + d.city + d.district;

        var lng = point.lng;
        var lat = point.lat;

        // map1.addOverlay(new BMap.Marker(point));
        if (zoom != false) {
            var pointArray = [];
            pointArray = pointArray.concat(polygon.getPath())
            map1.setViewport(pointArray);
        }


        var title = '';
        var html = '';
        html += '<ul class="newslist" >';
        var pcd = '';
        var t = 3 < messages.length ? messages.slice(0, 3) : messages;
        $(t).each(function (i, e) {
            pcd = e.province + (e.city ? e.city : '') + (e.district ? e.district : '');

            var t = new Date(1e3 * this.m_time);
            html +=
                '<li style="padding: 4px 10px 4px 10px">' +
                '<h3><a  onclick="showMessageDetail(' + e.m_id + ', 5)">' + UI.cutSize(this.m_title, 56) + '</a></h3>' +
                '<p><a style="float: right;"> ' + t.format("yyyy-MM-dd hh:mm:ss") + '</a></p>' +
                '</li>'
        });
        html += "</ul>";


        var str = "";
        var str1 = "<p style='color: #115FAD;text-align: center;font-size:.14rem'>" + pcd + html + "</p>";
        var idx = 0;
        var sContent = str1 + str;
        var point = new BMap.Point(lng, lat);
        //map1.centerAndZoom(point, 10);
        var opts = {width: 200, title: title, enableMessage: true, message: ""};
        var infoWindow = new BMap.InfoWindow(sContent, opts);
        map1.openInfoWindow(infoWindow, point)

    }
    var constant = UI.getConstant();
    var drawMapArea = function (v, messages, keep,last) {
        /* map.reset();
         if (!keep) {
         cleanMapAreas()
         }*/
        var index = 0;


        var bdary = new BMap.Boundary;
        bdary.get(v, function (rs) {
            var count = rs.boundaries.length;
            if (count === 0) {
                layer.msg("未能获取当前输入行政区域");
                return
            }
            for (var i = 0; i < count; i++) {
                var ply = new BMap.Polygon(rs.boundaries[i], {
                    strokeWeight: 2,
                    strokeColor: "#ff0000",
                    fillColor: "#fff",
                    strokeOpacity: 1
                });
                map1.addOverlay(ply);
                overlays.push(ply);
                /*var pointArray = [];
                 pointArray = pointArray.concat(ply.getPath())
                 map1.setViewport(pointArray);*/

                all.push(ply.getBounds().getCenter());
                polygon_item.push({item: messages, polygon: ply});

                //TODO 后台获取默认点
                // if (isFocused == false && ply) {
                //     showInfo(ply, messages)
                //     isFocused = true;
                // }
                //xwfedit

                if(focus_one){
                    isFocused = true;
                    focus_one = false;
                    showInfo(ply, messages)

                }
                else

                if (isFocused == false && ply) {
                    console.log(constant)
                    if (constant && constant.province_ === v) {
                        console.log(constant.province_)
                        showInfo(ply, messages)
                        isFocused = true;
                    } else {

                        if (constant && constant.city_ === messages[0].city) {
                            console.log(constant.city_)
                            showInfo(ply, messages)
                            isFocused = true;
                        }
                    }

                }

                if(last){
                    showD();
                }

                ply.addEventListener("click", function () {
                    // console.log(this.Ou.Ol)
                    showInfo(this, messages);

                });
            }


        })
    };

    $('#showall').on('click', function () {

        if (all.length == 0) {
            layer.msg('未发现任何区域');
        } else {

            if(all.length == 1){
                showInfo(polygon_item[0].polygon,polygon_item[0].item)

            }else
                map1.setViewport(all);
        }
    });


    var reload = function () {
        var waringType = page.find(".selWaringType");
        var type = waringType.attr("value");
        /* if (!type) {
         alert("select type");
         waringType.toggle();
         return
         }*/
        var pSel = $(".topProvinceSel");
        /*if (!pSel.attr("value")) {
         $(".more-cnt-other").show();
         pSel.prev().find("i").click();
         layer.msg("请先选择所在省份");
         return
         }*/
        var cSel = $(".topCitySel");
        var dSel = $(".topDistrictSel");

        /* API.service("/listMessage", {*/
        API.service("/listMessageInMap", {
            m_class: type,
            m_type: 3,
            m_content: selEl.find("input").val(),
            m_province: pSel.attr("value"),
            m_city: cSel.attr("value"),
            m_district: dSel.attr("value")
        }, function (d) {
            if (d.object) {
                /*  changeAreaSelect(d)
                 } else {*/
                all = [];
                polygon_item = [];
                map1.clearOverlays();
                isFocused = false;

                $.each(d.object, function (i) {
                    var item = this;
                    var place = item.province + (item.city ? item.city : '') + (item.district ? item.district : '');
                    console.log(place)
                    drawMapArea(place, item.list, i > 0,i == d.object.length -1)
                })


            }
        }, function (d) {
            layer.msg(d.msg || "暂无数据");
            cleanMapAreas()
        })
    };

    /**\
     * 显示默认地区
     */
    function showD() {
        if (!isFocused) {
            var city = "北京市市辖";
            if (UI.getConstant()) {
                city = UI.getConstant().province_ + UI.getConstant().city_+ UI.getConstant().district_;

            }

            var bdary = new BMap.Boundary;
            bdary.get(city, function (rs) {
                var count = rs.boundaries.length;
                if (count === 0) {
                    return
                }
                var ply = new BMap.Polygon(rs.boundaries[0], {
                    strokeWeight: 2,
                    strokeColor: "#ff0000",
                    fillColor: "#fff",
                    strokeOpacity: 1
                });

                var pointArray = [];
                pointArray = pointArray.concat(ply.getPath())
                map1.setViewport(pointArray);
            })
        }
    }
    $(".selWaringType").on("change", function () {
        reload()
    });
    API.listClassType("3", function (d) {
        $(".selWaringType").selectX(d)
    });
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
            //20181021xwfedit
            if (!me.attr("init_select")) {
                me.attr("init_select", true);
                var render = function (d) {
                    return '<dd style="cursor: pointer;"' + " onmouseover=\"this.style.backgroundColor='#ccc';\"" + " onmouseout=\"this.style.backgroundColor='#fff'\"" + ' value="' + d.value + '"' + " onclick=\"$(this).parents('dl')" + ".attr('value', $(this).attr('value'))" + ".trigger('change')" + ".prev('h3').html($(this).text()+'<em><i></i></em>').click()" + '">' + d.name + "</dd>"
                };

                UI.renderProvince(".topProvinceSel", function () {
                    focus_one = true;
                    reload();

                    if ($(this).attr("value")) {


                        $(".topCitySel").prev("h3").removeClass("on").addClass("on").next().show();
                        $(".topCitySel").attr('value','');
                        $(".topProvinceSel").prev("h3").attr("init_select", true);
                        UI.renderCity(".topCitySel", $(this).attr("value"), function () {
                            focus_one = true;
                            reload();

                            if ($(this).attr("value")) {

                                $(".topDistrictSel").prev("h3").removeClass("on").addClass("on").next().show();
                                $(".topDistrictSel").attr('value','');
                                $(".topCitySel").prev("h3").attr("init_select", true);


                                UI.renderDistrict(".topDistrictSel", $(this).attr("value"), function () {
                                    var val = $(this).attr("value");
                                    focus_one = true;
                                    reload();

                                    if (val) {
                                        $(".topDistrictSel").prev("h3").attr("init_select", true);

                                        /*val = parseInt(val);
                                         for (var i = 0; i < distData.length; i++) {
                                         if (parseInt(distData[i]["d_district"]) === val) {
                                         renderMapData(distData[i]);
                                         break
                                         }
                                         }*/
                                    }
                                }, render,3)
                            }
                        }, render, 3)
                    }
                }, render, 3);
                $(".topProvinceSel, .topCitySel, .topDistrictSel").css("max-height", "300px").css("overflow", "auto")
            }
        }
    });
    selEl.find("a").click(function () {
        reload()
    });
    var mainIframe = $("#main_iframe");
    var mapEl = $("#map4");
    mapEl.height(Math.max(500, mainIframe.height() - 40));
    mainIframe.on("body-height", function () {
        var mf = $("#main_iframe");
        $("#map").height(Math.max(500, mf.height() - 40))
    })
});