export class Router {

	constructor() {

		this._route = null;

		window.addEventListener( 'popstate', () => {
			console.log( this.getRoute() );
		});

	}

	getRoute() {
		return ( window.location );
	}

}
