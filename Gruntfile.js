module.exports = function(grunt) {

  require("./tasks/generate-tern-qooxdoo_4.1");
  
  var templateUtil = require("./tasks/template-util");

  var template = templateUtil.getTemplate();
  grunt.initConfig({
    'template' : template
  });

  grunt.loadNpmTasks('grunt-template');
  grunt.registerTask('default', [ 'template' ]);

};