'use strict';

var gulp = require('gulp'),

    // Plugins
    svgmin = require('gulp-svgmin'),
    svg2png = require('gulp-svg2png'),
    imagemin = require('gulp-imagemin'),
    iconfont = require('gulp-iconfont'),
    rimraf = require('gulp-rimraf'),
    imacss = require('gulp-imacss'),
    replace = require('gulp-replace'),
    es = require('event-stream');


var svgFiles = ['./originals/**/*.svg'],
    pngConf = {
        small: {
            scale: 0.03125, // 16/512
            size: '16x16'
        },
        med: {
            scale: 0.0625, //32/512
            size: '32x32'
        }
    };

/**
 * Optimize SVGs
 */
gulp.task('optimize-svg', function(cb) {
    var opts = [
        { removeViewBox: false },
        { removeUselessStrokeAndFill: false },
        { convertColors: false }
    ],
    cleanSVGs = gulp.src('./clean', {read: false})
        .pipe(rimraf()),
    createSVGs = gulp.src(svgFiles)
        .pipe(svgmin(opts))
        .pipe(gulp.dest('./clean'));

    return es.concat.apply(es, [cleanSVGs, createSVGs]);
});

/**
 * Remove viewBox from SVGs
 */
gulp.task('svg-removeViewBox', function(cb) {
    var cleanSVGs = gulp.src('./no-viewbox', {read: false})
        .pipe(rimraf()),
    createSVGs = gulp.src(svgFiles)
        .pipe(replace(/\sviewBox="[^"]{0,}"/g, ''))
        .pipe(gulp.dest('./no-viewbox'));

    return es.concat.apply(es, [cleanSVGs, createSVGs]);
});

/**
 * Generate 32x32px and 16x16px PNGs
 */
var generatePng = function(cfg) {
    return gulp.src('./no-viewbox/**/*.svg')
        .pipe(svg2png(cfg.scale))
        .pipe(gulp.dest('./png/' + cfg.size + '/'));
};
gulp.task('clean-pngs', ['svg-removeViewBox'], function() {
    return gulp.src('./png', {read: false}).pipe(rimraf());
});
gulp.task('png-small', ['clean-pngs'], function() {
    return generatePng(pngConf.small);
});
gulp.task('png-med', ['clean-pngs'], function() {
    return generatePng(pngConf.med);
});
gulp.task('png', ['svg-removeViewBox', 'clean-pngs', 'png-small', 'png-med']);

/**
 * Optimize PNGs
 */
gulp.task('optimize-png', ['png'], function() {
    var options = {
        optimizationLevel: 7
    };
    return gulp.src('./png/**/*.png').pipe(imagemin(options));
});

/**
 * Generate iconfont
 */
gulp.task('iconfont', ['optimize-svg'], function(cb) {
    var options = {
        fontName: 'iconfont',
        appendCodepoints: true,
        descent:  -64,
        fontHeight: 512
    };
    var cleanIconfont = gulp.src('./iconfont', {read: false})
        .pipe(rimraf()),
        createIconfont = gulp.src('./clean/**')
            .pipe(iconfont(options))
            .pipe(gulp.dest('./iconfont'));

    return es.concat.apply(es, [cleanIconfont, createIconfont]);
});

/**
 * Transform svg files to data URIs
 */
gulp.task('imacss-svg', ['optimize-svg'], function() {
    return gulp.src('./clean/*.svg')
        .pipe(imacss('icons.svg.css', 'icons'))
        .pipe(replace(/-u.{4}-/g, '-'))
        .pipe(gulp.dest('./css'));
});

/**
 * Transform 16x16px png files to data URIs
 */
gulp.task('imacss-png', ['optimize-png'], function() {
    return gulp.src('./png/' + pngConf.small.size + '/*.png')
        .pipe(imacss('icons.png.css', 'icons'))
        .pipe(replace(/-u.{4}-/g, '-'))
        .pipe(gulp.dest('./css'));
});

gulp.task('default', ['iconfont', 'imacss-svg', 'imacss-png']);
