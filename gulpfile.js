'use strict';

const gulp = require('gulp');
const less = require('gulp-less');
const debug = require('gulp-debug');
const del = require('del');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();
const newer = require('gulp-newer');
const notify = require('gulp-notify');
const multipipe = require('multipipe');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify');
const pump = require('pump');


gulp.task('clean', function () {
    return del('public');
});

gulp.task('styles', function () {

    return multipipe(
        gulp.src('frontend/styles/style.less'), debug({
            title: 'src'
        }), less(), debug({
            title: 'less'
        }), gulp.dest('public/css')).on('error', notify.onError());
});

gulp.task('assets', function () {

    return gulp.src('frontend/assets/**', {
            since: gulp.lastRun('assets')
        })
        .pipe(newer('public'))

    .pipe(gulp.dest('public'));
});

gulp.task('build', gulp.series('clean', gulp.parallel('styles', 'assets')));

gulp.task('watch', function () {

    gulp.watch('frontend/styles/**/*.*', gulp.series('styles'));
    gulp.watch('frontend/assets/**/*.*', gulp.series('assets'));

});

gulp.task('serve', function () {
    browserSync.init({
        server: 'public'
    });
    browserSync.watch("public/**/*.*").on('change', browserSync.reload);
});

gulp.task('modifycss', function () {

    return gulp.src('public/css/style.css', {
            since: gulp.lastRun('styles')
        })
        .pipe(autoprefixer())
        .pipe(debug({
            title: 'prefixer'
        }))
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(debug({
            title: 'minifier'
        }))
        .pipe(gulp.dest('public/css'));
});

gulp.task('compress', function () {
    return gulp.src('public/img/*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('public/img/'));
});

gulp.task('uglifyjs', function (cb) {
    pump([
        gulp.src('public/js/*'),
        uglify(),
        debug({
                title: 'uglify'
            }),
        gulp.dest('public/js')
    ],
        cb
    );
});

gulp.task('htmlmin', function () {
    return gulp.src('public/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(debug({
            title: 'htmlmin'
        }))
        .pipe(gulp.dest('public/'));
});

gulp.task('modify', gulp.series('modifycss', 'compress', 'uglifyjs', 'htmlmin'));

gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'serve')));
