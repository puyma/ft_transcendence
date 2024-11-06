import { Button } from 'bootstrap';
import { Collapse } from 'bootstrap';
import { Dropdown } from 'bootstrap';
import { Toast } from 'bootstrap';

import { Router } from './router.js';
import { Game } from './pong.js';
import { Game as Game3D } from './pong3d.js';  

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

// function setup_game_buttons() {
//     const button = window.document.getElementById('pong-play-btn');
//     if (button != null) {
//         button.addEventListener('click', () => {
//             if (!window.game || window.game.isFinished) {
//                 window.game = new Game3D();
//                 window.game.start();
//             } else {
//                 console.log("juego cargado");
//             }
//         });
//     }
// }
// MIRAR CUAL DE LAS DOS FUNCIONA MEJOR---------------------->

function setup_game_buttons ()
{
	const button = window.document.getElementById('pong-play-btn');
	if ( button != null	 )
		button.addEventListener( 'click', window.game.start.bind( window.game ) );
	return ;
}

// __main__
// Execute once DOM is loaded

document.addEventListener( 'DOMContentLoaded', () => {
	const game = window.game = new Game3D();
	router = window.router = new Router();
	router.bind_events([
		setup_ajax_anchors,
		setup_login_providers,
		setup_game_buttons,
	]);
	router.init();
	return ;
} );
