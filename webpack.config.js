const debug = ( String( process.env.DEBUG ).toLowerCase() === "true" ) ? true : false

const path = require( 'path' );
const TerserPlugin = require( 'terser-webpack-plugin' );

module.exports = {
	mode: ( debug == true ) ? "development" : "production",
	devtool: 'source-map',
	entry: './js/main.js',
	output: {
			path: path.resolve( __dirname, 'static/js' ),
			filename: 'bundle.js',
	},
	optimization: {
		concatenateModules: true,
		minimizer: [
			new TerserPlugin( {
				parallel: true, terserOptions: {
					compress: {
						defaults: true
					},
					ecma: undefined,
					enclose: false,
					ie8: false,
					keep_classnames: true,
					keep_fnames: true,
					mangle: false,
					module: false,
					nameCache: null,
					//sourceMap: {},
					format: {
						braces: true,
						comments: false,
						semicolons: true,
						preserve_annotations: false
					},
				}
			} )
		]
	},
	watch: ( debug == true ) ? true : false,
}
