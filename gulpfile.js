// 载入外挂
var gulp = require('gulp'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    jade = require('gulp-jade'),
    rev = require('gulp-rev'),
    revReplace = require('gulp-rev-replace'),
    useref = require('gulp-useref'),
    filter = require('gulp-filter'),
    revCollector = require('gulp-rev-collector'),
    changed = require('gulp-changed'),
    connect = require('gulp-connect'),
    runSequence = require('run-sequence'),
    watch = require('gulp-watch'),
    livereload = require('gulp-livereload');

//cdn url
var cdn_url = '//your.cdn.com/' + new Date().getFullYear() + '/' + (parseInt(new Date().getMonth() + 1)) + '/' + new Date().getDate() + '/';

gulp.task('rev', function () {
    return gulp.src(['rev/**/*.json', 'dist/*.html'])
        .pipe(revCollector({
                replaceReved: true,
                dirReplacements: {
                    'css': function (manifest_value) {
                        return cdn_url + manifest_value;
                    },
                    'js': function (manifest_value) {
                        return cdn_url + manifest_value;
                    },
                    'fonts': function (manifest_value) {
                        return '//your.cdn.com/' + new Date().getFullYear() + '/' + (parseInt(new Date().getMonth() + 1)) + '/' + new Date().getDate() + '/' + manifest_value;
                    }
                }
            }
        ))
        .pipe(gulp.dest('cdn'))
        .pipe(notify({message:'rev ok'}));
});

//使用connect启动一个Web服务器
gulp.task('connect', function () {
    connect.server({
        root: 'dist',
        livereload: true,
        port:7777
    });
});

// 样式
gulp.task('css', function () {
    return gulp.src('app/less/*.less')
        .pipe(less())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        //.pipe(concat('index.css')) your can concat to one js or not
        .pipe(gulp.dest('dist/css'))
        .pipe(minifycss())
        .pipe(rev())
        .pipe(gulp.dest('dist/css'))
        .pipe(gulp.dest('cdn/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/css'))
        .pipe(livereload())
        .pipe(notify({ message: 'css task complete' }));
});

// Jade task
gulp.task('jade', function () {
    console.log('run jade...')
    return gulp.src('app/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('dist/'))
        .pipe(gulp.dest('cdn'))
        .pipe(livereload())
});

gulp.task('js', function () {
    return gulp.src('app/js/*.js')
        .pipe(gulp.dest('dist/js'))
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest('dist/js'))
        .pipe(gulp.dest('cdn/js'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/js'))
        .pipe(livereload())
        //.pipe(notify({ message: 'js task complete' }));
});

// 图片
gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe(cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true})))
        .pipe(gulp.dest('dist/images'))
        .pipe(livereload())
        //.pipe(notify({ message: 'Images task complete' }));
});

// fonts
gulp.task('fonts', function () {

    return gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'))
        .pipe(gulp.dest('dist/css/fonts'))
        .pipe(gulp.dest('cdn/fonts'))
        .pipe(gulp.dest('cdn/css/fonts'))
        .pipe(livereload())

});


// 清理
gulp.task('clean', function () {
    return gulp.src(['rev', 'cdn', 'dist'], {read: false})
        .pipe(clean());
});

//runSequence
gulp.task('run', function () {
    runSequence(
        'clean',
        ['jade', 'js', 'css', 'fonts'],
        ['rev'],
        ['connect', 'watch']
    );//end of runSequence
})


// 看手
gulp.task('watch', function (err) {
    console.log('watch....')
    livereload.listen();

    // 监听html
    gulp.watch('app/*.jade', function (event) {
        console.log('watch jade....')
        gulp.run('jade');
    })

    // 监听所有.less档
    gulp.watch('app/less/**/*.less', ['css']);

    // 监听所有.js档
    gulp.watch('app/js/**/*.js', ['js']);

    // 监听所有图片档
    gulp.watch('app/images/**/*', ['images']);

});
