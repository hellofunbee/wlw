$(function () {

    listPic();

    listMessage1Bygroup();

    $('.inputAr_s_search').on('click', function () {

        var str = $(this).siblings('input').val()

        if (str) {

            $('.fir_skill>p').hide();

            $('.fir_var_l_nums>li').each(function () {

                if ($(this).find('p.fir_var_l_n_t_top').text().indexOf(str) >= 0) {

                    $(this).show()

                } else {

                    $(this).hide()

                }

            })

        } else {

            $('.fir_var_l_nums>li').show();

        }
        ;

        $(".fir_head_n_list").hide();

        $('.fir_head_n_all').css('background-image', 'url(img/1062.svg)');

    })

});

//时间戳

function dealdata(ele) {

    var time = new Date(ele * 1000);

    var n = time.getFullYear();

    var y = time.getMonth() + 1;

    var r = time.getDate();

    var h = time.getHours() < 10 ? "0" + time.getHours() : time.getHours();

    var m = time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();

    var s = time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds();

    var result = n + '年' + y + '月' + r + '日';

    return result;

}

//查看政策 资讯消息

function listMessage1Bygroup() {

    var obj = new Object();

    obj.ckuid = sessionStorage.getItem('ckuid');

    obj.cksid = sessionStorage.getItem('cksid');

    obj.m_type = '4';

    loadShow();

    $.ajax({

        // url: http + "listMessage1Bygroup",
        url: http + "listHomePageMessage",

        type: "post",

        contentType: "application/json",

        headers: {

            'Content-type': 'application/json;charset=UTF-8'

        },

        data: JSON.stringify(obj),

        cache: false,

        success: function (data) {

            removeload();

            if (data.state == 0) {

                $(".header-ul").empty().append("<li class='choose'><a>全部分类</li>");

                $(data.object).each(function (i, el) {

                    $(".header-ul").append("<li><a>" + data.object[i].c_name +

                        "</a></li>")

                });


                $(document).on('click', function (e) {

                    var target = $(e.target);

                    if (target.closest(".fir_head_nav").length == 0) {

                        $('.header-ul').hide();

                        $('.fir_head_n_all').css('background-image', 'url(img/1062.svg)');

                    }
                    ;

                    e.stopPropagation();

                });

                $(".fir_head_n_all").click(function () {

                    $('.header-ul').show();

                    $(this).css('background-image', 'url(img/downed.svg)');

                });

                $(".header-ul>li").on('click', function () {

                    $(this).addClass('choose').siblings().removeClass('choose');

                    $(".header-ul").hide();

                    $('.fir_head_n_all').css('background-image', 'url(img/1062.svg)');

                    var num = $(this).index();

                    $('.fir_head_n_all').text($(this).text());

                    if (num == 0) {

                        $('.fir_var_out').show();

                    } else {

                        $('.fir_var_out').eq(num - 1).show().siblings().hide();

                    }
                    ;

                    var nima = $(document).height() - $(window).height();

                    if (nima > 0) {

                        $('.picHave').show()

                    } else {

                        $('.picHave').hide()

                    }

                    $(document).scroll(function () {

                        if ($(document).scrollTop() - nima >= 0) {

                            $('.picHave').hide()

                        } else {

                            $('.picHave').show()

                        }

                    })

                });

                if (data.object != null) {

                    $('.fir_skill>p').hide();

                    $(data.object).each(function (a, e) {

                        var str = '<div class="fir_var_out">' +
                            '<p class="fir_var">' + e.c_name + '</p>';

                            $(e.classList).each(function (b, e) {

                                str += '<p class="fir_var_lists">' + mutil.cutSize(e.c_name,9) + '</p>' +
                                    '<ul class="fir_var_l_nums">';
                                $(e.messageList).each(function (b, e) {

                                    var newText
                                    if (e.m_content.length > 50) {
                                        newText = e.m_content.substr(0, 50) + '...';
                                    } else {
                                        newText = e.m_content;
                                    }

                                    var tTop = '';

                                    if (e.m_title.length > 25) {

                                        tTop = e.m_title.substr(0, 25) + '...';

                                    } else {

                                        tTop = e.m_title

                                    }

                                    //添加了  http://servera.jianghujoy.com:8087/

                                    str += '<li class="fir_var_l_num"><a href="./proDetail.html?m_id=' + e.m_id +

                                        '&title=文章详情" target="_self" ><div class="fir_var_l_n_top clear"><img class="fir_var_l_n_img fl" src="' + img +

                                        e.m_cover + '" /><div class="fir_var_l_n_text fl">' +

                                        '<p class="fir_var_l_n_t_top">' + tTop +

                                        '</p><p class="fir_var_l_n_t_text">' + newText + '</p>' +

                                        '</div></div><p class="fir_var_l_user">' + e.m_authorname +

                                        '</p><div class="clear"><span class="fl fir_var_l_time">' + dealdata(e.m_time) +

                                        '</span><span class="fr fir_var_l_more">了解更多></span>' +

                                        '</div></a></li>'

                                    /* str += '<li class="fir_var_l_num"><a href="./proDetail.html?m_id=' + data.object[

                                     a].list[b].m_id +

                                     '&title=文章详情" target="_self" ><div class="fir_var_l_n_top clear"><img class="fir_var_l_n_img fl" src="' +

                                     e.m_cover + '" /><div class="fir_var_l_n_text fl">' +

                                     '<p class="fir_var_l_n_t_top">' + tTop +

                                     '</p><p class="fir_var_l_n_t_text">' + newText + '</p>' +

                                     '</div></div><p class="fir_var_l_user">' + e.m_authorname +

                                     '</p><div class="clear"><span class="fl fir_var_l_time">' + dealdata(data.object[

                                     a].list[b].m_time) +

                                     '</span><span class="fr fir_var_l_more">了解更多></span>' +

                                     '</div></a></li>' */

                                });
                                str += '</ul>'
                            });

                        str += '</div>'

                        $(".fir_skill").append(str);

                    })
                    ;

                } else {

                    $('.fir_skill>p').text(data.msg).show();

                }


                var nima = $(document).height() - $(window).height();

                if (nima > 0) {

                    $('.picHave').show()

                } else {

                    $('.picHave').hide()

                }

                $(document).scroll(function () {

                    if ($(document).scrollTop() - nima >= 0) {

                        $('.picHave').hide()

                    } else {

                        $('.picHave').show()

                    }

                })


            } else if (data.state == 2) {

                swal({

                    title: data.msg,

                    text: "",

                    type: "warning",

                    showCancelButton: false,

                    confirmButtonColor: "#3366FF",

                    confirmButtonText: "确定",

                    closeOnConfirm: false

                }, function () {

                    window.location.href = './login.html'

                });

                return false

            } else {

                swal({

                    title: data.msg,

                    text: "",

                    type: "warning",

                    showCancelButton: false,

                    confirmButtonColor: "#3366FF",

                    confirmButtonText: "确定",

                    closeOnConfirm: false

                });

            }

        },

        error: function () {

            removeload()

            swal({

                title: "请求失败,请重新尝试",

                text: "",

                type: "warning",

                showCancelButton: false,

                confirmButtonColor: "#3366FF",

                confirmButtonText: "确定",

                closeOnConfirm: false

            });

            return

        }

    });

}


