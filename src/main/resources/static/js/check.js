/**
 * Created by lenovo on 2018/10/12.
 */

String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g,"");
}
String.prototype.ltrim = function() {
    return this.replace(/^\s+/,"");
}
String.prototype.rtrim = function() {
    return this.replace(/\s+$/,"");
}


function checkNull(value,msg){
    msg=msg?"【"+msg+"】":"";
    if(value==null||value.trim().length==0){
        alert(msg+"不能为空，请重新输入");
        return false;
    }
    return true;
}
function checkRange(value,start,end,msg){
    msg=msg?"【"+msg+"】":"";
    if(!(start<=value && value<=end)){
        alert(msg+"超出范围值，请重新输入");
        return false;
    }
    return true;
}
function checkDate(value,msg)
{
    msg=msg?"【"+msg+"】":"";
    ymd=value.split("-");
    month=ymd[1]-1;
    var Date1 = new Date(ymd[0],month,ymd[2]);
    if (Date1.getMonth()+1!=ymd[1]||Date1.getDate()!=ymd[2]||Date1.getFullYear()!=ymd[0]||ymd[0].length!=4)
    {
        alert(msg+"非法日期,请依【YYYY-MM-DD】格式输入");
        return false;
    }
    return true;
}
function checkEmail(a,msg)
{
    msg=msg?"【"+msg+"】":"";
    var i=a.length;
    var temp = a.indexOf('@');
    if(temp<0){
        alert(msg+"非法Email格式,请依【test@hotmail.com】格式输入");
        return false;
    }
    var tempd = a.indexOf('.');
    if(tempd<0){
        alert(msg+"非法Email格式,请依【test@hotmail.com】格式输入");
        return false;
    }
    if (tempd<temp) {
        alert(msg+"非法Email格式,请依【test@hotmail.com】格式输入");
        return false;
    }
    return true;
}
function checkNum(num,msg)
{
    msg=msg?"【"+msg+"】":"";
    if(isNaN(num)==true){
        alert(msg+"非法数字,请重新输入");
        return false;
    }
    return true;
}
function checkInt(num,msg)
{
    msg=msg?"【"+msg+"】":"";
    var i,j,strTemp;
    strTemp="0123456789";
    for (i=0;i<strTemp.length;i++){
        j=strTemp.indexOf(num.charAt(i));
        if(j==-1)
        {
            alert(msg+"非法数字,请重新输入");
            return false;
        }
    }
    return true;
}
//2016
function checkIPAndDomain(value,msg){
    msg=msg?"【"+msg+"】":"";
    //ip
    var re = /^((\d)|(([1-9])\d)|(1\d\d)|(2(([0-4]\d)|5([0-5]))))\.((\d)|(([1-9])\d)|(1\d\d)|(2(([0-4]\d)|5([0-5]))))\.((\d)|(([1-9])\d)|(1\d\d)|(2(([0-4]\d)|5([0-5]))))\.((\d)|(([1-9])\d)|(1\d\d)|(2(([0-4]\d)|5([0-5]))))$/;
    var re2=/^(([a-zA-Z0-9][-a-zA-Z0-9]{0,64}[a-zA-Z0-9])|[a-zA-Z0-9])\.((([a-zA-Z0-9][-a-zA-Z0-9]{0,64}[a-zA-Z0-9])|[a-zA-Z0-9])\.)*(([a-zA-Z0-9][-a-zA-Z0-9]{0,64}[a-zA-Z])|[a-zA-Z])$/;
    if(re.test(value)||re2.test(value)){
        return true;
    }else{
        alert(msg+"为非法IP或者域名地址，请重新输入!");
        return false;
    }
}
//2016
function checkDomain(value,msg){
    msg=msg?"【"+msg+"】":"";
    var re=/^(([a-zA-Z0-9][-a-zA-Z0-9]{0,64}[a-zA-Z0-9])|[a-zA-Z0-9])\.((([a-zA-Z0-9][-a-zA-Z0-9]{0,64}[a-zA-Z0-9])|[a-zA-Z0-9])\.)*(([a-zA-Z0-9][-a-zA-Z0-9]{0,64}[a-zA-Z])|[a-zA-Z])$/;
    if(re.test(value)){
        return true;
    }else{
        alert(msg+"为非法域名格式，请重新输入!");
        return false;
    }
}
function checkIP(value,msg){
    msg=msg?"【"+msg+"】":"";
    var re = /^((\d)|(([1-9])\d)|(1\d\d)|(2(([0-4]\d)|5([0-5]))))\.((\d)|(([1-9])\d)|(1\d\d)|(2(([0-4]\d)|5([0-5]))))\.((\d)|(([1-9])\d)|(1\d\d)|(2(([0-4]\d)|5([0-5]))))\.((\d)|(([1-9])\d)|(1\d\d)|(2(([0-4]\d)|5([0-5]))))$/;
    if(re.test(value)){
        return true;
    }else{
        alert(msg+"为非法IP地址，请重新输入!");
        return false;
    }
}
function checkTime(value){
    var times=value.split(":");
    if(times.length<3){
        return false;
    }
    if(checkInt(times[0])==false){
        return false;
    }
    if(checkInt(times[1])==false){
        return false;
    }
    if(checkInt(times[2])==false){
        return false;
    }
    if(times[0]<0||times[0]>24){
        return false;
    }
    if(times[1]<0||times[1]>59){
        return false;
    }
    if(times[2]<0||times[2]>59){
        return false;
    }
    if(times[0]==24 &&(times[1]>0||times[2]>0)){
        return false;
    }
    return true;
}
function checkByReg(value,msg,reg){
    msg=msg?"【"+msg+"】":"";
    var re = reg;
    if(re.test(value)){
        return true;
    }else{
        alert(msg+"!");
        return false;
    }
}




