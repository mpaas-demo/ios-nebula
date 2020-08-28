(function (window) {
    var meta = document.querySelector('meta[name="alipay-autosave-webimage"]');
	if(meta && meta.content === "disable" || window.H5SAVEWEBIMAGEINITED){
        return;
	}
 
    function call() {
        var a = arguments,
            fn = function () {
                window.AlipayJSBridge.call.apply(null, a);
            };

        window.AlipayJSBridge ? fn() : document.addEventListener('AlipayJSBridgeReady', fn, false);
    }

    function onceEvent(ele, name, cb) {
        var events = name.split(" ");

        var handle = function (e) {
            for (var i = 0; i < events.length; i++) {
                ele.removeEventListener(events[i], handle, true);
            }
            cb && cb(e);
        };
        for (var i = 0; i < events.length; i++) {
            ele.addEventListener(events[i], handle, true);
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

    onDOMReady(function(){
        var timeoutId = 0;
        if (document && document.body) {
            document.body.addEventListener("touchstart", function (e) {
                var imgElement = e.target;
                if (imgElement.nodeName.toLowerCase() === 'img') {
                    imgElement.style.webkitUserSelect = 'none';
                    timeoutId = window.setTimeout(function () {
                       onceEvent(imgElement, "click", function (ev) {
                           ev.preventDefault();
                           return false;
                       });
                        call('privateSaveImage', {
                            src: imgElement.src
                        });
                    }, 750);
                                      
                    var clearHandle = function () {
                      window.clearTimeout(timeoutId);
                    };
                    onceEvent(document.body, "touchmove touchend touchcancel", clearHandle);
                }
            }, false);
        }
    });


    window.H5SAVEWEBIMAGEINITED = true;
})(window);



