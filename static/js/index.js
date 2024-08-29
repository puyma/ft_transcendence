
const scheme = document.body.dataset.scheme === 'http' ? 'ws' : 'wss';
const host = document.body.dataset.host;
const ws = new WebSocket ( `${scheme}://${host}/ws/chat/` );

// @param	{string}		message
// @param	{WebSocket}		ws
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
	const message_text = document.querySelector( "#message-text" );
	send_data( {
		"action": 'new message',
		"data": { "message": message_text.value },
	}, ws );
	message_text.value = '';
	return ;
}

// @param	{Event}	ev
// @return	{void}

function change_group ( ev )
{
	ev.preventDefault();
	send_data( {
		"action": "change group",
		"data": {
			"groupName": ev.target.dataset.groupName,
			"isGroup": ev.target.dataset.groupPublic === "true",
		},
	}, ws);
	return ;
}

ws.addEventListener( "message", (ev) => {
	const data = JSON.parse( ev.data );
	document.querySelector( data.selector ).innerHTML = data.html;

	const messages_list = document.querySelector( "#messages-list" );
	messages_list.scrollTop = messages_list.scrollHeight;

	document.querySelector( "#send" ).addEventListener( 'click', send_new_message );
	document.querySelectorAll( ".nav__link" ).forEach( button => {
		button.addEventListener( 'click', change_group );
	} );
} );
