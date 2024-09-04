const path = require( 'path' );
const debug = ( String( process.env.DEBUG ).toLowerCase() === "true" ) ? true : false

module.exports = {
	mode: ( debug == true ) ? "development" : "production",
	entry: './js/main.js',
	output: {
			path: path.resolve( __dirname, 'static/js' ),
			filename: 'bundle.js',
	},
	watch: ( debug == true ) ? true : false,
}
