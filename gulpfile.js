var gulp = require('gulp');

var pkg = require('./package.json');

// Plugins
var svgmin = require('gulp-svgmin'),
    convert = require('gulp-rsvg'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    iconfont = require('gulp-iconfont'),
    clean = require('gulp-clean');

var svgFiles = ['./originals/**/*.svg'];

/**
 * Clean
 */
gulp.task('clean', function() {
    gulp.src(['./clean', './iconfont'], {read: false})
        .pipe(clean());
});

/**
 * Optimize SVGs
 */
gulp.task('optimize', ['clean'], function() {
    var options = [
        { removeViewBox: false },
        { removeUselessStrokeAndFill: false },
        { convertColors: false }
    ];
    gulp.src(svgFiles)
        .pipe(svgmin(options))
        .pipe(gulp.dest('./clean'));
});

/**
 * Generate PNGs
 */
gulp.task('png', function() {
    var options = {
        width: 32,
        height: 32
    };
    gulp.src(svgFiles)
        .pipe(convert(options))
        .pipe(rename(function(dir, base, ext) {
            var iconName = base.split('-')[1];
            return iconName + ext;
        }))
        .pipe(gulp.dest('./png'));
});

/**
 * Optimize PNGs
 */
gulp.task('optimize-png', function() {
    var options = {
        optimizationLevel: 7
    };
    gulp.src('./png/*.png')
        .pipe(imagemin(options));
});

/**
 * Generate iconfont
 */
gulp.task('iconfont', ['optimize'], function() {
    var options = {
        fontName: 'iconfont',
        appendCodepoints: true,
        descent:  -64,
        fontHeight: 512
    };
    gulp.src('./clean/**')
        .pipe(iconfont(options))
        .pipe(gulp.dest('./iconfont'));
});

gulp.task('default', function() {
    gulp.run('clean', 'optimize', 'iconfont', 'png', 'optimize-png');
});
