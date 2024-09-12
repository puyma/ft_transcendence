import bootstrap from 'bootstrap';

document.addEventListener('DOMContentLoaded', function() {
	// Guarda la URL de la página de inicio
	const homeUrl = window.location.href;
	
	// Asigna eventos de click a los enlaces con data-ajax=true
	setupAjaxLinks();

	// asignar eventos de click a los enlaces AJAX
	function setupAjaxLinks() {
		document.querySelectorAll('a[data-ajax=true]').forEach(function(link) {
			link.addEventListener('click', function(event) {
				event.preventDefault();
				var url = this.getAttribute('href');
				fetchPage(url, true);
			});
		});
	}

	// cargar y actualizar el contenido
	function fetchPage(url, addToHistory) {
		fetch(url)
			.then(response => response.text())
			.then(data => {
				var parser = new DOMParser();
				var doc = parser.parseFromString(data, 'text/html');
				var newContent = doc.querySelector('main').innerHTML;
				document.querySelector('main').innerHTML = newContent;
				
				// Vuelve a asignar eventos de click a los enlaces AJAX en el nuevo contenido
				setupAjaxLinks();
				
				// Agrega al historial si se requiere
				if (addToHistory) {
					history.pushState({ url: url }, '', url);
				}
			})
			.catch(error => {
				console.error('Error loading content: ', error);
			});
	}

	// Maneja los eventos de popstate para la navegación con las flechas
	window.onpopstate = function(event) {
		if (event.state && event.state.url) {
			// Carga el contenido de la URL almacenada en el historial
			fetchPage(event.state.url, false);
		} else {
			// Cargar la página de inicio si no hay estado guardado
			fetchPage(homeUrl, false);
		}
	};
});
