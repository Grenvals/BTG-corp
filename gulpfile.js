const gulp = require('gulp'); // Инициализируем gulp 

let plumber = require('gulp-plumber'), // Отслеживание ошибок без остановки
// img ---------------------------------------------------------------------
    tinypng = require('gulp-tinypng-compress'), // сжатие изображений
// js ---------------------------------------------------------------------
    concat  = require('gulp-concat'), // обэдинение файлов
    uglify = require('gulp-uglify'), // минификация скриптов
// Sass ---------------------------------------------------------------------
    sourcemaps = require('gulp-sourcemaps'),
    sass       = require('gulp-sass'),
		autoprefixer = require('gulp-autoprefixer'),
		cleancss      = require('gulp-clean-css'),
// PUG ---------------------------------------------------------------------
    pug = require('gulp-pug'),
		pugInheritance = require('gulp-pug-inheritance'),
		changed = require('gulp-changed'),
		cached = require('gulp-cached'),
		gulpif = require('gulp-if'),
		filter = require('gulp-filter'),
// SVG ---------------------------------------------------------------------
    svgSprite = require('gulp-svg-sprite'), // собирает все файлы в спрайт sprite.svg#shopping-cart
    svgmin = require('gulp-svgmin'), // минификация svg 
    cheerio = require('gulp-cheerio'), // удаляет артибуты
		replace = require('gulp-replace'), // чистим символы после предыдущего плагина
// ---------------------------------------------------------------------
    Path = {
        Svg : {
					in : 'in',
					out: 'out'
				},

        "output": "./build/static/images/svg/"
		};


// Изображения 
  gulp.task('imgDev', () => {
		return gulp.src(['./src/img/**/*', '!./src/img/svg/**/*' ])
    .pipe(gulp.dest('build/img/'));
	});

	gulp.task('imgBuild', () => {
		return gulp.src(['./src/img/**/*', '!./src/img/svg/**/*' ])
		.pipe(tinypng({
			key: '78UEHTVIN19cuH3B5ZsGUaTWJ6Vsv3Ev',
			sigFile: 'src/img/.tinypng-sigs',  // создает лог, чтобы исключить повторения файлов которые сжимались
			log: true
	   }))
    .pipe(gulp.dest('build/img/'));
	});

	gulp.task('fonts', () => {
		return gulp.src('./src/fonts/**/*')
    .pipe(gulp.dest('build/fonts/'));
	});

// Скрипты 
	gulp.task('libsDev', () => {
		return gulp.src([
			'./src/js/libs/**/*', 
			'!./src/js/scripts.js',
			// 'node_modules/owl.carousel2/dist/owl.carousel.min.js'
		 ])
		.pipe(sourcemaps.init())
		.pipe(concat('libs.js'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('build/js'));
	});

	gulp.task('libsBuild', () => {
		return gulp.src([
			'./src/js/libs/**/*', 
			'!./src/js/scripts.js',
		 ])
		.pipe(concat('libs.js'))
		.pipe(uglify())
    .pipe(gulp.dest('build/js'));
	});

	gulp.task('scriptsDev', () => {
		return gulp.src(['./src/js/scripts.js'])
    .pipe(gulp.dest('build/js'));
	});

	gulp.task('scriptsBuild', () => {
		return gulp.src(['./src/js/scripts.js'])
		.pipe(uglify())
    .pipe(gulp.dest('build/js'));
	});

	// Styles 
	gulp.task('stylesDev', () => {
		return gulp.src(['./src/sass/style.scss'])
				.pipe(sourcemaps.init())
				.pipe(sass())
				.pipe(autoprefixer({
						overrideBrowserslist:  ['last 10 versions']
				}))
				.pipe(sourcemaps.write('.'))
				.pipe(gulp.dest('build/css/'));
	});
	
	gulp.task('stylesBuild', () => {
		return gulp.src(['./src/sass/style.scss'])
				.pipe(sass({outputStyle: 'compressed'}))
				.pipe(cleancss( {level: { 1: { specialComments: 0 } } }))
				.pipe(autoprefixer({
						overrideBrowserslist:  ['last 10 versions']
				}))
				.pipe(gulp.dest('build/css/'));
	});
 
  // PUG 
	gulp.task('pug', () => {
			return gulp.src('./src/pug/*.pug')
					.pipe(plumber())
					.pipe(changed('dist', {extension: '.html'}))
					.pipe(gulpif(global.isWatching, cached('pug')))
					.pipe(pugInheritance({basedir: './src/pug/', skip: 'node_modules'}))
					.pipe(filter(function (file) {
							return !/\/_/.test(file.path) && !/^_/.test(file.relative);
					}))
					.pipe(pug({
							pretty: true
					}))
					.pipe(plumber.stop())
					.pipe(gulp.dest('./build/'))
	});

	gulp.task('watch', () => {
		gulp.watch('./src/pug/**/*.pug', gulp.series('pug'));
});

// SVG
gulp.task('svg', () => {
	return gulp.src('./src/img/svg/*.svg')
			.pipe(svgmin({
					js2svg: {
							pretty: true
					}
			}))
			.pipe(cheerio({
					run: function ($) {
							$('[fill]').removeAttr('fill');
							$('[stroke]').removeAttr('stroke');
							$('[style]').removeAttr('style');
					},
					parserOptions: {xmlMode: true}
			}))
			.pipe(replace('&gt;', '>'))
			.pipe(svgSprite({
					mode: {
							symbol: {
									sprite: "sprite.svg"
							}
					}
			}))
			.pipe(gulp.dest('./build/img/svg/'));
});