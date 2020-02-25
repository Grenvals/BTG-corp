"use strict";

//                   Gulp. Инструкция по управлению пылесосом, или как навести порядок в квартире. 
// Короче Жень. Представь, что галп это пылесос😊. С помощю него мы можем всмоктывать наши файлы и нужным образом их обрабытывать. 
// С помощю метода .src() пылесос всмоктывает файлы, метод .pipe() это труба пылесоса, по которой мы последовательно(линейно) направляем нашу пыль(файлы) через различные фильтры од пыли(пропускаем файлы через различные npm пакеты которые их обрабытывают). 
// После того как пыль(файлы) прошла через фильтры, метод .dest() направляет нашу трубу в мешок для пыли(директория готового проекта). 
// Также мы можем его научить(робота пылесоса) убирать квартиру(src) только когда мы там сделали бардак(отслеживать изменения в файлах). Также у нас есть различные пылесосы, которые мы включаем в зависимости од того насколько мы хочем чистую квартиру(запускать различные таски галпа в зависимости от надобности). Короче удачной уборки)
var gulp = require('gulp'); // Инициализируем gulp 


var browserSync = require('browser-sync'),
    plumber = require('gulp-plumber'),
    // Убирает прерывание тасков при ошибке
del = require('del'),
    // чистим ненужные файлы
// IMG ---------------------------------------------------------------------
tinypng = require('gulp-tinypng-compress'),
    // думаю можно не писать
imagemin = require('gulp-imagemin'),
    // очень гибкий и хороший набор офлайн, не хуже tinyPNG, попробуй
imageminJpegRecompress = require('imagemin-jpeg-recompress'),
    pngquant = require('imagemin-pngquant'),
    newer = require('gulp-newer'),
    // пропускает только те файлы, которых нету в директории
// JS ---------------------------------------------------------------------
rigger = require('gulp-rigger'),
    // конкатинация js в указаной последовательности:  //= folder/file.js
concat = require('gulp-concat'),
    // обэдинение файлов
uglify = require('gulp-uglify'),
    // минификация 
// SASS ---------------------------------------------------------------------
sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cleancss = require('gulp-clean-css'),
    // PUG ---------------------------------------------------------------------
pug = require('gulp-pug'),
    // KIT ---------------------------------------------------------------------
kit = require('gulp-kit'),
    // он мне понравился) его преимущество - компилируется мгновенно, в отличии от pug.
// SVG ---------------------------------------------------------------------
svgSprite = require('gulp-svg-sprite'),
    // собирает все файлы в спрайт sprite.svg#shopping-cart
svgmin = require('gulp-svgmin'),
    // минификация svg 
cheerio = require('gulp-cheerio'),
    // удаляет артибуты
replace = require('gulp-replace'),
    // чистим символы после предыдущего плагина
// ----------------------------------- CONFIGURATION --------------------------------------------
// BROWSERSYNC Configuration---------------------------------------------------------------------
BrowserSyncConfig = {
  server: {
    baseDir: "./build"
  },
  tunnel: false,
  host: 'localhost',
  port: 3000,
  notify: false,
  // open: false,
  online: false // Work Offline Without Internet Connection
  // tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me

},
    // DIRECTORY -------------------------------------------------------------------------------------
