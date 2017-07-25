Laminar.Model = (function() {
  function Model(obj) {
    this.setIsArray(Array.isArray(obj));
    
    for(var key in obj) {
      if(obj.hasOwnProperty(key)) {
        this.add(key,obj[key]);
      }
    }
  }

  Model.prototype = {
    add : function(prop,val,setfunc,getfunc) {
      if(this.isArray) {
        this.push(val);
      } else {
        this.setProp(prop,val,setfunc,getfunc);
      }
    },
    setProp : function(prop,val,setFunc,getFunc) {
      setFunc = setFunc || function (val) {
        console.log("Invoking setter function for " + prop);
        return val;
      };
      getFunc = getFunc || function (val) {
        return val;
      };
      Object.defineProperty(
        this,
        prop,
        {
          configurable:false,
          enumerable:true,
          set: function(val) {
            if(this.isArray) {
              console.log("Invoking array-style push of val: " + val);
              [].push.call(this,val);
            }
            return this;
          },
          get: function() {
            return getFunc(this[prop]);
          }
        }
      );
      if(!val===undefined) this[prop] = val;
    },
    setIsArray : function(isarray) {
      console.log("Value is array: " + isarray);
      Object.defineProperty(
        this,
        "isArray",
        {
          value:isarray,
          configurable:false,
          writable:true,
          enumerable:false
        }
      );
    },
    push : function(val) {
      [].push.call(this,val);
      return this;
    },
    del : function(index) {
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
    },
    update : function(value) {
      if(value instanceof Laminar.Model) {
        value.index = 0;
        value.parent = this;
      }
      this.value = [value];
      this.publish("update", this);
      return this;
    },
    publish : function(evnt, args) {
      var pubObject = args || this;
      if(!this.events[evnt]) return false;

      var subscribers = this.events[evnt];
      var len = subscribers ? subscribers.length : 0;

      while(len--) {
        subscribers[len].publishfunction(evnt, pubObject);
      }

      return this;
    },
    subscribe : function(evnt, func) {
      if(!this.events[evnt]) this.events[evnt] = [];

      var token = (++this.eventId).toString();
      this.events[evnt].push({
        token: token,
        publishfunction: func
      });
      return token;
    },
    unsubscribe : function(evnt, token) {
      for(var e in this.events[evnt]) {
        if(this.events[evnt][e].token == token) {
          this.events[evnt].splice(e,1);    // Delete
          return true;
        }
      }
      return false;
    },
    /**
    * Creates default bindings to an object. Those defaults are: update, delete,
    * and add.
    *
    * @param {Object} object Typically the Laminar Model that you have added to
    * this model.
    * @returns {bool} true is bindings were created, false if not
    */
    setSubscription : function(obj) {
      if (obj.subscribe) {
        obj.subscribe("update",function(evnt,args) {
          this.publish("update",this);
        }.bind(this));
        obj.subscribe("delete",function(evnt,args) {
          this.publish("update",this);
        }.bind(this));
        obj.subscribe("add",function(evnt,args) {
          this.publish("update",this);
        }.bind(this));
        return true;
      }
      return false;
    }
  }

  return Model;
})();
