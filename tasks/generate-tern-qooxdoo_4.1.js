"use strict";

/**
 * Create grunt target template to generate tern plugin for Qooxdoo 4.1 in the
 * file plugin/qooxdoo_4.1.js
 */

var templateUtil = require('./template-util');

function getData() {
  return templateUtil.createData("4.1");
}

templateUtil.addTargetTemplate({
  'generate-tern-qooxdoo_4.1' : {
    'options' : {
      'data' : getData
    },
    'files' : {
      'plugin/qooxdoo_4.1.js' : [ 'generator/qooxdoo.js.tpl' ]
    }
  }
});