filePath = {
  // Все пути вынесены в свойства обэктов, для быстрого изменения, позволяет быстро подстраиватся. 
  pug: {
    "in": './src/pug/*.pug',
    out: './build/'
  },
  kit: {
    "in": 'src/kit/*.kit',
    out: './build/'
  },
  sass: {
    "in": './src/sass/style.scss',
    out: 'build/css/'
  },
  jsLibs: {
    "in": [// Точка входа. Конкатенирует все библиотеки указаные в файле #AddLibs.js в заданой последовательности, или подключать напряму из пакетов ноды
    './src/js/libs/#AddLibs.js' // './src/js/libs/*.js',  
    // 'node_modules/owl.carousel2/dist/owl.carousel.min.js',
    ],
    out: 'build/js'
  },
  jsScripts: {
    "in": './src/js/*.js',
    out: 'build/js'
  },
  img: {
    "in": ['src/img/**/*', '!src/img/svg/**/*', '!src/img/_compress/**/*'],
    out: './build/img/',
    compImgCache: './src/img/_compress/',
    // TinyPng Online
    tinyPngApiKey: '78UEHTVIN19cuH3B5ZsGUaTWJ6Vsv3Ev' // '*****************************',

  },
  svg: {
    "in": './src/img/svg/*.svg',
    out: './build/img/svg'
  },
  fonts: {
    "in": './src/fonts/**/*',
    out: 'build/fonts/'
  },
  cleaner: 'build/*'
}; // -------------------------------------- TASKS -------------------------------------------------
// PUG ------------------------------------------------------------------ +


gulp.task('pug', function () {
  return gulp.src(filePath.pug["in"]).pipe(plumber()).pipe(pug({
    pretty: true
  })).pipe(gulp.dest(filePath.pug.out)).on('end', browserSync.reload);
}); // KIT ------------------------------------------------------------------ +

gulp.task('kit', function () {
  return gulp.src(filePath.kit["in"]).pipe(plumber()).pipe(kit()).pipe(gulp.dest(filePath.kit.out)).on('end', browserSync.reload);
}); // SASS ------------------------------------------------------------------ +

gulp.task('sassDev', function () {
  return gulp.src(filePath.sass["in"]).pipe(plumber()).pipe(sourcemaps.init()).pipe(sass().on('error', function (error) {
    console.log(error);
  })).pipe(autoprefixer({
    overrideBrowserslist: ['last 10 versions']
  })).pipe(sourcemaps.write('.')).pipe(gulp.dest(filePath.sass.out)).pipe(browserSync.stream());
});
gulp.task('sassBuild', function () {
  return gulp.src(filePath.sass["in"]).pipe(sass({
    outputStyle: 'compressed'
  })).pipe(cleancss({
    level: {
      1: {
        specialComments: 0
      }
    }
  })).pipe(autoprefixer({
    overrideBrowserslist: ['last 10 versions']
  })).pipe(gulp.dest(filePath.sass.out));
}); // JS ------------------------------------------------------------------ +

gulp.task('libsDev', function () {
  return gulp.src(filePath.jsLibs["in"]).pipe(plumber()).pipe(sourcemaps.init()).pipe(rigger()).pipe(concat('libs.js')).pipe(sourcemaps.write('.')).pipe(gulp.dest(filePath.jsLibs.out)).pipe(browserSync.stream());
});
gulp.task('libsBuild', function () {
  return gulp.src(filePath.jsLibs["in"]).pipe(rigger()).pipe(concat('libs.js')).pipe(uglify()).pipe(gulp.dest(filePath.jsLibs.out));
});
gulp.task('scriptsDev', function () {
  return gulp.src(filePath.jsScripts["in"]).pipe(plumber()).pipe(gulp.dest(filePath.jsScripts.out)).pipe(browserSync.stream());
});
gulp.task('scriptsBuild', function () {
  return gulp.src(filePath.jsScripts["in"]).pipe(uglify()).pipe(gulp.dest(filePath.jsScripts.out));
}); // IMG ------------------------------------------------------------------ +

