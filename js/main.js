import { Button } from 'bootstrap';
import { Collapse } from 'bootstrap';
import { Dropdown } from 'bootstrap';
import { Toast } from 'bootstrap';

import { Router } from './router.js';

// variables

const scheme = document.body.dataset.scheme === 'http' ? 'ws' : 'wss';
const host = document.body.dataset.host;
//const ws = new WebSocket( `${scheme}://${host}/ws/router/` )

window.dataset = {};
window.dataset.scheme = document.body.dataset.scheme;
window.dataset.host = document.body.dataset.host;

// functions

// @fn		setup_login_providers
// @return	{void}

function setup_login_providers ()
{
	const elements = document.querySelectorAll( '[data-login-provider=true]' );
	if ( ! elements ) { return ; }
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
	if ( ! anchors ) { return ; }
	anchors.forEach( (element) => {
		element.addEventListener( 'click', window.router.default_event );
	} );
	return ;
}

// __main__
// Execute once DOM is loaded

document.addEventListener( 'DOMContentLoaded', () => {
	router = window.router = new Router();
	router.bind_events( [ setup_ajax_anchors, setup_login_providers ] );
	router.init();
	return ;
} );
