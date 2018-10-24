$(function () {

    $('.backHome').click(function () { //多数据分析
        var data_type = getUrlKey('data_type');
        window.location.href = './productData.html?data=' + $(this).attr('data-home') + "&data_type=" + data_type;

    })

    $('.btn').click(function () {
        $('.bdequipshowNext').css({
            'left': '-1000rem',
            'width': '100%',
            'overflow': 'hidden'

        });

    });
    $('.bdequipshList>li').click(function () {

        $(window).scrollTop(0)

        var inde = $(this).index();

        $('.bdequipshowNext').css({

            'left': '0',

            'width': '200%'

        });

        $('.bdequipshListn>li:eq(' + inde + ')').css({

            'left': '0',

            'top': '0'

        }).siblings('li').css('left', '-1000rem');

    });

    $('.rigntMores').css('top', '.62rem');

    var oTr = $('.bdequipshowNext').width() - $(window).innerWidth();

    $('.wrap').on('scroll', function () {

        if ($('.wrap').scrollLeft() >= oTr) {

            $('.toRight').hide()

        } else {

            $('.toRight').show()

        }

    })

    $('.fir_head_allaa').text(getUrlKey('titlesa'));

    var data_type = getUrlKey('data_type');
    var obj = new Object();
    obj.ckuid = sessionStorage.getItem('ckuid');
    obj.cksid = sessionStorage.getItem('cksid');
    $('.backHome').attr('data-home', 'more')
    obj.deviceList = getUrlKey('addEqui').split(',');
    if (data_type == 1)
        obj.channelList = getUrlKey('channelList').split(',');
    else
        obj.channelList = [];//获取

    obj.beginTime = getUrlKey('beginTime');
    obj.endTime = getUrlKey('endTime');


    console.log("param:")
    console.log(obj)
    console.log("data_type:" + getUrlKey('data_type'))


    var url = '';
    var title_pre = '';//标题前缀


    //执行分析
    if (data_type == 0) {

        url = http + "getLogCaldata_app";
        title_pre = '执行分析'


        //投入品分析
    } else if (data_type == 1) {
        url = http + "listInput_app";
        obj.data_type = data_type;
        title_pre = '投入品分析'

        //生产分析
    } else if (data_type == 2) {
        url = http + "produceAnalysis";
        title_pre = '生产分析'
        obj.tp_ids = obj.deviceList
    }


    loadShow();
    $.ajax({

        type: "post",
        url: url,
        contentType: "application/json",
        headers: {
            'Content-type': 'application/json;charset=UTF-8'
        },
        data: JSON.stringify(obj),
        cache: false,
        success: function (data) {
            console.log(data)
            removeload();
            if (data.object != null) {

                if (data_type == 0)
                    ctrlChart(data);
                if (data_type == 1)
                    inputChart(data)
                if (data_type == 2){
                    $(data.object).each(function (i, e) {
                        produceChart(i, e)
                    });
                }

                if (!$('.mainLiInner').html()) {
                    swal({
                        title: '暂无数据',
                        text: "",
                        type: "warning",
                        showCancelButton: false,
                        confirmButtonColor: "#3366FF",
                        confirmButtonText: "确定",
                        closeOnConfirm: true
                    });
                }

            }

        }, error:

            function () {
                removeload();
                swal({
                    title: '请求失败，请重新尝试',
                    text: "",
                    type: "warning",
                    showCancelButton: false,
                    confirmButtonColor: "#3366FF",
                    confirmButtonText: "确定",
                    closeOnConfirm: true
                });
            }
    })
    ;
})
;

