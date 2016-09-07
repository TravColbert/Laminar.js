/**
 * @author Travis Colbert trav.colbert@gmail.com
 */

"use strict";

var Laminar = Laminar || {};

Laminar.Widget = (function(){
  /**
   * The default class that will be added to every Laminar Widget object
   * @type String
   */
  var defaultElementClass = "lm";
  var defaultElementType = "div";
  /**
   * Find any element in the DOM
   *
   * @param {String} selector The DOM selector string to look for or blank to
   * search the whole document body.
   *
   * @returns {Object} A DOM object
   */
  var _findElement = function(selector) {
    selector = selector || "body";
    return document.querySelector(selector);
  }
  /**
   * If there is an element with the same ID specified in the configObj then
   * remove that DOM element so that a new one canbe created.
   *
   * @private
   * @param {Object} configObj The configuration object
   */
  var _clobber = function(configObj) {
    if(configObj.hasOwnProperty("clobber")) {
      if(configObj.hasOwnProperty("id")) {
        var theElement = document.querySelector("#" + configObj.id);
        if(theElement) {
          theElement.parentNode.removeChild(theElement);
          return true;
        }
      }
    }
    return false;
  };

  var _gobble = function(domObj) {
    var attributeList = domObj.attributes;
    var widgetConfigObj = {};
    for(var count=0;count<attributeList.length;count++) {
      widgetConfigObj[attributeList[count]["name"]] = attributeList[count]["value"];
    }
    widgetConfigObj["element"] = domObj["tagName"];
    widgetConfigObj["content"] = domObj.innerHTML || '';
    var parentID = domObj.parentNode.getAttribute("id");
    widgetConfigObj["parent"] = (parentID) ? "#" + parentID : "body";
    if(widgetConfigObj.hasOwnProperty("class")) {
      widgetConfigObj.classlist = widgetConfigObj.class.split(" ");
    }
    widgetConfigObj.clobber = true;
    return widgetConfigObj;
  }

  /**
   * @constructor
   *
   * The constructor accepts a configObj also a DOM object. If a DOM object is
   * passed then the DOM object is 'gobbled' into the Laminar Object.
   *
   * @property {object} configObj   The configuration object
   */
  function Widget(configObj) {
    if(configObj.nodeType) {
      configObj = _gobble(configObj);
      _clobber(configObj);
    }
    this.element = configObj.element || defaultElementType;
    this.parent = configObj.parent || "body";
    this.events = {};
    this.subscriptions = [];
    this.states = [];

    if(configObj) {
      if(configObj.hasOwnProperty("id")) {
        //_clobber(configObj);
        //if(configObj.hasOwnProperty("element")) this.element = configObj.element;
        this.object = document.createElement(this.element);
        if(configObj.hasOwnProperty("id")) this.set("id",configObj.id);
      }
      if(configObj.hasOwnProperty("type")) this.set("type",configObj.type);
      //if(configObj.hasOwnProperty("parent")) this.parent=configObj.parent;
      this.addClass(defaultElementClass);
      if(configObj.hasOwnProperty("classlist")) this.addClasses(configObj.classlist);
      if(configObj.hasOwnProperty("content")) this.content(configObj.content);
      if(configObj.hasOwnProperty("value")) this.set("value",configObj.value);
      if(configObj.hasOwnProperty("proplist")) this.setProps(configObj["proplist"]);
      if(configObj.hasOwnProperty("states")) {
        this.states = configObj["states"];
        this.setState();
      }
    }
  };

  /**
   * Set or add an HTML attribute.
   *
   * HTML attributes are like this button: <button disabled="disabled">Disabled Button</button>.
   * The 'disabled' is an attribute.
   *
   * @param {string} attrib The HTML attribute to set
   * @param {string} val  The new value of the attribute
   * @returns {Object} The Laminar Widget object
   */
  Widget.prototype.set = function(attrib,val) {
    if(attrib=="value" && this.element.toLowerCase()=="input") return this.setValue(val);
    this.object.setAttribute(attrib,val);
    return this;
  };

  /**
   * Set an input's value
   *
   * @param {string} val The value to put into the input
   * @returns {Object} The Laminar Widet object
   */
  Widget.prototype.setValue = function(val) {
    this.object.value = val;
    return this;
  };

  /**
   * Get the value of an HTML attribute.
   *
   * @param {string} attrib The HTML attribute
   * @returns {string} The value of the HTML attribute
   */
  Widget.prototype.get = function(attrib) {
    if(attrib=="value" && this.element.toLowerCase()=="input") return this.object.value;
    return this.object.getAttribute(attrib);
  };

  /**
   * Get the value of an HTML input
   *
   * @returns {string} The value of the HTML attribute
   */
  Widget.prototype.value = function() {
    return this.get("value");
  };

  /**
   * Find children of this DOM element
   *
   * Use an optional CSS selector to narrow-down the number of children
   *
   * @param {string} selector The (optional) CSS selector
   * @returns {Object} The Laminar Widget object
   */
  Widget.prototype.findChildren = function(selector) {
    if(selector === null || selector === undefined) return this.object.children;
    return this.object.querySelectorAll(selector);
  };

  /**
   * Remove this element from the DOM
   *
   * The removed object is stil in memory just no longer in the DOM
   *
   * @returns {Object} This removed Laminar Widget object
   */
  Widget.prototype.remove = function() {
    return this.object.parentNode.removeChild(this.object);
  };

  /**
   * Remove a child element from the DOM
   *
   * @param {String} selector   A selector of elements to remove
   * @returns {Object} The Laminar widget
   */
  Widget.prototype.removeChild = function(childSelector) {
    this.object.removeChild(this.find(childSelector));
    return this;
  };

  /**
   * Sets HTML properties of a DOM element
   *
   * Format is:
   * [
   *  [propertyname, propertyvalue],
   *  [propertyname, propertyvalue],
   *  ...
   * ]
   *
   * @param {Array} List of property/value pairs
   */
  Widget.prototype.setProps = function(props) {
    if(props===null || props===undefined || props.length<1) return false;
    props.forEach(function(e,i,a) {
      if (e[0]!==undefined) this.set(e[0],e[1]);
    }.bind(this));
  };

  /**
   * Returns a propery value
   *
   * @param {string} prop The property to return
   * @returns {string} The property value
   */
  Widget.prototype.getProp = function(prop) {
    return this.object[prop] || false;
  };

  Widget.prototype.getAttributes = function() {
    var attrs = this.getProp("attributes");
    var attrList = {};
    for(var count=0;count<attrs.length;count++) {
      attrList[attrs[count].name] = attrs[count].value;
    }
    return attrList;
  };

  Widget.prototype.getId = function() {
    return this.getProp("id");
  };

  Widget.prototype.getTagName = function() {
    return this.getProp("tagName");
  };

  Widget.prototype.getClassList = function() {
    return this.getProp("classList");
  }
  /**
   * Return the position of the LEFT side of this widget
   *
   * @returns {number} The pixels of the left side of the widget
   */
  Widget.prototype.getLeft = function() {
    return this.object.offsetLeft;
  };
  /**
   * Return the position of the TOP side of this widget
   *
   * @returns {number} The pixels of the top side of the widget
   */
  Widget.prototype.getTop = function() {
    return this.object.offsetTop;
  };
  /**
   * Return the position of this widget (left,top)
   *
   * @returns {Object} The pixels of the top and left side of the widget
   */
  Widget.prototype.getPosition = function() {
    return {left: this.getLeft(), top: this.getTop()}
  };
  Widget.prototype.getHeight = function() {
    return this.object.offsetHeight;
  };
  Widget.prototype.getWidth = function() {
    return this.object.offsetWidth;
  };
  /**
   * Remove a class from the widget's classlist
   *
   * @param {String} classname  The name of the class to remove
   * @return {Object}  This Laminar widget
   */
  Widget.prototype.removeClass = function(classname) {
    this.object.classList.remove(classname);
    return this;
  };
  /**
   * Add a classname to this widget
   *
   * @param {string} classname - the class name to add
   */
  Widget.prototype.addClass = function(classname) {
    if (this.object.classList) {
      this.object.classList.add(classname);
    } else {
      this.object.classname += ' ' + classname;
    }
    return this;
  };
  /**
   * Adds an array of classnames to this widget
   *
   * @param {Array} classlist An array list of classnames to add
   * @returns {Object}  This Laminar widget
   */
  Widget.prototype.addClasses = function(classlist) {
    for(var c in classlist) this.addClass(classlist[c]);
    return this;
  };

  // STATE MANAGEMENT //
  /**
   * Sets the 'state' of a widget to one of only a set of pre-defined class
   * names
   *
   * @param {String} string A name of a predefined state
   * @returns {Object}  This Laminar widget
   */
  Widget.prototype.setState = function(state) {
    if(state===undefined || state===null) {
      state = (this.states.length>0) ? this.states[0] : null;
    }

    var statePosition = this.states.indexOf(state);
    if(this.states.length>0 && statePosition>-1) {
      this.addClass(state);
      for(var i=0;i<this.states.length;i++) {
        if(i!=statePosition) this.removeClass(this.states[i]);
      }
    }
    return this;
  }

  Widget.prototype.setNextState = function() {
    var statePosition = this.states.indexOf(this.getState());
    if(++statePosition==this.states.length) statePosition=0;
    this.setState(this.states[statePosition]);
    return this;
  }

  Widget.prototype.setPrevState = function() {
    var statePosition = this.states.indexOf(this.getState());
    if(--statePosition<0) statePosition=(this.states.length-1);
    this.setState(this.states[statePosition]);
    return this;
  }

  Widget.prototype.getState = function() {
    for(var i=0;i<this.states.length;i++) {
      if(this.hasClass(this.states[i])) return this.states[i];
    }
    return false;
  }


  /**
   * Checks for the existence of 'classname' in this widget's class list
   *
   * @param {String} classname  The class name to look for
   * @returns {String}  The name of the class or 'false'
   */
  Widget.prototype.hasClass = function(classname) {
    if(this.object.classList) return this.object.classList.contains(classname);
    return false;
  };
  Widget.prototype.toggleClass = function(classname) {
    this.object.classList.toggle(classname);
    return this;
  };

  /**
   * Manipulate the CSS for an element
   *
   * @param {string} prop The CSS attribute to change
   * @param {string} val  The CSS attribute value
   * @return {Object} This Laminar Widget object
   */
  Widget.prototype.css = function(prop,val) {
    this.object.style[prop] = val;
    return this;
  };
  /** Hide element in the DOM */
  Widget.prototype.hide = function() {
    this.css("display","none");
    return this;
  };
  /** Show an element in the DOM */
  Widget.prototype.show = function() {
    this.css("display","");
    return this;
  };
  /**
   * Adds HTML content AFTER the widget
   *
   * @param {String} content  The HTML content to add
   * @returns {Object}   The Waminar widget
   */
  Widget.prototype.after = function(content) {
    this.object.insertAdjacentHTML('afterend',content);
    return this;
  };
  /**
   * Adds HTML content BEFORE the widget
   *
   * @param {String} content  The HTML content to add
   * @returns {Object}   The Laminar widget
   */
  Widget.prototype.prepend = function(content) {
    this.object.insertAdjacentHTML('afterbegin',content);
    return this;
  };
  /**
   * Adds HTML content at the end of the widget's content
   *
   * @param {String} content  The HTML content to add
   * @returns {Object}    The Laminar widget
   */
  Widget.prototype.append = function(content) {
    this.object.insertAdjacentHTML("beforeend",content);
    return this;
  };
  /**
   * Adds HTML content at the beginning of the widget's content
   *
   * @parem {String} content  The HTML content to add
   * @returns {Object}    The Laminar widget
   */
  Widget.prototype.before = function(content) {
    this.object.insertAdjacentHTML('beforebegin',content);
    return this;
  };
  /**
   * Returns this widget's DOM children
   *
   * @returns {HTMLCollection}  Child elements of this node
   */
  Widget.prototype.children = function() {
    return this.object.children;
  };
  /**
   * Clears the contents of the widget.
   *
   * If the widget is of a type INPUT then the VALUE is cleared.
   *
   * @returns {Object} This Laminar widget
   */
  Widget.prototype.empty = function() {
    if(this.element.toLowerCase()=="input") {
      this.object.value = '';
    } else {
      this.object.innerHTML = '';
    }
    return this;
  };

  /**
   * Appends content into the DOM element
   * If the content is an array, each element is appended.
   * If the content is a Laminar Widget then the widget is inserted into this.
   * Otherwise, the content is appended to this.
   *
   * @param content The content to insert
   * @returns {Object} The Laminar widget
   */
  Widget.prototype.content = function(content) {
    if(Array.isArray(content)) {
      for(var i=0;i<content.length;i++) this.content(content[i]);
    } else if(content instanceof Laminar.Widget) {
      content.parent = this.object.id;
      this.object.appendChild(content.object);
    } else {
      this.object.insertAdjacentHTML("beforeend",content);
    }
    return this;
  };

  /**
   * Appends HTML content into the DOM element or returns the content
   *
   * @param {String} content  The HTML content to insert
   * @returns {Object} The Laminar widget or the HTML content
   */
  Widget.prototype.html = function(content) {
    if(content === null || content === undefined) return this.object.innerHTML;
    this.object.innerHTML = content;
    return this;
  };

  /**
   * Write the object to the DOM
   *
   * @returns {Object} This Laminar widget
   */
  Widget.prototype.update = function() {
    if(this.parent !== null) {
      var foundObject = _findElement(this.parent);
      if(foundObject) foundObject.appendChild(this.object);
    }
    return this;
  }

  Widget.prototype.setEvent = function(e, func) {
    if(typeof(func)!=="function") return this;
    this.events[e] = func;
    this.object.addEventListener(e,function(e){
      this.events[e.type](e, this);
    }.bind(this));
    return this;
  };

  Widget.prototype.subscribe = function(obj,evnt,func) {
    var setSubscribe = function(obj,evnt,func) {
      var token = obj.subscribe(evnt,func);
      if(token) {
        return {event:evnt, token:token, obj:obj};
        //this.subscriptions.push({event:evnt, token:token, obj:obj});
        //return this;
      }
      //return false;
    }

    if(Array.isArray(evnt)) {
      for(var i in evnt) {
        this.subscriptions.push(setSubscribe(obj,evnt[i],func));
      }
    } else {
      this.subscriptions.push(setSubscribe(obj,evnt,func));
    }
  };

  Widget.prototype.getSubscription = function(obj,evnt) {
    for(var count in this.subscriptions) {
      if(this.subscriptions[count].event == evnt && this.subscriptions[count].obj == obj)
        return this.subscriptions[count].token;
    }
    return false;
  };

  Widget.prototype.unsubscribe = function(obj, evnt) {
    var token = this.getSubscription(obj,evnt);
    if(token) {
      return obj.unsubscribe(token);
    }
  };

  return Widget;
})();

