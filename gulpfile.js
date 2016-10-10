/**
 * Created by antonio.monge on 9/30/2016.
 */
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var notify = require('gulp-notify');
var htmlmin = require('gulp-htmlmin');
var runSequense = require('run-sequence');

gulp.task('htmlmin', function () {
    gulp.src('Templates/**/*.html')
        .pipe(notify({message:'Finished html minification', onLast:true}))
        .pipe(htmlmin({collapseWhitespace: true, removeComments:true}))
        .pipe(gulp.dest('dist/Templates/'));
});

gulp.task('move_files', function () {
    gulp.src('assets/**/*')
        .pipe(gulp.dest('dist/assets/'));

    gulp.src(['Scripts/**/*', '!Scripts/app/**/*'])
        .pipe(gulp.dest('dist/Scripts/'));

    gulp.src('bin/index.html')
        .pipe(gulp.dest('dist/'));

    gulp.src('redirectToAndroid.html')
        .pipe(gulp.dest('dist/'));
});

gulp.task('js', function () {
    gulp.src('Scripts/app/module.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/Scripts/app/'));

    gulp.src(['Scripts/app/**/*.js', '!Scripts/app/programa/module.js'])
        .pipe(concat('all.js'))
        .pipe(notify({message:'Finished Javascript concatenation'}))
        .pipe(uglify())
        .pipe(gulp.dest('dist/Scripts/app/'))
        .pipe(notify({message:'Finished Javascript minification'}));
});

gulp.task('production', function () {
    runSequense(['move_files', 'js', 'htmlmin']);
});

gulp.task('default', function(){
    gulp.watch('Scripts/**/*.js', [uglify]);
});

gulp.task('concat', function(){
    // gulp.src('Scripts/app/programa/../**/*.js')
    gulp.src(['Scripts/app/**/*.js', '!Scripts/app/programa/module.js'])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('bin/'))
        .pipe(notify({message:'Finished concatenation'}));
});

gulp.task('uglify', function(){
    gulp.src('Scripts/app/module.js')
        .pipe(gulp.dest('bin/'));

    gulp.src('bin/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/'))
        .pipe(notify({message:'Finished javascript minification'}));
});
