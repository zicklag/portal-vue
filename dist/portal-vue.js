/*
    portal-vue
    Version: 1.2.0
    Licence: MIT
    (c) Thorsten Lünborg
  */
  
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('vue')) :
	typeof define === 'function' && define.amd ? define(['vue'], factory) :
	(global.PortalVue = factory(global.Vue));
}(this, (function (Vue) { 'use strict';

Vue = Vue && 'default' in Vue ? Vue['default'] : Vue;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};



































var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

function extractAttributes(el) {
  var map = el.hasAttributes() ? el.attributes : [];
  var attrs = {};
  for (var i = 0; i < map.length; i++) {
    var attr = map[i];
    if (attr.value) {
      attrs[attr.name] = attr.value === '' ? true : attr.value;
    }
  }
  return attrs;
}

function freeze(item) {
  if (Array.isArray(item) || (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object') {
    return Object.freeze(item);
  }
  return item;
}

var transports = {};

var Wormhole = function () {
  function Wormhole(transports) {
    classCallCheck(this, Wormhole);

    this.transports = transports;
  }

  createClass(Wormhole, [{
    key: 'open',
    value: function open(transport) {
      var to = transport.to,
          from = transport.from,
          passengers = transport.passengers;

      if (!to || !from || !passengers) return;

      transport.passengers = freeze(passengers);
      var keys = Object.keys(this.transports);
      if (keys.indexOf(to) !== -1) {
        this.transports[to] = transport;
      } else {
        Vue.set(this.transports, to, transport);
      }
    }
  }, {
    key: 'close',
    value: function close(transport) {
      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var to = transport.to,
          from = transport.from;

      if (!to || !from) return;
      if (this.transports[to] && (force || this.transports[to].from === from)) {
        this.transports[to] = undefined;
      }
    }
  }, {
    key: 'hasTarget',
    value: function hasTarget(to) {
      return this.transports.hasOwnProperty(to);
    }
  }, {
    key: 'hasContentFor',
    value: function hasContentFor(to) {
      return this.transports[to] && this.transports[to].passengers != null ? true : false;
    }
  }, {
    key: 'getSourceFor',
    value: function getSourceFor(to) {
      return this.transports[to] && this.transports[to].from;
    }
  }, {
    key: 'getContentFor',
    value: function getContentFor(to) {
      var transport = this.transports[to];
      return transport ? transport.passengers : undefined;
    }
  }]);
  return Wormhole;
}();
var wormhole = new Wormhole(transports);

var nestRE = /^(attrs|props|on|nativeOn|class|style|hook)$/;

var babelHelperVueJsxMergeProps = function mergeJSXProps (objs) {
  return objs.reduce(function (a, b) {
    var aa, bb, key, nestedKey, temp;
    for (key in b) {
      aa = a[key];
      bb = b[key];
      if (aa && nestRE.test(key)) {
        // normalize class
        if (key === 'class') {
          if (typeof aa === 'string') {
            temp = aa;
            a[key] = aa = {};
            aa[temp] = true;
          }
          if (typeof bb === 'string') {
            temp = bb;
            b[key] = bb = {};
            bb[temp] = true;
          }
        }
        if (key === 'on' || key === 'nativeOn' || key === 'hook') {
          // merge functions
          for (nestedKey in bb) {
            aa[nestedKey] = mergeFn(aa[nestedKey], bb[nestedKey]);
          }
        } else if (Array.isArray(aa)) {
          a[key] = aa.concat(bb);
        } else if (Array.isArray(bb)) {
          a[key] = [aa].concat(bb);
        } else {
          for (nestedKey in bb) {
            aa[nestedKey] = bb[nestedKey];
          }
        }
      } else {
        a[key] = b[key];
      }
    }
    return a
  }, {})
};

function mergeFn (a, b) {
  return function () {
    a.apply(this, arguments);
    b.apply(this, arguments);
  }
}

var Target = {
  abstract: true,
  name: 'portalTarget',
  props: {
    attributes: { type: Object },
    name: { type: String, required: true },
    slim: { type: Boolean, default: false },
    tag: { type: String, default: 'div' },
    transition: { type: [Boolean, String, Object], default: false },
    transitionEvents: { type: Object, default: function _default() {
        return {};
      } }
  },
  data: function data() {
    return {
      transports: transports,
      firstRender: true
    };
  },
  mounted: function mounted() {
    var _this = this;

    if (!this.transports[this.name]) {
      this.$set(this.transports, this.name, undefined);
    }

    this.unwatch = this.$watch(function () {
      return this.transports[this.name];
    }, this.emitChange);

    this.updateAttributes();
    this.$nextTick(function () {
      if (_this.transition) {
        _this.firstRender = false;
      }
    });
  },
  updated: function updated() {
    this.updateAttributes();
  },
  beforeDestroy: function beforeDestroy() {
    this.unwatch();
    this.$el.innerHTML = '';
  },


  methods: {
    updateAttributes: function updateAttributes() {
      if (this.attributes) {
        var attrs = this.attributes;
        var el = this.$el;

        if (attrs.class) {
          attrs.class.trim().split(' ').forEach(function (klass) {
            el.classList.add(klass);
          });
          delete attrs.class;
        }

        var keys = Object.keys(attrs);

        for (var i = 0; i < keys.length; i++) {
          el.setAttribute(keys[i], attrs[keys[i]]);
        }
      }
    },
    emitChange: function emitChange(newTransport, oldTransport) {
      this.$emit('change', _extends({}, newTransport), _extends({}, oldTransport));
    }
  },
  computed: {
    passengers: function passengers() {
      return this.transports[this.name] && this.transports[this.name].passengers || [];
    },
    children: function children() {
      return this.passengers.length !== 0 ? this.passengers : this.$slots.default || [];
    },
    noWrapper: function noWrapper() {
      var noWrapper = !this.attributes && this.slim;
      if (noWrapper && this.children.length > 1) {
        console.warn('[portal-vue]: PortalTarget with `slim` option received more than one child element.');
      }
      return noWrapper;
    },
    withTransition: function withTransition() {
      return !!this.transition;
    },
    transitionData: function transitionData() {
      var t = this.transition;
      var data = {};

      if (this.firstRender && _typeof(this.transition) === 'object' && !this.transition.appear) {
        data.props = { name: '__notranstition__portal-vue__' };
        return data;
      }

      if (typeof t === 'string') {
        data.props = { name: t };
      } else if ((typeof t === 'undefined' ? 'undefined' : _typeof(t)) === 'object') {
        data.props = t;
      }
      if (this.renderSlim) {
        data.props.tag = this.tag;
      }
      data.on = this.transitionEvents;

      return data;
    }
  },

  render: function render(h) {
    var TransitionType = this.noWrapper ? 'transition' : 'transition-group';
    var Tag = this.tag;
    var result = this.withTransition ? h(
      TransitionType,
      babelHelperVueJsxMergeProps([this.transitionData, { 'class': 'vue-portal-target' }]),
      [this.children]
    ) : this.noWrapper ? this.children[0] : h(
      Tag,
      { 'class': 'vue-portal-target' },
      [this.children]
    );

    return result;
  }
};

var inBrowser = typeof window !== 'undefined';

var pid = 1;

var Portal = {
  abstract: true,
  name: 'portal',
  props: {
    disabled: { type: Boolean, default: false },
    name: { type: String, default: function _default() {
        return String(pid++);
      } },
    slim: { type: Boolean, default: false },
    tag: { type: [String], default: 'DIV' },
    targetEl: { type: inBrowser ? [String, HTMLElement] : String },
    to: { type: String, default: function _default() {
        return String(Math.round(Math.random() * 10000000));
      } }
  },

  mounted: function mounted() {
    if (this.targetEl) {
      this.mountToTarget();
    }
    if (!this.disabled) {
      this.sendUpdate();
    }
  },
  updated: function updated() {
    if (this.disabled) {
      this.clear();
    } else {
      this.sendUpdate();
    }
  },
  beforeDestroy: function beforeDestroy() {
    this.clear();
    if (this.mountedComp) {
      this.mountedComp.$destroy();
    }
  },


  watch: {
    to: function to(newValue, oldValue) {
      oldValue && this.clear(oldValue);
      this.sendUpdate();
    },
    targetEl: function targetEl(newValue, oldValue) {
      this.mountToTarget();
    }
  },

  methods: {
    sendUpdate: function sendUpdate() {
      if (this.to) {
        if (this.$slots.default) {
          wormhole.open({
            from: this.name,
            to: this.to,
            passengers: [].concat(toConsumableArray(this.$slots.default))
          });
        } else {
          this.clear();
        }
      } else if (!this.to && !this.targetEl) {
        console.warn('[vue-portal]: You have to define a target via the `to` prop.');
      }
    },
    clear: function clear(target) {
      wormhole.close({
        from: this.name,
        to: target || this.to
      });
    },
    mountToTarget: function mountToTarget() {
      var el = void 0;
      var target = this.targetEl;

      if (typeof target === 'string') {
        el = document.querySelector(this.targetEl);
      } else if (target instanceof HTMLElement) {
        el = target;
      } else {
        console.warn('[vue-portal]: value of targetEl must be of type String or HTMLElement');
        return;
      }

      var attributes = extractAttributes(el);

      if (el) {
        var _target = new Vue(_extends({}, Target, {
          parent: this,
          propsData: {
            name: this.to,
            tag: el.tagName,
            attributes: attributes
          }
        }));
        _target.$mount(el);
        this.mountedComp = _target;
      } else {
        console.warn('[vue-portal]: The specified targetEl ' + this.targetEl + ' was not found');
      }
    }
  },

  render: function render(h) {
    var children = this.$slots.default || [];
    var Tag = this.tag;
    if (children.length && this.disabled) {
      return children.length <= 1 && this.slim ? children[0] : h(
        Tag,
        null,
        [children]
      );
    } else {
      return h(
        Tag,
        { 'class': 'v-portal', style: 'display: none', key: 'v-portal-placeholder' },
        []
      );
    }
  }
};

function install(Vue$$1) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  Vue$$1.component(opts.portalName || 'portal', Portal);
  Vue$$1.component(opts.portalTargetName || 'portal-target', Target);
}
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use({ install: install });
}

var index = {
  install: install,
  Portal: Portal,
  PortalTarget: Target,
  Wormhole: wormhole
};

return index;

})));
//# sourceMappingURL=portal-vue.js.map