function ctrlChart(a) {
    var c_el = $(".mainLiInner").empty();
    $.each(a.object, function (i, o) {

        var name = o.tp_name;
        var unit = '(分)';

        var data1 = [];
        var series = [];
        for (var ii in o.data) {
            var data2 = [];
            var item = o.data[ii];
            var ctrl_id = item.ctrl_id;
            var ctrl_name = item.ctrl_name;


            var vals = item.list;
            var x_label = "时间";
            var y_label = ctrl_name + "：开启时长" + unit;
            var title = "设备--" + name + '--各开关使用时长(m)分析';
            $(vals).each(function (iii) {
                data2.push([vals[iii]['time'], parseFloat(vals[iii]['count']) / 60000]);

            });

            if (data2.length > 0) {
                data1.push(data2);
                series.push({
                    fill: false,
                    label: y_label
                });
            }
        }


        if (data1.length > 0) {
            /*class="fx-result-list"*/
            $('<div  style="height: 450px" id="chart_' + i + '"></div>').appendTo(c_el);

            var plot2 = $.jqplot('chart_' + i, data1, {
                title: title,
                cursor: {
                    show: false
                },
                legend: {
                    show: true,//设置是否出现分类名称框（即所有分类的名称出现在图的某个位置）
                    location: 'ne',     // 分类名称框出现位置, nw, n, ne, e, se, s, sw, w.
                    xoffset: 12,        // 分类名称框距图表区域上边框的距离（单位px）
                    yoffset: 12,        // 分类名称框距图表区域左边框的距离(单位px)
                    background: '',       //分类名称框距图表区域背景色
                    textColor: ''          //分类名称框距图表区域内字体颜色
                },
                series: series,
                highlighter: {
                    show: true,
                    showMarker: false,
                    useAxesFormatters: false,
                    formatString: '%d, %.1f'

                },
                seriesDefaults: {
                    showMarker: false,
                    rendererOptions: {
                        smooth: true,
                        animation: {
                            show: false
                        }
                    },
                },
                axes: {
                    xaxis: {
                        renderer: $.jqplot.DateAxisRenderer,
                        label: x_label,
                        labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                        tickRenderer: $.jqplot.CanvasAxisTickRenderer,

                        tickOptions: {
                            // labelPosition: 'middle',
                            angle: 30,
                            formatString: '%Y-%m-%d ',
                        }
                    },
                    yaxis: {
                        label: unit,
                        labelRenderer: $.jqplot.CanvasAxisLabelRenderer
                    }
                }
            });
        }

    })
}

function inputChart(a) {
    var c_el = $(".mainLiInner").empty();
    $.each(a.object, function (i, o) {

        var name = o.name;
        var unit = '(kg)';

        var data1 = [];
        var series = [];
        for (var ii in o.data) {
            var data2 = [];
            var item = o.data[ii];
            var ctrl_id = item.deviceId;
            var ctrl_name = item.deviceName;


            var vals = item.list;
            var x_label = "时间";
            var y_label = ctrl_name + "：投入量" + unit;
            var title = "地块:" + name + '--投入分析';
            $(vals).each(function (iii) {
                data2.push([vals[iii]['in_time'], parseFloat(vals[iii]['in_total'])]);

            });

            if (data2.length > 0) {
                data1.push(data2);
                series.push({
                    fill: false,
                    label: y_label
                });
            }
        }


        if (data1.length > 0) {
            /*class="fx-result-list"*/
            $('<div  style="height: 450px" id="chart_' + i + '"></div>').appendTo(c_el);

            var plot2 = $.jqplot('chart_' + i, data1, {
                title: title,
                cursor: {
                    show: false
                },
                legend: {
                    show: true,//设置是否出现分类名称框（即所有分类的名称出现在图的某个位置）
                    location: 'ne',     // 分类名称框出现位置, nw, n, ne, e, se, s, sw, w.
                    xoffset: 12,        // 分类名称框距图表区域上边框的距离（单位px）
                    yoffset: 12,        // 分类名称框距图表区域左边框的距离(单位px)
                    background: '',       //分类名称框距图表区域背景色
                    textColor: ''          //分类名称框距图表区域内字体颜色
                },
                series: series,
                highlighter: {
                    show: true,
                    showMarker: false,
                    useAxesFormatters: false,
                    formatString: '%d, %.1f'

                },
                seriesDefaults: {
                    showMarker: false,
                    rendererOptions: {
                        smooth: true,
                        animation: {
                            show: false
                        }
                    },
                },
                axes: {
                    xaxis: {
                        renderer: $.jqplot.DateAxisRenderer,
                        label: x_label,
                        labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                        tickRenderer: $.jqplot.CanvasAxisTickRenderer,

                        tickOptions: {
                            // labelPosition: 'middle',
                            angle: 30,
                            formatString: '%Y-%m-%d ',
                        }
                    },
                    yaxis: {
                        label: unit,
                        labelRenderer: $.jqplot.CanvasAxisLabelRenderer
                    }
                }
            });
        }

    })
}

