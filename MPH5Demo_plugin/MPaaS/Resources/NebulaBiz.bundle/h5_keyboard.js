window.AlipayH5Keyboad || (function () {

    var isFixdPostion = function (element) {
        if (element && element.nodeType) {
            var parentNode = element;
            while (parentNode) {
                var isFixed = window.getComputedStyle(parentNode).position;
                if (isFixed == "fixed") {
                    return true;
                } else if (parentNode === document || parentNode === document.documentElement || parentNode === document.body) {
                    break;
                }
                parentNode = parentNode.parentNode;
            }
            return false;
        }
    }
    var findElementByTag = function(element, tagName){
        if (element && element.nodeType) {
            var parentNode = element;
            while (parentNode) {
                if (parentNode.tagName && parentNode.tagName.toLowerCase() == tagName) {
                    return parentNode;
                } else if (parentNode === document || parentNode === document.documentElement || parentNode === document.body) {
                    break;
                }
                parentNode = parentNode.parentNode;
            }
            return null;
        }
    }
    var _currentInputKeyBoardInput;
    var cachePlaceHolder = 'data-kb-placeholder';
    function bridgeReady(cbFn) {
        if (typeof AlipayJSBridge != 'undefined') {
            cbFn();
        } else {
            document.addEventListener("AlipayJSBridgeReady", function () {
                cbFn();
            })
        }
    }
    // 10.1 10.2 不能正确处理 fixed 元素自定义键盘
    var isBackListSystem = navigator.userAgent.search(/iPhone OS 10_(1|2)/gi) != -1;
    // 有开关配置的 会使用新的键盘弹出方式，这时，就不再降级使用 系统 键盘处理 处理 fixed 元素。
    if(window.SHOULDH5CUSTOMKEYBOARDRUNSPVERSION) {
        isBackListSystem = false;
    }
    var isWK = navigator.userAgent.search("Nebula WK") !== -1;
    function initH5KeyBoardEventListener() {
      if (window.SHOULDUESH5KEYBOARD) {
        document.addEventListener("focus", function (event) {
          var target = event.target;
          var keyBoardType = target.getAttribute("data-keyboard");
          var type = target.type;
          _currentInputKeyBoardInput = null;
          if (target && (target.tagName.toLowerCase() == "input" || target.tagName.toLowerCase() == "textarea")
            && keyBoardType && keyBoardType != "") {
            _currentInputKeyBoardInput = target;
            // TODO 如果是不支持设备的 fixed 元素，或者是 type = password 就不执行
            if(isWK){
              var isExec = false;
              if(isBackListSystem && !isFixdPostion(target)){
                isExec = true;
              } else if (!isBackListSystem){
                isExec = true;
              }

              if(type == "password"){
                isExec = false;
              }

              if(isExec){
                if (target._sourceBlur ) {
                  if (window.AlipayJSBridge) {
                    AlipayJSBridge.call("updateNativeKeyBoardInput", {"BLURFROMH5":"BLURFROMH5"});
                  }
                  target._sourceBlur();
                }
              }

            }
          }
        }, true);
        if(isWK){
          var resizeTimeoutId = null, timerTimeout = 250;
          if(navigator.userAgent.search(/iPhone\sOS\s(10|9|8)_(1|2)/gi) != -1){
            timerTimeout = 300;
          }
          window.addEventListener('resize', function (event) {
            if (_currentInputKeyBoardInput) {
              bridgeReady(function () {
                clearTimeout(resizeTimeoutId);
                resizeTimeoutId = setTimeout(function () {
                  var strRS = h5InputKeybord.getInputParamWithElement(_currentInputKeyBoardInput, true);
                  if(strRS){
                    var rs = JSON.parse(strRS);
                    AlipayJSBridge.call("resizeNativeKeyBoardInput", rs);
                  }

                }, timerTimeout);
              })
            }
          });
          window.addEventListener('scroll', function (event) {
            if (_currentInputKeyBoardInput) {
              bridgeReady(function () {
                clearTimeout(resizeTimeoutId);
                resizeTimeoutId = setTimeout(function () {
                  var rss = h5InputKeybord.getInputParamWithElement(_currentInputKeyBoardInput, true);
                  if(rss) {
                    var rs = JSON.parse(rss);
                    AlipayJSBridge.call("resizeNativeKeyBoardInput", rs);
                  }
                }, timerTimeout);
              })
            }
          });

          //add listener when dom change
          (function addDomChangeListener(){
            if (window.SHOULDUESMUTATIONOBSERVER) {
                var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
                var target = document.querySelector('body'); 
                var observer = new MutationObserver(function(mutations) {  
                    if (_currentInputKeyBoardInput) {
                      bridgeReady(function () {
                        var parentElement = _currentInputKeyBoardInput.parentNode;
                        if (parentElement && (typeof parentElement.className === "string") && /a-input-wrap/.test(parentElement.className)) {
                            var ratio = "1.0";
                            var viewPort =  document.querySelector('meta[name=viewport]');
                            if (viewPort) {
                                var content = viewPort.getAttribute('content');
                                if (content) {
                                    ratio = content.match(/initial-scale=\s*([0-9.]+)/)[1];
                                }
                            }

                            var scaleRatio = parseFloat(ratio);
                            var borderWith = parseFloat(window.getComputedStyle(_currentInputKeyBoardInput).borderWidth);
                            var borderLeftWidth = parseFloat(window.getComputedStyle(_currentInputKeyBoardInput).borderLeftWidth);
                            var borderRightWidth = parseFloat(window.getComputedStyle(_currentInputKeyBoardInput).borderRightWidth);
                            var borderTopWidth = parseFloat(window.getComputedStyle(_currentInputKeyBoardInput).borderTopWidth);
                            var offset = window.AlipayH5Keyboad._getEleOffset(parentElement);
                            if (borderWith && borderWith > 0) {
                                offset.x = offset.x + borderLeftWidth || borderWith;
                                offset.y = offset.y + borderTopWidth || borderWith;
                                offset.yt = offset.yt + borderTopWidth || borderWith;
                                if(borderRightWidth){
                                  offset.w -= borderRightWidth;
                                }
                                if(borderLeftWidth){
                                  offset.w -= borderLeftWidth;
                                }
                            };
                            var rss = {};
                            rss.RESIZEACTION = "SETFRAME";
                            rss.offset = offset;
                            AlipayJSBridge.call("updateNativeKeyBoardInput", rss);
                        }
                      });
                    }
                }); 
                var config = { attributes: true, childList: true, subtree: true, attributeFilter:["class","style"]} 
                observer.observe(target, config);
            } 
          })();



        }
        var sourceBlurFn = HTMLInputElement.prototype.blur;
        HTMLInputElement.prototype.blur = function () {
          var keyboard = this.getAttribute('data-keyboard');
          if(keyboard && keyboard != ""){
            bridgeReady(function () {
              AlipayJSBridge.call("hideCustomKeyBoard");
            })
          }
          return sourceBlurFn.apply(this, arguments);
        }
        HTMLInputElement.prototype._sourceBlur = sourceBlurFn;

        var textareaBlurFn = HTMLTextAreaElement.prototype.blur;
        HTMLTextAreaElement.prototype.blur = function () {
          var keyboard = this.getAttribute('data-keyboard');
          if(keyboard && keyboard != ""){
            bridgeReady(function () {
              AlipayJSBridge.call("hideCustomKeyBoard");
            })
          }
          return textareaBlurFn.apply(this, arguments);
        }
        HTMLTextAreaElement.prototype._sourceBlur = textareaBlurFn;

      };
    }

    var inputElId = 1;
    var h5InputKeybord = {
        //重置某个 input 的 offset
        _getOffset: function (index) {
            var ele = document.getElementsByClassName('h5numInput')[index];
            return this._getEleOffset(ele);
        },
        //获得某个 input 的 offset
        getInputOffset: function (index) {
            return JSON.stringify(this._getOffset(index));
        },
        _getEleOffset: function (ele) {
            //要重新计算缩放，当页面被menu bar scale
            var ratio = document.querySelector('meta[name=viewport]').getAttribute('content').match(/initial-scale=\s*([0-9.]+)/)[1];
            var scaleRatio = parseFloat(ratio);

            var paddingLeft = window.getComputedStyle(ele).paddingLeft;
            var isAlignCenter = window.getComputedStyle(ele).textAlign == 'center' ? true : false;
            if (isAlignCenter) {
                paddingLeft = 0;
            }
            var xPoint = (parseFloat(paddingLeft) + ele.getBoundingClientRect().left) * scaleRatio;
            var yPoint = (ele.getBoundingClientRect().top + document.body.scrollTop) * scaleRatio;
            var yPointT = ele.getBoundingClientRect().top * scaleRatio;
            var width = (ele.offsetWidth - parseFloat(paddingLeft)) * scaleRatio;
            var height = ele.offsetHeight * scaleRatio;
            return {
                'x': xPoint,
                'y': yPoint,
                'yt': yPointT,
                'w': width,
                'h': height
            };
        },
        getInputParam: function (index) {

            var curEle = document.getElementsByClassName('h5numInput')[index];

            curEle.setAttribute('readonly', 'true');
            curEle.setAttribute('placeholder', '');

            //dom 缓存color值
            var dataColor = curEle.getAttribute('h5kb-color');
            var originColor = window.getComputedStyle(curEle).color;

            var color;
            if (dataColor && dataColor.length) {
                color = dataColor;
            } else {
                color = originColor;
                curEle.setAttribute('h5kb-color', originColor);
            }

            //拿字体大小
            var fontSize = parseFloat(window.getComputedStyle(curEle).fontSize);

            //把 color 设置为 bgColor 防止重影
            curEle.style.color = window.getComputedStyle(curEle).backgroundColor;

            var ratio = document.querySelector('meta[name=viewport]').getAttribute('content').match(/initial-scale=\s*([0-9.]+)/)[1];
            var scaleRatio = parseFloat(ratio);

            return {
                'offset': this._getOffset(index),
                'placeholder': this.getPlaceholder(index),
                'type': curEle.getAttribute('type') || 'text',
                'kbType': curEle.getAttribute('kb-type') || curEle.getAttribute('data-kb-type') || 0,
                'value': curEle.value || '',
                'color': color,
                'fontSize': fontSize * scaleRatio,
                'fontWeight': window.getComputedStyle(curEle).fontWeight,
                'maxlength': parseInt(curEle.getAttribute('maxlength')) || -1,
                'canPaste': !(curEle.getAttribute('data-paste') == 'false'),
                'textAlign': window.getComputedStyle(curEle).textAlign
            };
        },
        dispatchEventWithElement: function (curEle, eventName, keyCode, strKey, marked, range, extData) {
            if (curEle) {
                if (eventName == "blur") {
                    var focusEvent = new FocusEvent("blur");
                    focusEvent.initEvent("blur", false, false);
                    // 兼容 react-dom 模型，数值为模拟设置
                    focusEvent.simulated = true;
                    curEle.dispatchEvent(focusEvent);
                    if (strKey && strKey == "r") {
                        var formElement = findElementByTag(curEle,"form");
                        if (formElement && formElement.submit) {
                            formElement.submit();
                        }
                    }
                    // clear currentInputEL when  dispatch blur event
                    window._currentInput = null;
                    // curEle._sourceBlur && curEle._sourceBlur();
                } else if (eventName == "keydown") {
                    var keyboardEvent = new KeyboardEvent("keydown", {keyCode:keyCode ? keyCode : 0});
                    keyboardEvent.data = {keyCode:keyCode ? keyCode : 0};
                    keyboardEvent.initEvent("keydown", false, false);
                    curEle.dispatchEvent(keyboardEvent);
                } else if (eventName == "keyup") {
                    var keyboardEvent = new KeyboardEvent("keyup", {keyCode:keyCode ? keyCode : 0});
                    keyboardEvent.data = {keyCode:keyCode ? keyCode : 0};
                    keyboardEvent.initEvent("keyup", false, false);
                    curEle.dispatchEvent(keyboardEvent);
                } else if(eventName == "input"){
                    if((strKey && strKey != "") || keyCode == 46){
                        var inputEvent = new Event("input", {
                            'bubbles': true,
                            'cancelable': false,
                        });
                        inputEvent.data = strKey;
                        // 兼容 react-dom 模型，数值为模拟设置
                        inputEvent.simulated = true;
                        // for marked string not in English
                        inputEvent.marked = ((marked == "Y") ? true : false);
                        if(range){
                            inputEvent.markedstart = range.start;
                            inputEvent.markedlength = range.length;
                        }
                        if (extData && typeof extData == "object" && extData.hasOwnProperty("cursor")) {
                            inputEvent.cursor = extData.cursor;
                        }
                        //console.error(inputEvent);
                        curEle.dispatchEvent(inputEvent);
                  }
                }else if (eventName == "change") {
                    var changeEvent = new Event("change", {
                        'bubbles': true,
                        'cancelable': false,
                    });
                    curEle.dispatchEvent(changeEvent);
                } else if (eventName == 'complete') {
                    var completeEvent = new Event("complete", {
                        'bubbles': true,
                        'cancelable': false,
                    });
                    if (extData && extData.value) {
                        completeEvent.data = {"value": extData.value};
                    }
                    curEle.dispatchEvent(completeEvent);
                } else if (eventName == "linechange") {
                    var lineChangeEvent = new Event("linechange", {
                        'bubbles': true,
                        'cancelable': false,
                    });
                    if (extData && extData.lineCount && extData.height) {
                        lineChangeEvent.data = {
                            "lineCount": extData.lineCount,
                            "height": extData.height
                        };
                    }
                    curEle.dispatchEvent(lineChangeEvent);
                }
            }
        },
        getTagName: function (_curEle) {
            var curEle;
            if (_currentInputKeyBoardInput) {
                curEle = _currentInputKeyBoardInput;
            } else {
                curEle = _curEle;
            }
            if(!curEle || (curEle && curEle.tagName && !(curEle.tagName.toLowerCase() == "input" || curEle.tagName.toLowerCase() == "textarea"))){
                return;
            }

            return JSON.stringify({
                'tagName': curEle.tagName.toLowerCase()
            });
        },
        getInputParamWithElement: function (_curEle, noChangeStyle) {
            var curEle;
            if (_currentInputKeyBoardInput) {
                curEle = _currentInputKeyBoardInput;
            } else {
                curEle = _curEle;
            }
            if(!curEle || (curEle && curEle.tagName && !(curEle.tagName.toLowerCase() == "input" || curEle.tagName.toLowerCase() == "textarea"))){
                return;
            }
            if (isFixdPostion(curEle) && isBackListSystem && isWK) {
                // 不处理 不支持设备的 fixed 元素
                return;
            }
            var keyboardType = curEle.getAttribute('data-keyboard');


            if (!keyboardType) {
                window._currentInput = null;
                // TODO 检测完所有的类型
                var isInputEle = curEle.tagName.toLowerCase() == "input" || curEle.tagName.toLowerCase() == "textarea";
                if(isInputEle){
                    return JSON.stringify({
                        isNoNeedKeyBoardInput:"YES"
                    });
                }else {
                    return;
                }

            }

            if(curEle && curEle.type == "password") {
              return JSON.stringify({
                isNoNeedKeyBoardInput:"YES"
              });
            }

            if (keyboardType == "idcard" || keyboardType == "digit") {
                setTimeout(function(){
                    if(!noChangeStyle){
                        curEle.setAttribute("type", "text");
                    }
                },0);
            }


            window._currentInput = curEle;
            //dom 缓存color值
            var dataColor = curEle.getAttribute('h5kb-color');
            var placeHolder = curEle.getAttribute('placeholder');
            if (placeHolder && placeHolder != "" && !noChangeStyle) {
                 //setTimeout(function(){
                    curEle.setAttribute(cachePlaceHolder, placeHolder);
                 //},0);
                curEle.placeholder = "";
            }
            var originColor = window.getComputedStyle(curEle).color;
            var styleColorAttr = curEle.style.color;
            var color;
            if (dataColor && dataColor.length) {
                color = dataColor;
            } else {
                color = originColor;
                setTimeout(function(){
                   if(!noChangeStyle){
                      curEle.setAttribute('h5kb-color', originColor);
                      if (styleColorAttr && styleColorAttr != "" && styleColorAttr != null) {
                           curEle.setAttribute('isStyleColor', true);
                           curEle.setAttribute('isStyleColorVal', styleColorAttr);
                      }
                   }
                },0);
            }

            //拿字体大小
            var fontSize = parseFloat(window.getComputedStyle(curEle).fontSize);
            //拿font-family
            var fontFamily = window.getComputedStyle(curEle).fontFamily;
            if(!noChangeStyle) {
                 //把 color 设置为 bgColor 防止重影
                 curEle.style.color = window.getComputedStyle(curEle).backgroundColor;
            }
            
            // 写一个ID
            var elId = curEle.getAttribute("data-kbel-id");
            if(!elId){
              elId = inputElId++;
              setTimeout(function(){
                curEle.setAttribute("data-kbel-id", elId);
              },0);
            }


            var ratio = document.querySelector('meta[name=viewport]').getAttribute('content').match(/initial-scale=\s*([0-9.]+)/)[1];
            var scaleRatio = parseFloat(ratio);

            var borderWith = parseFloat(window.getComputedStyle(curEle).borderWidth);
            var borderLeftWidth = parseFloat(window.getComputedStyle(_currentInput).borderLeftWidth);
            var borderRightWidth = parseFloat(window.getComputedStyle(_currentInput).borderRightWidth);
            var borderTopWidth = parseFloat(window.getComputedStyle(_currentInput).borderTopWidth);
            var offset = this._getEleOffset(curEle);
            if (borderWith && borderWith > 0) {
                offset.x = offset.x + borderLeftWidth || borderWith;
                offset.y = offset.y + borderTopWidth || borderWith;
                offset.yt = offset.yt + borderTopWidth || borderWith;
                if(borderRightWidth){
                  offset.w -= borderRightWidth;
                }
                if(borderLeftWidth){
                  offset.w -= borderLeftWidth;
                }
            };
            // if (curEle.parentNode && curEle.parentNode.style.position && curEle.parentNode.style.position == "fixed") {
            //     offset.y = offset.y - 200;
            // };
            var rsPlaceHolder = placeHolder;
            if (!rsPlaceHolder) {
                rsPlaceHolder = curEle.getAttribute(cachePlaceHolder) ? curEle.getAttribute(cachePlaceHolder) : ""
            }
            var data = {
                'tagName': curEle.tagName.toLowerCase(),
                'position': isFixdPostion(curEle) ? "fixed" : "static",
                'offset': offset,
                'placeholder': rsPlaceHolder,
                'type': curEle.getAttribute('type') || 'text',
                'keyboard': curEle.getAttribute('data-keyboard'),
                'value': curEle.value || '',
                'color': color,
                'fontSize': fontSize * scaleRatio,
                'fontFamily': fontFamily,
                'fontWeight': window.getComputedStyle(curEle).fontWeight,
                'lineHeight': window.getComputedStyle(curEle).lineHeight,
                'maxlength': parseInt(curEle.getAttribute('maxlength')) || -1,
                'canPaste': !(curEle.getAttribute('data-paste') == 'false'),
                'textAlign': window.getComputedStyle(curEle).textAlign,
                'selectionStart':parseFloat(curEle.getAttribute("data-selection-start") ? curEle.getAttribute("data-selection-start") : "-1"),
                'selectionEnd':parseFloat(curEle.getAttribute("data-selection-end") ? curEle.getAttribute("data-selection-end") : "-1"),
                'returnType':curEle.getAttribute("data-return-type") ? curEle.getAttribute("data-return-type") : "",
                'canReturn':curEle.getAttribute("data-return") ? curEle.getAttribute("data-return") : "Y",
                'randomNumber':curEle.getAttribute("data-randomnumber") ? curEle.getAttribute("data-randomnumber") : "N",
                'cursor':parseFloat(curEle.getAttribute("data-cursor") ? curEle.getAttribute("data-cursor") : "-1"),
                'kbElId': elId,
                'controlled':curEle.getAttribute("data-controlled") ? curEle.getAttribute("data-controlled") : "N"
            }
            if (data.tagName == 'textarea') {
                data['autoHeight'] = curEle.getAttribute('data-auto-height') ? !(curEle.getAttribute('data-auto-height') == 'false') : false;
                data['cursorSpacing'] = parseFloat(curEle.getAttribute("data-cursor-spacing") ? curEle.getAttribute("data-cursor-spacing") : "0")  * scaleRatio;
                data['position'] = (isFixdPostion(curEle) && (curEle.getAttribute('data-fixed') == 'true')) ? "fixed" : "static";
                data['adjustPosition'] = curEle.getAttribute("data-adjust-position") ? curEle.getAttribute("data-adjust-position") : "Y";
                data['showConfirmBar'] = curEle.getAttribute("data-show-confirm-bar") ? curEle.getAttribute("data-show-confirm-bar") : "Y";
            }
            return JSON.stringify(data);
        },
        setTextareaValue: function(value) {
            window._currentInput.value = value.replace(/\\n/, "\n")
        },
        restoreInputElement: function (kbElId) {
            var el = document.querySelector("[data-kbel-id='" + kbElId + "']");
            if (el) {
                if (el.getAttribute('isStyleColor') == true) {
                    el.style.color = el.getAttribute('h5kb-color');
                } else {
                    el.style.color = null;
                }

                var sourcePlaceHolder = el.getAttribute(cachePlaceHolder);
                if (sourcePlaceHolder && sourcePlaceHolder != "") {
                    el.removeAttribute(cachePlaceHolder);
                    el.placeholder = sourcePlaceHolder;
                }
                el.removeAttribute('h5kb-color');
                el.removeAttribute('isStyleColor');
            } else {
                console.error("::data-kbel-id::", kbElId);
            }
            _currentInputKeyBoardInput = null;
        },
        //获取对应 index 输入框的 placeholder
        getPlaceholder: function (index) {
            var placeholder = document.getElementsByClassName('h5numInput')[index].getAttribute('data-placeholder');
            return placeholder || '';
        },
        //回填数值
        setInputValue: function (index, value) {
            var element = document.getElementsByClassName('h5numInput')[index];
            if (element) {
                element.value = value;
            }
        },
        fixWKFixElementScrollBug:function(){
           document.addEventListener("touchmove",function(e){
                bridgeReady(function () {
                    //if (isFixdPostion(window._currentInput)) {
                        AlipayJSBridge.call("hideCustomKeyBoard");
                    //};
                });
            },true);
        },
        init: function () {
            var inputArr = [];
            var inputEles = document.getElementsByClassName('h5numInput');

            for (var i = 0; i < inputEles.length; i++) {
                inputArr.push(this.getInputParam(i));
            }

            if (inputArr.length > 0) {
                if (typeof AlipayJSBridge != 'undefined') {
                    AlipayJSBridge.call('createInput', {
                        param: inputArr
                    });
                } else {
                    document.addEventListener("AlipayJSBridgeReady", function () {
                        AlipayJSBridge.call('createInput', {
                            param: inputArr
                        });

                    })
                }

            }
            //为 Android 做兼容，Android 拿不到 js 执行结果
            document.addEventListener('getNewOffset', function (param, clientId) {
                var offset = this._getOffset(index);
                AlipayJSBridge.callback && AlipayJSBridge.callback({
                    'clientId': clientId,
                    'offset': offset
                });
            });

            //fix scroll bug
            if (window.SHOULDUESH5KEYBOARD) {
                var isWK = navigator.userAgent.search("Nebula WK") !== -1;
                if (isWK) {
                    h5InputKeybord.fixWKFixElementScrollBug();
                };
            }
        }
    }
    // for developer to test, open to all developer soon
    h5InputKeybord._getInputJsonWithElement = function (_curEle){
        var rs = h5InputKeybord.getInputParamWithElement(_curEle, true);
        try{
             if(rs) {
                rs = JSON.parse(rs);
             }
        }catch(e){
            console.error('json transform error:', e, rs);
        }
        return rs;
    }
    document.addEventListener("AlipayJSBridgeReady", function () {
            h5InputKeybord.init();
    });
    var readyRE = /complete|loaded|interactive/;
    if (readyRE.test(document.readyState)) {
            setTimeout(function() {
                   initH5KeyBoardEventListener();
            }, 1);
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            initH5KeyBoardEventListener();
        }, false);
    }

    h5InputKeybord.version = '1.5.1';
    window.AlipayH5Keyboad = h5InputKeybord;

})();
