import { Button } from 'bootstrap';
import { Collapse } from 'bootstrap';
import { Dropdown } from 'bootstrap';
import { Toast } from 'bootstrap';

import { Router } from './router.js';
import { Game } from './pong';
import { Tournament } from './tournament';

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

function initPlay() {
    const startGame = document.getElementById('playGame');
    if (startGame) {
        startGame.addEventListener('click', (event) => {
            event.preventDefault();
			let canvas = document.createElement('canvas');
            canvas.id = 'canvas';
            canvas.style.width = `${window.innerWidth}px`;
			canvas.style.height = `${window.innerHeight}px`;
			canvas.width = window.innerWidth * window.devicePixelRatio;
        	canvas.height = window.innerHeight * window.devicePixelRatio;

            const main = document.querySelector('main');
            if (main) {
                main.replaceChildren(canvas);
            } else {
                console.error('<main> element not found.');
                return;
            }
            // const game = new Game('canvas');
			const players = ['mica', 'clara', 'ana'];
			const tournament = new Tournament(players);
			tournament.startTournament();
        });
    }
	// const tournamentMode = document.getElementById('tournamentMode');
	// if (tournamentMode) {
	// 	tournamentMode.addEventListener('click', (event) => {
	// 		event.preventDefault();
	// 		const players = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'];
	// 		const tournament = new Tournament(players);
	// 		tournament.startTournament();
	// 	});
	// }
}

// __main__
// Execute once DOM is loaded

document.addEventListener( 'DOMContentLoaded', () => {
	router = window.router = new Router();
	router.bind_events( [ setup_ajax_anchors, setup_login_providers, initPlay ] );
	router.init();

	//const game = new Game( 'canvas' );
	return ;
} );
