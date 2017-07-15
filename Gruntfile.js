module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Timing the build tasks.
  require('time-grunt')(grunt);

  grunt.initConfig({
  	clean: {
  	  dist: [
        'dist/*',
        'babel-output/*',
        'bower_components/',
        'documentation/dist/*',
        'documentation/assets/components/'
      ]
  	},
  	jshint: {
      options: {
		    jshintrc: '.jshintrc'
	    },
  	  all: {
  		  src: [
          'lib/*.js',
          'tests/*.js',
          'documentation/assets/js/app/*.js',
          '!lib/path-to-regexp.js'
        ]
  	  }
  	},
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [
          { expand: true, cwd: 'documentation/', src: ['*.html'], dest: 'documentation/dist/' }
        ]
      }
    },
    cssmin: {
      dist: {
        expand: true,
        cwd: 'documentation/assets/css/',
        src: ['*.css'],
        dest: 'documentation/dist/assets/css/'
      }
    },
    babel: {
  		options: {
  			presets: ['es2015', 'babili']
  		},
  		dist: {
  			files: [
          { expand: true, cwd: 'lib/', src: ['*.js'], dest: 'babel-output/lib/' },
          { expand: true, cwd: 'documentation/assets/js/app/', src: ['*.js'], dest: 'documentation/dist/assets/js/app/' }
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
    copy: {
      dist: {
        files: [
          { expand: true, cwd: 'documentation/', src: ['*.md'], dest: 'documentation/dist/' },
          { expand: true, cwd: './', src: ['*.json'], dest: 'dist/' },
        ]
      },
      documentation: {
        files: [
          { expand: true, cwd: 'node_modules/', src: ['joi-browser/**/*'], dest: 'documentation/assets/components/' },
          { expand: true, cwd: 'documentation/assets/', src: ['components/**/*'], dest: 'documentation/dist/assets/' }
        ]
      }
    },
    'bower-install-simple': {
      default: {},
      documentation: {
        options: {
          cwd: 'documentation/'
        }
      }
    },
    open: {
      file : {
        path : './documentation/dist/index.html'
      },
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
  grunt.registerTask('documentation', ['default', 'open']);
  grunt.registerTask('test', ['default']);
  grunt.registerTask('default', [
    'clean',
    'jshint',
    'htmlmin',
    'cssmin',
    'babel',
    'requirejs',
    'copy',
    'bower-install-simple',
    'bower-install-simple:documentation',
    'copy:documentation'
  ]);
};
