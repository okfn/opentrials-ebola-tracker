var gulp = require('gulp');
var browserify = require('browserify');
var resolve = require('resolve');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var file = require('gulp-file');
var minifyCss = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var less = require('gulp-less');
var prefixer = require('gulp-autoprefixer');
var faker = require('faker');
var app = require('./prototype')
var config = app.get('config');


/**
 * Project automation tasks
 */
gulp.task('default', [
  'app.scripts',
  'app.styles',
  'app.images',
  'app.favicon',
  'vendor.scripts',
  'vendor.styles',
  'vendor.fonts'
]);
gulp.task('app.scripts', distAppScripts);
gulp.task('app.styles', distAppStyles);
gulp.task('app.images', distAppImages);
gulp.task('app.favicon', distAppIcon);
gulp.task('vendor.scripts', distVendorScripts);
gulp.task('vendor.styles', distVendorStyles);
gulp.task('vendor.fonts', distVendorFonts);

var production = (process.env.NODE_ENV === 'production');

if (!production) {
  var browserSync = require('browser-sync');
  var reload = browserSync.reload;
  var watchify = require('watchify');
}

/**
 * Run and return the scripts pipeline on bundle
 */
function scriptPipeline(bundle, outfile) {
  return bundle
    //.pipe(sourcemaps.init())
    .pipe(source(outfile))
    .pipe(buffer())
    .pipe(uglify())
    //.pipe(sourcemaps.write(config.get('build:publicDir))
    .pipe(gulp.dest(config.get('build:publicScriptsDir')));
}

/**
 * Provide frontend dependencies as a single bundle.
 */
function distVendorScripts() {
  var bundler = browserify({});
  config.get('build:frontendDependencies').forEach(function(id) {
    bundler.require(resolve.sync(id), {expose: id});
  });
  return scriptPipeline(bundler.bundle(), config.get('build:vendorJS'));
}

/**
 * Provide frontend app as a single bundle.
 */
function distAppScripts() {
  var bundler = browserify({
    entries: [config.get('build:scriptsDir') + '/app.js'],
    debug: production,
    cache: {},
    packageCache: {},
    fullPaths: true
    // transform: [],
  });
  // Don't include vendor dependencies in this bundle
  bundler.external(config.get('build:frontendDependencies'));
  if (process.env.WATCH === 'true') {
    bundler = watchify(bundler);
    bundler
      .on('update', function() {
        scriptPipeline(bundler.bundle(), config.get('build:appJS'));
      });
    return scriptPipeline(bundler.bundle(), config.get('build:appJS'))
      .pipe(reload({stream: true}));
  }
  return scriptPipeline(bundler.bundle(), config.get('build:appJS'));
}

/**
 * Provide frontend styles as a single bundle.
 */
function distAppStyles() {
  return gulp
    .src(config.get('build:stylesDir') + '/app.less')
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(prefixer({browsers: ['last 4 versions']}))
    .pipe(sourcemaps.write(config.get('build:publicDir')))
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(rename(config.get('build:appCSS')))
    .pipe(gulp.dest(config.get('build:publicStylesDir')));
}

function distAppImages() {
  return gulp
    .src(config.get('build:imagesDir') + '/*')
    .pipe(gulp.dest(config.get('build:publicImagesDir')));
}

function distAppIcon() {
  return gulp
    .src(config.get('build:imagesDir') + '/favicon.png')
    .pipe(gulp.dest(config.get('build:publicDir')));
}

function distVendorStyles() {
  return gulp
    .src([
      config.get('build:nodeModulesDir') + '/bootstrap/dist/css/bootstrap.min.css'
    ])
    .pipe(concat(config.get('build:appCSS')))
    .pipe(gulp.dest(config.get('build:publicStylesDir')));
}

function distVendorFonts() {
  return gulp
    .src([
      config.get('build:nodeModulesDir') + '/bootstrap/dist/fonts/*'
    ])
    .pipe(gulp.dest(config.get('build:publicFontsDir')));
}
