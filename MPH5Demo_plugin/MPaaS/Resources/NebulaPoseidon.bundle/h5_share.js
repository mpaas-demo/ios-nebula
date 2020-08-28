(window.AlipayH5Share && !window.AlipayCallFromJS) || (function() {
  var AlipayH5Share = {};
  var shareMessage = {
    title: "",
    imgUrl: "",
    link:"",
    desc: "",
    fromMeta: false,
    ready: false
  };
  var collectReadyState = {
    title: false,
    link:false,
    imgUrl: false,
    desc: false
  };

  var imgArr;
  var H5ShareCollector = {
    init: function(strict) {
      var t = this;
      t.strict = (typeof strict ==='undefined')?true:(!!strict);
      t.collectLink();
      t.collectTitle();
      t.collectDesc();
      t.collectThumbnail();
    },
    collectLink:function(){
      var t=this;
      var metaLinkNode = document.querySelector('meta[name="Alipay:link"]');
      if (metaLinkNode && metaLinkNode.getAttribute("content")) {
        shareMessage.fromMeta = true;
        shareMessage.link = metaLinkNode.getAttribute("content");
      }
      collectReadyState.link = true;
      t.collectReady();
    },
    collectTitle: function() {
      var t = this;
      var metaTitleNode = document.querySelector('meta[name="Alipay:title"]');
      if (metaTitleNode && metaTitleNode.getAttribute("content")) {
        collectReadyState.title = true;
        shareMessage.title = metaTitleNode.getAttribute("content");
        shareMessage.fromMeta = true;
        t.collectReady();
      } else if(window.location.hostname==='mp.weixin.qq.com'  && typeof msg_title !== "undefined" && msg_title) {
          collectReadyState.title = true;
          shareMessage.title = t.htmlDecode(msg_title);
          t.collectReady();
      } else{
        if (document.title && document.title.trim() !== "") {
          shareMessage.title = t.contentTidy(document.title);
          collectReadyState.title = true;
          t.collectReady();
        } else {
          if (document.getElementsByTagName("H1").length > 0 && document.getElementsByTagName("H1")[0].textContent.length > 0) {
            var tmpH1 = t.nodeStrFliter(document.getElementsByTagName("H1")[0]);
            if (t.getStrLen(tmpH1) <= 64 && tmpH1.length > 0) {
              shareMessage.title = tmpH1;
              collectReadyState.title = true;
              t.collectReady();
            }
          }
        }
      }
    },
    collectThumbnail: function() {
      var t = this;
      var metaImgNode = document.querySelector('meta[name="Alipay:imgUrl"]');
      if (metaImgNode && metaImgNode.getAttribute("content")) {
        collectReadyState.imgUrl = true;
        shareMessage.imgUrl = t.getAbsoluteUrl(metaImgNode.getAttribute("content"));
        shareMessage.fromMeta = true;
        t.collectReady();
      } else if(window.location.hostname==='mp.weixin.qq.com'  && typeof msg_cdn_url !== "undefined"  && msg_cdn_url.match(/^http(s?):\/\/.*$/g)) {
        collectReadyState.imgUrl = true;
        shareMessage.imgUrl = msg_cdn_url;
        t.collectReady();
      } else {
        collectReadyState.imgUrl = false;
        t.collectReady();
        imgArr = Array.prototype.slice.call(document.images);
        t.findImgUrl(200*50,2000*640);
        if(!t.strict){
          if(shareMessage.imgUrl == ''){
            t.findImgUrl(100*25,200*50);
          }
          if(shareMessage.imgUrl == ''){
            t.findImgUrl(32*32,100*25);
          }
        }
        if(shareMessage.imgUrl == ''){
          var iconImgNode = document.querySelector('link[type="image/x-icon"]');
          if (iconImgNode && iconImgNode.getAttribute("href")) {
            collectReadyState.imgUrl = true;
            shareMessage.imgUrl = t.getAbsoluteUrl(iconImgNode.getAttribute("href"));
            t.collectReady();
          }
        }
      }
    },
    findImgUrl: function(min,max) {
      var t = H5ShareCollector;
      if (imgArr.length === 0) {
        collectReadyState.imgUrl = true;
        t.collectReady();
        return;
      }
      var imgYAxis = 99999;
      var imgXAxis = 99999;
      if (imgArr.length > 0 && !collectReadyState.imgUrl) {
        for (var i = 0; i < imgArr.length; i++) {
          var curImg = imgArr[i];
          if(t.isHidden(curImg)){
            continue;
          }
          if(t.isBanner(curImg)){
            continue;
          }
          if(t.isBase64(curImg)){
            continue;
          }
          if (curImg.complete || curImg.natureWidth) {
            if ((curImg.naturalHeight * curImg.naturalWidth >= min && curImg.naturalHeight * curImg.naturalWidth < max)) {
              if ((curImg.y > 60 && curImg.y <imgYAxis) || (curImg.y <= 60 && curImg.y >imgYAxis) || (curImg.y ===imgYAxis && curImg.x <imgXAxis)) {
                shareMessage.imgUrl = curImg.src;
                imgYAxis = curImg.y || 0;
                imgXAxis = curImg.x || 0;
                collectReadyState.imgUrl = true;
                t.collectReady();
              }
            }
          }
        }
      }

    },
    collectDesc: function() {
      var t = this;
      var metaDescNode = document.querySelector('meta[name="Alipay:desc"]');
      if (metaDescNode && metaDescNode.getAttribute("content")) {
        collectReadyState.desc = true;
        shareMessage.desc = metaDescNode.getAttribute("content");
        shareMessage.fromMeta = true;
        t.collectReady();
      }

      if(!collectReadyState.desc && window.location.hostname==='mp.weixin.qq.com' && typeof msg_desc !== "undefined" && msg_desc) {
        collectReadyState.desc = true;
        shareMessage.desc = t.htmlDecode(msg_desc);
        t.collectReady();
      }

      if (!collectReadyState.desc) {
        t.tarvelPtags(50,2000);
      }
      if (!collectReadyState.desc) {
        t.tarvelPtags(20,50);
      }
      if (!collectReadyState.desc) {
        t.travelDocument(document.body,50,2000);
      }
      if (!collectReadyState.desc) {
        var descNode = document.querySelector('meta[name="description"]');
        if (descNode && descNode.getAttribute("content")) {
          shareMessage.desc = t.contentTidy(descNode.getAttribute("content"));
          shareMessage.fromMeta = true;
          collectReadyState.desc = true;
          t.collectReady();
        }
      }
      if(!t.strict){
        if (!collectReadyState.desc) {
          t.travelDocument(document.body,20,50);
        }
        if (!collectReadyState.desc) {
          t.tarvelPtags(10,20);
        }
        if (!collectReadyState.desc) {
          t.travelDocument(document.body,10,20);
        }
      }
      if (!collectReadyState.desc){
        var hostDesc = window.location.hostname;
        if(hostDesc != undefined && hostDesc != ''){
          shareMessage.desc = hostDesc;
          collectReadyState.desc = true;
          t.collectReady();
        }
      }
      var shareHref=window.location.href;
      var shareDesc = shareMessage.desc?shareMessage.desc:'';
      var shareLeaveLength= 280 - t.getStrLen(shareHref);
      // 如果剩余长度，大于摘要长度，则截取摘要
      if(shareLeaveLength <= t.getStrLen(shareDesc) && shareLeaveLength>=0){
        shareDesc = t.cutStr(shareDesc,Math.floor(shareLeaveLength/2));
      }
      shareMessage.desc = shareDesc;
    },
    collectReady: function() {
      if (collectReadyState.title && collectReadyState.imgUrl  && collectReadyState.link && collectReadyState.desc) {
        shareMessage.ready = true;
      }
    },
    tarvelPtags:function(min,max){
      var t=this;
      var pArr = Array.prototype.slice.call(document.getElementsByTagName("P"));
      if (pArr.length > 0) {
        for (var i = 0; i < pArr.length; i++) {
          var c=pArr[i];
          if(typeof c ==='undefined'){
            continue;
          }
          if (c.id == "Debug") {
            continue;
          }
          if(t.isHidden(c)){
            continue;
          }
          var pConetent=c.textContent;
          if (t.getStrLen(pConetent) >= min && t.getStrLen(pConetent) < max) {
            pConetent = t.nodeStrFliter(c, false);
          }
          if (t.getStrLen(pConetent) >= min && t.getStrLen(pConetent) < max) {
            shareMessage.desc = pConetent;
            collectReadyState.desc = true;
            t.collectReady();
          }
          if(collectReadyState.desc){
            break;
          }
        }
      }
    },
    travelDocument: function(el,min,max) {
      if(el !=undefined && el.hasChildNodes()){
        var t = this,
          childNodes = el.childNodes;
        if (childNodes && childNodes.length > 0) {
          for (var i = 0; i < childNodes.length; i++) {
            var c = childNodes[i];
            if(typeof c ==='undefined'){
              continue;
            }
            switch (c.nodeType) {
              case 1:
                if(!t.isHidden(c)){
                  if (c.nodeName != "P" && c.nodeName != "SCRIPT" && c.nodeName != "STYLE" && c.nodeName != "AUDIO" && c.nodeName != "VIDEO") {
                    t.travelDocument(c,min,max);
                  }
                }
                break;
              case 3:
                var tmp = c.nodeValue;
                if (t.getStrLen(tmp) >= min && t.getStrLen(tmp) < max) {
                  tmp = t.contentTidy(tmp);
                }
                if (t.getStrLen(tmp) >= min && t.getStrLen(tmp) <= max) {
                  shareMessage.desc = tmp;
                  collectReadyState.desc = true;
                  t.collectReady();
                }
                break;
            }
            if (collectReadyState.desc) {
              break;
            }
          }
        }
      }
    },
    getStrLen: function(str) {
      return str.replace(/[^\x00-\xff]/g, "xx").length;
    },
    cutStr:function(str, len){
      var char_length = 0;
      for (var i = 0; i < str.length; i++){
        var son_str = str.charAt(i);
        encodeURI(son_str).length > 2 ? char_length += 1 : char_length += 0.5;
        if (char_length >= len){
          var sub_len = char_length == len ? i+1 : i;
          return str.substr(0, sub_len);
          break;
        }
      }
    },
    getAbsoluteUrl:function (url) {
      var a = document.createElement('A');
      a.href = url;  // 设置相对路径给Image, 此时会发送出请求
      url = a.href;  // 此时相对路径已经变成绝对路径
      return url;
    },
    getCurrentStyle:function(obj, prop) {
      if (window.getComputedStyle) {
        return window.getComputedStyle(obj,null).getPropertyValue(prop);
      }else if (obj.currentStyle) {
        return obj.currentStyle[prop];
      }
      return null;
    },
    isHidden:function(el){
      var t = H5ShareCollector;
      var isHidden =  ( el != undefined && el.nodeType != undefined && el.nodeType == '1') && (t.getCurrentStyle(el,'display')=='none' || t.getCurrentStyle(el,'visibility')=='hidden');
      if(isHidden){
        return true;
      }else{
        return el.parentNode != undefined ?t.isHidden(el.parentNode):false;
      }
    },
    isBanner:function(el){
      var t = H5ShareCollector;
      var isBanner =  ( el != undefined && el.nodeType != undefined && el.nodeType == '1') && t.matchKeyword([el.className,el.id],['banner','baner']);
      if(isBanner){
        return true;
      }else{
        return el.parentNode != undefined ?t.isBanner(el.parentNode):false;
      }
    },
    isBase64:function(el){
      var t = H5ShareCollector;
      var isBase64 =  ( el != undefined && el.nodeType != undefined && el.nodeType == '1') && el.src.indexOf("http")!== 0;
      if(isBase64){
        return true;
      }else{
        return el.parentNode != undefined ?t.isBanner(el.parentNode):false;
      }
    },
    matchKeyword:function(srcArr,targetArr){
      srcArr = srcArr || [];
      targetArr = targetArr || [];
      for(var i=0;i<srcArr.length;i++){
        for(var j=0;j<targetArr.length;j++){
          if ((srcArr[i] || '').indexOf(targetArr[j])>-1) {
            return true;
            break;
          }
        }
      }
      return false;
    },
    getType:function(obj) {
      return Object.prototype.toString.call(obj).replace(/\[object (\w+)\]/, '$1').toLowerCase();
    },
    htmlDecode: function(str) {
      var t = document.createElement("div");
      t.innerHTML = str;
      return t.innerText || t.textContent
    },
    nodeStrFliter: function(element, imgAlt) {
      imgAlt = imgAlt || true;
      var t = this,
        tmp = element.cloneNode(true);
      if (imgAlt) {
        Array.prototype.forEach.call(tmp.querySelectorAll("img[alt]"), function(el) {
          el.parentNode.replaceChild(document.createTextNode(el.alt), el);
        });
      }
      Array.prototype.forEach.call(tmp.querySelectorAll("script,style,link"), function(el) {
        el.parentNode.replaceChild(document.createTextNode(""), el);
      });
      tmp = t.contentTidy(tmp.textContent);
      return tmp;
    },
    contentTidy: function(str) {
      return str.replace(/\s{4}/g, " ").replace(/(\r|\n)/g, "").trim();
    }
  };
  AlipayH5Share.getShareContent = function(strict) {
    strict = (typeof strict ==='undefined')?true:(!!strict);
    H5ShareCollector.init(strict);
    return JSON.stringify(shareMessage);
  };
    document.addEventListener("JSPlugin_AlipayH5Share", function(e) {
        var strict = (typeof e.strict ==='undefined')?true:(!!e.strict);
        if (window.AlipayJSBridge && e.clientId) {
            H5ShareCollector.init(strict);
            if (window.AlipayJSBridge && e.clientId) {
                setTimeout(function(){
                    H5ShareCollector.init(strict);
                    AlipayJSBridge.callback(e.clientId, shareMessage);
                },0);
            }
            AlipayJSBridge.callback(e.clientId, shareMessage);
        }
    });
    window.AlipayH5Share = AlipayH5Share;
})();
