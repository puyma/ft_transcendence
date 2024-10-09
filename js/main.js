import bootstrap from 'bootstrap';
// import {game} from './pong.js';
import {Game} from './pong';
import { Tournament } from './tournament';

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
			setup_ajax_anchors();
			setup_login_providers();
			initEvents();
			if ( push_to_history === true ) {
				window.history.pushState( { url: url }, '', url );
			}
		} )
		.catch ( (error) => {
			console.log( "Error loading context: ", error );
		} );
	return ;
}

function initEvents() {
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
            const game = new Game('canvas');
        });
    }
	const tournamentMode = document.getElementById('tournamentMode');
	if (tournamentMode) {
		tournamentMode.addEventListener('click', (event) => {
			event.preventDefault();
			const players = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'];
			const tournament = new Tournament(players);
			tournament.startTournament();
		});
	}
}

// __main__
// Execute once DOM is loaded

document.addEventListener( 'DOMContentLoaded', () => {
	setup_ajax_anchors();
	setup_login_providers();
	initEvents();
	window.addEventListener( 'popstate', (event) => {
		var url = event.state?.url;
		if ( ! url ) {
			url = window.location.href;
		}
		fetch_page( url, false );
	} );
	return ;
} );