gulp.task('imgMover', function () {
  return gulp.src(filePath.img["in"]).pipe(newer(filePath.img.out)).pipe(gulp.dest(filePath.img.out));
});
gulp.task('tinyPngMover', function () {
  return gulp.src(['!' + filePath.img.compImgCache + '*.tinypng-sigs', filePath.img.compImgCache + '**/*']).pipe(gulp.dest(filePath.img.out));
});
gulp.task('tinyPngHandler', function () {
  return gulp.src(filePath.img["in"]).pipe(plumber()).pipe(newer(filePath.img.compImgCache)).pipe(tinypng({
    key: filePath.img.tinyPngApiKey,
    log: true
  })).pipe(gulp.dest(filePath.img.compImgCache));
});
gulp.task('imgOflineHandler', function () {
  return gulp.src(filePath.img["in"]).pipe(newer(filePath.img.out)).pipe(imagemin([imagemin.gifsicle({
    interlaced: true
  }), imagemin.mozjpeg({
    progressive: true
  }), imageminJpegRecompress({
    loops: 5,
    min: 70,
    max: 75,
    quality: 'high'
  }), imagemin.svgo(), imagemin.optipng({
    optimizationLevel: 3
  }), pngquant([0.8, 0.8])], {
    verbose: true
  })).pipe(gulp.dest(filePath.img.out));
}); // SVG ------------------------------------------------------------------ +

gulp.task('svg', function () {
  return gulp.src(filePath.svg["in"]).pipe(svgmin({
    js2svg: {
      pretty: true
    }
  })).pipe(cheerio({
    run: function run($) {
      $('[fill]').removeAttr('fill');
      $('[stroke]').removeAttr('stroke');
      $('[style]').removeAttr('style');
    },
    parserOptions: {
      xmlMode: true
    }
  })).pipe(replace('&gt;', '>')).pipe(svgSprite({
    mode: {
      symbol: {
        sprite: "sprite.svg"
      }
    }
  })).pipe(gulp.dest(filePath.svg.out));
}); // FONTS ------------------------------------------------------------------ +

gulp.task('fonts', function () {
  return gulp.src(filePath.fonts["in"]).pipe(newer(filePath.fonts.out)).pipe(gulp.dest(filePath.fonts.out)).pipe(browserSync.stream());
}); // CLEANER ------------------------------------------------------------------ +

gulp.task('clearBuild', function () {
  return del(filePath.cleaner);
}); // WATCHER ------------------------------------------------------------------ +

gulp.task('watch', function () {
  browserSync.init(BrowserSyncConfig);
  gulp.watch('./src/**/*.pug', gulp.series('pug')); //PUG +

  gulp.watch('./src/**/*.kit', gulp.series('kit')); //KIT + 

  gulp.watch('./src/**/*.scss', gulp.parallel('sassDev')); //SASS +

  gulp.watch('./src/js/libs/*.js', gulp.parallel('libsDev')); //JS LIBS +

  gulp.watch('./src/js/*.js', gulp.parallel('scriptsDev')); //JS SCRIPTS +
  // gulp.watch('./src/img/**/*.{png,jpg,gif,svg}', gulp.series('tinyPngHandler', 'imgComprMover')); //TinyPNG Online+

  gulp.watch('./src/img/**/*.{png,jpg,gif,svg}', gulp.parallel('imgOflineHandler' // optimize & compsess
  // 'imgMover', // only transfer
  )); //IMG Ofline +

  gulp.watch('./src/img/svg/*.svg', gulp.parallel('svg')); //SVG +

  gulp.watch('./src/fonts/**/*.', gulp.parallel('fonts')); //FONTS +
}); // TASKER ------------------------------------------------------------------ +

gulp.task('dev', gulp.series('clearBuild', // 'tinyPngHandler',
// 'tinyPngMover',
gulp.parallel('pug', 'kit', 'sassDev', 'libsDev', 'scriptsDev', // 'imgMover',
'imgOflineHandler', 'svg', 'fonts')));
gulp.task('build', gulp.series('clearBuild', 'pug', 'kit', 'sassBuild', 'libsBuild', 'scriptsBuild', 'imgOflineHandler', // 'imgMover',
// 'tinyPngHandler',
// 'tinyPngMover',
'svg', 'fonts'));
gulp.task('default', gulp.series('dev', gulp.parallel('watch')));