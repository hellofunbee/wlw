var sexarr = ['', '男', '女']$(function () {    if (!sessionStorage.getItem('ckuid') || sessionStorage.getItem('ckuid') == undefined || sessionStorage.getItem('ckuid') == null) {        swal({            title: '登录失效,请重新登录',            text: "",            type: "warning",            showCancelButton: false,            confirmButtonColor: "#3366FF",            confirmButtonText: "确定",            closeOnConfirm: false        }, function () {            window.location.href = './login.html'        });        return    }    ;    listClass1(); //一家专家列表select展示；    $('.inputAr_s_new').click(function () {        $('.expertLists').show();    })    //我要提问    $('.expert_de_pro_ask span').on('click', function () {        $('.expert_de_bg').show().css('height', $('.inputAr_searchList').outerHeight() + 'px');        if ($(this).attr('data-s') == 1) {            $(".ex_onl_ask").show();        } else {            $('.exper_ask').show();        }    });    //专家服务    $('.expertLink').click(function () {        $('.experShows').hide();        $('.experShows:eq(2)').show();        $('.inputAr_set').hide()    });    $('.expertListsBack').click(function () {        $('.experShows').hide();        $('.experShows:eq(0)').show();        $('.inputAr_set').show()    })    $('.experDetail_back').click(function () {        $('.experShows').hide();        $('.experShows:eq(1)').show();        $('.inputAr_set').hide();    })    //遮罩层关闭按钮    $('.expert_de_bg_clo').click(function () {        $(this).parents('.dialog').hide();        $('.expert_de_bg').hide();    });    //客户提问    $('.ques_sub').click(function () {        addAnswerQuestion(1);    })    //专家提问    $('.expert_sub').click(function () {        addAnswerQuestion(2);    })    // 专家分类搜索    $('.inputAr_s_search').on('click', function () {        var str = $(this).siblings('input').val();        if (str) {            $('#inputAr_se_out>li').each(function () {                if ($(this).find('.expert_i_name').text().indexOf(str) >= 0) {                    $(this).show()                } else {                    $(this).hide()                }            })        } else {            $('.ul_bot>li').show();        }    });    $(document).scroll(function () {        var oa = $(document).height() - $(window).height();        if (oa > 0) {            $('.picHave').show()        }        if ($(document).scrollTop() - oa >= 0) {            $('.picHave').hide()        } else {            $('.picHave').show()        }    });})//一级分类列表function listClass1() {    var obj = new Object();    obj.ckuid = sessionStorage.getItem('ckuid');    obj.cksid = sessionStorage.getItem('cksid');    obj.c_type = 6;    obj.c_lev = 1    loadShow();    $.ajax({        url: http + "listClass1",        type: "post",        contentType: "application/json",        headers: {'Content-type': 'application/json;charset=UTF-8'},        data: JSON.stringify(obj),        cache: false,        success: function (data) {            removeload();            if (data.state == 0) {                //一级分类 不同领域                if (data.object == null) {                    swal({                        title: '没有一级相关信息',                        text: "2秒后关闭",                        confirmButtonText: "确定",                        confirmButtonColor: "#3366FF",                        timer: 2000                    });                } else {                    $('.expertLists').html('<li expertLData="0">专家分类</li>');                    $(data.object).each(function (i, el) {                        var names;                        if (data.object[i].c_name.length > 10) {                            names = data.object[i].c_name.substr(0, 8) + '...'                        } else {                            names = data.object[i].c_name                        }                        $('.expertLists').append('<li expertLData=' + data.object[i].c_id + '>' + names + '</li>')                    });                    $(document).on('click', function (e) {                        var target = $(e.target);                        if (target.closest(".inputAr_s_new_bg").length == 0) {                            $('.expertLists').hide();                        }                        ;                        e.stopPropagation();                    });                    $('.expertLists>li').click(function () {                        $('.expertLists>li').removeClass('choose');                        $(this).addClass('choose');                        $('.experShows').hide();                        $('.experShows:eq(0)').show();                        $(this).parent().hide();                        $(this).parent().siblings('.inputAr_s_new').text($(this).text());                        if ($(this).attr('expertLData')) {                            listProfessor($(this).attr('expertLData'), 1);                        }                    });                    $('.expertLists>li').eq(0).click()                }            } else if (data.state == 2) {                swal({                    title: data.msg,                    text: "",                    type: "warning",                    showCancelButton: false,                    confirmButtonColor: "#3366FF",                    confirmButtonText: "确定",                    closeOnConfirm: false                }, function () {                    window.location.href = './login.html'                });                return            } else {                swal({                    title: data.msg,                    text: "",                    type: "warning",                    showCancelButton: false,                    confirmButtonColor: "#3366FF",                    confirmButtonText: "确定",                    closeOnConfirm: false                });                return            }        },        error: function () {            removeload();            swal({                title: '请求失败，请重新尝试',                text: "",                type: "warning",                showCancelButton: false,                confirmButtonColor: "#3366FF",                confirmButtonText: "确定",                closeOnConfirm: false            });            return        }    });}function active() {    var state;    $('.dialog_lists>li').each(function () {        if ($(this).hasClass('active')) {            state = $(this)        }    })    return state}//获取专家列表   id为选重的领域 s！=1表示编辑listProfessor(0, 0);function listProfessor(id, s) {    var obj = new Object();    obj.ckuid = sessionStorage.getItem('ckuid');    obj.cksid = sessionStorage.getItem('cksid');    obj.tu_type = 6;    obj.c_id = id;    var url = "";    if (id > 0) {        url = http + 'listExpByFields'    } else {        url = http + 'listUserForMap'    }    if (s == 1) {        // obj.class1id = id;    } else {        obj.tu_id = id        obj.c_id = 0;        url = http + 'listUserForMap'    }    loadShow();    $.ajax({        url: url,        type: 'post',        contentType: 'application/json',        headers: {'content-type': 'application/json;charset=UTF-8'},        data: JSON.stringify(obj),        cache: false,        success: function (data) {            removeload();            if (data.state == 0) {                if (s == 1) { //多个专家                    /*头部搜索显示*/                    $('.inputAr_set').show();                    if (data.Object != null) {                        swal({                            title: data.msg,                            text: "",                            type: "warning",                            showCancelButton: false,                            confirmButtonColor: "#3366FF",                            confirmButtonText: "确定",                            closeOnConfirm: false                        });                        return;                    } else {                        /*添加专家列表*/                        var str = '';                        $(data.object).each(function (i, e) {                            var field = '';                            if (e.fields && e.fields.length > 4) {                                field = e.fields.substr(0, 4) + '...'                            } else {                                field == data.object[i].fields                            }                            str += '<li class="inputAr_se_o_exper" data-id="' + e.tu_id + '">' +                                '<div class="inputAr_se_i_out" style="background: url(' + img + e.tu_logo + ') center/cover no-repeat"></div>' +                                '<div class="expert_info"><p class="clear">' +                                '<span class="expert_i_name">' + e.tu_name + '</span>' +                                '<span class="expert_i_work">' + field + '</span>' +                                '</p><p class="area">专业领域</p><p class="ara_work">' + field + '</p>' +                                '<p class="area">电子邮箱</p><p class="areaEmail">' + e.tu_email + '</p>' +                                '<p class="area">服务对象</p><p class="araPro">' + (e.clients) + '个</p>' +                                '</div></li>'                        });                        $('#inputAr_se_out').empty().append(str);                        var oa = $(document).height() - $(window).height();                        if (oa > 0) {                            $('.picHave').show();                        } else {                            $('.picHave').hide();                        }                        $('#inputAr_se_out li').on('click', function () {                            $('.inputAr_set').hide();                            $("#inputAr_se_out").hide();                            $('.expert_detail').show();                            sessionStorage.setItem('u_id', $(this).attr('data-id'));                            /*专家列表*/                            listProfessor($(this).attr('data-id'), 2);                            //专家项目                            loadExpPro($(this).attr('data-id'));                            //服务用户                            loadExpClient($(this).attr('data-id'));                            /*专家提问记录*/                            listQuestion($(this).attr('data-id'));                            /*专家提问记录*/                            /*专家答疑问*/                            listAnswerQuestion($(this).attr('data-id'));                            /*专家答疑问*/                            /* 专家服务详情*/                            getProfessorArticle($(this).attr('data-id'));                            /* 专家服务详情*/                            $('.expert_de_pro_tops>li').click(function () {                                $(this).find('.line').css('display', 'block');                                $(this).siblings('li').find('.line').hide();                                var index = $(this).index();                                $('.expert_de_pro:eq(' + index + ')').show().siblings('.expert_de_pro').hide();                            })                        });                        if (getUrlKey('experId')) {                            var index = getUrlKey('experId');                            $('#inputAr_se_out li[data-id="' + index + '"]').click();                            $('.experShows').hide();                            $('.experShows:eq(2)').show();                            $('.inputAr_set').hide()                        }                    }                } else { //单个专家                    var user_type = sessionStorage.getItem('ckuid');                    var user_id = sessionStorage.getItem('u_id');                    if (user_type != user_id) {                        $('.expert_de_pro_ask span').text('我要提问').attr('data-s', 1);                    } else {                        $('.expert_de_pro_ask span').text('回答').attr('data-s', 2)                    }                    //展示专家详细信息                    var age, Odetail;                    if (data.object[0].tu_age != null) {                        age = data.object[0].tu_age                    } else {                        age = ''                    }                    if (data.object[0].tu_info.length > 32) {                        Odetail = data.object[0].tu_info.slice(0, 32)                    } else {                        Odetail = data.object[0].tu_info                    }                    $('.expertLink').attr('u_id', id);                    $('.expert_de_t .expert_d_img').css('background-image', 'url(' + img + data.object[0].tu_logo + ')')                    $('.expert_name').text(data.object[0].tu_name)                    $('.expert_age').text(age);                    $('.expert_sex').text(sexarr[data.object[0].tu_sex])                    // $('.expert_job').text(data.object[0].position);                    $('.exper_serve').text(data.object[0].class2name);                    $('.exper_field').text(data.object[0].fields)                    $('.exper_email').text(data.object[0].tu_email)                    $('.expert_de_c_text').text(Odetail);                    var oa = false;                    $('.showmore').click(function () {                        oa = !oa;                        if (oa) {                            $(this).find('img').attr('src', 'img/toUp.svg');                            $('.showmore').find('span').text('收起');                            $('.expert_de_c_text').text(data.object[0].tu_info);                        } else {                            $(this).find('img').attr('src', 'img/Path/1104.svg');                            $('.showmore').find('span').text('展开更多');                            var Odetail = '';                            if (data.object[0].tu_info.length > 32) {                                Odetail = data.object[0].tu_info.slice(0, 32)                            } else {                                Odetail = data.object[0].tu_info                            }                            $('.expert_de_c_text').text(Odetail)                        }                    });                    /*$('.servingPro').empty();                     $(data.object[0].serproject).each(function (a, el) {                     $('.servingPro').append('<li>' + data.object[0].serproject[a].text + '</li>')                     })                     $('.servedPro').empty();                     $(data.object[0].seredproject).each(function (b, el) {                     $('.servedPro').append('<li>' + data.object[0].seredproject[b].text + '</li>')                     })                     $('.expert_servUser').empty();                     $(data.object[0].seruser).each(function (c, el) {                     $('.expert_servUser').append('<li><span></span>' + data.object[0].seruser[c].text + '</li>')                     })                     */                }            } else if (data.state == 2) {                swal({                    title: data.msg,                    text: "",                    type: "warning",                    showCancelButton: false,                    confirmButtonColor: "#3366FF",                    confirmButtonText: "确定",                    closeOnConfirm: false                }, function () {                    window.location.href = './login.html'                });            } else {                swal({                    title: data.msg,                    text: "",                    type: "warning",                    showCancelButton: false,                    confirmButtonColor: "#3366FF",                    confirmButtonText: "确定",                    closeOnConfirm: false                });            }        },        error: function () {            alert('请求失败，请重试')        }    })}/*专家答疑提问*/function listAnswerQuestion(id) {    var obj = new Object();    obj.ckuid = sessionStorage.getItem('ckuid');    obj.cksid = sessionStorage.getItem('cksid');    // obj.aq_pid = id;    obj.q_exp_id = id;    obj.q_state = 1;    obj.u_search = '';    loadShow();    $.ajax({        url: http + "/uq/list",        type: "post",        contentType: "application/json",        headers: {'Content-type': 'application/json;charset=UTF-8'},        data: JSON.stringify(obj),        cache: false,        success: function (data) {            console.log(data)            removeload();            if (data.state == 0) {                $('.zhuanjaidayi').find('.expert_de_pro_cen').empty();                $(data.object).each(function (i, el) {                    $('.zhuanjaidayi').find('.expert_de_pro_cen').append('<li class="expert_de_pro_cen_list">' + data.object[i].q_title + '<br><span>' + data.object[i].q_ans + '</span></li>');                });            } else if (data.state == 2) {                swal({                    title: data.msg,                    text: "",                    type: "warning",                    showCancelButton: false,                    confirmButtonColor: "#3366FF",                    confirmButtonText: "确定",                    closeOnConfirm: false                }, function () {                    window.location.href = './login.html'                });                return            } else {                swal({                    title: data.msg,                    text: "",                    type: "warning",                    showCancelButton: false,                    confirmButtonColor: "#3366FF",                    confirmButtonText: "确定",                    closeOnConfirm: false                });            }        },        error: function (data) {            swal({                title: data.msg,                text: "",                type: "warning",                showCancelButton: false,                confirmButtonColor: "#3366FF",                confirmButtonText: "确定",                closeOnConfirm: false            });            return        }    })};//加载服务项目function loadExpPro(id) {    var obj = new Object();    obj.ckuid = sessionStorage.getItem('ckuid');    obj.cksid = sessionStorage.getItem('cksid');    obj.tu_id = id;    obj.u_search = '';    loadShow();    $.ajax({        url: http + "/expPro/list",        type: "post",        contentType: "application/json",        headers: {'Content-type': 'application/json;charset=UTF-8'},        data: JSON.stringify(obj),        cache: false,        success: function (data) {            removeload();            if (data.success) {                $('.servingPro').empty();                $(data.object).each(function (i, e) {                    $('.servingPro').append("<li><span></span>" + e.exp_pro_title + "</li>")                });                //问题列表                $(data.object).each(function (z, e) {                    $('.dialog_lists').append(' <li data-id=' + e.exp_pro_id + '> ' + z + ': ' + e.exp_pro_title + '</li>')                })                $('.dialog_lists>li').eq(0).addClass('active');                //提问内容                $('.asctext').text($('.dialog_lists>li').eq(0).text());                $('.dialog_lists>li').on('click', function () {                    $(this).addClass('active').siblings().removeClass('active');                    var content = $(this).text();                    $('.asctext').text(content)                })            } else if (data.state == 2) {                swal({                    title: data.msg,                    text: "",                    type: "warning",                    showCancelButton: false,                    confirmButtonColor: "#3366FF",                    confirmButtonText: "确定",                    closeOnConfirm: false                }, function () {                    window.location.href = './login.html'                });                return            } else {                swal({                    title: data.msg,                    text: "",                    type: "warning",                    showCancelButton: false,                    confirmButtonColor: "#3366FF",                    confirmButtonText: "确定",                    closeOnConfirm: false                });                return            }        },        error: function () {            swal({                title: '请求失败，请重新尝试',                text: "",                type: "warning",                showCancelButton: false,                confirmButtonColor: "#3366FF",                confirmButtonText: "确定",                closeOnConfirm: false            });            return;        }    })}//服务用户function loadExpClient(id) {    var obj = new Object();    obj.ckuid = sessionStorage.getItem('ckuid');    obj.cksid = sessionStorage.getItem('cksid');    obj.exp_id = id;    obj.u_search = '';    loadShow();    $.ajax({        url: http + "/expClient/list",        type: "post",        contentType: "application/json",        headers: {'Content-type': 'application/json;charset=UTF-8'},        data: JSON.stringify(obj),        cache: false,        success: function (data) {            removeload();            if (data.success) {                $('.expert_servUser').empty();                $(data.object).each(function (i, e) {                    $('.expert_servUser').append("<li><span></span>" + e.tu_name + "</li>")                });                //问题列表                $(data.object).each(function (z, e) {                    $('.dialog_lists').append(' <li data-id=' + e.exp_pro_id + '> ' + z + ': ' + e.tu_name + '</li>')                })                $('.dialog_lists>li').eq(0).addClass('active');                //提问内容                $('.asctext').text($('.dialog_lists>li').eq(0).text());                $('.dialog_lists>li').on('click', function () {                    $(this).addClass('active').siblings().removeClass('active');                    var content = $(this).text();                    $('.asctext').text(content)                })            } else if (data.state == 2) {                swal({                    title: data.msg,                    text: "",                    type: "warning",                    showCancelButton: false,                    confirmButtonColor: "#3366FF",                    confirmButtonText: "确定",                    closeOnConfirm: false                }, function () {                    window.location.href = './login.html'                });                return            } else {                swal({                    title: data.msg,                    text: "",                    type: "warning",                    showCancelButton: false,                    confirmButtonColor: "#3366FF",                    confirmButtonText: "确定",                    closeOnConfirm: false                });                return            }        },        error: function () {            swal({                title: '请求失败，请重新尝试',                text: "",                type: "warning",                showCancelButton: false,                confirmButtonColor: "#3366FF",                confirmButtonText: "确定",                closeOnConfirm: false            });            return;        }    })}/*专家在线上提问*/function listQuestion(id) {    var obj = new Object();    obj.ckuid = sessionStorage.getItem('ckuid');    obj.cksid = sessionStorage.getItem('cksid');    obj.aq_pid = id;    obj.q_exp_id = id;    obj.q_state = 1;    obj.u_search = '';    loadShow();    $.ajax({        url: http + "/uq/list",        type: "post",        contentType: "application/json",        headers: {'Content-type': 'application/json;charset=UTF-8'},        data: JSON.stringify(obj),        cache: false,        success: function (data) {            console.log(data)            removeload();            if (data.state == 0) {                $('.tiwenjilv').find('.expert_de_pro_a_conten').empty();                /*$('.textbox4 .a_1>ul').empty()*/                $(data.object).each(function (i, el) {                    $('.tiwenjilv').find('.expert_de_pro_a_conten').append("<li><span></span>" + data.object[i].q_title + "</li>")                });                //问题列表                $(data.object).each(function (z, el) {                    $('.dialog_lists').append(' <li data-id=' + data.object[z].aq_id + '> ' + z + ': ' + data.object[z].q_title + '</li>')                })                $('.dialog_lists>li').eq(0).addClass('active');                //提问内容                $('.asctext').text($('.dialog_lists>li').eq(0).text());                $('.dialog_lists>li').on('click', function () {                    $(this).addClass('active').siblings().removeClass('active');                    var content = $(this).text();                    $('.asctext').text(content)                })            } else if (data.state == 2) {                swal({                    title: data.msg,                    text: "",                    type: "warning",                    showCancelButton: false,                    confirmButtonColor: "#3366FF",                    confirmButtonText: "确定",                    closeOnConfirm: false                }, function () {                    window.location.href = './login.html'                });                return            } else {                swal({                    title: data.msg,                    text: "",                    type: "warning",                    showCancelButton: false,                    confirmButtonColor: "#3366FF",                    confirmButtonText: "确定",                    closeOnConfirm: false                });                return            }        },        error: function () {            swal({                title: '请求失败，请重新尝试',                text: "",                type: "warning",                showCancelButton: false,                confirmButtonColor: "#3366FF",                confirmButtonText: "确定",                closeOnConfirm: false            });            return;        }    })};/*专家在线上提问*//*提问问题*/function addAnswerQuestion(num) {    var obj = new Object();    obj.ckuid = sessionStorage.getItem('ckuid');    obj.cksid = sessionStorage.getItem('cksid');    if (num == 1) { //客户提问        obj.aq_pid = sessionStorage.getItem('u_id');        obj.aq_uid = sessionStorage.getItem('ckuid');        obj.aq_qid = 0;        obj.aq_type = 0        obj.aq_content = $('.userText').val();        if (!obj.aq_content) {            swal({                title: "问题内容不能为空!",                text: "2秒后关闭",                confirmButtonText: "确定",                confirmButtonColor: "#3366FF",                timer: 2000            });            return        }    } else { //专家提问        obj.aq_pid = sessionStorage.getItem('u_id');        obj.aq_uid = sessionStorage.getItem('ckuid');        obj.aq_qid = active().attr('data-id');        obj.aq_type = 2        obj.aq_content = $('.expertTxt').val();        if (!obj.aq_content) {            swal({                title: "问题内容不能为空!",                text: "2秒后关闭",                confirmButtonText: "确定",                confirmButtonColor: "#3366FF",                timer: 2000            });            return        }    }    loadShow()    $.ajax({        url: http + "addAnswerQuestion",        type: "post",        contentType: "application/json",        headers: {'Content-type': 'application/json;charset=UTF-8'},        data: JSON.stringify(obj),        cache: false,        success: function (data) {            console.log(data)            removeload()            if (data.state == 0) {                swal({                    title: data.msg,                    text: "2秒后关闭",                    confirmButtonText: "确定",                    confirmButtonColor: "#3366FF",                    timer: 2000                });                $('.dialog').hide();                $('.expert_de_bg').hide();                if (num == 1) { //客户提问完--专家提问列表                    listQuestion(sessionStorage.getItem('u_id'));                } else { //专家提问列表完--专家答疑                    listAnswerQuestion(sessionStorage.getItem('u_id'));                }            } else if (data.state == 2) {                swal({                    title: data.msg,                    text: "",                    type: "warning",                    showCancelButton: false,                    confirmButtonColor: "#3366FF",                    confirmButtonText: "确定",                    closeOnConfirm: false                }, function () {                    window.location.href = './login.html'                });                return false            } else {                swal({                    title: data.msg,                    text: "",                    type: "warning",                    showCancelButton: false,                    confirmButtonColor: "#3366FF",                    confirmButtonText: "确定",                    closeOnConfirm: false                });            }        },        error: function () {            removeload()            swal({                title: '请求失败，请重新尝试',                text: "",                type: "warning",                showCancelButton: false,                confirmButtonColor: "#3366FF",                confirmButtonText: "确定",                closeOnConfirm: false            });            alert('请求失败，请重新尝试');            return        }    })};/*提问问题*//* 专家服务详情*/function getProfessorArticle(id) {    var obj = new Object();    obj.ckuid = sessionStorage.getItem('ckuid');    obj.cksid = sessionStorage.getItem('cksid');    // obj.u_id = id;    obj.m_type = 4;    obj.m_source = 2;    obj.m_author_id = id    loadShow()    $.ajax({        url: http + "listHomePageMessage",        type: "post",        contentType: "application/json",        headers: {'Content-type': 'application/json;charset=UTF-8'},        data: JSON.stringify(obj),        cache: false,        success: function (data) {            console.log(data)            removeload();            if (data.success) {                $('.expertServedetail').empty();                var c1_name = "";                var c2_name = "";                $(data.object).each(function (i, item) {                    c1_name = item.c_name;                    $(item.classList).each(function (i, item) {                        c2_name = item.c_name;                        $(item.messageList).each(function (i, item) {                            item.class1Name = c1_name;                            item.class2Name = c2_name;                            var str = '';                            var titleName = item.m_title;                            if (titleName && titleName.length > 20) {                                titleName = titleName.slice(0, 20) + '......'                            }                            var titleTexts = item.m_content;//以前是100                            if (titleTexts && titleTexts.length > 80) {                                titleTexts = titleTexts.slice(0, 80) + '......'                            }                            str += '<li data-uid="' + item.a_uid + '" data-id="' + item.m_id + '"><a class="clear" href="./proDetail.html?m_source=2&m_id=' +                                item.m_id + '&m_type=' + item.m_type + '&experId=' + id + '&title=专家成果" target="_self" ><img class="expertServede_img" src="' +img+ item.m_cover + '" alt="加载失败" /><div style="width:1.2rem"><p class="expertList_tit">' + titleName + '</p><p class="expertList_tex">' + item.class1Name + " - " + item.class2Name + '</p>' +                               /* '<p class="expertList_tex">文章分类 - '*/ '</p><p class="expertList_data">' + dealdata(item.m_time) + '</p></div>'                            str += '<p class="expertList_text">' + titleTexts + '<span class="showMore">查看详情&gt;</span></p>'                            str += '</a></li>'                            $('.expertServedetail').append(str);                        });                    });                });                $('.expertServedetail').find('li').eq(0).css('margin-top', '.08rem');                $('.expertServedetail>li').click(function () {                })            } else if (data.state == 2) {                swal({                    title: data.msg,                    text: "",                    type: "warning",                    showCancelButton: false,                    confirmButtonColor: "#3366FF",                    confirmButtonText: "确定",                    closeOnConfirm: false                }, function () {                    window.location.href = './login.html'                });                return false            } else {                swal({                    title: data.msg,                    text: "",                    type: "warning",                    showCancelButton: false,                    confirmButtonColor: "#3366FF",                    confirmButtonText: "确定",                    closeOnConfirm: false                });            }        }, error: function () {            removeload()            swal({                title: '请求失败，请重新尝试',                text: "",                type: "warning",                showCancelButton: false,                confirmButtonColor: "#3366FF",                confirmButtonText: "确定",                closeOnConfirm: false            });            return        }    })}//专家文章详情列表单个文章function getPersonArt() {}/*专家服务详情*///时间戳function dealdata(ele) {    var time = new Date(ele * 1000);    var n = time.getFullYear();    var y = time.getMonth() + 1;    var r = time.getDate();    var h = time.getHours() < 10 ? "0" + time.getHours() : time.getHours();    var m = time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();    var s = time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds();    var result = n + '年' + y + '月' + r + '日';    return result;}function updateUser() {    var obj = new Object();    obj.ckuid = sessionStorage.getItem('ckuid');    obj.cksid = sessionStorage.getItem('cksid');    $('#userList>li').each(function (i, el) {        if (i == 0) {            obj.headimgurl = $('#userList>li').eq(i).find('img').attr('src')        }        if (i == 1) {            obj.u_uname = $('#userList>li').eq(i).find('input').val()            if (!obj.u_uname) {                swal({                    title: '姓名不能为空',                    text: "2秒后关闭",                    confirmButtonText: "确定",                    confirmButtonColor: "#3366FF",                    timer: 2000                });                return            }            obj.sex = activeSex()        }        if (i == 2) {            obj.u_phone = $('#userList>li').eq(i).find('input').val()            if (!obj.u_phone) {                swal({                    title: '手机号不能为空',                    text: "2秒后关闭",                    confirmButtonText: "确定",                    confirmButtonColor: "#3366FF",                    timer: 2000                });                return            }        }        if (i == 3) {            obj.field = $('#userList>li').eq(i).find('input').val()            if (!obj.field) {                swal({                    title: '研究领域不能为空',                    text: "2秒后关闭",                    confirmButtonText: "确定",                    confirmButtonColor: "#3366FF",                    timer: 2000                });                return            }        }        if (i == 4) {            obj.u_phone2 = $('#userList>li').eq(i).find('input').val()            if (!obj.u_phone2) {                swal({                    title: '备用联系方式不能为空',                    text: "2秒后关闭",                    confirmButtonText: "确定",                    confirmButtonColor: "#3366FF",                    timer: 2000                });                return            }        }        if (i == 5) {            obj.position = $('#userList>li').eq(i).find('input').val()            if (!obj.position) {                swal({                    title: '职务不能为空',                    text: "2秒后关闭",                    confirmButtonText: "确定",                    confirmButtonColor: "#3366FF",                    timer: 2000                });                return            }        }        if (i == 6) {            obj.u_email = $('#userList>li').eq(i).find('input').val()            if (!obj.u_email) {                swal({                    title: '电子邮箱不能为空',                    text: "2秒后关闭",                    confirmButtonText: "确定",                    confirmButtonColor: "#3366FF",                    timer: 2000                });                return            }        }        if (i == 9) {            obj.detail = $('#userList>li').eq(i).find('input').val()            if (!obj.detail) {                swal({                    title: '个人介绍不能为空',                    text: "2秒后关闭",                    confirmButtonText: "确定",                    confirmButtonColor: "#3366FF",                    timer: 2000                });                return            }        }    })    $('.textbox5').find('.ul_class2_1>li').each(function (a, el) {    })};function getUrlKey(name) {    return decodeURIComponent((        new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [, ""])[1].replace(/\+/g, '%20')) || null;};