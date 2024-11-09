import { Button } from "bootstrap";
import { Collapse } from "bootstrap";
import { Dropdown } from "bootstrap";
import { Toast } from "bootstrap";
import { Router } from './router.js';
import { Game } from './pong';
import { Tournament } from './tournament';
import { Game as Game3D } from './pong3d.js';  

// variables

//const host = document.body.dataset.host;
//const ws = new WebSocket( `wss://${host}/ws/` )

// functions


// @fn		setup_login_providers
// @return	{void}

function setup_login_providers() {
  const elements = document.querySelectorAll("[data-login-provider=true]");

  if (!elements) {
    return;
  }
  elements.forEach((element) => {
    const url = element.getAttribute("data-login-provider-url");
    element.addEventListener("click", (event) => {
      event.preventDefault();
      window.open(url, "_self");
    });
  });
  return;
}
<<<<<<< HEAD

// @fn		event_handler_anchor
// @ev		{Event}
// @return	{void}

function event_handler_anchor(event) {
  const href = event.target?.getAttribute("href");

  event.preventDefault();
  Router.notify(href);
  return;
}

// @fn		event_handler_form
// @ev		{Event}
// @return	{void}

function event_handler_form(event) {
  const target = event.target;
  const form = target.tagName === "FORM" ? target : target.form;
  const form_data = new FormData(form);

  event.preventDefault();
  console.log(form_data);
  // send form POST
  // wait response,
  // swap content,
  // update history
  return;
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

<<<<<<< HEAD
function main() {
  router = window.router = new Router();
  router.attach([setup_login_providers], "pre");
  router.add_event(
    window.document,
    "click",
    'a[data-ajax="true"]',
    event_handler_anchor,
  );
  /*
  router.add_event(
    window.document,
    "submit",
    'form[data-ajax="true"]',
    event_handler_form,
  );
  */
  //router.add_event(window.router, 'notify', , );
  //router.add_event(window.router, 'history', , );
  router.init();
  return;
}

document.addEventListener("DOMContentLoaded", main);

/*
document.addEventListener( 'DOMContentLoaded', () => {
	const game = window.game = new Game3D();
	router = window.router = new Router();
	router.bind_events( [ setup_ajax_anchors, setup_login_providers, initPlay ] );
	router.init();

	const game = new Game( 'canvas' );
	return ;
} );
*/
