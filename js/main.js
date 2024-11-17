import { Button } from "bootstrap";
import { Collapse } from "bootstrap";
import { Dropdown } from "bootstrap";
import { Toast } from "bootstrap";
import { Router } from "./router.js";
import { Game } from "./pong";
import { Tournament } from "./tournament";
import { Game as Game3D } from "./pong3d.js";

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

// @fn		event_handler_anchor
// @ev		{Event}
// @return	{void}

function event_handler_anchor(event) {
  const href = event.target?.getAttribute("href");

  event.preventDefault();
  Router.get(href);
  return;
}

// @fn		event_handler_form
// @ev		{Event}
// @return	{void}

function event_handler_form(event) {
  const target = event.target;
  const form = target.tagName === "FORM" ? target : target.form;

  event.preventDefault();
  Router.post(form);
  // TO DO:
  // update history
  return;
}
function initPlay() {
  // Fetch player aliases for the tournament from the JSON script, if available
  const tournamentAliases = document.getElementById("playerData")
    ? JSON.parse(document.getElementById("playerData").textContent)
    : [];

  // Get all game mode buttons
  const gameButtons = document.querySelectorAll("[id$='Play']");

  gameButtons.forEach(button => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      // Get the selected mode and players from the data attributes
      const mode = button.getAttribute("data-mode");
      let players;

      if (mode === "tournament") {
        // Use the JSON data for tournament mode
        players = tournamentAliases;
      } else if (mode === "solo") {
        // Use the data-players attribute for solo mode
        players = button.getAttribute("data-players").split(",");
      } else if (mode == "double_play")
        players = button.getAttribute('data-players').split(",");

      console.log(`Mode: ${mode}, Players:`, players);

      // Create and set up the canvas
      let canvas = document.createElement("canvas");
      canvas.id = "canvas";
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;

      const main = document.querySelector("main");
      if (main) {
        main.replaceChildren(canvas);
      } else {
        console.error("<main> element not found.");
        return;
      }

      // Initialize the game do it better this main !!
      const tournament = new Tournament(players);
      tournament.startTournament();
    });
  });
}


document.addEventListener("DOMContentLoaded", initPlay);


// function initPlay() {
//   const startGame = document.getElementById("playGame");
//   // get players dinamically form tournament page WIP
//   // const players = JSON.parse(document.getElementById('playerData').textContent);
//   // console.log(players);
//   if (startGame) {
//     startGame.addEventListener("click", (event) => {
//       event.preventDefault();
//       let canvas = document.createElement("canvas");
//       canvas.id = "canvas";
//       canvas.style.width = `${window.innerWidth}px`;
//       canvas.style.height = `${window.innerHeight}px`;
//       canvas.width = window.innerWidth * window.devicePixelRatio;
//       canvas.height = window.innerHeight * window.devicePixelRatio;

//       const main = document.querySelector("main");
//       if (main) {
//         main.replaceChildren(canvas);
//       } else {
//         console.error("<main> element not found.");
//         return;
//       }
//       const players = ["mica", "clara", "ana"];
//       const tournament = new Tournament(players);
//       tournament.startTournament();
//     });
//   }
// }
// const tournamentMode = document.getElementById('tournamentMode');
// if (tournamentMode) {
// 	tournamentMode.addEventListener('click', (event) => {
// 		event.preventDefault();
// 		const players = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'];
// 		const tournament = new Tournament(players);
// 		tournament.startTournament();
// 	});
// }

// __main__
// Execute once DOM is loaded

function main() {
  router = window.router = new Router();
  router.attach([setup_login_providers], "pre");
  router.attach([initPlay], "post");
  router.add_event(
    window.document,
    "click",
    'a[data-ajax="true"]',
    event_handler_anchor
  );
  router.add_event(
    window.document,
    "submit",
    'form[data-ajax="true"]',
    event_handler_form
  );
  //router.add_event(window.router, 'get', , );
  //router.add_event(window.router, 'history', , );
  router.init();
  return;
}

document.addEventListener("DOMContentLoaded", main);
