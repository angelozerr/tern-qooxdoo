(function(root, mod) {
    if (typeof exports == "object" && typeof module == "object")
	return mod(exports); // CommonJS
    if (typeof define == "function" && define.amd)
	return define([ "exports" ], mod); // AMD
    mod(root.QooxdooApi2TernDef || (root.QooxdooApi2TernDef = {})); // Plain
    // browser
    // env
})
	(
		this,
		function(exports) {
		    "use strict";

		    var defaultOptions = {
			doc : true,
			private : true
		    }

		    var Generator = exports.Generator = function(options) {
			this.options = options || defaultOptions;
			this.ternDef = createDef();
		    };

		    function createDef(name) {
			return {
			    "!name" : "qooxdoo",
			    "!define" : {}
			};
		    }

		    var visitors = {
			"desc" : {
			    visit : visitDesc
			},
			"methods-static" : {
			    visit : visitMethods
			},
			"constants" : {
			    visit : visitConstants
			},
			"constructor" : {
			    visit : visitConstructor
			},
			"methods" : {
			    visit : visitMethods,
			    prototype : true
			},
			"types" : {
			    visit : visitTypes
			}

		    }

		    Generator.prototype.addApi = function(qooxdooApi) {
			if (qooxdooApi.attributes) {
			    var name = qooxdooApi.attributes.fullName, superClass = qooxdooApi.attributes.superClass;
			    if (name) {
				var ternClass = getTernClass(name, this.ternDef);
				if (superClass)
				    ternClass["!proto"] = superClass;
				visitChildren(qooxdooApi, ternClass,
					this.options);
			    }
			}
		    };

		    function visitChildren(qooxdoItem, ternClass, options) {
			var children = qooxdoItem.children;
			if (children) {
			    for (var i = 0; i < children.length; i++) {
				var child = children[i];
				var visitor = visitors[child.type];
				if (visitor) {
				    var ternItem = visitor.prototype ? getTernPrototype(ternClass)
					    : ternClass;
				    visitor.visit(child, ternItem, options);
				}
			    }
			}
		    }

		    function getTernPrototype(ternClass) {
			if (!ternClass.prototype)
			    ternClass.prototype = {};
			return ternClass.prototype;
		    }

		    function visitDesc(qooxdooItem, ternItem, options) {
			if (options.doc && qooxdooItem.attributes
				&& qooxdooItem.attributes.text) {
			    ternItem["!doc"] = qooxdooItem.attributes.text;
			}
		    }

		    function visitMethods(qooxdoItem, ternItem, options) {
			var qooxdooMethods = qooxdoItem.children;
			for (var i = 0; i < qooxdooMethods.length; i++) {
			    var qooxdooMethod = qooxdooMethods[i], name = qooxdooMethod.attributes.name, children = qooxdooMethod.children;
			    var ternMethod = ternItem[name] = {};
			    updateMethod(qooxdooMethod, ternMethod, options);
			}
		    }
		    
		    function updateMethod(qooxdooMethod, ternMethod, options) {
			var children = qooxdooMethod.children, type = "fn(", params, returnValue;
			    if (children) {
				for (var j = 0; j < children.length; j++) {
				    var child = children[j];
				    if (child.type === 'params') {
					params = getParams(child);
				    } else if (child.type === 'return') {
					returnValue = getType(child);
				    } else if (child.type === 'desc') {
					visitDesc(child, ternMethod, options);
				    }
				}
			    }
			    if (params)
				type += params;
			    type += ")";
			    if (returnValue) {
				type += " -> ";
				type += getTernType(returnValue);
			    }
			    ternMethod["!type"] = type;
		    }

		    function getType(child) {
			var children = child.children;
			if (children) {
			    for (var i = 0; i < children.length; i++) {
				var c = children[i];
				if (c.type === 'types') {
				    var types = c.children;
				    for (var j = 0; j < types.length; j++) {
					return types[j].attributes.type;
				    }
				}
			    }
			}
		    }

		    function getParams(child) {
			var children = child.children;
			if (children) {
			    var params = '';
			    for (var i = 0; i < children.length; i++) {
				var c = children[i];
				if (c.type === 'param') {
				    var name = c.attributes.name, optional = c.attributes.optional, type = getTernType(getType(c));

				    if (params != '') {
					params += ', ';
				    }
				    params += name;
				    if (optional) params += '?';
				    params += ': ';
				    params += type;

				}
			    }
			    return params;
			}
		    }

		    function visitConstants(qooxdooItem, ternItem, options) {

		    }

		    function visitTypes(qooxdooItem, ternItem, options) {
			if (qooxdooItem.children
				&& qooxdooItem.children.length > 0) {
			    var type = getTernType(qooxdooItem.children[0].attributes.type);
			    ternItem["!type"] += (": " + type);
			}
		    }

		    function getTernType(qooxdooType) {
			switch (qooxdooType) {
			case 'String':
			    return 'string';
			case 'Boolean':
			    return 'bool';
			case 'Number':
			    return 'number';
			case 'Function':
			    return 'fn()';
			case 'var':
			case 'Object':
			    return 'Object';
			}
			return "+" + qooxdooType;
		    }

		    function visitConstructor(qooxdooItem, ternItem, options) {
			updateMethod(qooxdooItem, ternItem, options);
		    }

		    function getTernClass(owner, ternDef) {
			var ternClass = ternDef;
			var names = owner.split('.');
			for (var i = 0; i < names.length; i++) {
			    var name = names[i];
			    if (!ternClass[name]) {
				ternClass[name] = {};
			    }
			    ternClass = ternClass[name];
			}
			return ternClass;
		    }

		});