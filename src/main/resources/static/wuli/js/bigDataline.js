$(function () {

    $('.backHome').click(function () { //多数据分析
        var fx_type = getUrlKey('fx_type');
        var data_type = getUrlKey('data_type');

        window.location.href = './bigData.html?data=' + $(this).attr('data-home')+"&fx_type="+fx_type+"&data_type="+data_type;


    })

    $('.btn').click(function () {

        $('.bdequipshowNext').css({

            'left': '-1000rem',

            'width': '100%',

            'overflow': 'hidden'

        });

    });

    /* $("#mains").click(function () {

         $('.bdequipshowNext').css({

             'left': '0',

             'width': '200%'

         });

     });*/

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


    function getOption(index) {
        $('.mainLiInner').append('<p style="text-align: center;margin-top: 20px" id="title_' + index + '"></p>');
        $('.mainLiInner').append(' <div style="height: 500px" class="bigLi" id="chart_' + index + '"></div>');

        var dom0n = document.getElementById('chart_' + index);
        var myChart0n = echarts.init(dom0n);

        var option0 = {
            tooltip: {
                show: true
            },

            title: {
                text: '',
                left: 'center'

            },
            grid: {
                left: '2%',
                right: '4%',
                bottom: '20%',
                containLabel: true
            },

            legend: {
                data: [],
                padding: 0,
                textStyle: {
                    fontSize: 12,
                    color: '#666'
                },
                orient: 'horizontal', // 'vertical'

                itemGap: 0,
                y: 'bottom', // 'center' | 'bottom' | {number}

            },

            xAxis: [{
                type: 'category',
                data: [],
                axisLabel: {
                    formatter: '',
                    /*interval: 30,*/
                    rotate: 40
                }
            }],
            yAxis: [{
                type: 'value',
                name: '',
                splitArea: {
                    show: true,
                    areaStyle: {
                        color: ['rgba(0,0,0,1)']
                    }
                }
            }],
            series: []
        };

        return {op: option0, chart: myChart0n, title: 'title_' + index};

    }


    // 名字左移，上移

    /*
        var optionList = [option0];

        optionList.forEach(function (item) {

            item.legend.bottom = '-40px';

            item.legend.left = 0;

        })
    */


    var showVal = getUrlKey('m_id');

    var obj = new Object();

    obj.ckuid = sessionStorage.getItem('ckuid');

    obj.cksid = sessionStorage.getItem('cksid');

    if (showVal == '0') { //单

        $('.backHome').attr('data-home', 'only')

        obj.deviceList = getUrlKey('addEqui').split(',');

        obj.channelList = new Array(getUrlKey('texts'));

        obj.beginTime = getUrlKey('beginTime');

        obj.endTime = getUrlKey('endTime');


    } else {

        $('.backHome').attr('data-home', 'more')

        obj.deviceList = getUrlKey('addEqui').split(',');

        obj.channelList = getUrlKey('channelList').split(',');

        obj.beginTime = getUrlKey('beginTime');

        obj.endTime = getUrlKey('endTime');

    }
    ;


    console.log("param:")
    console.log(obj)
    console.log("showVal:" + showVal)
    console.log("fx_type:" + getUrlKey('fx_type'))
    console.log("data_type:" + getUrlKey('data_type'))

    var fx_type = getUrlKey('fx_type');
    var data_type = getUrlKey('data_type');
    var url = '';
    var title_pre = '';//标题前缀


    //数值分析
    if (fx_type == 0) {
        url = http + "getStaticData";

        //谷值、峰值、均值
    } else if (fx_type == 1) {
        url = http + "getStaticData_avg";
        obj.data_type = data_type;

        if (data_type == 0) {
            title_pre = '均值分析'

        } else if (data_type == 1) {
            title_pre = '谷值分析'

        } else if (data_type == 2) {
            title_pre = '峰值分析'
        }


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
            console.log("showVal:" + showVal)
            removeload();

            if (showVal == '00001') { //单

                $('.nav_l_morede').removeClass('active');

                $('.nav_l_de').addClass('active')

                var Oids = getUrlKey('targe');
                var look = getUrlKey('texts');
                var title = getUrlKey('value');
                console.log("look:" + look)

                console.log("title:" + title)

                $(".mainsout").find('.title').text(title + '分析图表');
                $(".mainsoutn").find('.title').text(title + '分析图表');
                if (data.object != null) {
                    var len = data.object[0].info;
                    var times = len.date;
                    var num = 0;
                    var bean = getOption(1);
                    var option0 = bean.op;
                    var myChart0n = bean.chart;

                    option0.series.length = 0;
                    option0.legend.data.length = 0;

                    for (var i = 0; i < data.object.length; i++) {
                        for (var j = 0; j < data.object[i].info.data.length; j++) {

                            if (data.object[i].info.data[j].channel == look) {

                                num++;

                                $("#mains").show();
                                $("#mainsn").show();
                                $('.bdequipshList').hide();
                                $('.bdequipshListn').hide();
                                var objs = {
                                    name: data.object[i].deviceName,
                                    type: 'line',
                                    stack: '总量' + i + j,
                                    data: data.object[i].info.data[j].data,
                                };

                                // console.log(objs.data.sort());

                                option0.yAxis[0].name = title;
                                option0.legend.data.push(data.object[i].deviceName);
                                option0.series.push(objs);
                                option0.xAxis[0].data = times;

                                option0.xAxis[0].axisLabel.formatter = function (val) {
                                    var d = parseFloat(val)
                                    return getFormatDateByLong(d, "yy-MM-dd")

                                }

                            }

                        }
                        ;

                    }
                    ;

                    /*if (num % 2 > 0) {
                        option0.grid.bottom = Math.floor((num + 1) / 2) * 10 + '%';
                    } else {
                        option0.grid.bottom = Math.floor(num / 2) * 10 + '%';

                    }*/

                    myChart0n.setOption(option0);
                    console.log(option0)

                }

            } else {

                var newStr = decodeURI(window.location.href.split('?')[1].split('&')[1].split('=')[1]);

                /*  $(".mainsout").hide(); //单
                  $('.bdequipshList').show();
                  $('.bdequipshList>li').hide();
                  $(".mainsoutn").hide(); //多
                  $('.bdequipshListn').show();
                  $('.bdequipshListn>li').hide();*/


                $(obj.channelList).each(function (i, channel) {

                    if (data.object != null) {
                        var len = data.object[0].info;
                        var times = len.date;
                        var num = 0;
                        var bean = getOption(i);
                        var option0 = bean.op;
                        var myChart0n = bean.chart;
                        var title_el = $('#' + bean.title);
                        var title = '';
                        var y_lable = '';


                        option0.series.length = 0;
                        option0.legend.data.length = 0;


                        for (var i = 0; i < data.object.length; i++) {
                            for (var j = 0; j < data.object[i].info.data.length; j++) {

                                if (data.object[i].info.data[j].channel == channel) {

                                    title = data.object[i].info.data[j].name + '(' + data.object[i].info.data[j].unit + ')'+title_pre;
                                    y_lable = data.object[i].info.data[j].name + '(' + data.object[i].info.data[j].unit + ')';
                                    num++;

                                    $("#mains").show();
                                    $("#mainsn").show();
                                    $('.bdequipshList').hide();
                                    $('.bdequipshListn').hide();
                                    var objs = {
                                        name: data.object[i].deviceName,
                                        type: 'line',
                                        stack: '总量' + i + j,
                                        data: data.object[i].info.data[j].data,
                                        symbol:'none',  //这句就是去掉点的
                                        smooth:true,  //这句就是让曲线变平滑的
                                    };

                                    // console.log(objs.data.sort());

                                    option0.yAxis[0].name = y_lable;
                                    option0.legend.data.push(data.object[i].deviceName);
                                    option0.series.push(objs);
                                    option0.xAxis[0].data = times;

                                    option0.xAxis[0].axisLabel.formatter = function (val) {
                                        var d = parseFloat(val)
                                        return getFormatDateByLong(d, "yy-MM-dd")

                                    }

                                }

                            }
                            ;

                        }
                        ;

                        /*if (num % 2 > 0) {
                            option0.grid.bottom = Math.floor((num + 1) / 2) * 10 + '%';
                        } else {
                            option0.grid.bottom = Math.floor(num / 2) * 10 + '%';

                        }*/

                        title_el.text(title);
                        myChart0n.setOption(option0);
                        console.log(option0)

                    }


                });


            }

        }, error: function () {
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

    });


});


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