module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Timing the build tasks.
  require('time-grunt')(grunt);

  grunt.initConfig({
  	clean: {
  	  dist: ['dist/*', 'babel-output/*']
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
    babel: {
  		options: {
  			presets: ['es2015', 'babili']
  		},
  		dist: {
  			files: [
          { expand: true, cwd: 'lib/', src: ['*.js'], dest: 'babel-output/lib/' },
        ]
  		}
  	},
    requirejs: {
      compile: {
        options: {
          baseUrl: 'babel-output/lib/',
          paths: {
              'middleware-chain': 'empty:',
              'lodash': 'empty:',
              'Joi': 'empty:',
              'timed-cache': 'empty:',
              'expressify': 'expressify'
          },
          modules: [
              { name: 'expressify' }
          ],
          dir: 'dist/'
        }
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
  grunt.registerTask('default', ['clean', 'jshint', 'babel', 'requirejs']);
};
