import { Button } from "bootstrap";
import { Collapse } from "bootstrap";
import { Dropdown } from "bootstrap";
import { Toast } from "bootstrap";

import { Router } from "./router.js";
import { Game } from "./pong.js";
import { Tournament } from "./tournament.js";
import { Game as Game3D } from "./pong3d.js";

// variables

//const host = document.body.dataset.host;
//const ws = new WebSocket( `wss://${host}/ws/` )

// functions

function event_handler_double_play_btn(event) {
  // Add query parameter for Player 1 without affecting Player 2's state
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set('anonymous', 'true');
  let url = `${location.pathname}?${urlParams}`;
  //window.history.pushState({}, '', url);
  Router.get(url);
  //window.location.reload();
  return;
}

function event_handler_double_play_btn2(event) {
  // Add query parameter for Player 1 without affecting Player 2's state
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set('anonymous2', 'true');
  let url = `${location.pathname}?${urlParams}`;
  //window.history.pushState({}, '', `${location.pathname}?${urlParams}`);
  Router.get(url);
  //window.location.reload();
  return;
}

function updatePageState() {
  // Check for "anonymous" and "anonymous2" parameters in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const isPlayer1Anonymous = urlParams.get('anonymous') === 'true';
  const isPlayer2Anonymous = urlParams.get('anonymous2') === 'true';

  // Update the visibility of the "anonymous" messages
  const playAnonymousBtn = document.getElementById('playAnonymousBtn');
  const playAnonymousBtn2 = document.getElementById('playAnonymousBtn2');
}

// @fn		setup_login_providers
// @return	{void}

function event_handler_login_provider(event) {
  const href = event.target.getAttribute("data-login-provider-url");
  event.preventDefault();
  window.open(href, "_self");
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
  const tournamentAliases = document.getElementById("playerData")
    ? JSON.parse(document.getElementById("playerData").textContent)
    : [];

  const gameButtons = document.querySelectorAll("[id$='Play']");
  gameButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      let mode = button.getAttribute("data-mode");
      let gameType = button.getAttribute("data-type");
      let players;

      if (mode === "tournament") {
        players = tournamentAliases;
        if (players.length > 3) {
          mode = "knockout";
        } else {
          mode = "all_vs_all";
        }
      } else if (mode === "solo_play") {
        players = button.getAttribute("data-players").split(",");
      } else if (mode == "double_play")
        players = button.getAttribute("data-players").split(",");

      console.log(`Mode: ${mode}, Game Type: ${gameType}, Players:`, players);

      if (gameType === "3d") {
        let player1 = players[0];
        let player2 = players[1];
        console.log(`Mode: ${mode}, Game Type: ${gameType}, Players:`, players);
        const game = new Game3D(player1, player2);
        game.init();
      }
      else {
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
          /*console.error("<main> element not found.");*/
          return;
        }
        const tournament = new Tournament(players, "2d", mode);
        tournament.startTournament();
      }
    });
  });
}

function updateStyles() {
  const checkbox = document.getElementById('changeStyleSwitch');
  const body = document.body;
  if (checkbox.checked) {
      // Si el checkbox está activado, añadimos la clase 'mode3D' y el atributo 'data-bs-theme="dark"'
      body.classList.add('mode3D');
      // Cambiar el estilo visual del checkbox (activado)
      checkbox.classList.add('checkbox-activated');
      console.log("Modo 3D y tema oscuro activados");
  } else {
      // Si el checkbox está desactivado, eliminamos los estilos
      body.classList.remove('mode3D');
      // Restablecer el estilo visual del checkbox
      checkbox.classList.remove('checkbox-activated');
      console.log("Modo 3D y tema oscuro desactivados");
  }
}

function updateBackground3D(event)
{
	const body = window.document.getElementsByTagName('body')[0];
	const currentPage = window.location.pathname;

	console.log(currentPage);
  if (window.location.pathname === "/") {
    document
      .getElementsByTagName("header")?.[0]
      ?.classList.remove("d-none");
  }

	if (currentPage === "/tresD/" || currentPage === "/tresD/play")
		body.classList.add("tresd-body");
	else
		body.classList.remove("tresd-body"); 
}

function main() {
  router = window.router = new Router();
  router.attach([initPlay, updatePageState, updateBackground3D], "post");
  router.add_event(
    window.document,
    "click",
    'a[data-ajax="true"]',
    event_handler_anchor,
  );
  router.add_event(
    window.document,
    "click",
    'button[data-login-provider="true"]',
    event_handler_login_provider,
  );
  router.add_event(
    window.document,
    "submit",
    'form[data-ajax="true"]',
    event_handler_form,
  );
  router.add_event(
    window.document,
    "click",
    'button#playAnonymousBtn',
    event_handler_double_play_btn
  );
  router.add_event(
    window.document,
    "click",
    'button#playAnonymousBtn2',
    event_handler_double_play_btn2
  );
  // router.add_event(
  //   window.document,
  //   "change",
  //   'input[type="checkbox"]#changeStyleSwitch',
  //   updateStyles
  // );
  router.init();
  return;
}

document.addEventListener("DOMContentLoaded", main);
