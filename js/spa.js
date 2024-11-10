export function try_replace_content(tag, data) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, "text/html");
  const tag_in_data = doc.querySelector(tag).innerHTML;
  const tag_in_document = document.querySelector(tag);
  if (tag_in_data && tag_in_document) tag_in_document.innerHTML = tag_in_data;
  return;
}
