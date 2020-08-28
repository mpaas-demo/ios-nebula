//contact with lin.weng@alipay.com  before change  this file
(window.AlipayJSBridge && !window.AlipayCallFromJS)|| (function () {
    "H5_BRIDGE_JS_REPLACE_STRING";
    var iframe = null;

    var rawJsonStringify = JSON.stringify;
    var rawJsonParse = JSON.parse;
    var rawArrayPush = Array.prototype.push;
    /***************Messge Handler*****************/
    var safeCallMessage,shouldUseMessageChannel = false;
    if (window.webkit 
        && window.webkit.messageHandlers 
        && window.webkit.messageHandlers.PSDBRIDGEMESSAGEHANDLER 
        && window.webkit.messageHandlers.PSDBRIDGEMESSAGEHANDLER.postMessage) {
        var webkit = window.webkit;
        var postMessage = window.webkit.messageHandlers.PSDBRIDGEMESSAGEHANDLER.postMessage;
        var PSDBRIDGEMESSAGEHANDLER = window.webkit.messageHandlers.PSDBRIDGEMESSAGEHANDLER;
        window.webkit.messageHandlers.PSDBRIDGEMESSAGEHANDLER.postMessage = function(){};
        safeCallMessage = function(message){
            return postMessage.apply(PSDBRIDGEMESSAGEHANDLER,[message]);
        }
        shouldUseMessageChannel = true;
    }

    function renderIframe() {
        if (iframe || shouldUseMessageChannel) return;
        try {
            iframe = document.createElement("iframe");
            iframe.id = "__AlipayJSBridgeIframe";
            iframe.style.display = "none";
            if (document.documentElement) {
                document.documentElement.appendChild(iframe);
            }else{
                //for pdf to append iframe
                document.appendChild(iframe);
            }
        } catch (e) {

        }
    }

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

    /***************Param Type*****************/
    var NEBULA_TYPE_INFO = "NEBULATYPEINFO",NEBULA_TYPE_OF_ARRAYBUFFER = "ArrayBuffer";

    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var lookup = new Uint8Array(256);
    for (var i = 0; i < chars.length; i++) {
        lookup[chars.charCodeAt(i)] = i;
    }
    
    function arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    function base64ToArrayBuffer(base64) {
        var bufferLength = base64.length * 0.75,
        len = base64.length, i, p = 0,
        encoded1, encoded2, encoded3, encoded4;

        if (base64[base64.length - 1] === "=") {
          bufferLength--;
          if (base64[base64.length - 2] === "=") {
            bufferLength--;
          }
        }

        var arraybuffer = new ArrayBuffer(bufferLength),
        bytes = new Uint8Array(arraybuffer);

        for (i = 0; i < len; i+=4) {
          encoded1 = lookup[base64.charCodeAt(i)];
          encoded2 = lookup[base64.charCodeAt(i+1)];
          encoded3 = lookup[base64.charCodeAt(i+2)];
          encoded4 = lookup[base64.charCodeAt(i+3)];

          bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
          bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
          bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }

        return arraybuffer;
    }

    function transformCallParam(param){
        var result = param;
        for(var key in param){
            if (param.hasOwnProperty(key)) {
                var val = param[key];
                if (val instanceof ArrayBuffer) {
                    param[key] = arrayBufferToBase64(val);
                    if (!result[NEBULA_TYPE_INFO]) {
                        result[NEBULA_TYPE_INFO] = {};
                    }
                    result[NEBULA_TYPE_INFO][key] = {"type" : NEBULA_TYPE_OF_ARRAYBUFFER};
                }
            }
        }
        return result;
    }

    function transformResponseData(responsedata){
        if (responsedata && responsedata[NEBULA_TYPE_INFO]) {
            var nebulaTypeInfo = responsedata[NEBULA_TYPE_INFO];
            if (nebulaTypeInfo) {
                for(var key in nebulaTypeInfo){
                    if (nebulaTypeInfo.hasOwnProperty(key)) {
                        var item = nebulaTypeInfo[key];
                        if (item.type) {
                            var typeVal = item["type"];
                            if (typeVal === NEBULA_TYPE_OF_ARRAYBUFFER) {
                                responsedata[key] = base64ToArrayBuffer(responsedata[key]);
                            }
                        }
                    }
                }
                delete responsedata[NEBULA_TYPE_INFO];
            }
        }
        return responsedata;
    }

    /***************Bridge*****************/
    var msgKt = "messageTK";
    var callbackPoll = {};

    var sendMessageQueue = [];
    var receiveMessageQueue = [];

    var JSAPI = {
        /*
         * 调用Native功能
         */
        call: function (func, param, callback) {
            //jsbridge注入提前后，DOM环境可能还没创建，原jsbridge注入的同时创建iframe的方式将创建失败，改为调用接口的时候创建iframe
            //如果直接使用JSC通信
            renderIframe();
            //
            if ('string' !== typeof func) {
                return;
            }

            if ('function' === typeof param) {
                callback = param;
                param = null;
            } else if (typeof param !== 'object') {
                param = null;
            }

            // 防止时间戳重复
            var callbackId = func + '_' + new Date().getTime() + (Math.random());
            if ('function' === typeof callback) {
                callbackPoll[callbackId] = callback;
            }

            if (param && param.callbackId) {
                // 从Native调用过来的请求，再回调到Native的callback里
                // TODO: 需要优化，这里调用回Native的callback不需要传入`handlerName`
                func = {
                    responseId: param.callbackId,
                    responseData: param
                };
                delete param.callbackId;
            } else {
                // 从页面直接发起到Native的请求
                // 支持arrayBuffer的数据格式
                func = {
                    handlerName: func,
                    data: transformCallParam(param) || {}
                };
                func.callbackId = '' + callbackId;
            }

//            //console.log('bridge.call: ' + JSON.stringify(func));

            rawArrayPush.call(sendMessageQueue, func);
            //use jsc
            if (window.AlipayCallFromJS && 'function' === typeof window.AlipayCallFromJS) {
                window.AlipayCallFromJS(JSAPI._fetchQueue(), document.location.href);
            }else if(window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.PSDBRIDGEMESSAGEHANDLER && window.webkit.messageHandlers.PSDBRIDGEMESSAGEHANDLER.postMessage){
                //use wkwebview message channel
                safeCallMessage({
                    type:"api",
                    queue:JSAPI._stringifyMessageQueue(),
                    msgKt:msgTKTarget
                });
            }else if (iframe) {
                iframe.src = "alipaybridge://dispatch_message";
            }
        },

        trigger: function (name, data) {
//            //console.log('bridge.trigger ' + name);
            if (name) {
                var triggerEvent = function (name, data) {
                    var callbackId;
                    if (data && data.callbackId) {
                        callbackId = data.callbackId;
                        data.callbackId = null;
                    }
                    var evt = document.createEvent("Events");
                    evt.initEvent(name, false, true);
                    evt.syncJsApis = [];

                    if (data) {
                        if (data.__pull__) {
                            delete data.__pull__;
                            for (var k in data) {
                                evt[k] = data[k];
                            }
                        } else {
                            evt.data = data;
                        }
                    }
                    var canceled = !document.dispatchEvent(evt);
                    if (callbackId) {
                        var callbackData = {};
                        callbackData.callbackId = callbackId;
                        callbackData[name + 'EventCanceled'] = canceled;
                        callbackData['syncJsApis'] = evt.syncJsApis;
                        JSAPI.call('__nofunc__', callbackData);
                    }
                };
                setTimeout(function () {
                    triggerEvent(name, data);
                }, 1);
            }
        },

        /*
         * Native调用js函数，传输消息
         **/
        _invokeJS: function (resp) {
//            //console.log('bridge._invokeJS: ' + resp);
            resp = rawJsonParse(resp);

            if (resp.responseId) {
                var func = callbackPoll[resp.responseId];
                //某些情况需要多次回调，添加keepCallback标识，防删除
                if (!(typeof resp.keepCallback == 'boolean' && resp.keepCallback)) {
                    delete callbackPoll[resp.responseId];
                }

                if ('function' === typeof func) {
                    // 避免死锁问题
                    setTimeout(function () {
                        func(transformResponseData(resp.responseData));
                    }, 1);
                }
            } else if (resp.handlerName) {
                if (resp.callbackId) {
                    resp.data = resp.data || {};
                    resp.data.callbackId = resp.callbackId;
                }
                JSAPI.trigger(resp.handlerName, resp.data);
            }
        },

        // ***********************************************
        // WebViewJSBridge.js库兼容 @远尘 2014.2.28

        _handleMessageFromObjC: function (message) {
            if (receiveMessageQueue&&!window.AlipayJSBridge) {
                receiveMessageQueue.push(message);
            } else {
                JSAPI._invokeJS(message);
            }
        },
        _stringifyMessageQueue:function(){
            var messageQueueString = rawJsonStringify(sendMessageQueue);
            sendMessageQueue = [];
            return messageQueueString;
        },
        _fetchQueue: function (tk) {
            //if shouldshouldUseTK  and if no token  we think it is illegal call and just retrun empth array
            if (shouldUseTK) {
                if (tk && msgTKTarget && msgTKTarget === tk) {
                    return JSAPI._stringifyMessageQueue();
                }else {
                    return '[]';
                }
            }else{
                return JSAPI._stringifyMessageQueue();
            }
        }
    };

    // ***********************************************

    // 初使化事件, 在webview didFinishLoad后调用
    JSAPI.init = function () {
        // dont call me any more
        //JSAPI.init = null;

                
        var readyEvent = document.createEvent('Events');
        readyEvent.initEvent('AlipayJSBridgeReady', false, false);

        // 处理ready事件发生以后才addEventListener的情况
        var docAddEventListener = document.addEventListener;
        document.addEventListener = function (name, func) {
            if (name === readyEvent.type) {
                // 保持func执行的异步性
                setTimeout(function () {
                    func(readyEvent);
                }, 1);
            } else {
                docAddEventListener.apply(document, arguments);
            }
        };

        document.dispatchEvent(readyEvent);

        var receivedMessages = receiveMessageQueue;
        receiveMessageQueue = null;
        for (var i = 0; i < receivedMessages.length; i++) {
            JSAPI._invokeJS(receivedMessages[i]);
        }
    };

    window.AlipayJSBridge = JSAPI;
    
    //动态替换js片段，为了解决在AlipayJSBridge Ready中，使用新增的js属性，由内核替换为js片段字符串
    "H5_BRIDGE_JS_***_REPLACE_STRING_***_SJ_EGDIRB_5H";

    //从全局对象中读取startupParams,确保ready中可用
    JSAPI.startupParams = window.ALIPAYH5STARTUPPARAMS || {};
                          
    //jsbridge提前后，将webViewDidFinishLoad中init方法，提前到DOMReady后执行，避免由于长时间加载资源，而影响到接口调用
    onDOMReady(JSAPI.init);

    onDOMReady(function(){
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.PSDBRIDGEDOMREADY && window.webkit.messageHandlers.PSDBRIDGEDOMREADY.postMessage) {
            window.webkit.messageHandlers.PSDBRIDGEDOMREADY.postMessage("");
        };
    });
})();
