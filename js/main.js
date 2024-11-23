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
  /*console.log("holaaaaaaaa");*/
  gameButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      let mode = button.getAttribute("data-mode");
      let gameType = button.getAttribute("data-type"); // "2d" or "3d"
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

      /*console.log(`Mode: ${mode}, Game Type: ${gameType}, Players:`, players);*/

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
    });
  });
}

function main() {
  router = window.router = new Router();
  router.attach([initPlay], "post");
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
  //router.add_event(window.router, 'history', , );
  router.init();
  return;
}

document.addEventListener("DOMContentLoaded", main);
