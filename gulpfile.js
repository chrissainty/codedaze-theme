var gulp = require('gulp');

var minifyCSS = require('gulp-minify-css');
var concat = require('gulp-concat');
var prefix = require('gulp-autoprefixer');

// gulp plugins and utils
var gutil = require('gulp-util');
var livereload = require('gulp-livereload');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var zip = require('gulp-zip');

// postcss plugins
var autoprefixer = require('autoprefixer');
var colorFunction = require('postcss-color-function');
var cssnano = require('cssnano');
var customProperties = require('postcss-custom-properties');
var easyimport = require('postcss-easy-import');

var swallowError = function swallowError(error) {
    gutil.log(error.toString());
    gutil.beep();
    this.emit('end');
};

var nodemonServerInit = function () {
    livereload.listen(1234);
};

gulp.task('build', ['css'], function (/* cb */) {
    return nodemonServerInit();
});

gulp.task('styles', ['build'], function(){
    var themeName = require('./package.json').name;
    var filename = themeName + '.css';

    return gulp.src('assets/built/*.css')
    .pipe(concat(filename))
    .pipe(minifyCSS())
    .pipe(prefix('last 2 versions'))
    .pipe(gulp.dest('assets/css'))
});

gulp.task('css', function () {
    var processors = [
        easyimport,
        customProperties,
        colorFunction(),
        autoprefixer({browsers: ['last 2 versions']}),
        cssnano()
    ];

    return gulp.src('assets/css/*.css')
        .on('error', swallowError)
        .pipe(sourcemaps.init())
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('assets/built/'))
        .pipe(livereload());
});

gulp.task('zip', ['styles'], function () {
    var targetDir = 'dist/';
    var themeName = require('./package.json').name;
    var filename = themeName + '.zip';

    return gulp.src([
        '**',
        '!assets/built',
        '!assets/built/**',
        '!assets/css/milligram.min.css',
        '!assets/css/normalise.css',
        '!assets/css/site.css',
        '!node_modules', 
        '!node_modules/**',
        '!dist', 
        '!dist/**'
    ])
        .pipe(zip(filename))
        .pipe(gulp.dest(targetDir));
});

gulp.task('default', ['build'], function() {
    gulp.run('styles')
    gulp.watch('assets/css/*.css', function(){
        gulp.run('styles')
    })
});