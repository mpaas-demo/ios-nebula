"use strict";
//rwrite pushState and replaceState to trigger change
(function(){
  try{
    window.history.pushState = (function(fn){
      return function(){
        var args = [].slice.call(arguments);
        document.addEventListener("AlipayJSBridgeReady",function(){
          window.AlipayJSBridge.call("pushStateChange",{});
        },false);
        fn.apply(this,args);
      }
    })(window.history.pushState);

    window.history.replaceState = (function(fn){
      return function(){
        var args = [].slice.call(arguments);
        document.addEventListener("AlipayJSBridgeReady",function(){
          window.AlipayJSBridge.call("pushStateChange",{});
        },false);
        fn.apply(this,args);
      }
    })(window.history.replaceState);
  }catch(ex){

  }
})();
