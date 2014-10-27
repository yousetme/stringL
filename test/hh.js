var a = function(data){var out='';out+="";
    var tr = data; var pushedChannels = tr.find("td[name='videoChannel']").find('span'); var pushedPlatforms = tr.find("td[name='videoPlatform']").find('span'); var filterCh = []; for(var i= 0,ln=pushedChannels.length; i<ln; i++) { filterCh.push($(pushedChannels[i]).attr('code')); } var code = eval('(<?php echo json_encode($chanelCode) ?>)'); var isIn = false; var temp = []; for(var i= 0, ln1=code.length; i<ln1; i++) { for(var j= 0, ln2=filterCh.length; j<ln2; j++) { if(code[i]['chanel_code']==filterCh[j]) { isIn = true; break; } } if(!isIn) temp.push(code[i]); else isIn = false; } var channels = temp; var userId = tr.find("td[name='userId']").text(), videoName = tr.find("td[name='videoName']").text(), videoId = tr.find("td[name='videoIdInt']").text(), mediaId = tr.find("input[name='mediaid']").val(), videoDesc = tr.find("input[name='videodesc']").val(), videoTag = tr.find("input[name='tag']").val(), videoImg = tr.find("img[name='img']").attr('src');out+="<div class=\"dialog-box\" style=\"z-index: 2000\"> <div class=\"mask\"></div> <div id=\"dragP\" class=\"dialog-wrapper\"> <span class=\"dialog-side\"></span> <font class=\"dialog\" style=\"position: static;\"> <div style=\"background-color: #fff; border: 1px #234 solid;width:600px;\"> <div style=\"background-color: #D6DBDE;line-height: 30px;font-weight: bold;text-align: left; padding: 0 3px;\">推送-";
    out+=videoName;
    out+="</div> <table width=\"100%\" class=\"table_form contentWrap\"> <tr> <td width=\"100px\">渠道ID:</td> <td ><input id=\"_userid\" value=\"";
    out+=userId;
    out+="\" type=\"text\" disabled=\"disabled\" size=\"60\" /></td> </tr> <tr> <td>视频名称:</td> <td><input id=\"_videoname\" value=\"";
    out+=videoName;
    out+="\" type=\"text\" size=\"60\" /></td> </tr> <tr> <td>标签:</td> <td><input id=\"_tagdesc\" value=\"";
    out+=videoTag;
    out+="\" type=\"text\" size=\"60\" /> </td> </tr> <tr> <td>描述:</td> <td><textarea style=\"width: 240px;height: 80px;\" id=\"_videodesc\" cols=\"57\" rows=\"6\">";
    out+=videoDesc;
    out+="</textarea> <img style=\"vertical-align: top\" src=\"";
    out+=videoImg;
    out+="\"> </td> </tr> <tr class=\"mainChannel\"> <td>已推送主站频道：</td> <td> <div id=\"pushedVideos\" class=\"tdCls\">";
    for(var i=0,ln=pushedChannels.length; i<ln; i++) {out+="<span>";
        out+=$(pushedChannels[i]).attr('name');
        out+="</span>&nbsp;";
    }out+="</div> </td> </tr> <tr class=\"mainChannel\"> <td>已推送平台：</td> <td> <div class=\"tdCls\">";
    for(var i=0,ln=pushedPlatforms.length; i<ln; i++) {out+="<span code=\"";
        out+=$(pushedPlatforms[i]).attr('code');
        out+="\">";
        out+=mapPlatformName($(pushedPlatforms[i]).attr('code'));
        out+="</span>&nbsp;";
    }out+="</div> </td> </tr> <tr> <td>推送专辑id:</td> <td><input id=\"_videoSet\" type=\"text\" size=\"60\" /> </td> </tr> <tr class=\"mainChannel\"> <td>选择平台:</td> <td> <div id=\"platformlist\" class=\"tdCls\">";
    out+=writePlayPlatformCheckboxCode();
    out+="</div> </td> </tr> <tr class=\"mainChannel\"> <td>选择频道:</td> <td> <div id=\"chanellist\" class=\"tdCls\">";
    for(var i=0,ln=channels.length; i<ln; i++) {out+="<em class=\"wrappedBlock\" class=\"channelCls\"> <input type=\"checkbox\" class=\"checkbox\" vname=\"";
        out+=channels[i]['chanel_name'];
        out+="\" value=\"";
        out+=channels[i]['chanel_code'];
        out+="\" /> &nbsp;";
        out+=channels[i]['chanel_name'];
        out+="</em>";
    }out+="</div> </td> </tr> </table> <div style=\"line-height: 30px\"> <button onclick=\"return validateInput();\"> &nbsp;确定&nbsp;</button>&nbsp;&nbsp; <button onclick=\"$(this).closest('.dialog-box').remove();\">&nbsp;取消&nbsp;</button> </div> </div> </font> </div> </div>";
    window.validateInput = function() {
        if($.trim($('#_videoname').val())=='') {
            alert('请您输入视频名字'); return false; }
        if($("#chanellist input:[type='checkbox']:checked").val()==null) {
            alert('请您选择推送频道'); return false; }
        if($("#platformlist input:[type='checkbox']:checked").val()==null) {
            alert('请您选择推送频道'); return false; }
        pushViedeo(); return true; };
    function pushViedeo() {
        var videocodeArr = []; var platformCodeArr = [];
        $('#chanellist input:checkbox').each(function() {
            if ($(this).attr('checked') ==true) {
                videocodeArr.push($(this).val()); } });
        $('#platformlist input:checkbox').each(function() {
            if ($(this).attr('checked') ==true) {
                platformCodeArr.push($(this).val()); } });
        function inArr(arr, element) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == element) { return true; } } return false; }
        function addPushInfo(data) {
            for(var i=0,ln=data.length; i<ln; i++) {
                tr.find("td[name='videoChannel']").append('<span code="'+data[i].chanelCode+'" name="'+data[i].chanelCode+'">'+data[i].vrs_id + ' ' + data[i].chanelCode +'</span>');
                tr.find("td[name='videoPlatform']").append('<span code="'+data[i].playPlatform+'">'+mapPlatformName(data[i].playPlatform) +'</span>'); } }
        addPushInfo([{chanelCode:232, vrs_id:234242, playPlatform:420013}]); }return out;}
