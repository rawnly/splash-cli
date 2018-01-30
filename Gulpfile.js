const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('build', () => {
	gulp.src('src/**/*.js')
		.pipe(babel({
			presets: ['env'],
			plugins: ['syntax-async-functions', 'transform-regenerator']
		}))
		.pipe(gulp.dest('build'));

	gulp.src('src/*.json')
		.pipe(gulp.dest('build'));
});

