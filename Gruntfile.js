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
        'docs/dist/*',
        'docs/assets/components/'
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
          'docs/assets/js/app/*.js',
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
          { expand: true, cwd: 'docs/', src: ['*.html'], dest: 'docs/dist/' }
        ]
      }
    },
    cssmin: {
      dist: {
        expand: true,
        cwd: 'docs/assets/css/',
        src: ['*.css'],
        dest: 'docs/dist/assets/css/'
      }
    },
    babel: {
  		options: {
  			presets: ['es2015', 'babili']
  		},
  		dist: {
  			files: [
          { expand: true, cwd: 'lib/', src: ['**/*.js'], dest: 'babel-output/lib/' },
          { expand: true, cwd: 'docs/assets/js/app/', src: ['*.js'], dest: 'docs/dist/assets/js/app/' }
        ]
  		}
  	},
    requirejs: {
      default: {
        options: {
          baseUrl: 'babel-output/lib/',
          paths: {
            'middleware-chain': 'empty:',
            'lodash': 'empty:',
            'Joi': 'empty:',
            'timed-cache': 'empty:',
            'event-emitter': 'empty:',
            'expressify': 'expressify'
          },
          name: 'expressify',
          out: 'dist/expressify.min.js'
        }
      }
    },
    copy: {
      dist: {
        files: [
          { expand: true, cwd: 'docs/', src: ['*.md'], dest: 'docs/dist/' },
          { expand: true, cwd: './', src: ['package.json', 'bower.json'], dest: 'dist/' }
        ]
      },
      documentation: {
        files: [
          { expand: true, cwd: 'docs/assets/', src: ['components/**/*'], dest: 'docs/dist/assets/' },
          { expand: true, cwd: 'docs/', src: ['*.md'], dest: 'docs/dist/' },
          { expand: true, cwd: 'docs/', src: ['index.html'], dest: 'docs/dist/' }
        ]
      }
    },
    'bower-install-simple': {
      default: {},
      documentation: {
        options: {
          cwd: 'docs/'
        }
      }
    },
    open: {
      file: {
        path: './docs/dist/index.html'
      },
    },
    mochaTest: {
      test: {
        src: ['tests/**/*.js']
      }
    }
  });

  // Registering the tasks.
  grunt.registerTask('documentation', ['default', 'open']);
  grunt.registerTask('test', ['mochaTest']);
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
