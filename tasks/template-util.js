"use strict";

/**
 * Grunt template utilities for generate Qooxdoo Tern plugin by using API data
 * json.
 */

var fs = require("fs"), path = require("path"), QooxdooApi2TernDef = require("../generator/QooxdooApi2TernDef");

/**
 * Create ExtJS data waited by the grunt template.
 * 
 * @param version
 *        version of the Api.
 * @param formatJSON
 *        true if tern defs must be formated.
 */
exports.createData = function(version, formatJSON) {
  var options = {
    version : version
  };
  var generator = new QooxdooApi2TernDef.Generator(), ternDef = generator.ternDef;
  // loop for Qooxdoo*.json
  var basedir = getApiBaseDir(version);
  var filenames = fs.readdirSync(basedir);
  updateTernDef(generator, version, filenames);
  var defs = formatJSON ? JSON.stringify(ternDef, null, ' ') : JSON.stringify(ternDef);
  return {
    'version' : version,
    'defs' : defs
  }
}

var template = {};

/**
 * Add Qooxdoo target template.
 * 
 * @param the
 *        grunt target template.
 */
exports.addTargetTemplate = function(target) {
  for ( var name in target) {
    template[name] = target[name];
  }
}

/**
 * Returns the Qooxdoo grunt template which contains the list of Qooxdoo target
 * template.
 * 
 * @return the Qooxdoo grunt template which contains the list of Qooxdoo target
 *         template.
 */
exports.getTemplate = function() {
  return template;
}

exports.generateTernDef = generateTernDef;

//----------- private function

function generateTernDef(version, filenames) {
  var generator = new QooxdooApi2TernDef.Generator();
  updateTernDef(generator, version, filenames);
  return generator.ternDef;
}

function updateTernDef(generator, version, filenames) {
  if (filenames instanceof Array) {
    filenames.forEach(function(filename) {
      updateTernDef(generator, version, filename);
    });
  } else {
    if (endsWith(filenames, '.json')) {
      var qooxdooApi = loadQooxdooApi(version, filenames);
      generator.addApi(qooxdooApi);
    }
  }
}

function loadQooxdooApi(version, filename) {
  var basedir = getApiBaseDir(version);
  console.log(path.join(basedir, filename))
  return JSON.parse(fs.readFileSync(path.join(basedir, filename), "utf8"));
}

function getApiBaseDir(version) {
  var basedir = path.resolve("./api/", version);
  if (!fs.existsSync(basedir)) {
    // case when test is run
    basedir = path.resolve("../api/", version);
  }
  return basedir;
}

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}