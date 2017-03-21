import React from 'react';
import WebSocket from 'ws';

export default class WebSocketClient extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			messages:[],
			error: undefined
		}

	}

	componentDidMount() {
		console.log('Component did mount with websocket client');
		const ws = new WebSocket('ws://localhost:8080/');

		ws.on('open', function() {
			ws.send('sending from client@browser', function(err) {
				if(err){
					console.log('Error: ',  err);
					this.setState({error: err});
				}
				console.log('Send message');
			});
		});

		ws.on('message', function(newMsg) {
			console.log('received: %s ', newMsg);
			this.setState({messages: this.state.messages.push(newMsg)});
		});
	}

	render() {
		return (
			<div>
				Message: {this.state.messages.length}
				<ol>
					{this.state.messages.map((msg) => {
						<li>{msg}</li>
					})}
				</ol>
			</div>);
	}
}
