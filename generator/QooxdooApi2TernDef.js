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

		    Generator.prototype.addApi = function(qooxdooApi) {
			var name = qooxdooApi.name;
			if (name) {
			    var ternClass = getTernClass(name, this.ternDef);
			    addDocIfNeeded(qooxdooApi, ternClass, this.options);
			}
			// visit members.
			visitMembers(qooxdooApi, this.ternDef, this.options);
		    };

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

		    function getTernType(member, isConstructor) {
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

		    function getTernClassOrPrototype(member, qooxdooApi, ternDef) {
			var ternClass = getTernClass(member.owner, ternDef);
			if (qooxdooApi.singleton) {
			    return ternClass;
			}
			/*
			 * if (isMemberStatic(member)) return ternClass;
			 */
			if (!ternClass.prototype)
			    ternClass.prototype = {};
			return ternClass.prototype;
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
			if (options.doc && qooxdooItem.doc && qooxdooItem.doc != '\n') {
			    ternItem["!doc"] = qooxdooItem.doc;
			}
		    }

		});