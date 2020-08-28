(function(){
  var tkReplace = "NEBULA_BRIDGE_JS_REPLACE_STRING";

/**********************js fetch************************/
(function(self) {
  'use strict';

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1])
      }, this)
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ')
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = options.status === undefined ? 200 : options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

/**********************from serializes************************/
(function(){
    // get successful control from form and assemble into object
    // http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2

    // types which indicate a submit action and are not successful controls
    // these will be ignored
    var k_r_submitter = /^(?:button|image|reset|file)$/i;

    // node names which could be successful controls
    var k_r_success_contrls = /^(?:input|select|textarea|keygen)/i;

    // Matches bracket notation.
    var brackets = /(\[[^\[\]]*\])/g;

    // serializes form fields
    // @param form MUST be an HTMLForm element
    // @param options is an optional argument to configure the serialization. Default output
    // with no options specified is a url encoded string
    //    - hash: [true | false] Configure the output type. If true, the output will
    //    be a js object.
    //    - serializer: [function] Optional serializer function to override the default one.
    //    The function takes 3 arguments (result, key, value) and should return new result
    //    hash and url encoded str serializers are provided with this module
    //    - disabled: [true | false]. If true serialize disabled fields.
    //    - empty: [true | false]. If true serialize empty fields
    function serialize(form, options) {
        if (typeof options != 'object') {
            options = { hash: !!options };
        }
        else if (options.hash === undefined) {
            options.hash = true;
        }

        var result = (options.hash) ? {} : '';
        var serializer = options.serializer || ((options.hash) ? hash_serializer : str_serialize);

        var elements = form && form.elements ? form.elements : [];

        //Object store each radio and set if it's empty or not
        var radio_store = Object.create(null);

        for (var i=0 ; i<elements.length ; ++i) {
            var element = elements[i];

            // ingore disabled fields
            if ((!options.disabled && element.disabled) || !element.name) {
                continue;
            }
            // ignore anyhting that is not considered a success field
            if (!k_r_success_contrls.test(element.nodeName) ||
                k_r_submitter.test(element.type)) {
                continue;
            }

            if (/submit/.test(element.type) && (document.activeElement !== element && window.lastClickElement !== element)) {
            	continue;
            }

            var key = element.name;
            var val = element.value;

            // we can't just use element.value for checkboxes cause some browsers lie to us
            // they say "on" for value when the box isn't checked
            if ((element.type === 'checkbox' || element.type === 'radio') && !element.checked) {
                val = undefined;
            }

            // If we want empty elements
            if (options.empty) {
                // for checkbox
                if (element.type === 'checkbox' && !element.checked) {
                    continue;
                }

                // for radio
                if (element.type === 'radio' && !element.checked) {
                    continue;
                }

                // for radio
                if (element.type === 'radio') {
                    if (!radio_store[element.name] && !element.checked) {
                        radio_store[element.name] = false;
                    }
                    else if (element.checked) {
                        radio_store[element.name] = true;
                    }
                }

                // if options empty is true, continue only if its radio
                if (val == undefined && element.type == 'radio') {
                    continue;
                }
            }
            else {
                // value-less fields are ignored unless options.empty is true
                if (!val) {
                    continue;
                }
            }

            // multi select boxes
            if (element.type === 'select-multiple') {
                val = [];

                var selectOptions = element.options;
                var isSelectedOptions = false;
                for (var j=0 ; j<selectOptions.length ; ++j) {
                    var option = selectOptions[j];
                    var allowedEmpty = options.empty && !option.value;
                    var hasValue = (option.value || allowedEmpty);
                    if (option.selected && hasValue) {
                        isSelectedOptions = true;

                        result = serializer(result, key, option.value);

                    }
                }

                // // Serialize if no selected options and options.empty is true
                // if (!isSelectedOptions && options.empty) {
                //     result = serializer(result, key, '');
                // }

                continue;
            }

            result = serializer(result, key, val);
        }

        // Check for all empty radio buttons and serialize them with key=""
        if (options.empty) {
            for (var key in radio_store) {
                if (!radio_store[key]) {
                    result = serializer(result, key, '');
                }
            }
        }

        return result;
    }

    function parse_keys(string) {
        var keys = [];
        var prefix = /^([^\[\]]*)/;
        var children = new RegExp(brackets);
        var match = prefix.exec(string);

        if (match[1]) {
            keys.push(match[1]);
        }

        while ((match = children.exec(string)) !== null) {
            keys.push(match[1]);
        }

        return keys;
    }

    function hash_assign(result, keys, value) {
        if (keys.length === 0) {
            result = value;
            return result;
        }

        var key = keys.shift();
        var between = key.match(/^\[(.+?)\]$/);

        if (key === '[]') {
            result = result || [];

            if (Array.isArray(result)) {
                result.push(hash_assign(null, keys, value));
            }
            else {
                // This might be the result of bad name attributes like "[][foo]",
                // in this case the original `result` object will already be
                // assigned to an object literal. Rather than coerce the object to
                // an array, or cause an exception the attribute "_values" is
                // assigned as an array.
                result._values = result._values || [];
                result._values.push(hash_assign(null, keys, value));
            }

            return result;
        }

        // Key is an attribute name and can be assigned directly.
        if (!between) {
            result[key] = hash_assign(result[key], keys, value);
        }
        else {
            var string = between[1];
            // +var converts the variable into a number
            // better than parseInt because it doesn't truncate away trailing
            // letters and actually fails if whole thing is not a number
            var index = +string;

            // If the characters between the brackets is not a number it is an
            // attribute name and can be assigned directly.
            if (isNaN(index)) {
                result = result || {};
                result[string] = hash_assign(result[string], keys, value);
            }
            else {
                result = result || [];
                result[index] = hash_assign(result[index], keys, value);
            }
        }

        return result;
    }

    // Object/hash encoding serializer.
    function hash_serializer(result, key, value) {
        var matches = key.match(brackets);

        // Has brackets? Use the recursive assignment function to walk the keys,
        // construct any missing objects in the result tree and make the assignment
        // at the end of the chain.
        // not to change filename so use false
        if (false) {
            var keys = parse_keys(key);
            hash_assign(result, keys, value);
        }
        else {
            // Non bracket notation can make assignments directly.
            var existing = result[key];

            // If the value has been assigned already (for instance when a radio and
            // a checkbox have the same name attribute) convert the previous value
            // into an array before pushing into it.
            //
            // NOTE: If this requirement were removed all hash creation and
            // assignment could go through `hash_assign`.
            if (existing) {
                if (!Array.isArray(existing)) {
                    result[key] = [ existing ];
                }

                result[key].push(value);
            }
            else {
                result[key] = value;
            }
        }

        return result;
    }

    // urlform encoding serializer
    function str_serialize(result, key, value) {
        // encode newlines as \r\n cause the html spec says so
        value = value.replace(/(\r)?\n/g, '\r\n');
        value = encodeURIComponent(value);

        // spaces should be '+' rather than '%20'.
        value = value.replace(/%20/g, '+');
        return result + (result ? '&' : '') + encodeURIComponent(key) + '=' + value;
    }

    window.NebulaSerialize = serialize;
})();