function produceChart(index, a) {


    var c_el = $(".mainLiInner");
    var div_id = 'content_' + index;

    var chars = [];
    var deviceName = a.deviceName;
    var standard = a.standard;
    var class1 = a.class1;
    var class2 = a.class2;

    var standard_arr = [getKVs(standard)];
    var class1_arr = [getKVs(class1)];
    var class2_arr = [getKVs(class2)];


    if (standard_arr && standard_arr.length > 0 && standard_arr[0].length > 0)
        chars.push({aar: standard_arr, title: '排产标准面积分析', unit: '亩'});
    if (class1_arr && class1_arr.length > 0 && class1_arr[0].length > 0)

        chars.push({aar: class1_arr, title: '作物排产面积分析', unit: '亩'});
    if (class2_arr && class2_arr.length > 0 && class2_arr[0].length > 0)

        chars.push({aar: class2_arr, title: '作物品种排产面积分析', unit: '亩'});


    if (chars.length == 0) return false;

    $('<div style="width: 100%;float: left" id="' + div_id + '"> </div>').appendTo(c_el);
    c_el = $("#" + div_id);


    $('<h3 style="width: 100%;text-align: center;font-size: 18px;background-color: aliceblue"> ' + deviceName + '</h3>').appendTo(c_el);


    $(chars).each(function (i, e) {
        var id = 'chart_' + index + '_' + i;
        $('<div  style="height: 450px;width: 100%;float: left;margin-left: 2% "  id="' + id + '"></div>').appendTo(c_el);

        jQuery.jqplot(id,
            e.aar,
            {
                title: e.title,
                series:[ {
                    shadow: true,
                    renderer: jQuery.jqplot.PieRenderer,
                    rendererOptions: {
                        showDataLabels: true,
                        //dataLabels: labelsArr,
//                                dataLabelFormatString: '%s'

                            //diameter: 250,//饼图的直径
                            sliceMargin: 1,//饼的每个部分之间的距离
                            dataLabelNudge: 35,
                            lineWidth: 5 //设置 饼 块的边框宽度


                    }
                }],
                legend: {show: true},
                highlighter: {
                    show: true,
                    formatString: '%s',
                    tooltipLocation: 'sw',
                    useAxesFormatters: false
                }
            }
        );


        $('#' + id).bind('jqplotDataHighlight', function (ev, seriesIndex, pointIndex, data) {
            var $this = $(this);
            $this.attr('title', data[0] + ":" + data[1]);
        });
        $('#' + id).bind('jqplotDataUnhighlight', function (ev, seriesIndex, pointIndex, data) {
            var $this = $(this);
            $this.attr('title', "");
        });


    });


}

function getKVs(arr) {
    var back = [];
    $(arr).each(function (i, e) {
        var kv = [];
        kv.push(e.name);
        kv.push(parseInt(e.val));
        back.push(kv);
    });

    return back;
}

function getUrlKey(name) {

    /* var u = (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [, ""])[1].replace(/\+/g, '%20');

	console.log(name);

	console.log(decodeURIComponent(u));  */

    // 根据正则匹配name对应的URL地址中的信息，进行解码返回

    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [, ""])[1]

        .replace(/\+/g, '%20')) || null;

};


$(function () {

    $('#tips').hide()

    window.setTimeout(function () {

        var nima = $(document).height() - $(window).height();

        console.log($(document).height());

        console.log(nima);

        if (nima > 0) {

            $('#tips').show()

        } else {

            $('#tips').hide()

        }

        $(document).scroll(function () {

            if ($(document).scrollTop() - nima >= 0) {

                $('#tips').hide()

            } else {

                $('#tips').show()

            }

        })

    }, 500);


})