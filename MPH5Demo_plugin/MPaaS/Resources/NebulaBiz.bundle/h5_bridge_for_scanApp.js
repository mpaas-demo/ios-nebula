//adapter for scanApp change by lin.weng 2014-04-10
(function(){
//webBridge default handle
var defaultHandler=function(res,callback){
    if (window.WebViewJavascriptBridge._messageHandler){
        window.WebViewJavascriptBridge._messageHandler(res,callback);
    }
};
var scanAppCallFunMap={
    "alipay_sc_alert":function(param,callback){
        if ("string"===typeof param) {
            param=eval("("+param+")");
        }
        var buttons=[];
        if (param.buttons) {
            for(var i=0,len=param.buttons.length;i<len;i++){
                buttons.push(param.buttons[i].title);
            }
            param.buttons=buttons;
        }else{
            param.buttons=["确定"];
        }
        window.AlipayJSBridge.call("showAlert",param,function(res){
            //如果没有call
            if(!callback){
                defaultHandler(res,function(res){});
                return;
            }
            var clickIndex=res.index,title;
            title=(param.buttons[clickIndex]?param.buttons[clickIndex]:"");
            callback(JSON.stringify({title:title}));
        });
    },
    "alipay_sc_pay":function(param,callback){
        if ("string"===typeof param) {
            param=eval("("+param+")");
        }
        //adapter for tradeNo;
        if (param["tradeNo"]) {
            param["tradeNO"]=param["tradeNo"];
        }
        window.AlipayJSBridge.call("tradePay",param,function(res){
            //如果没有call调用默认处理的函数
            if(!callback){
                defaultHandler(res);
                return;
            }
            //兼容处理结果，返回的结果值包含statusCode
            if(res){
                res.resultStatus=res.resultCode;
                delete res.resultCode;
            }
            callback(JSON.stringify(res));
        });
    },
    "alipay_sc_thirdpay":function(param,callback){
        if (!param) {return;}
        window.AlipayJSBridge.call("tradePay",{
            orderStr:param
        },function(res){
            //如果没有call调用默认处理的函数
            if(!callback){
                defaultHandler(res);
                return;
            }
            //兼容处理结果，返回的结果值包含statusCode
            if(res){
                res.resultStatus=res.resultCode;
                delete res.resultCode;
            }
            if (res.resultStatus=="9000") {
                callback(JSON.stringify(res));
            }else{
              window.AlipayJSBridge.call("startApp",{
                appId:"20000003",
                param:{
                    sourceId:"MobApp",
                    category:"ALL",
                    actionType:"toBillList"
                    }
                },function(res){
                });                 
            }
        }); 
    },
    "alipay_sc_authcode":function(param,callback){
        window.AlipayJSBridge.call("getThirdPartyAuthcode",{"appId":param},function(res){
            //如果没有call调用默认处理的函数
            if(!callback){
                defaultHandler(res);
                return;
            }
            callback(JSON.stringify(res));
        });        
    },
    "alipay_sc_clearcookie":"clearAllCookie",
    "alipay_sc_clientinfo":function(param,callback){
        if (!param){callback();return;}
        var transParam={};
        transParam[param]="";
        window.AlipayJSBridge.call("getClientInfo",transParam,function(res){
            //如果没有call调用默认处理的函数
            if(!callback){
                defaultHandler(res);
                return;
            }
            var realResult={};
            realResult[param]=res[param];
            callback(JSON.stringify(realResult));
        });
    },
    "alipay_sc_exit":function(param,callback){
         window.AlipayJSBridge.call("startApp",{
            appId:"20000001",
            param:{
                actionType:"20000002"
            }
         },function(res){
            if(!callback){
                defaultHandler(res);
                return;
            }
            callback(res);
         });           
    },
    "alipay_sc_sinasso":function(param,callback){
        AlipayJSBridge.call('sinasso',function(res){
            if (res&&"object"===typeof res) {
                res=JSON.stringify(res);
            }
            callback(res);
        });
    }
};
window.bridge=window.WebViewJavascriptBridge={
    init:function(messageHandler){
        if (self._messageHandler) {
            return;
        }
        self._messageHandler=messageHandler;
    },
    callHandler:function(func, param, callback){
        if (func && "string" === typeof func) {
            var callFun=scanAppCallFunMap[func];
            if (!callFun){return;}
            if (callFun && "function" === typeof callFun){
                callFun(param,callback);
            }else if("string" === typeof callFun){
                AlipayJSBridge.call(callFun,param,callback);
            }
        }
    },
    _messageHandler:null
};

var doc = document,readyEvent = doc.createEvent('Events');
readyEvent.initEvent('WebViewJavascriptBridgeReady');
readyEvent.bridge = WebViewJavascriptBridge;
doc.dispatchEvent(readyEvent);

})();