(function(){
    var ktnebula = tkReplace;
    var webkit = window.webkit;
    var postMessage = webkit.messageHandlers.PSDXMLHTTPREQUESTMESSAGE.postMessage;
    var PSDXMLHTTPREQUESTMESSAGE = webkit.messageHandlers.PSDXMLHTTPREQUESTMESSAGE;

    function safeCallMessage(message){
        return postMessage.apply(PSDXMLHTTPREQUESTMESSAGE,[message]);
    }
    /**********************rewrite cookie************************/

    var cookieOriginSetter = document.__lookupSetter__('cookie'),
    cookieOriginGetter = document.__lookupGetter__('cookie');
    var NebulaUpdateCookies;
    if (cookieOriginSetter && cookieOriginGetter) {
        Object.defineProperty(document, 'cookie', {
            set: function(cookstr) {
                if (typeof cookstr !== 'string') {
                      return;
                };
                var message = {};
                message[msgType] = "cookie";
                message["cookie"] = cookstr;
                message["url"] = document.location.href;
                message["msgKt"] = ktnebula;
                //iOS 10 and iOS 11 if call this on unload event,window.webkit can be null
                if (webkit && webkit.messageHandlers && webkit.messageHandlers.PSDXMLHTTPREQUESTMESSAGE && webkit.messageHandlers.PSDXMLHTTPREQUESTMESSAGE.postMessage) {
                    safeCallMessage(message);
                }
                cookieOriginSetter.apply(document,[cookstr]);
            },
            get: function(){
                return cookieOriginGetter.apply(document,[]);
            },
            configurable: false
        });
    }else{
      if (window.SHOULDNEBULADORWC) {
          var cookieNameMap = {
                  Version: 'version',
                  Name: 'name',
                  Value: 'value',
                  MaxAge: 'maxAge',
                  MaxAgeDate: 'maxAgeDate',
                  ExpiresDate: 'expiresDate',
                  Domain: 'domain',
                  Path: 'path',
                  Secure: 'secure',
                  HttpOnly: 'httpOnly'
          }

          function idIPAddress(address) {
              return /^(d+).(d+).(d+).(d+)$/.test(address);
          };

          function isRegExp(value, rule) {
              if (rule && typeof rule === "string" && rule.length > 0) {
                  var reg = new RegExp(rule + '$');
                  return reg.test(value);
              }else{
                  return false;
              }
          };

          function hasPrefix(value, rule){
              if (rule.length > 0) {
                var reg = new RegExp("^" + rule);
                return reg.test(value);
              }else{
                return false;
              }
          }

          function domianMatch(value){
            var hostMatch = (value && isRegExp(document.location.hostname.toLowerCase(),value));
            var isRootDomain = false;
            var p = value.split('.');
            var q = p.length;
            if (q == 2 || (q == 3 && p[1] === 'com')) {
                isRootDomain = true;
            }
            return (hostMatch && !isRootDomain);
          }

          function getPath() {
              var k = document.location.pathname;
              var l = k.lastIndexOf('/');
              var result = k.substring(0, l);
              if (result.length == 0) {
                return "/";
              }else{
                return result;
              }
          };

        var cookieStore = [];

        function isCookieExpired(cookieObj) {
              var l = typeof cookieObj[cookieNameMap.MaxAgeDate] == 'object';
              if (l && cookieObj[cookieNameMap.MaxAge] <= 0) {
                  return true
              } else {
                  if (l) {
                      return cookieObj[cookieNameMap.MaxAgeDate] < new Date()
                  } else {
                      if (typeof cookieObj[cookieNameMap.ExpiresDate] == 'object') {
                          return cookieObj[cookieNameMap.ExpiresDate] < new Date()
                      } else {
                          return false
                      }
                  }
              }
          };



        function getCookieStr() {
              var length = cookieStore.length,
              index = 0, item, result = [];
              for (; index < length; index ++) {
                  item = cookieStore[index];
                  if (!isCookieExpired(item)) {
                      result.push(item[cookieNameMap.Name] + '=' + item[cookieNameMap.Value])
                  }
              };
              return result.join('; ')
          };

         function updateAllCookie(cookieObj) {
              var length = cookieStore.length,
              index=0, item, result = [];
              for (; index < length; index ++) {
                  item = cookieStore[index];
                  if (!(item[cookieNameMap.Name] === cookieObj[cookieNameMap.Name] && item[cookieNameMap.Path] === cookieObj[cookieNameMap.Path] && item[cookieNameMap.Domain] === cookieObj[cookieNameMap.Domain])) {
                      result.push(item);
                  }
              };
              cookieStore = result;
          };

          function updateCookie(cookieObj) {
              //if path not match just return
              var cookiePath = cookieObj[cookieNameMap.Path];
              var isPrefixWithCookiePath = (hasPrefix(getPath(),cookiePath) || hasPrefix(document.location.pathname,cookiePath));
              if (!isPrefixWithCookiePath) {
                  return;
              }
              updateAllCookie(cookieObj);
              cookieStore.unshift(cookieObj);
          };


         function parseOthers(name, value, cookieObj) {
              var name = name.toLowerCase();
              var o;
              value = value.trim();
              switch (name) {
              case 'expires':
                  {
                      var date = new Date(value);
                      if (!isNaN(date.getTime())) {
                          cookieObj[cookieNameMap.ExpiresDate] = date;
                      }
                  };
                  break;
              case 'max-age':
                  {
                      if (!isNaN(value)) {
                          var p = Number(parseInt(value));
                          var q = new Date();
                          q.setTime(q.getTime() + p * 1000);
                          cookieObj[cookieNameMap.MaxAge] = p;
                          cookieObj[cookieNameMap.MaxAgeDate] = q
                      }
                  };
                  break;
              case 'domain':
                  {
                      hostName = document.location.hostname.toLowerCase();
                      if (idIPAddress(hostName)) {
                          cookieObj[cookieNameMap.Domain] = hostName;
                      } else {
                          if (value.length > 0) {
                              if (value.charAt(0) != '.') {
                                  value = '.' + value
                              };
                              if (isRegExp(hostName, value)) {
                                  var p = value.split('.');
                                  var q = p.length;
                                  if (q == 2 || (q == 3 && p[1] === 'com')) {
                                      cookieObj[cookieNameMap.Domain] = '.' + hostName
                                  } else {
                                      cookieObj[cookieNameMap.Domain] = value
                                  }
                              } else {
                                  cookieObj[cookieNameMap.Domain] = '.' + hostName
                              }
                          }
                      }
                  };
                  break;
              case 'path':
                  {
                      if (value.length == 0 || value.charAt(0) !== '/') {
                          cookieObj[cookieNameMap.Path] = getPath();
                      } else {
                          cookieObj[cookieNameMap.Path] = value;
                      }
                  };
                  break;
              case 'secure':
                  {
                      cookieObj[cookieNameMap.Secure] = true;
                  };
                  break;
              default:
                  {}
                  break
              }
          };

          function saveCookieOtherPart(cookie, cookieObj) {
              var name, value = '';
              var item;
              var length = cookie.length;
              for (var index = 0; index < length; index++) {
                  item = cookie[index];
                  var splitObj = item.split('=');
                  name = splitObj[0];
                  if (splitObj.length > 1) {
                      value = splitObj[1];
                  };
                  name = name.trim();
                  if (name.length == 0) {
                      continue
                  };
                  value = value.trim();
                  if (name.toLowerCase() === "httponly") {
                    return false;
                  }else if(name.toLowerCase() === "path"){
                    var isPrefixWithCookiePath = (hasPrefix(getPath(),value) || hasPrefix(document.location.pathname,value));
                    if (!isPrefixWithCookiePath) {
                      return false;
                    }else{
                      parseOthers(name, value, cookieObj);
                    }
                  }else if(name.toLowerCase() === "domain"){
                    if (!(domianMatch(value))) {
                       return false;
                    }else{
                       parseOthers(name, value, cookieObj);
                    }
                  }else{
                    parseOthers(name, value, cookieObj);
                  }
              };
              if (typeof cookieObj['domain'] == 'undefined') {
                  cookieObj['domain'] = document.location.hostname.toLowerCase()
              }
              return true;
          };

          function saveCookieNameAndValue(cookie, cookieObj) {
              cookie = cookie.trim();
              if (cookie.length <= 0) {
                  return false
              };
              var eq_idx = cookie.indexOf('=');
              // skip things that don't look like key=value
              if (eq_idx < 0) {
                return false;
              }
              var key = cookie.substr(0, eq_idx).trim();
              var val = cookie.substr(++eq_idx, cookie.length).trim();
              // quoted values
              if ('"' == val[0]) {
                val = val.slice(1, -1);
              }
              cookieObj[cookieNameMap.Name] = key;
              cookieObj[cookieNameMap.Value] = val;
              return true;
          }

          function saveCookieStr(cookieStr) {
              var hostname = document.location.hostname.toLowerCase(),cookie = {
                  name: '',
                  value: '',
                  secure: false,
                  httpOnly: false,
                  path:getPath(),
                  domain:hostname
              };
              var cookieSplit = cookieStr.split(';');
              if (cookieSplit.length > 0) {
                  var name = cookieSplit[0];
                  if (!saveCookieNameAndValue(name, cookie)) {
                      return null;
                  };
                  if (!saveCookieOtherPart(cookieSplit.slice(1, cookieSplit.length), cookie)) {
                      return null;
                  }
                  if (isCookieExpired(cookie)) {
                      updateAllCookie(cookie);
                  } else {
                      updateCookie(cookie);
                  };
                  return cookie;
              };
              return null
          };

        var getCookieSuc = false;
        function getCurrentCookie(){
          var protocol = document.location.protocol,host = document.location.host;
              if (protocol && host) {
                try{
                  doCookieSyncRequest(protocol + '//' + host + '/'+requestTK+'/?' + document.location.href);
                }catch(ex){

                }
              }
        };

        function doCookieSyncRequest(url) {
              var xmlHttprequest = new XMLHttpRequest();
              xmlHttprequest.open('GET', url, false);
              xmlHttprequest.setRequestHeader('Content-Type', "text/plain");
              xmlHttprequest.send(null); 
              if (xmlHttprequest.status == 200) {
                var result = xmlHttprequest.responseText;
                if ( !result || result.length == 0) {
                    return
                };
                try{
                  var cookieJSON = JSON.parse(result);
                  if (typeof cookieJSON === 'object') {
                      getCookieSuc = true;
                      saveCookies(cookieJSON);
                  }
                }catch(ex){

                }
              }    
          };


        function saveCookies(cookies) {
              cookieStore = [];
              var index = 0, 
              length = cookies.length,item;
              for ( ; index < length; index ++) {
                  item = cookies[index];
                  if (typeof item[cookieNameMap.ExpiresDate] != 'undefined') {
                      item[cookieNameMap.ExpiresDate] = new Date(item[cookieNameMap.ExpiresDate]);
                  };
                  cookieStore.push(item);
              }
          };

          function updateIfameCookie(message) {
              var iframes = document.querySelectorAll('iframe');
              if (!iframes) {
                  return
              };
              var length = iframes.length;
              var index;
              var iframe;
              if (length > 0) {
                  for (index = 0; index < length; index++) {
                      iframe = iframes[index];
                      iframe.contentWindow.postMessage(message, '*');
                  }
              }
          };

          function updateCookies(cookies,host){
            for(var i = 0;i < cookies.length; i++){
                 var item = cookies[i],domain;
                if (domianMatch(item[cookieNameMap.Domain])) {
                    updateCookie(item);
                }
            }
          }

          if (top != this) {
              window.addEventListener('message',function(event) {
                  var data = event['data'];
                  if (((typeof data) === 'object')) {
                      if (typeof data['host'] === 'string' &&  data['nebula_data']) {
                          updateCookies(data['nebula_data'], data['host']);
                          updateIfameCookie(data);
                          if (event.stopImmediatePropagation) {
                              event.stopImmediatePropagation();
                          };
                          return false
                      }
                }
              },true)
          } else {
            //use this function to update cookiess
            NebulaUpdateCookies = function(cookies,host,tk) {
                //native inject token and check this token for forbidden other one call this method
                if (ktnebula === tk) {
                    updateCookies(cookies,host);
                    var message = {};
                    message["host"] = host;
                    message["nebula_data"] = cookies;
                    updateIfameCookie(message);
                }         
            }
          };

          getCurrentCookie();

          if (getCookieSuc) {
            Object.defineProperty(document, 'cookie', {
                get: function() {
                    var cookieStr = getCookieStr();
                    return cookieStr;
                },
                set: function(cookieStr) {
                    if (typeof cookieStr !== 'string') {
                        return
                    };
                    saveCookieStr(cookieStr);
                    var message = {};
                    message[msgType] = "cookie";
                    message["cookie"] = cookieStr;
                    message["url"] = document.location.href;
                    message["msgKt"] = ktnebula;
                    //iOS 10 and iOS 11 if call this on unload event,window.webkit can be null
                    if (webkit && webkit.messageHandlers && webkit.messageHandlers.PSDXMLHTTPREQUESTMESSAGE && webkit.messageHandlers.PSDXMLHTTPREQUESTMESSAGE.postMessage) {
                        safeCallMessage(message);
                    }
                },
                configurable: false
            });
          }   

      } 
    }
    /**********************Util************************/
    function getAllHTMLFormData(element, fromAjax){
        var result = [];
        if (element.nodeName.toLowerCase() == "form") {
            var serializeResult = NebulaSerialize(element, { hash: true , empty: true });
            var inputs = [].slice.call(element.querySelectorAll('input'));
            for(var i = 0; i < inputs.length ; i++){
                var field = inputs[i];
                var type = field.type, name = field.name;
              if(type == 'file' && field.files && field.files.length > 0){
                var filesLength = field.files.length;
                for(var j = 0; j < filesLength; j++){
                    //if get file data
                    if ((element.enctype.toLowerCase() == "application/x-www-form-urlencoded" || element.enctype.toLowerCase() == "text/plain") && !fromAjax) {
                        result.push({"name" : name, "value" : field.files[j].name});
                    }else if (formElemntList[name] && formElemntList[name][j]) {
                        result.push({"name" : name, "value" : formElemntList[name][j]});
                    }else{
                        result.push({"name" : name, "value" : field.files[j]});
                    }
                }
              }
            }
            for(var key in serializeResult){
                if (serializeResult.hasOwnProperty(key)) {
                    result.push({"name" : key, "value" : serializeResult[key]});
                }
            }
        }
        return  result;    
    }

    function serializeFormData(data) {
        return new Promise(function (resolve, reject) {
            var dataVal = data["value"];
            if (typeof(dataVal) === "string") {
                resolve(data);
            }else if(dataVal instanceof Blob || dataVal instanceof File){
                var reader = new FileReader();
                reader.onload = function (event) {
                    var result = event.target.result;
                    if (result.length > 0) {
                        data["value"] = result;
                        resolve(data);
                    }else{
                        reject(new Error(""));
                    }
                }
                reader.onerror = function(){
                    reject(new Error(""));
                }
                reader.onabort = function(){
                    reject(new Error(""));
                }
                reader.readAsDataURL(dataVal);
            }else{
                resolve(data);
            }
        });
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

    var serializeData = function(data,callback){
        var reader = new FileReader();
        reader.onload = function (event) {
            var result = event.target.result;
            callback(result);
        }
        reader.readAsDataURL(data);
    }

    function recordError(error){
        if (error instanceof Error) {
            var message = {};
            message[msgType] = "error";
            message["errorInfo"] = error.message;
            message["msgKt"] = ktnebula;
            safeCallMessage(message);
        }
    }

    function isFormUseGetMethod(element){
    		var item = element;
    		if (item && item.nodeName && (typeof item.nodeName === "string") && item.nodeName.toLowerCase() == "form") {
    			var methodStr = item.method;
    	        if (typeof methodStr !== "string") {
    	        	methodStr = item.getAttribute("method");
    	        }
    	        if (methodStr && methodStr.toLowerCase() === "get") {
    	            return true;
    	        }
    		}
        return false;
    }

    function generateFormTargetUrlWithRadom(url,radom){
      var urlParse = document.createElement('a');
      urlParse.href = url;
      var originUrlSearch = urlParse.search ? urlParse.search : "";
      var originUrlHash = urlParse.hash ? urlParse.hash : "";
      if (!/X-NEBULAXMLHTTPREQUEST/.test(url)) {
          if (urlParse.search && urlParse.search.length > 0) {
              var hrefSearch =  urlParse.search;
              if (/X-NEBULAXMLHTTPREQUEST/.test(hrefSearch)) {
                urlParse.search = hrefSearch.replace(/X-NEBULAXMLHTTPREQUEST=(\d+)/,"X-NEBULAXMLHTTPREQUEST="+radom);
              }else{
                urlParse.search = hrefSearch + "&X-NEBULAXMLHTTPREQUEST="+radom;
              }
          }else{
              urlParse.search = "?X-NEBULAXMLHTTPREQUEST="+radom;
          }
      }else{
          urlParse.search = urlParse.search.replace(/X-NEBULAXMLHTTPREQUEST=(\d+)/,"X-NEBULAXMLHTTPREQUEST="+radom);
      }
 
      var path = url.replace(originUrlSearch,"").replace(originUrlHash,"");
      if (path.trim() === '#') {
          path='';
      }
 
      return {targetUrl:path+urlParse.search+urlParse.hash,fullTargetUrl:urlParse.href};
    }

    function addFormExtraInfoWithElement(element){
        var item = element;
        if (isFormUseGetMethod(item)) {
        	return;
        }
        var radom = (+new Date()) +""+ Math.round((Math.random()*(100000)));
        //change form element method url for inject
        var methodUrl = item.getAttribute("action");
        if (!methodUrl) {
            methodUrl = "";
        }
        //if has no param add flag
        var urlObj = generateFormTargetUrlWithRadom(methodUrl,radom);
        item.setAttribute("action", urlObj.targetUrl);
        item.setAttribute("data-fullactionurl", urlObj.fullTargetUrl);
        item.setAttribute("data-nebulaId",radom);   
    }

    

    /**********************FormData************************/

    var  FakeFormData = (function(fn){
    window.originFormData = fn;
        return function(form){
            this.realFormData = new fn(form);  
            if (form) {
               this.targetForm = form; 
            }
            this.appendData = [];
        }
    })(FormData);

    FakeFormData.prototype.constructor = window.originFormData;
    FakeFormData.prototype.append = function(name, value, filename){
        var filenameInValue = (value!=undefined ? value.name : undefined);
        this.appendData.push({"name":name,"value":value,"fileName":filename||filenameInValue});
        //this.realFormData.append(name,value,filename);
    }

    FormData = FakeFormData;

    /**********************Message************************/
    var messageList = {};
    var msgId = "msgId",
    msgCookie = "msgCookie",
    msgMainUrl = "msgMainUrl",
    msgRequestUrl = "msgRequestUrl",
    msgKt = "msgKt",
    msgVal = "val", 
    msgType = 'type',
    msgEnctype = 'FormEnctype',
    msgAcceptCharset = "AcceptCharset",
    msgErrorMessage = "errorMessage",
    msgDocumentCharset = "DocumentCharset",
    msgIsStream = "IsStream";
    var NEBULAXMLHTTPREQUESTMESSAGEHANDLER = {
        cacheMessage:function(xmlhttprequest, callFn, args, msgId, kt){
          if (ktnebula === kt) {
            messageList[msgId] = {
                msgId:msgId,
                callBack:function(){
                    var that = xmlhttprequest;
                    try{
                        return callFn.apply(that, args);
                    }catch(ex){
                        recordError(ex);
                    }
                }
            };
            //if mainProcess message not come back deply 500ms do really call
            setTimeout(function(){
                NEBULAXMLHTTPREQUESTMESSAGEHANDLER.triggerMessageCallBack(msgId, kt);
            },500);
          }
        },
        triggerMessageCallBack:function(msgId, kt){
          if (ktnebula === kt) {
           if (messageList[msgId]){
               messageList[msgId]["callBack"]();
               delete  messageList[msgId];
            }
          }
        },
        addFormExtraInfoToElement:function(target, kt){
          if (ktnebula === kt) {
            var message = {};
            message[msgType] = "FormElement";
            message[msgKt] = kt;
            var element = getFormWithElement(target ? target : document.activeElement);
            //if is get request we should not send message to main process
            if (isFormUseGetMethod(element)) {
                return;
            }
            if (element) {
            	var dataNebulaId = element.getAttribute("data-nebulaId");
                var requestUrl = element.getAttribute("data-fullactionurl");
                var datas = getAllHTMLFormData(element,false);
                Promise.all(datas.map(function(data){
                    return serializeFormData(data);
                })).then(function (value) {
                	message[msgId] = dataNebulaId;
                    message[msgVal] = value;
                    message[msgType] = "FormElement";
                    message[msgEnctype] = element.enctype;
                    message[msgAcceptCharset] = element.acceptCharset;
                    message[msgDocumentCharset] = document.charset;
                    message[msgRequestUrl] = requestUrl;
                    safeCallMessage(message);
                }).catch(function(error){
                    recordError(error);
                }); 
                return  dataNebulaId;
            }
          }
        },
        updateCookies:NebulaUpdateCookies
    }

    window.NebulaXMLHttpRequestMessageBridge = NEBULAXMLHTTPREQUESTMESSAGEHANDLER;
    Object.freeze(window.NebulaXMLHttpRequestMessageBridge);
    Object.defineProperty(window,"NebulaXMLHttpRequestMessageBridge",{configurable:false,writable:false});

    /**********************XMLHttpRequest************************/
    // ReWrite send method
    // https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest
    // void send();
    // void send(ArrayBuffer data);
    // void send(Blob data);
    // void send(Document data);
    // void send(DOMString? data);
    // void send(FormData data);
    //if should stop request inject
    var generateTargetHash = function(hash){
      return "^^^^"+ hash +"^^^^";
    }

    var hashRegExp = /\^\^\^\^(\d+)\^\^\^\^/;
    function generateTargetUrlWithRadom(url,radom){
      var urlParse = document.createElement('a');
      urlParse.href = url;
      var originHash = urlParse.hash ? urlParse.hash : "";
      if (!hashRegExp.test(urlParse.hash)) {
          if (urlParse.hash && urlParse.hash.length > 0) {
              urlParse.hash = urlParse.hash + generateTargetHash(radom);
          }else{
              urlParse.hash = generateTargetHash(radom);
          }
      }else{
          urlParse.hash = urlParse.hash.replace(hashRegExp, generateTargetHash(radom));
      }

      var urlWithoutHash = url.replace(originHash,"");
      if (urlWithoutHash.trim() === '#') {
          urlWithoutHash ='';
      }

      return {targetUrl:urlWithoutHash + urlParse.hash,fullTargetUrl:urlParse.href};
    }

    var HttpMethods = ['POST', 'PUT', 'PATCH', 'DELETE', 'COPY', 'OPTIONS', 'LINK', 'UNLINK', 'PURGE','TRACE','LOCK', 'UNLOCK', 'VIEW', 'PROPFIND']
    var isTargetHttpMethod = function(method){
        if (typeof method == "string") {
          if (HttpMethods.indexOf(method.toUpperCase()) == -1) {
            return false;
          }else{
            return true;
          }
        }
        return false;
    }

    XMLHttpRequest.prototype.open = (function(fn) {
        return function(method, url, async, username, password) {
            var args = [].slice.call(arguments);
            var requestAsync = true;
            if (args.length > 2) {
                  requestAsync = !!args[2];
            }
            this.requestAsync = requestAsync;
            var radom = (+new Date()) +""+Math.round((Math.random()*(100000)));
            this.requestId = radom;
            var fullUrl = "";
            if (method && isTargetHttpMethod(method)) {
                var urlObj = generateTargetUrlWithRadom(url,radom);
                url = urlObj.targetUrl;
                fullUrl = urlObj.fullTargetUrl;
            }
            this.requestUrl = fullUrl;
            args[1] = url;
            return fn.apply(this, args);
        }
    })(XMLHttpRequest.prototype.open);

    //XMLHttpRequest rewrite send method
    XMLHttpRequest.prototype.send = (function(fn) {
        return function(e) {

            var radom = this.requestId;
            var message = {};
            var that = this;
            var args = [].slice.call(arguments);
            message[msgId] = radom;
            message[msgKt] = ktnebula;
            message[msgMainUrl] = document.location.href;
            message[msgRequestUrl] = this.requestUrl;
            //if sync request
            if (!e) {
                return fn.apply(this,args);
            }else if (typeof(e) === 'string' && e.length > 0) {
                message[msgVal] = e;
                message[msgType] = "String";
                safeCallMessage(message);
            } else if(e instanceof Blob){
                message[msgType] = "Blob";
                if (this.requestAsync) {
                   serializeData(e,function(result){
                        message[msgVal] = result;
                        safeCallMessage(message);
                        NEBULAXMLHTTPREQUESTMESSAGEHANDLER.cacheMessage(that,fn,args,radom,ktnebula);
                    });
                    return;
                }else{
                    message["error"] = "NOTSUPPORT";
                    safeCallMessage(message);
                }
            } else if(e instanceof FormData){
                message[msgType] = "FormData";
                if (this.requestAsync) {
                    message[msgType] = "FormData";
                    var datas = e.appendData;
                    if (e.targetForm) {
                        datas = datas.concat(getAllHTMLFormData(e.targetForm,true));
                    }
                    Promise.all(datas.map(function(data){
                        return serializeFormData(data);
                    })).then(function (value) {
                        message[msgVal] = value;
                        safeCallMessage(message);
                        NEBULAXMLHTTPREQUESTMESSAGEHANDLER.cacheMessage(that,fn,e.realFormData,radom,ktnebula);
                    }).catch(function(error){
                        recordError(error);
                    })
                    return;
                }else{
                    message["error"] = "NOTSUPPORT";
                    safeCallMessage(message);
                }
            } else if(e.nodeType){
                message[msgType] = "Document";
                if (e === document) {
                   message[msgVal] = (new XMLSerializer()).serializeToString(document);
                }else{
                   message[msgVal] = e.toString();
                }
                safeCallMessage(message);
            } else if(e instanceof ArrayBuffer){
                //transfor ArrayBuffer to base64
                message[msgVal] = arrayBufferToBase64(e);
                message[msgType] = "ArrayBuffer";
                safeCallMessage(message);
            } else if(e.buffer){
                message[msgVal] = arrayBufferToBase64(e.buffer);
                message[msgType] = "ArrayBuffer";
                safeCallMessage(message);
            } else {
                return fn.apply(this,args);
            }

            if (this.requestAsync) {
                return NEBULAXMLHTTPREQUESTMESSAGEHANDLER.cacheMessage(that,fn,args,radom,ktnebula);
            }else{
                return fn.apply(this,args);
            }
        }
    })(XMLHttpRequest.prototype.send);

    /**********************FormElement************************/
    var formElemntList = {};
    window.lastClickElement = null;
    function getFormWithElement(element){
        if (element && element.nodeType) {
            var parentNode = element;
            while (parentNode) {
                if (parentNode.nodeName.toLowerCase() === "form") {
                    return parentNode;
                } else if (parentNode === document || parentNode === document.documentElement || parentNode === document.body) {
                    break;
                }
                parentNode = parentNode.parentNode;
            }
            return null;
        }
    }

    document.addEventListener("DOMContentLoaded",function(){
        //inject a hidden input to form element
        // addFormExtraInfoToElement();
        //add input file change  and read file data
        document.addEventListener("change",function(e){
            var targetElement = e.target;
            if (targetElement.nodeName && targetElement.nodeName.toLowerCase() && targetElement.type && targetElement.type === "file") {
               var that = targetElement;
               for(var i = 0; i < that.files.length; i++){
                   (function(fileItem){
                        serializeFormData({name:that.name, value:fileItem}).then(function(value ){
                            //we save files in array
                            if (!formElemntList[that.name]) {
                                formElemntList[that.name] = [];
                            }
                            formElemntList[that.name].push({name:that.name,value:value["value"],fileName:fileItem.name});
                       }).catch(function(error){
                            recordError(error);
                       });
                   })(that.files[i])
               }
            }
        },false);

        document.addEventListener("click",function(e){
            window.lastClickElement = e.target;
        },true);
    },false);

    //before form form submit to add extraInfo
    document.addEventListener("submit",function(e){
        if (e.target &&  e.target.nodeName && typeof e.target.nodeName === "string" && e.target.nodeName.toLowerCase() == "form") {
          addFormExtraInfoWithElement(e.target);
          NEBULAXMLHTTPREQUESTMESSAGEHANDLER.addFormExtraInfoToElement(e.target,ktnebula);
        }
    },true);

    HTMLFormElement.prototype.submit = (function(fn){
        return function(){
            //if submit from js method, we send method to main process
            var that = this;
            var args = [].slice.call(arguments);
            var datas = getAllHTMLFormData(this,false);
            var message = {};
            //for dynamic form
            addFormExtraInfoWithElement(this);
            window.lastClickElement = this;
            NEBULAXMLHTTPREQUESTMESSAGEHANDLER.addFormExtraInfoToElement(this,ktnebula);
            fn.apply(that,args);
        }
    })(HTMLFormElement.prototype.submit);
})();

})();
