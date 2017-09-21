"use strict";

var gulp = require("gulp"),
    uglify = require("gulp-uglify"),
    sourcemaps = require("gulp-sourcemaps"),
    newer = require("gulp-newer"),
    filter = require("gulp-filter"),
    concat = require("gulp-concat"),
    less = require("gulp-less"),
    cssmin = require("gulp-cssmin"),
    rename = require("gulp-rename"),
    replace = require('gulp-replace'),
    ts = require("gulp-typescript"),
    modernizr = require("gulp-modernizr"),
    debug = require("gulp-debug"),
    path = require("path"),
    vpath = require("vinyl-paths"),
    del = require("del"),
    fs = require("fs"),
    chalk = require("chalk"),
    Promise = require("promise"),
    GitVersionJson = require('git-version-json');

var paths = {
    webroot: "./src/"
};

// less
paths.less = {
    src: path.join(paths.webroot, "css/site.less"),
    dst: path.join(paths.webroot, "css")
};

gulp.task('less', () => {
    return gulp.src(paths.less.src)
        .pipe(sourcemaps.init())
        .pipe(less({ paths: ["node_modules/bootstrap/less"] }))
        .pipe(cssmin())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.less.dst));
});

gulp.task('clean-less', (cb) => {
    return del([path.join(paths.less.dst, "*.css"), path.join(paths.less.dst, "*.css.map")]);
});

// typescript
gulp.task("ts", () => {
    var tsProj = ts.createProject("tsconfig.json");
    var tsResult = tsProj.src()
        .pipe(sourcemaps.init())
        .pipe(tsProj());
    
    return tsResult.js.pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('src/js'))
        .pipe(debug({ title: 'ts:' }));
});

gulp.task('clean-ts', (cb) => {
    return del([
        path.join(paths.webroot, "js/**/*.js"),
        path.join(paths.webroot, "js/**/*.js.map")]);
});

gulp.task('mark-version', [GitVersionJson.task, 'ts'], ()=>{
    return gulp.src('src/js/app.js')
        .pipe(replace('\"MARK_GIT_VERSION\"', JSON.stringify(GitVersionJson.gitVer)))
        .pipe(gulp.dest('src/js'));
});

// modernizr
gulp.task('modernizr', ['ts'], () => {
    return gulp.src([path.join(paths.webroot, "js/**/*.js")])
        .pipe(modernizr())
        .pipe(uglify())
        .pipe(gulp.dest(path.join(paths.webroot, "lib")));
});

// lib
paths.lib = {
    base: "node_modules",
    src: [
        "requirejs/require.js",
        "requirejs-text/text.js",
        "bluebird/js/browser/*.*",
        "jquery/dist/*.*",
        "jquery.cookie/jquery.cookie.js",
        "bootstrap/dist/**/*.*",
        "vue/dist/*.*",
        "vue-router/dist/*.*"
    ],
    dst: path.join(paths.webroot, "lib")
};

gulp.task('lib-cp', (cb) => {
    return gulp.src(paths.lib.src.map((x) => { return path.join(paths.lib.base, x); }), { base: paths.lib.base })
        .pipe(gulp.dest(paths.lib.dst));
});

gulp.task('lib-min', ['lib-cp'], (cb) => {
    return gulp.src(paths.lib.src
        .filter((x) => { return /\.js$/.test(x); })
        .map((x) => { return path.join(paths.lib.dst, x); }), { base: paths.lib.dst })
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({ suffix: ".min" }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.lib.dst));
});

gulp.task('lib', ['lib-cp', 'lib-min']);

gulp.task("clean-lib", (cb) => {
    return del(paths.lib.dst);
});

paths.i18n = {
    src: [
        "src/**/*.html"
    ]
};

gulp.task('i18n-check', (cb) => {
    var langs = ["en", "zh"];
    var totalMissing = 0;

    return new Promise((resolve, reject) => {
        gulp.src(paths.i18n.src, { read: false })
            .pipe(vpath((x) => {
                var cmp = {};
                var warnnings = [];

                var target = path.parse(x);

                for (var j in langs) {
                    var lang = langs[j];

                    var json = target.name + "-" + lang + ".json";
                    var jsonFull = path.join(target.dir, json);

                    if (fs.existsSync(jsonFull)) {
                        cmp[json] = require(jsonFull);
                    }
                    else {
                        warnnings.push("\tMissing file " + chalk.red(path.join(target.dir, json)));
                    }
                }

                var keys = Object.keys(cmp);
                var size = keys.length;
                for (var i = 0; i < size - 1; i++) {
                    for (var j = i + 1; j < size; j++) {
                        var kL = keys[i], kR = keys[j];
                        var cL = cmp[kL], cR = cmp[kR];

                        var fnCMP = (x, y, f) => {
                            for (var k in x) {
                                if (y[k] === undefined) {
                                    totalMissing++;
                                    console.warn("\tMissing " + chalk.red(k) + " in " + chalk.blue(path.join(target.dir, f)));
                                }
                            }
                        };
                        fnCMP(cL, cR, kR);
                        fnCMP(cR, cL, kL);
                    }
                }

                // output warnings
                if (Object.keys(cmp).length > 0 && warnnings.length > 0) {
                    for (var i in warnnings) {
                        totalMissing++;
                        console.warn(warnnings[i]);
                    }
                }

                return Promise.resolve(0);
            }))
            .on('finish', () => {
                if (totalMissing > 0)
                    reject(chalk.red(totalMissing) + " missing");
                else
                    resolve(0);
            });
    });
});

// default
gulp.task("build", ["less", "ts", "modernizr", "lib", "i18n-check", "mark-version"]);
gulp.task("clean", ["clean-lib", "clean-ts", "clean-less"]);
gulp.task("default", ["build"]);