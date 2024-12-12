import { try_replace_content } from "./spa.js";

// class Router
//
// #events = { 'click': [ { selector: '', func: '' }, ... ], ... };

class Router {
  static #_instance = null;

  #href = null;
  #events = new Object();

  constructor() {
    if (this._instance != null) return Router._instance;
    Router._instance = this;
    this.href = window.location.href;
    this.form = null;
    this.form_data = null;
    this.#history_update();
    this.pre_load_events = [];
    this.post_load_events = [];
    this.add_event(window.document, "click", 'a[data-ajax="true"]', null);
    //this.add_event(window.document, "submit", 'form[data-ajax="true"]', null);
    this.add_event(window, "popstate", null, function () {
      Router.get(window.location.href);
      return;
    });
    return;
  }

  init() {
    this.pre_load();
    this.post_load();
    return;
  }

  add_event(_interface, event_name, selector, func) {
    let event_array = null;
    let event_data = null;

    // Create empty an array corresponding to an event_name identifier
    // if has not been set previously.
    if (Object.hasOwn(this.#events, event_name) != true)
      this.#events[event_name] = [];
    event_array = this.#events[event_name];

    // Get event_data if already set
    event_data = this.#events[event_name].find((item) => {
      return Object.hasOwn(item, "selector") && item.selector === selector;
    });
    if (event_data == undefined) {
      let pos = this.#events[event_name].push(new Object());
      event_data = this.#events[event_name].at(pos - 1);
    }

    // Set event_data content
    event_data.selector = selector;
    event_data.func = func;

    this.#bind_event(_interface, event_name);
    return;
  }

  #bind_event(_interface, event_name) {
    _interface.addEventListener(event_name, Router.event_controller);
    return;
  }

  static event_controller(event) {
    const router = Router._instance;
    const type = event.type;
    const target = event.target;

    if (Object.hasOwn(router.#events, type) == false) return;
    router.#events[type].forEach((obj) => {
      if (obj.selector === null || target.matches(obj.selector) === true) {
        event.preventDefault();
        try {
          obj.func(event);
        } catch (err) {
          window.console.error(err);
        }
      }
    });
    return;
  }

  #attach_pre_event(fn) {
    this.pre_load_events.push(fn);
    return;
  }

  #attach_post_event(fn) {
    this.post_load_events.push(fn);
    return;
  }

  attach(fn_array, when = "post") {
    if (!fn_array) return;
    if (when === "pre")
      fn_array.forEach((fn) => {
        this.#attach_pre_event(fn);
      });
    else if (when === "post")
      fn_array.forEach((fn) => {
        this.#attach_post_event(fn);
      });
    return;
  }

  pre_load() {
    if (this.pre_load_events.length === 0) return;
    this.pre_load_events.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        window.console.log(err);
      }
    });
    return;
  }

  post_load() {
    if (this.post_load_events.length === 0) return;
    this.post_load_events.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        window.console.log(err);
      }
    });
    this.#history_update(this.url);
    return;
  }

  static get(url) {
    const router = Router._instance;

    if (url.startsWith("/")) router.href = `${window.location.origin}${url}`;
    else if (url.startsWith("https://") || url.startsWith("http://"))
      router.href = url;
    router.load_content();
    return;
  }

  static post(form) {
    const router = Router._instance;

    router.form = form;
    router.form_data = new FormData(form);
    router.publish_content();
    return;
  }

  #history_update() {
    try {
      window.history.pushState({}, "", this.href);
    } catch (err) {
      window.console.log(err);
    }
    return;
  }

  load_content() {
    this.pre_load();
    fetch(this.href, {
      method: "GET",
    })
      .then((response) => response.text())
      .then((data) => {
        try_replace_content("header", data);
        try_replace_content("main", data);
        try_replace_content("footer", data);
      })
      .then(() => {
        this.post_load();
      })
      .catch((err) => {
        window.console.log(err);
      });
    return;
  }

  publish_content() {
    fetch(this.form.action, {
      method: "POST",
      body: this.form_data,
    })
      .then((response) => {
        if (response.ok == true) {
          this.href = response.url;
        }
        return response.text();
      })
      .then((data) => {
        try_replace_content("header", data);
        try_replace_content("main", data);
        try_replace_content("footer", data);
      })
      .then(() => {
        this.post_load();
      })
      .catch((err) => {
        window.console.log(err);
      });
    return this.form_data;
  }
}

export { Router };
