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

window.dataset = {};
window.dataset.scheme = document.body.dataset.scheme;
window.dataset.host = document.body.dataset.host;

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

// __main__
// Execute once DOM is loaded

document.addEventListener( 'DOMContentLoaded', () => {
	router = window.router = new Router();
	router.add_post_events( [ setup_login_providers ] );
	router.bind_events( [ 'a[data-ajax=true]' ] );
	router.init();
	return ;
} );
