module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Timing the build tasks.
  require('time-grunt')(grunt);

  grunt.initConfig({
  	clean: {
  	  dist: ['dist/*', 'tmp/*']
  	},
  	jshint: {
      options: {
		    jshintrc: '.jshintrc'
	    },
  	  all: {
  		  src: [
          'lib/*.js',
          'tests/*.js',
          '!lib/path-to-regexp.js'
        ]
  	  }
  	},
    concat: {
      dist: {
        src: [
          'lib/path-to-regexp.js',
          'lib/common.js',
          'lib/request.js',
          'lib/response.js',
          'lib/response.js',
          'lib/resource-manager.js',
          'lib/server.js',
          'lib/client.js',
          'index.js'
        ],
        dest: 'tmp/concat.js',
      },
    },
    umd: {
      all: {
        options: {
          src: 'tmp/concat.js',
          dest: 'tmp/umd.js',
          globalAlias: 'QueryProtocol',
          deps: {
            default: ['Chain', 'Emitter'],
            amd: ['middleware-chain', 'event-emitter'],
            cjs: ['middleware-chain', 'events'],
            global: ['Chain', 'EventEmitter2']
          }
        }
      }
    },
  	uglify: {
  	  dist: {
  		  src: 'tmp/umd.js',
  		  dest: 'dist/query-protocol.min.js'
  	  }
  	},
    mochaTest: {
      test: {
        src: ['tests/**/*.js'],
        options: {
          timeout: 3000
        }
      }
    }
  });

  // Registering the tasks.
  grunt.registerTask('test', []);
  grunt.registerTask('default', ['clean', 'jshint', 'concat', 'umd', 'uglify']);
};