function listPic() {

    var obj = new Object();

    obj.ckuid = sessionStorage.getItem('ckuid');

    obj.cksid = sessionStorage.getItem('cksid');

    loadShow();

    $.ajax({

        url: http + "listPic",

        type: "post",

        data: JSON.stringify(obj),

        contentType: "application/json",

        headers: {

            'Content-type': 'application/json;charset=UTF-8'

        },

        cache: false,

        success: function (data) {

            removeload()

            if (data.state == 0) {

                $('.swiper-wrapper').empty();

                $(data.object).each(function (i, el) {

                    //添加了  http://servera.jianghujoy.com:8087/

                    $('.swiper-wrapper').append(' <div class="swiper-slide"><img data-src="' + data.object[i].h_url + '" src="' + img + data.object[i].h_cover + '"/></div>')

                    /* $('.swiper-wrapper').append(" <div class='swiper-slide'><img data-src=" + data.object[

                     i].h_url + " src=" + data.object[i].h_cover + " alt=''></div>") */

                })

                var mySwiper = new Swiper('.swiper-container', {

                    autoplay: 1000,

                    mode: 'horizontal',

                    pagination: '.swiper-pagination',

                    loop: true,

                });

                $('.swiper-slide').on('click', function () {

                    window.location.href = $(this).find('img').attr('data-src');

                })

            } else if (data.state == 2) {

                swal({

                    title: data.msg,

                    text: "",

                    type: "warning",

                    showCancelButton: false,

                    confirmButtonColor: "#3366FF",

                    confirmButtonText: "确定",

                    closeOnConfirm: false

                }, function () {

                    window.location.href = './login.html'

                });

                return

            } else {

                swal({

                    title: data.msg,

                    text: "",

                    type: "warning",

                    showCancelButton: false,

                    confirmButtonColor: "#3366FF",

                    confirmButtonText: "确定",

                    closeOnConfirm: false

                });

                return

            }

        },

        error: function () {

            removeload()

            swal({

                title: '请求失败，请重新尝试',

                text: "",

                type: "warning",

                showCancelButton: false,

                confirmButtonColor: "#3366FF",

                confirmButtonText: "确定",

                closeOnConfirm: false

            });

            return

        }

    });

}
