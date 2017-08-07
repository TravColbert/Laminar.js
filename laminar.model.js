/**
 * @author Travis Colbert trav.colbert@gmail.com
 */

"use strict";

var Laminar = Laminar || {};

Laminar.createModel = function(obj,handlerFunctionObj) {
  var handlerFunctionProperty = "handlerFunctions";
  var handlerFunctionSuffix = "HandlerFunctions";
  var makeProxyHandlerObj = function(handlerFunctionObj) {
    handlerFunctionObj = handlerFunctionObj || {};

    var proxyHandler = {
      get: function(target,property) {
        var thisHandler = "get";
        var value = (property in target) ? target[property] : false;
        for(var f in this[handlerFunctionProperty][thisHandler + handlerFunctionSuffix]) {
          value = this[handlerFunctionProperty][thisHandler + handlerFunctionSuffix][f](target,property,value);
        }
        return value;
      },
      set: function(target,property,value,receiver) {
        var thisHandler = "set";
        //console.log("proxyHandler:",thisHandler,":Invoking handlers on target:",target,"property:",property,"value",value);
        //console.log(JSON.stringify(target));
        for(var f in this[handlerFunctionProperty][thisHandler + handlerFunctionSuffix]) {
          console.log("proxyHandler:",thisHandler,":function #",f);
          value = this[handlerFunctionProperty][thisHandler + handlerFunctionSuffix][f](target,property,value,receiver);
        }
        var result = (target[property] = value) ? true : false;
        console.log("proxyHandler:" + thisHandler + ": Result of SET operation is",result);
        console.log(JSON.stringify(target));
        //this.change(target,property);
        return result;
      },
      change: function(target,property) {
        var thisHandler = "change";
        for(var f in this[handlerFunctionProperty][thisHandler + handlerFunctionSuffix]) {
          this[handlerFunctionProperty][thisHandler + handlerFunctionSuffix][f](target,property);
        }
        return;
      },
      handlerFunctions: handlerFunctionObj
    };

    if(!proxyHandler.hasOwnProperty(handlerFunctionProperty)) {
      Object.defineProperty(
        proxyHandler,
        handlerFunctionProperty,
        {
          configurable:false,
          enumerable:false,
          value:handlerFunctionObj
        }
      );
    }

    if(!handlerFunctionObj.hasOwnProperty("addHandler")) {
      Object.defineProperty(
        handlerFunctionObj,
        "addHandler",
        {
          configurable:false,
          enumerable:false,
          value:function(type,func) {
            console.log("createModel: Adding handler: " + type + handlerFunctionSuffix);
            if(!this.hasOwnProperty(type + handlerFunctionSuffix)) return;
            this[type + handlerFunctionSuffix].push(func);
          }
        }
      );
    };

    for(var handler in proxyHandler) {
      if(!proxyHandler.hasOwnProperty(handler) || handler==handlerFunctionProperty) continue;
      if(proxyHandler.handlerFunctions.hasOwnProperty(handler + handlerFunctionSuffix)) continue;
      console.log("createModel: Creating empty function array for " + handler + " at: " + handler + handlerFunctionSuffix);
      Object.defineProperty(
        proxyHandler.handlerFunctions,
        handler + handlerFunctionSuffix,
        {
          configurable:false,
          enumerable:false,
          value:[]
        }
      );
    }
    return proxyHandler;
  }

  handlerFunctionObj = handlerFunctionObj || {};
  obj = obj || {};
  var proxyHandlerObj = makeProxyHandlerObj(handlerFunctionObj);

  return new Proxy(obj,proxyHandlerObj);
}