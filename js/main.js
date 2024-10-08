import bootstrap from 'bootstrap';
import Game from './pong3d.js';

// variables

const scheme = document.body.dataset.scheme === 'http' ? 'ws' : 'wss';
const host = document.body.dataset.host;
let modoJuego = '';

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
			
			
// Función para establecer el modo de juego
function setModoJuego(modo) {
	localStorage.setItem('modoJuego', modo);
}

// Función para obtener el modo de juego almacenado
function getModoJuego() {
	return localStorage.getItem('modoJuego') || 'default'; // Puedes cambiar 'default' a un modo específico si es necesario
}

function setup_ajax_anchors() {
    const anchors = document.querySelectorAll('a[data-ajax=true]');
    anchors.forEach((element) => {
        element.addEventListener('click', (event) => {
            event.preventDefault();
            const modo = element.textContent.trim(); // Obtener el texto del botón
            setModoJuego(modo); // Almacenar el modo de juego seleccionado
            fetch_page(element.getAttribute('href'), true);
        });
    });
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

    return;
	} );

function initGame() {
	// Iniciar el juego si se ha seleccionado un modo
    const modoJuegoSeleccionado = getModoJuego();
    const game = new Game();
    game.start(); // Inicia el juego
}