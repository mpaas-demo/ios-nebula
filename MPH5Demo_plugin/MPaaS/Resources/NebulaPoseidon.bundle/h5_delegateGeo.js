"use strict";
(function (window) {
    function call() {
        var a = arguments,
                fn = function () {
                    window.AlipayJSBridge.call.apply(null, a);
                };

        window.AlipayJSBridge ? fn() : document.addEventListener('AlipayJSBridgeReady', fn, false);
    }
    window.navigator.geolocation.getCurrentPosition = function (cb) {
 call('getLocation', {requestType: 2}, function (rtv) {
            var pos = {
                coords: {
                    accuracy: 50,
                    altitude: null,
                    altitudeAccuracy: null,
                    heading: null,
                    latitude: null,
                    longitude: null,
                    speed: null
                },
                timestamp: (+new Date())
            };
            for (var k in rtv) {
                if (rtv.hasOwnProperty(k)) {
                    pos.coords[k] = rtv[k];
                }
            }
            cb && cb(pos);
        });
    };
})(window);
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
