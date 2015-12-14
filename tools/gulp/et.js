'use strict'

const gulp    = require('gulp')
const watch   = require('gulp-watch')
const batch   = require('gulp-batch')
const through = require('through2')
const ET      = require('et-template')

const EtPath = ['src/components/et/**/*.html']

function compileET() {
  var option = {
    modules: 'angular',
    modelType: 'event'
  }
  var et = new ET(option)
  var compile = function() {
    return through.obj(function (file, enc, next) {
      if (!file.isBuffer()) {
        return next()
      }
      var moduleId = file.path.split('/')
      var pathLength = moduleId.length
      var moduleId0 = moduleId[pathLength - 3] || ''
      var moduleId1 = moduleId[pathLength - 2] || ''
      var moduleId2 = moduleId[pathLength - 1].split('.')[0]
      var moduleName = moduleId0 + '_' + moduleId1 + '_' + moduleId2
      var contents = et.compile(file.contents.toString(), {
        moduleId: moduleName,
        angularModuleName: 'ET-Template'
      })
      file.contents = new Buffer(contents)
      file.path = file.path.replace(/\.html/, '.js')
      this.push(file)
      next()
    })
  }
  return gulp.src(EtPath)
    .pipe(compile())
}

gulp.task('compile-et', function() {
  return compileET()
    .pipe(gulp.dest('.tmp/scripts/components/et/'))
})

gulp.task('watch-et', function() {
  watch(EtPath, batch(function(events, done) {
    gulp.start('compile-et', done)
  }))
})
