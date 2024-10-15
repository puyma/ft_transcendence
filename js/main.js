import bootstrap from 'bootstrap';
// import {game} from './pong.js';
import {Game} from './pong';

// variables

const scheme = document.body.dataset.scheme === 'http' ? 'ws' : 'wss';
const host = document.body.dataset.host;

// functions

// @fn		setup_login_providers
// @return	{void}

function setup_login_providers ()
{
	const elements = document.querySelectorAll( '[data-login-provider=true]' );
	elements.forEach( (element) => {
		const url = element.getAttribute( 'data-login-provider-url' );
		element.addEventListener( 'click', (event) => {
			event.preventDefault();
			window.open( url, "_self" );
		} );
	} );
	return ;
}

// @fn		setupAjaxLinks
//			Replaces click events on anchors with data-ajax=true attr.
// @return	{void}

function setup_ajax_anchors ()
{
	const anchors = document.querySelectorAll( 'a[data-ajax=true]' );
	anchors.forEach( (element) => {
		element.addEventListener( 'click', (event) => {
			event.preventDefault();
			fetch_page( element.getAttribute( 'href' ), true );
		} )
	} );
	return ;
}

// @fn		fetch_page
//			Fetches and replaces content (main tag)
// @param	{string}	url
// @param	{bool}		push_to_history
// @return	{void}

function fetch_page ( url, push_to_history )
{
	fetch( url, { method: "GET" } )
		.then( (response) => response.text() )
		.then( (data) => {
			const parser = new DOMParser();
			const doc = parser.parseFromString( data, 'text/html' );
			const main_tag = doc.querySelector( 'main' ).innerHTML;
			document.querySelector( 'main' ).innerHTML = main_tag;
			// Reassign anchor's click events
			setup_ajax_anchors();
			setup_login_providers();
			// Push to history
			if ( push_to_history === true ) {
				window.history.pushState( { url: url }, '', url );
			}
		} )
		.catch ( (error) => {
			console.log( "Error loading context: ", error );
		} );
	return ;
}

// __main__
// Execute once DOM is loaded

document.addEventListener( 'DOMContentLoaded', () => {
	setup_ajax_anchors();
	setup_login_providers();
	// Maneja los eventos de popstate para la navegación con las flechas
	window.addEventListener( 'popstate', (event) => {
		var url = event.state?.url;
		if ( ! url ) {
			url = window.location.href;
		}
		fetch_page( url, false );
	} );
	const game = new Game('canvas');
	return ;
} );
