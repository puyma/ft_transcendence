//                                                                            //
// index.js                                                                   //
// Thu 22 Aug 2024 12:07:03 PM CEST                                           //

// Variables

const scheme = document.body.dataset.scheme === 'http' ? 'ws' : 'wss';
const host = document.body.dataset.host;
const webSocket = new WebSocket ( `${scheme}://${host}/ws/feed/` );
const inputAuthor = document.getElementById( "message-form__author" );
const inputText = document.getElementById( "message-form__text" );
const inputSubmit = document.getElementById( "message-form__submit" );

// Functions

// Send data to server through WebSocket
// @param	{string}	message
// @param	{WebSocket}	ws
// @return	{void}

function send_data ( message, ws )
{
	ws.send( JSON.stringify( message ) );
	return ;
}

// @param	{Event}	ev
// @return	{void}

function send_new_message ( ev )
{
	ev.preventDefault();
	const new_data = {
		"action": "add message",
		"data": {
			"author": inputAuthor.value,
			"text": inputText.value,
		},
	};
	send_data ( new_data, webSocket );
	inputText.value = "";
	return ;
}

// @param	{Event}	ev
// @return	{void}

function on_new_message ( ev )
{
	const data = JSON.parse( ev.data );
	document.querySelector( data.selector ).innerHTML = data.html;
	document.querySelector( "#messages__next-page" )
		?.addEventListener( "click", go_to_next_page );
	document.querySelector( "#messages__previous-page" )
		?.addEventListener( "click", go_to_previous_page );
	return ;
}

function get_current_page ()
{
	return ( parseInt( document.querySelector( "#paginator" ).dataset.page ) );
}

// @param	{Event}	ev
// @return	{void}

function go_to_next_page ( ev )
{
	const new_data = {
		"action": "list messages",
		"data": { "page": get_current_page() + 1, },
	};
	send_data( new_data, webSocket );
	return ;
}

// @param	{Event}	ev
// @return	{void}

function go_to_previous_page ( ev )
{
	const new_data = {
		"action": "list messages",
		"data": { "page": get_current_page() - 1, },
	};
	send_data( new_data, webSocket );
	return ;
}

// Events

webSocket.addEventListener( "message", on_new_message );

inputSubmit.addEventListener( "click", send_new_message );
