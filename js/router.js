function fetch_page ( url )
{
	fetch( url, { method: "GET" } )
		.then( (response) => response.text() )
		.then( (data) => {
			const parser = new DOMParser();
			const doc = parser.parseFromString( data, 'text/html' );
			const main_tag = doc.querySelector( 'main' ).innerHTML;
			document.querySelector( 'main' ).innerHTML = main_tag;
		} )
		.catch ( (error) => {
			console.log( "Error loading context: ", error );
		} );
	return ;
}

class Router
{

	// array of functions to execute every time a page is (re)loaded.
	url;
	things_to_reset = [];

	constructor ()
	{
		this.url = window.location.href;
		return ;
	}

	init ()
	{
		this.bind_events();
		this.post_reload();
	}

	notify ( url )
	{
		console.log( `notify: ${url}` );
		if ( url === this.url )
			return ;
		this.url = url;
		this.reload_content();
		return ;
	}

	bind_events ()
	{
		// Reaccionar al canvi de url,
		// ja sigui per part d'un boto,
		// enllac o per part de l'historial...

		// set url
		return ;
	}

	update_history ( url )
	{
		console.log( url );
		// if relative url...
		// items are being repeated when relative
		// else ...
		window.history.pushState( {}, '', url );
		return ;
	}

	reload_content ()
	{
		this.pre_reload();
		console.log( `reload_content: ${this.url}` );
		//let content = this.fetch_content();
		//window.document.getElementsByTagName( 'main' )[0]
		//	.innerHTML = content;
		this.post_reload();
		return ;
	}

	pre_reload ()
	{
		return ;
	}


	post_reload () {
		this.things_to_reset.forEach( (fn) => {
			try { fn(); }
			catch ( err ) { console.log( err ); }
		});
		this.update_history( this.url );
		return ;
	}

	add_post_event ( fn )
	{
		this.things_to_reset.push( fn )
		return ;
	}

	add_post_events ( fn_array )
	{
		fn_array.forEach( (fn) => { this.add_post_event( fn ); });
		return ;
	}
}

export { fetch_page };
export { Router };
