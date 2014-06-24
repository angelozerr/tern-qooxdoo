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
				visit : visitConstructor,
				prototype : true
			    },
			    "methods" : {
				visit : visitMethods,
				prototype : true
			    },
			    "params" : {
				visit : visitParams
			    },
			    "param" : {
				visit : visitParam
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
			    if (superClass) ternClass["!proto"] = superClass;
			    visitChildren(qooxdooApi, ternClass, this.options);
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
					var ternItem = visitor.prototype ? getTernPrototype(ternClass) : ternClass;
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
			if (options.doc && qooxdooItem.attributes && qooxdooItem.attributes.text) {
			    ternItem["!doc"] = qooxdooItem.attributes.text;
			}
		    }
		    
		    function visitMethods(qooxdoItem, ternItem, options) {
			var qooxdooMethods = qooxdoItem.children;
			for (var i = 0; i < qooxdooMethods.length; i++) {
			    var qooxdooMethod = qooxdooMethods[i], name = qooxdooMethod.attributes.name;
			    var ternMethod = ternItem[name] = {};
			    ternMethod["!type"] = "fn(";
			    visitChildren(qooxdooMethod, ternMethod, options);
			    ternMethod["!type"] += ")";
			}
		    }		
		    
		    function visitConstants(qooxdooItem, ternItem, options) {
			
		    }
		    
		    function visitParams(qooxdooItem, ternItem, options) {
			visitChildren(qooxdooItem, ternItem, options);			
		    }		    

		    function visitParam(qooxdooItem, ternItem, options) {
			var attributes = qooxdooItem.attributes;
			if (attributes && attributes.name) {
			    if (ternItem["!type"] != "fn(") {
				ternItem["!type"] += ", ";
			    }
			    ternItem["!type"] += attributes.name;
			    visitChildren(qooxdooItem, ternItem, options);
			}
		    }
		    
		    function visitTypes(qooxdooItem, ternItem, options) {
			if (qooxdooItem.children && qooxdooItem.children.length > 0) {
			    var type = getTernType(qooxdooItem.children[0].attributes.type);
			    //ternItem["!type"] += (": " + type);
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
			}
			return "+" + qooxdooType;
		    }
		    
		    function visitConstructor(qooxdooItem, ternItem, options) {
			
		    }		    		    
		    
		    // -------------- Visit Members

		    /**
		     * Visit members.
		     */
		    function visitMembers(qooxdooApi, ternDef, options) {
			var members = qooxdooApi.members;
			if (members) {
			    var constructorMember = getConstructorMember(members);
			    if (constructorMember) {
				var ternMember = getTernClass(qooxdooApi.name, ternDef);
				var ternType = getTernType(constructorMember, true);
				if (ternType)
				    ternMember["!type"] = ternType;		
			    }
			    for (var i = 0; i < members.length; i++) {
				var member = members[i];
				if (!isMemberPrivate(member)
					|| options["private"]) {
				    var ternMember = visitMember(member,
					    qooxdooApi, ternDef);
				    if (ternMember)
					addDocIfNeeded(member, ternMember,
						options);
				}
			    }
			}
		    }
		    
		    function getConstructorMember(members) {
			for (var i = 0; i < members.length; i++) {
			    var member = members[i];
			    if (member.name === 'constructor') {
				return member;
			    }
			}
		    }

		    /**
		     * Visit member.
		     */
		    function visitMember(member, qooxdooApi, ternDef) {			
			if (member.name != 'constructor') {			    	    
			    var ternClass = getTernClassOrPrototype(member, qooxdooApi, ternDef);
			    var ternMember = {};
			    ternClass[member.name] = ternMember;
			    var ternType = getTernType(member);
			    if (ternType)
				ternMember["!type"] = ternType;
			    return ternMember;
			}
		    }

		    function isMemberChainable(member) {
			return getMemberProperty(member, "chainable");
		    }
		    
		    function isMemberPrivate(member) {
			return getMemberProperty(member, "private");
		    }

		    function isMemberStatic(member) {
			return getMemberProperty(member, "static");
		    }

		    function getMemberProperty(member, name) {
			if (member[name])
			    return member[name];
			if (member.autodetected && member.autodetected[name])
			    return member.autodetected[name];
		    }

		    function getOLDTernType(member, isConstructor) {
			var memberType = member.type, memberParams = member.params, memberReturn = member.return;
			if (!memberType) {
			    if (memberParams || memberReturn) {
				var fnType = 'fn(';
				// it's a function with parameters
				if (memberParams) {
				for (var i = 0; i < memberParams.length; i++) {
				    var param = memberParams[i], name = param.name, optional = param.optional, type = getTernType(
					    param.type, null)
				    if (i > 0)
					fnType += ', ';
				    fnType += name;
				    if (optional)
					fnType += '?';
				    fnType += ': ';
				    if (type) {
					fnType += type;
				    } else {
					fnType += '?';
				    }
				}
				}
				fnType += ')';
				if (!isConstructor) {
				    if (memberReturn) {
					var returnType = getTernType(memberReturn);
					if (!returnType) returnType = '?';
					fnType += ' -> ';
					fnType += returnType;
				    } else if (isMemberChainable(member)) {
					fnType += ' -> !this';
				    }
				}				
				return fnType;
			    }
			    return null;
			}
			switch (memberType) {
			case 'String':
			    return 'string';
			case 'Boolean':
			    return 'bool';
			case 'Number':
			    return 'number';
			}
			// console.log(memberType)
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

		    function addDocIfNeeded(qooxdooItem, ternItem, options) {
			if (options.doc && qooxdooItem.attributes && qooxdooItem.attributes.text) {
			    ternItem["!doc"] = qooxdooItem.attributes.text;
			}
		    }

		});