Laminar.Model = (function() {
  //"use strict";

  var defaultType = 'string';
  var defaultIndex = 0;
  var queryRe = /[=<>]=/;
  var isQuery = function(string) {
    return queryRe.test(string);
  }

  var allKeysPresent = function(obj) {
    var keys = ["key","value"];
    for(var key in keys) {
      if(!obj.hasOwnProperty(keys[key])) return false;
    };
    return true;
  }

  function Model(k, v, t) {
    if(typeof(k)=='object') {
      if(!allKeysPresent(k)) return false;
      if(k.hasOwnProperty("index")) var i = k.index;
      if(k.hasOwnProperty("type")) t = k.type;
      v = k.value;
      k = k.key;
    };
    this.key = k || '';
    this.index = i || defaultIndex;
    this.value = [];
    this.type = t || defaultType;
    this.events = {};
    this.eventId = -1;
    if(v!==undefined) {
      if(!Array.isArray(v)) v = [v];
      for(var count=0;count<v.length;count++) {
        if(typeof(v[count])=='object' && allKeysPresent(v[count])) {
          //debugBox.append("\nAdding new object (" + count + "): " + v[count]);
          this.add(new Laminar.Model(v[count]));
        } else {
          //debugBox.append("\nAdding value (" + count + "): " + v[count]);
          //this.value = [v[count]];
          this.value.push(v[count]);
        }
      }
    } else {
      //debugBox.append("\nAdding empty value (" + count + ")");
      this.value = [];
    }
    //this.value = (allKeysPresent(v)) ? [new Laminar.Model(v)] : [v]
    //this.value = (v!==undefined) ? [v] : [];
  };

  Model.prototype.getIndex = function() {
    return this.index;
  };
  Model.prototype.getAddress = function() {
    if(this.hasOwnProperty("parent")) {
      var parentAddress = this.parent.getAddress();
      parentAddress.push(this.getIndex());
      return parentAddress;
    }
    return [this.getIndex()];
  };
  Model.prototype.setKey = function(string) {
    return this.key=string;
  };
  Model.prototype.getKey = function() {
    return this.key;
  }
  Model.prototype.setType = function(type) {
    return this.type = type || defaultType;
  };
  Model.prototype.getType = function() {
    return this.type;
  }
  Model.prototype.read = function(index) {
    if(index!==null || index!==undefined) if(this.value[index]) return this.value[index];
    return this.value;
  };
  Model.prototype.count = function() {
    var count = this.read().length;
    for(var c=0; c<count; c++) {
      if(this.value[c]==null) count--;
    }
    return count;
  };
  Model.prototype.getByKey = function(keyArray) {
    //var keyArray = kA.slice(0);
    var k = keyArray;
    if(Array.isArray(keyArray)) {
      k = keyArray.shift();
    }
    for(var c=0; c<this.value.length; c++) {
      if(this.value[c] instanceof Laminar.Model) {
        if(this.value[c].key==k) {
          if(keyArray.length>0) {
            return this.value[c].getByArray(keyArray);
          } else {
            return this.value[c].get();
          }
        }
      } else {
        return this;
      }
    }
  };
  /*
  Model.prototype.getByQuery = function(keyArray) {
    var result = [];
    var q = keyArray;
    if(Array.isArray(keyArray)) {
      q = keyArray.shift();
    }
    //q.match(queryRe)
    var matches = queryRe.exec(q);
    //alert("Found match at " + matches.index);
    var objectAddress = q.slice(0,matches.index).split(".");
    var operator = q.substr(matches.index,2);
    var value = q.substr((parseInt(matches.index) + 2));
    //alert("Address: " + objectAddress + ", operator: " + operator + ", value: " + value);
    //objectAddress = objectAddress.split(".");
    for(var c=0; c<this.value.length; c++) {

      if(this.value[c].get(objectAddress).read(0)==value) result.push(this.value[c]);
    }
    return result;
  };
  */
  Model.prototype.getByArray = function(arr) {
    if(typeof arr[0] == "string") {
      //if(isQuery(arr[0])) return this.getByQuery(arr);
      return this.getByKey(arr);
    }
    return this.getByIndex(arr);
  };
  Model.prototype.getByIndex = function(indexArray) {
    //var indexArray = iA.slice(0);
    var i = indexArray;
    if(Array.isArray(indexArray)) {
      i = indexArray.shift();
    }
    for(var c=0; c<this.value.length; c++) {
      if(this.value[c] instanceof Laminar.Model) {
        if(this.value[c].getIndex()==i) {
          if(indexArray.length>0) {
            return this.value[c].getByArray(indexArray);
          }
          return this.value[c].get();
        }
      }
    }
    return false;
  };
  Model.prototype.get = function(i) {
    if(!i) return this;
    if(Array.isArray(i)) return this.getByArray(i);
    return this.getByIndex(i);
  };
  Model.prototype.add = function(value) {
    if(value instanceof Laminar.Model) {
      value.index = this.value.length;
      value.parent = this;
      this.setSubscription(value);
    }
    this.value.push(value);
    this.publish("add", this);
    return this;
  };
  Model.prototype.del = function(index) {
    if(index !== null && index !== undefined) {
      this.publish("delete", this.value[index]);
      delete this.value[index];
      return true;
    } else {
      this.publish("delete", this);
      this.parent.del(this.getIndex());
      return true;
    }
    return false;
  };
  Model.prototype.update = function(value) {
    if(value instanceof Laminar.Model) {
      value.index = 0;
      value.parent = this;
    }
    this.value = [value];
    this.publish("update", this);
    return this;
  };

  Model.prototype.publish = function(evnt, args) {
    var pubObject = args || this;
    if(!this.events[evnt]) return false;

    var subscribers = this.events[evnt];
    var len = subscribers ? subscribers.length : 0;

    while(len--) {
      subscribers[len].publishfunction(evnt, pubObject);
    }

    return this;
  };

  Model.prototype.subscribe = function(evnt, func) {
    if(!this.events[evnt]) this.events[evnt] = [];

    var token = (++this.eventId).toString();
    this.events[evnt].push({
      token: token,
      publishfunction: func
    });
    return token;
  };

  Model.prototype.unsubscribe = function(evnt, token) {
    for(var e in this.events[evnt]) {
      if(this.events[evnt][e].token == token) {
        this.events[evnt].splice(e,1);
        //delete this.events[evnt][e];
        return true;
      }
    }
    return false;
  };

  Model.prototype.setSubscription = function(obj) {
    if (obj.hasOwnProperty("subscribe")) {
      obj.subscribe("update",function(evnt,args) {
        //this.publish("update",args);
        this.publish("update",this);
      }.bind(this));
      obj.subscribe("delete",function(evnt,args) {
        //this.publish("delete",args);
        this.publish("update",this);
      }.bind(this));
      obj.subscribe("add",function(evnt,args) {
        //this.publish("delete",args);
        this.publish("update",this);
      }.bind(this));
      return true;
    }
    return false;
  };

  Model.prototype.exportJSON = function() {
    var replacer = function(k,v) {
      if(k=="parent") return undefined;
      if(k=="events") return undefined;
      if(k=="eventId") return undefined;
      return v;
    }
    return JSON.stringify(this,replacer);
  };

  Model.prototype.dump = function() {

  };

  Model.prototype.raw = function(showMethods) {
    var dumpOpen = '\t';
    var dumpClose = '';
    var propertyDiv = '\n\t--:';
    var methodDiv = '\n\t--(';
    var valueDiv = '\n\t-->';
    var objectDiv = '\n\t--{';
    var closeDiv = ' ';

    var dumpOutput = dumpOpen;
    for(var k in this) {
      if(k=="parent") {
        dumpOutput += objectDiv + k + ": [parent]" + closeDiv;
      } else if(k=="value") {
        dumpOutput += valueDiv;
        for(var kv in this[k]) {
          if(this[k][kv] instanceof Laminar.Model) {
            dumpOutput += k + "[" + kv + "]" + ": " + this[k][kv].raw();
          } else {
            dumpOutput += k + "[" + kv + "]" + ": " + this[k][kv];
          }
        }
        //dumpOutput += "" + closeDiv;
      } else {
        if(this[k] instanceof Laminar.Model) {
          dumpOutput += objectDiv + k + ": " + this[k].raw() + closeDiv;
        } else if(typeof this[k] === "function") {
          if(showMethods) dumpOutput += methodDiv + k + ": [function]" + closeDiv;
        } else {
          dumpOutput += propertyDiv + k + ": " + this[k] + closeDiv;
        }
      }
    }
    dumpOutput += dumpClose;
    return dumpOutput;
  };

  return Model;
})();

