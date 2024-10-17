class Router
{
	constructor ()
	{
		window.router = this;
		this.pre_load_events = [];
		this.post_load_events = [ window.router.bind_history ];
		this.href = window.location.href;
		return ;
	}

	init ()
	{
		//this.bind_events();
		this.post_load();
	}
	
	bind_pre_event ( fn )
	{
		this.pre_load_events.push( fn );
		return ;
	}

	bind_post_event ( fn )
	{
		this.post_load_events.push( fn );
		return ;
	}

	bind_events ( fn_array, when='post' )
	{
		if ( ! fn_array )
			return ;
		if ( when === 'pre' )
			fn_array.forEach( (fn) => { this.bind_pre_event( fn ); });
		else if ( when === 'post' )
			fn_array.forEach( (fn) => { this.bind_post_event( fn ); });
		return ;
	}

	bind_history ()
	{
		window.addEventListener( 'popstate', window.router.default_history_event );
		return ;
	}
	
	notify ( url )
	{
		if ( url.startsWith( '/' ) )
			this.href = `${window.location.origin}${url}`;
		else if ( url.startsWith( 'https://' ) || url.startswith( 'http://' ) )
			this.href = url;
		this.load_content();
		return ;
	}

	default_event ( ev )
	{
		ev.preventDefault();
		let href = ev.target?.getAttribute( 'href' );
		window.router.notify( href );
		return ;
	}
	
	default_history_event ()
	{
		let href = window.location.href;
		window.router.notify( href );
		return ;
	}

	history_update ()
	{
		try { window.history.pushState( {}, '', this.href ); }
		catch ( err ) { console.log( err ); }
		return ;
	}

	pre_load ()
	{
		if ( this.pre_load_events.length === 0 )
			return ;
		return ;
	}

	post_load ()
	{
		if ( this.post_load_events.length === 0 )
			return ;
		this.post_load_events.forEach( (fn) => {
			try { fn(); }
			catch ( err ) { console.log( err ); }
		});
		this.history_update( this.url );
		return ;
	}

	load_content ()
	{
		this.pre_load();
		fetch( this.href, { method: "GET" } )
			.then( (response) => response.text() )
			.then( (data) => {
				const parser = new DOMParser();
				const doc = parser.parseFromString( data, 'text/html' );
				const main_tag = doc.querySelector( 'main' ).innerHTML;
				document.querySelector( 'main' ).innerHTML = main_tag;
			} )
			.then( () => { this.post_load(); } )
			.catch ( (err) => { console.log( err ) } );
		return ;
	}

}

export { Router };
