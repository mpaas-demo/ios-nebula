(function () {
    if (window.BizLog) {
        return;
    }
    var BizLog = {
        _readyToRun: [],
        call: function () {
            var args = arguments;
            var argsList;
            try {
                argsList = [].slice.call(args, 0);
            } catch(ex) {
                var argsLen = args.length;
                argsList = [];
                for (var i=0; i<argsLen; i++) {
                    argsList.push(args[i]);
                }
            }

            BizLog.addToRun(function () {
                BizLog.call.apply(BizLog, argsList);
            });
        },
        addToRun: function (fn) {
            if (typeof fn==='function') {
                fn._logTimer = (new Date())-0;
                BizLog._readyToRun.push(fn);
            }
        }
    };

    window.BizLog = BizLog;
})();
