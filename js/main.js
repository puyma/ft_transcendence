import { Button } from 'bootstrap';
import { Collapse } from 'bootstrap';
import { Dropdown } from 'bootstrap';
import { Toast } from 'bootstrap';

import { fetch_page } from './router.js';
import { Router } from './router.js';

// variables

const scheme = document.body.dataset.scheme === 'http' ? 'ws' : 'wss';
const host = document.body.dataset.host;
//const ws = new WebSocket( `${scheme}://${host}/ws/router/` )

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
			window.router.notify( element.getAttribute( 'href' ) );
		} )
	} );
	return ;
}

// __main__
// Execute once DOM is loaded

document.addEventListener( 'DOMContentLoaded', () => {

	// TODO: integrate into Router Class
	// Maneja los eventos de popstate para la navegación con las flechas
	//window.addEventListener( 'popstate', (event) => {
	//	var url = event.state?.url;
	//	if ( ! url ) {
	//		url = window.location.href;
	//	}
	//	fetch_page( url );
	//} );
	router = window.router = new Router();
	router.add_post_events( [ setup_ajax_anchors, setup_login_providers ] );
	router.init();

	let element = window.document.createElement( 'a' );
	element.innerHTML = 'test anchor';
	element.href = 'profile/';
	element.id = 'test' ;
	window.document.getElementsByTagName( 'main' )[0]
		.insertAdjacentElement( 'beforebegin', element );

	element = window.document.getElementById( 'test' );
	element.addEventListener( 'click', (ev) => {
		ev.preventDefault();
		window.router.notify( element.href ); 
	});

	return ;
} );
