(window.AlipayH5Performance && !window.AlipayCallFromJS) || (function(){
    if (navigator.userAgent.indexOf(' AlipayClient/') < 0) {
        return;
    }

    /***************Messge Handler*****************/
    var safeCallMessage,shouldUseMessageChannel = false;
    if (window.webkit 
        && window.webkit.messageHandlers 
        && window.webkit.messageHandlers.PSDBRIDGEMESSAGEHANDLER 
        && window.webkit.messageHandlers.PSDBRIDGEMESSAGEHANDLER.postMessage) {
        var webkit = window.webkit;
        var postMessage = window.webkit.messageHandlers.PSDBRIDGEMESSAGEHANDLER.postMessage;
        var PSDBRIDGEMESSAGEHANDLER = window.webkit.messageHandlers.PSDBRIDGEMESSAGEHANDLER;
        safeCallMessage = function(message){
            return postMessage.apply(PSDBRIDGEMESSAGEHANDLER,[message]);
        }
        shouldUseMessageChannel = true;
    }

    /***************monitorKernel*****************/
    var iframe = {};
    var sendMessageQueue={};
    var timerHandler={};
    function type(obj) {
        return Object.prototype.toString.call(obj).replace(/\[object (\w+)\]/, '$1').toLowerCase();
    }
    var monitorKernel={
        init:function(){
            this.init=null;
            this.renderIframe();
            this.monitorDOMReady();
            this.monitorPageLoad();
            this.monitorJSErrors();
            this.monitorDNSTime();
            this.monitorCacheRate();
            this.monitorMixedContent();
        },
        monitorDOMReady:function(){
            var t=this;
            var readyRE = /complete|loaded|interactive/;
            if (readyRE.test(document.readyState)) {
                t.pushMessage('monitor',{
                    name:'domReady',
                    value:new Date().getTime(),
                    extra:'completed'
                });
                t.sendSignal();
            } else {
                document.addEventListener("DOMContentLoaded", function(event) {
                    t.pushMessage('monitor',{
                        name:'domReady',
                        value:new Date().getTime(),
                        extra:'complete'
                    });
                    t.sendSignal();
                },true);
            }
        },
        monitorPageLoad:function(){
            var t=this;
            window.addEventListener("load", function(event) {
                t.pushMessage('monitor',{
                    name:'pageLoad',
                    value:new Date().getTime(),
                    extra:'load'
                });
                t.sendSignal();
            },true);
        },
        monitorJSErrors:function(){
            var t=this;
            window.addEventListener("error", function(event) {
                if (event.message) {
                    t.pushMessage('monitor',{
                                  name:'jsErrors',
                                  value:event.message,
                                  filename:event.filename,
                                  lineno:event.lineno,
                                  colno:event.colno
                                  });
                    t.sendSignal();
                }
            },true);
            var unhandledrejection_handler = function(event) {
                if (event.reason) {
                    var error = event.reason;
                    if (typeof(event.reason) === 'object') {
                         try {
                             error =JSON.stringify(event.reason);
                         } catch (ex) { }
                     }

                    t.pushMessage('monitor', {
                        name: 'jsErrors',
                        value: 'Unhandled Promise Rejection:' + error,
                        filename: location.href.split("?")[0]
                    });
                    t.sendSignal();
                }
            }

            if (typeof PromiseRejectionEvent !== 'undefined') {
                window.addEventListener("unhandledrejection",
                function(event) {
                    unhandledrejection_handler(event);
                },
                false);
            } else {
                var oldHandler = window['onunhandledrejection'];
                window['onunhandledrejection'] = function(event) {
                    try {
                        oldHandler(event);
                    } catch(ex) {}
                    unhandledrejection_handler(event);
                };
            }
        },
        monitorDNSTime:function(){
            var t=this;
            window.addEventListener("load", function(event) {
                if(window.performance && window.performance.timing && window.performance.timing.domainLookupEnd-window.performance.timing.domainLookupStart){
                    t.pushMessage('monitor',{
                        name:'dns',
                        value:window.performance.timing.domainLookupEnd-window.performance.timing.domainLookupStart,
                        extra:'support'
                    });
                }else{
                    t.pushMessage('monitor',{
                        name:'dns',
                        value:'',
                        extra:'notsupport'
                    });
                }
                t.sendSignal();
            },true);
        },
        monitorMixedContent:function(){
            var t=this;
            var errorArr=[];
            var readyRE = /complete|loaded|interactive/;
            if (readyRE.test(document.readyState)) {
                window.location.protocol == 'https:' && [].slice.call(document.querySelectorAll('link[rel=stylesheet][href^="http:"], script[src^="http:"]')).forEach(function (elem) {
                    errorArr.push(elem.tagName + ':' + (elem.src || elem.href));
                });
                if(errorArr.length>0){
                    t.pushMessage('monitor',{
                        name:'mixedContent',
                        value:errorArr.join('@|@')
                    });
                    t.sendSignal();
                }
            } else {
                document.addEventListener("DOMContentLoaded", function(event) {
                    window.location.protocol == 'https:' && [].slice.call(document.querySelectorAll('link[rel=stylesheet][href^="http:"], script[src^="http:"]')).forEach(function (elem) {
                        errorArr.push(elem.tagName + ':' + (elem.src || elem.href));
                    });
                    if(errorArr.length>0){
                        t.pushMessage('monitor',{
                            name:'mixedContent',
                            value:errorArr.join('@|@')
                        });
                        t.sendSignal();
                    }
                },true);
            }
        },
        monitorCacheRate:function(){
            var t=this,
                result={
                    name:'cacheRate'
                },resourceArr;
            window.addEventListener("load", function(event) {
                if(window.performance && typeof window.performance.getEntriesByType ==='function' && (resourceArr=window.performance.getEntriesByType("resource"))){
                    if(resourceArr.length>0){
                        var cacheCount=0;
                        for(var i=0;i<resourceArr.length;i++){
                            if(resourceArr[i].duration===0){
                                cacheCount++;
                            }
                        }
                        result.value=(cacheCount/resourceArr.length).toFixed(4);

                    }else{
                        result.value=0.0000;
                    }
                    result.extra='support';
                }else{
                    result.value='';
                    result.extra='notsupport';
                }
                t.pushMessage('monitor',result);
                t.sendSignal();
            },true);
        },
        sendSignal:function(timer,tag){
            if (shouldUseMessageChannel) {
                setTimeout(function(){
                    safeCallMessage({
                        queue:AlipayH5Performance.fetchMessageQueue(),
                        type:"monitor"
                    });
                },0);
            }else{
                timer = (typeof timer=='number' &&timer>=0)?timer:500;
                tag = tag || 'monitor';
                clearTimeout(timerHandler[tag]);
                timerHandler[tag]=setTimeout(function(){
                    if (!(iframe && iframe[tag])){
                        monitorKernel.renderIframe(tag);
                    }
                    if (iframe[tag]) {
                        iframe[tag].src='alipay'+tag.toLowerCase()+'://dispatch_'+tag.toLowerCase()+'_message';
                    }
                },timer);
            }
        },
        renderIframe:function(tag) {
            tag = tag || 'monitor';
            if ((iframe && iframe[tag]) || shouldUseMessageChannel) return;
            try {
                var iframeElement = document.createElement("iframe");
                iframeElement.id = "__AlipayH5"+tag+"Iframe";
                iframeElement.style.display = "none";
                if (document.documentElement) {
                    document.documentElement.appendChild(iframeElement);
                }else{
                    //for pdf file
                    document.appendChild(iframeElement);
                }
                iframe[tag] = iframeElement;
            } catch (e) {}
        },
        pushMessage:function(tag,obj){
            tag = tag || 'monitor';
            if(!(sendMessageQueue && type(sendMessageQueue[tag]) == 'array')){
                sendMessageQueue[tag] = [];
            }
            sendMessageQueue[tag].push(obj);

        },
        getMessage:function(tag){
            tag = tag || 'monitor';
            if(!(sendMessageQueue && type(sendMessageQueue[tag]) == 'array')){
                sendMessageQueue[tag] = [];
            }
            var messageQueueString = JSON.stringify(sendMessageQueue[tag]);
            sendMessageQueue[tag] = [];
            return messageQueueString;

        }
    }
    monitorKernel.init();
    if (window.AlipayJSBridge) {
        monitorKernel.pushMessage('monitor',{name: 'bridgeReady',value: Date.now() + ''});
        monitorKernel.sendSignal(0);
    } else {
        document.addEventListener('AlipayJSBridgeReady', function(){
            monitorKernel.pushMessage('monitor',{name: 'bridgeReady',value: Date.now() + ''});
            monitorKernel.sendSignal(0);
        }, false);
    }
    var monitorInterface={
        fetchMessageQueue: function (tag) {
            return monitorKernel.getMessage(tag);
        },
        reportBizReady: function(){
            monitorKernel.pushMessage('monitor',{name: 'availableTime',value: Date.now() + ''});
            monitorKernel.sendSignal(0);
        },
        pushMessage:function(tag,obj){
            monitorKernel.pushMessage(tag,obj);
        },
        addTrackData:function(obj,tag){
            tag = tag || 'monitor';
            if(obj.value){
                obj.value+=('|time='+new Date().getTime());
            }
            monitorKernel.pushMessage(tag,obj);
            monitorKernel.sendSignal(0);
        },
        addTimeReport:function(obj){
            var objStr = '';
            for(var item in obj){
                objStr += (((objStr=='')?'':'&')+item+'='+obj[item]);
            }
            monitorInterface.addTrackData({
                'name':'timeReport',
                'value':objStr
            });
        },
        sendSignal:function(tag){
            monitorKernel.renderIframe(tag);
            monitorKernel.sendSignal(0,tag);
        },
        version:'1.2'
    }
    window.AlipayH5Performance = monitorInterface;
})();
(window.AlipayH5Report && !window.AlipayCallFromJS) || (function(){
    if (navigator.userAgent.indexOf(' AlipayClient/') < 0) {
        return;
    }
    var monitorInterface={
        fetchMessageQueue: function (tag) {
            return window.AlipayH5Performance.fetchMessageQueue('report');
        }
    }
    window.AlipayH5Report = monitorInterface;
})();
