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
		.then( () => { window.router.bind_events( [ 'a[data-ajax=true]' ] ); } )
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
		//this.bind_events();
		this.post_reload();
	}

	notify ( url )
	{
		console.log( `notify: ${url}` );
		// Don't reload if already on that url?? Maybe yes...
		//if ( url === this.url )
		//	return ;
		this.url = url;
		if ( !url.startsWith('https://') && !url.startsWith( 'http://' ) )
			this.url = `${window.dataset.scheme}://${window.dataset.host}/${url}`;
		this.reload_content();
		return ;
	}

	default_event ( ev )
	{
		ev.preventDefault();
		window.router.notify( ev.target.getAttribute( 'href' ) );
		return ;
	}

	bind_events ( selectors )
	{
		console.log( 'bind_events' );
		selectors.forEach( (sel) => {
			let elements = window.document.querySelectorAll( sel );
			elements.forEach( (el) => {
				el.addEventListener( 'click', this.default_event );
			});
		});
		return ;
	}

	update_history ( url )
	{
		console.log( url );
		// if relative url...
		// items are being repeated when relative
		// else ...
		//window.history.pushState( {}, '', url );
		return ;
	}

	reload_content ()
	{
		this.pre_reload();
		console.log( `reload_content: ${this.url}` );
		fetch_page( this.url );
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

	post_reload ()
	{
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

	// @fn		setupAjaxLinks
	//			Replaces click events on anchors with data-ajax=true attr.
	// @return	{void}

	setup_ajax_anchors ()
	{
		const anchors = document.querySelectorAll( 'a[data-ajax=true]' );
		anchors.forEach( (element) => {
			element.addEventListener( 'click', (event) => {
				event.preventDefault();
				window.router.notify( element.getAttribute( 'href' ) );
			} )
		} );
		return ;
	}
}

export { fetch_page };
export { Router };
