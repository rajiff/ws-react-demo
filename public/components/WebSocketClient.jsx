import React from 'react';

export default class WebSocketClient extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			messages:[],
			error: undefined
		}
	}

	componentDidMount() {
		//Connect using native socket implementation to server
		const socket = new WebSocket('ws://localhost:8080/');

		socket.addEventListener('open', function(e) {
			socket.send('sending from client@browser', function(err) {
				if(err){
					console.log('Error: ',  err);
					this.setState({error: err});
				}
				console.log('Send message');
			});
		});

		socket.addEventListener('message', (newMsg) => {
			console.log('received: %s ', newMsg);
			this.state.messages.push(newMsg.data);
			this.setState({messages: this.state.messages});
		});	}

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