Laminar.Filter = (function() {
  //"use strict";
  var defaultEvents = ["add","update","delete"];

  function Filter(obj, filterfunc) {
    //this.name = null;
    this.obj = obj;
    this.events = {};
    this.eventId = -1;
    this.filterset = null;
    this.filterfunc = filterfunc;

    for(var e in defaultEvents) {
      obj.subscribe(defaultEvents[e],function(event,args) {
        //debugContainer.append("<br>" + this.name + " detected an add event.");
        this.get(defaultEvents[e]);
      }.bind(this));
    };

    /*
    obj.subscribe("add",function(event,args) {
      //debugContainer.append("<br>" + this.name + " detected an add event.");
      this.get("add");
    }.bind(this));

    obj.subscribe("update",function(event,args) {
      //debugContainer.append("<br>" + this.name + " detected an update event.");
      this.get("update");
    }.bind(this));

    obj.subscribe("delete",function(event,args) {
      //debugContainer.append("<br>" + this.name + " detected a delete event.");
      this.get("delete");
    }.bind(this));
    */
  };

  Filter.prototype.get = function(event) {
    if(evnt===null || evnt===undefined) event="update";
    if(typeof(this.filterfunc)!=='function') {
      this.filterset = this.obj;
    } else {
      this.filterset = this.filterfunc(this.obj);
    }
    this.publish(evnt, this.filterset);
    return this.filterset;
  };

  Filter.prototype.publish = function(evnt, args) {
    if(!this.events[evnt]) return false;
    var pubObject = args || this;
    var subscribers = this.events[evnt];
    var len = subscribers ? subscribers.length : 0;
    while(len--) {
      subscribers[len].publishfunction(evnt,pubObject);
    }
    return this;
  };

  Filter.prototype.subscribe = function(evnt, func) {
    if (typeof(func)!=="function") return;
    //debugContainer.append("<br>" + this.name + " registering " + evnt + " function");
    if(!this.events[evnt]) this.events[evnt] = [];
    var token = (++this.eventId).toString();
    this.events[evnt].push({
      token: token,
      publishfunction: func
    });
    return token;
  };

  Filter.prototype.unsubscribe = function(token) {
    for(var e in this.events) {
      for(var i in this.events[e]) {
        if(this.events[e][i].token == token) {
          return this.events[e].splice(i,1);
        }
      }
    }
    return false;
  };

  return Filter;
})();
