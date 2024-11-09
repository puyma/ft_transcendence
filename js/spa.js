export function try_replace_content(tag, data) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, "text/html");
  const tag_in_data = doc.querySelector(tag).innerHTML;
  const tag_in_document = document.querySelector(tag);
  if (tag_in_data && tag_in_document) tag_in_document.innerHTML = tag_in_data;
  return;
}

function form_ajax_submit(ev) {
  const form = ev.target.tagName === "FORM" ? ev.target : ev.target.form;
  if (!form) {
    return;
  }

  let formdata = new FormData(form);
  //let formdata = new_FormData_compat(form);
  fetch(form.action, {
    method: "POST",
    body: formdata,
  })
    .then((response) => response.text())
    .then((data) => {
      try_replace_content("header", data);
      try_replace_content("main", data);
      try_replace_content("footer", data);
    })
    .catch((err) => {
      console.log(err);
    });
  ev.preventDefault();
  return form;
}
