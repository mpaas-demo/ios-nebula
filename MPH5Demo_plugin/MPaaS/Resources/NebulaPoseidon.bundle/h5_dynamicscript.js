//if use WKScript to inject dynamic script,it will be fixed content,so we should do this on every pageloaded happen
(window.HASINJECTDRNAMICSCRIPT && !window.AlipayCallFromJS) || (function(){
    window.HASINJECTDRNAMICSCRIPT = false;
    function onDOMReady(callback) {
        var readyRE = /complete|loaded|interactive/;
        if (readyRE.test(document.readyState)) {
            setTimeout(function() {
                       callback();
                       }, 1);
        } else {
            document.defaultView.addEventListener('DOMContentLoaded', function () {
                callback();
            }, false);
        }
    }
    onDOMReady(function(){
               if (!window.HASINJECTDRNAMICSCRIPT) {
                 var jsArray = window.ALIPAYH5DYNAMICSCRIPT;
                 for (var i in jsArray) {
                 var jsSrc = jsArray[i];
                     if (jsSrc && /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/.test(jsSrc)){
                          var script,head = document.head || document.documentElement;
                          script=document.createElement("script");
                          script.async = true;
                          script.charset = "UTF-8";
                          script.src = jsSrc;
                          if(jsSrc.indexOf("nebula-addcors") > 0 ){
               　            script.setAttribute('crossorigin','');
                          }
                          if (head) {
                            head.insertBefore(script,head.firstChild);
                          }
                     };
                 }
                 window.HASINJECTDRNAMICSCRIPT = true;
               };
    });
})();
