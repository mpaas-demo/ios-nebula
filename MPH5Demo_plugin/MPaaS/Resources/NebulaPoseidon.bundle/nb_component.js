(function(){
    function trimStr(str){
        if (str) {
            return str.replace(/^\s*|\s*$/,"");
        }
        return undefined;
    }
    var currentScale;
    var cssCaced = {};
    var componentIds = [];
    var componentsManager = {
          //NBComponent V2 begin
         createAnimationCls:function(css){
            if (typeof css == "string" &&  !cssCaced[css]) {
                var style = document.createElement('style');
                style.type = 'text/css';
                style.rel = 'stylesheet';
                style.appendChild(document.createTextNode(css));
                var head = document.head || document.documentElement;
                if (head) {
                  head.insertBefore(style, head.firstChild);
                }
                cssCaced[css] = "1";
            }
         },
         getScreenScale: function(){
                if (!currentScale) {
                    //compute scale
                    var viewPortTag = document.querySelector("meta[name=viewport]");
                    var viewPortContent;
                    if (viewPortTag) {
                        viewPortContent = viewPortTag.getAttribute("content");
                    };
                    var scaleValue = "0.33";
                    if (window.devicePixelRatio && window.devicePixelRatio > 2) {
                        scaleValue = "0.4235033";
                    };
                    if (viewPortContent) {
                        var contentList = viewPortContent.split(",");
                        for (var item in contentList) {
                            var scaleConfig = contentList[item].split("=");
                            if (scaleConfig && scaleConfig.length > 1) {
                                var scaleName = scaleConfig[0];
                                if (/initial-scale/.test(scaleName)) {
                                    scaleValue = scaleConfig[1];
                                    break;
                                };
                            };
                        }
                    };
                    currentScale = scaleValue;
                }
                return currentScale;
           },
          renderV2Internal: function (element, renderList, parentElementId) {
            var renderObj = {
                frame: {},
                data: {},
                props: {}
            };
            //compute id
            renderObj.id = trimStr(element.getAttribute("id"));

            //compute type
            renderObj.type = trimStr(element.getAttribute("nbcomponent-type"));

            //if is container 
            // if (typeof renderObj.type == "string" && renderObj.type == "container") {
            //  return;
            // }

            //compute scale
            renderObj.scale = componentsManager.getScreenScale();

            //compute frame
            var boundRect = element.getBoundingClientRect();
            renderObj.frame.width = boundRect.width;
            renderObj.frame.height = boundRect.height;

            var scrollLeft = 0;
            if (document.documentElement && document.documentElement.scrollLeft) {
                scrollLeft = document.documentElement.scrollLeft;
            } else if (document.body) {
                scrollLeft = document.body.scrollLeft;
            }
            var x = boundRect.left + scrollLeft;
            renderObj.frame.x = x;

            var scrollTop = 0;
            if (document.documentElement && document.documentElement.scrollTop) {
                scrollTop = document.documentElement.scrollTop;
            } else if (document.body) {
                scrollTop = document.body.scrollTop;
            }
            var y = boundRect.top + scrollTop;
            renderObj.frame.y = y;

            //compute zindex
            if (element.style.zIndex === "") {
                renderObj.frame.zindex = "-9998";
            } else {
                renderObj.frame.zindex = element.style.zIndex;
            }
            if (element.style.zIndex === "" && element.parentElement.style.zIndex != "") {
                renderObj.frame.zindex = (parseInt(element.parentElement.style.zIndex) + 1).toString();
            }

            //compute custom-data
            var customData = trimStr(element.getAttribute("nbcomponent-data"));;
            if (customData) {
                try {
                    var customDic = JSON.parse(customData);
                    for (var key in customDic) {
                        renderObj.data[key] = customDic[key];
                    }
                } catch (ex) {

                }
            };

            if (parentElementId) {
                var style = window.getComputedStyle(element);
                if (style && style.fontFamily) {
                    renderObj.data["NBFONTFAMILY"] = style.fontFamily;
                }
                renderObj.data["NBPARENTELEMENTID"] =  parentElementId;
            }
            if (element.previousSibling && element.previousSibling.id) {
                renderObj.data["NBPREVIOUSSIBLINGID"] =  element.previousSibling.id;
            }
            //compute custom-data
             var customProps = trimStr(element.getAttribute("nbcomponent-props"));;
             if (customProps) {
                 try {
                    var customDic = JSON.parse(customProps);
                    for (var key in customDic) {
                        renderObj.props[key] = customDic[key];
                    }
                 } catch (ex) {

                 }
             };

            renderList.push(renderObj);
        },

        renderV2: function (id) {
            var renderList = [];
            var element = document.getElementById(id);
            if (element) {
                var parentNode = element.parentNode;
                var parentId = null;
                if (parentNode && parentNode.id) {
                    parentId = parentNode.id;
                }
            	this.traverseTree(element, renderList, parentId);
            }
            return JSON.stringify(renderList);
        },

        hasClass: function(elem, className){
            var classes = elem.className.split(/\s+/) ;
            for(var i= 0 ; i < classes.length ; i ++) {
                if( classes[i] === className ) {
                    return true ;
                }
            }
            return false ;
        },
        addCls:function addClass(ele,cls) {
          if (!this.hasClass(ele,cls)) ele.className += " "+cls;
        },
        traverseTree: function (element, renderList, parentElementId) {
            if (this.hasClass(element, 'nbcomponent')) {
                this.renderV2Internal(element, renderList, parentElementId);
            }
            var nbcomponentType = element.getAttribute("nbcomponent-type");
            if (nbcomponentType && typeof nbcomponentType === "string") {
            	nbcomponentType = trimStr(nbcomponentType);
            }
            //because image is atomaic component we should not get children
            if (!element.children || element.children.length <= 0 || (typeof nbcomponentType == "string" && (nbcomponentType == "image" || nbcomponentType == "text"))) {
                return;
            }
            for (var i = 0; i < element.children.length; i++) {
               this.traverseTree(element.children[i], renderList, element.id);
            }
        },
        //NBComponent V2 end
        getElementInfoById:function(id){
            var objectElements = Array.prototype.slice.call(document.querySelectorAll("object[type=application\\/view]"));
            var result = {};
            if (objectElements) {
                for(var element in objectElements){
                    var childNodes = Array.prototype.slice.call(objectElements[element].childNodes);
                    if (childNodes) {
                        for(var index in childNodes){
                            var childNode = childNodes[index];
                            var childNodeTag = childNode.tagName;
                            if (childNodeTag && /param/i.test(childNodeTag)) {
                                var name = trimStr(childNode.getAttribute("name"));
                                var value = trimStr(childNode.getAttribute("value"));
                                if(name && value){
                                    result[name] = value;
                                }
                            }
                        }
                    };
                    if (result.id && result.id == id) {
                        result["element"] = objectElements[element];
                        break;
                    };
                }
            };
            return result;
        },
        createTargetAnimationWithId:function(id){
            var clsMode = ".nbcomponentanimation-%@{-webkit-animation:nbcomponentopacity%@ 100s infinite linear}@-webkit-keyframes nbcomponentopacity%@{0%{-webkit-transform:translateZ(0)}100%{-webkit-transform:translateZ(0)}}";
            return clsMode.replace(/%@/g,id);
        },
        addListenerForDomChange:function(){
            var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
            var target = document.querySelector('body'); 
            var observer = new MutationObserver(function(mutations) { 
                for(var i=0 ;i<componentIds.length; i++){
                    var item = componentIds[i];
                    if (typeof item === "string" && window.AlipayJSBridge) {
                        AlipayJSBridge.call("NBComponent.setData",{
                            element:item,
                            NEBULAFRAMEDATA:JSON.parse(componentsManager.render(item))
                        },function(){});
                    }
                }
            }); 
            var config = { attributes: true, childList: true, subtree: true, attributeFilter:["class","style"]} 
            observer.observe(target, config);
        },
        render:function(id){
            var elementInfo = this.getElementInfoById(id);
            if(elementInfo && elementInfo.element){
                componentsManager.createAnimationCls(componentsManager.createTargetAnimationWithId(id));
                var element = elementInfo.element;
                componentsManager.addCls(element,'nbcomponentanimation'+"-"+id);
                var type = elementInfo["type"];
                //if is nbcomponent
                var scaleValue = componentsManager.getScreenScale(); 
                
                var renderObj = {
                                    id:id,
                                    scale:scaleValue,
                                    type:type,
                                    frame:{},
                                    data:{}
                };
                
                renderObj.clsName = element.className;

                var boundRect = element.getBoundingClientRect();
                renderObj.frame.width = boundRect.width;
                renderObj.frame.height = boundRect.height;
                
                var scrollLeft = 0;
                if (document.documentElement && document.documentElement.scrollLeft){
                    scrollLeft = document.documentElement.scrollLeft;   
                }else if (document.body){
                    scrollLeft = document.body.scrollLeft;
                }
                var x = element.getBoundingClientRect().left + scrollLeft; 
                renderObj.frame.x = x;

                var scrollTop = 0;
                if (document.documentElement && document.documentElement.scrollTop){
                    scrollTop = document.documentElement.scrollTop;   
                }else if (document.body){
                    scrollTop = document.body.scrollTop;
                }
                var y = element.getBoundingClientRect().top + scrollTop;
                renderObj.frame.y = y;

                //get custom-data
                var customData = elementInfo["data"];
                if (customData) {
                    try{
                        var customDic = JSON.parse(customData);
                        for (var key in customDic){
                            renderObj.data[key] = customDic[key];
                        }
                    }catch(ex){

                    }
                };
                // merge other config to render data obj
                try{
                    for(var key in elementInfo){
                        if (!/^(?:data|id|type|element)$/.test(key)) {
                            renderObj.data[key] = elementInfo[key];
                        };
                    }
                }catch(ex){
                }
                if (componentIds && componentIds.indexOf((id+"")) == -1) {
                    componentIds.push((id+""));
                }
                //return config
                return JSON.stringify(renderObj);               
            }
        }
    };
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
        componentsManager.addListenerForDomChange();
    });
    window.componentsManager = componentsManager;
})();
