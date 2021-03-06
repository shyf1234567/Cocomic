import fs from 'fs';
import del from 'del';
import runSequence from 'run-sequence';
import childProcess from 'child_process';
import gulp from 'gulp';
import eslint from 'gulp-eslint';
import stylelint from 'gulp-stylelint';

const { spawn } = childProcess;
const isProduction = process.env.NODE_ENV === 'production';
const yarn = process.platform === 'win32' ? 'yarn.cmd' : 'yarn';

const path = {
  dist: 'frontend/dist',
  src: {
    js: '**/*.js',
    jsx: '**/*.jsx',
    css: '**/*.css',
    scss: '**/*.scss',
  },
  exclude: {
    node_modules: '!node_modules/**',
  },
};

const tasks = {
  eslint: 'eslint',
  stylelint: 'stylelint',
  clean: 'clean',
  buildDll: 'buildDll',
  buildProd: 'buildProd',
  profile: 'profile',
  server: 'server',
  build: 'build',
  start: 'start',
};
// Run eslint
gulp.task(tasks.eslint, () =>
  gulp.src([path.src.js, path.src.jsx]) // respect .eslintignore
    .pipe(eslint())
    .pipe(eslint.format('codeframe'))
    .pipe(eslint.failAfterError()));

// Run stylelint
gulp.task(tasks.stylelint, () =>
  gulp.src([path.src.css, path.src.scss]) // respect ignoreFiles in .stylelintrc
    .pipe(stylelint({
      reporters: [
        { formatter: 'string', console: true },
      ],
    })));

// Clean webpack generated files
gulp.task(tasks.clean, () => del([path.dist]));

// Yarn task generator
const generateTask = args =>
  (callback) => {
    const proc = spawn(yarn, args, { stdio: 'inherit' });
    proc.on('close', (code) => {
      console.log(`child process exited with code ${code}`); // eslint-disable-line no-console
      callback();
    });
    proc.on('error', (err) => {
      callback(err);
    });
  };

// Build dll reference files
gulp.task(tasks.buildDll, generateTask(['run', 'build-dll']));

// Generate webpack asset bundles for production
gulp.task(tasks.buildProd, generateTask(['run', 'build-prod']));

// Profile webpack asset bundle
gulp.task(tasks.profile, generateTask(['run', 'profile']));

// Run server
gulp.task(tasks.server, generateTask(['run', 'server']));

// Generate asset bundles
gulp.task(tasks.build, (callback) => {
  fs.exists(path.dist, (exists) => {
    const taskList = [];
    if (isProduction) {
      taskList.unshift(tasks.buildProd);
    }
    if (!exists) {
      taskList.unshift(tasks.buildDll);
    }
    if (taskList.length > 0) {
      runSequence(...taskList, callback);
    } else {
      callback();
    }
  });
});

// Generate asset bundles and run server
gulp.task(tasks.start, (callback) => {
  runSequence(tasks.build, tasks.server, callback);
});

// Default task
// 1. eslint
// 2. stylelint
// 3. generate asset bundles and run server
gulp.task('default', (callback) => {
  runSequence(tasks.eslint, tasks.stylelint, tasks.start, callback);
});
