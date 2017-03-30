import React from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import io from 'socket.io-client';

export default class WebSocketClient extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			messages:[],
			myMessage: '',
			error: undefined
		}

		this.handleChange = this.handleChange.bind(this);
		this.sendMyMessage = this.sendMyMessage.bind(this);
	}

	componentDidMount() {
		this.socket = io();

		this.socket.on('PONG', (newMsg) => {
			newMsg = JSON.parse(newMsg);
			// console.log('Got message ', newMsg);
    		this.state.messages.push(newMsg);
			this.setState({messages: this.state.messages});
  		});
	}

	componentWillUnmount() {
	    if (!this.socket) return;

	    try {
	    	this.socket.close();
	    } catch (e) {
	    	console.log('Error in closing socket: ', err);
	    }
  	}

	handleChange(event) {
		this.setState({myMessage: event.target.value});
	}

	sendMyMessage() {
		if(this.socket && this.state.myMessage) {
			this.socket.emit('PING', ('New message @ browser ' + this.state.myMessage), function(result){
				// console.log('Test this', result);
				if(!result) {
					console.log('Error in sending websocket message ', result);
					this.setState({error: result});
				}
				console.log('message sent..!');
			});
		}
	}

	render() {
		return (
			<div>
				<div>
					<TextField
						hintText="Send message"
						floatingLabelText="Send message"
						value = {this.state.myMessage}
						onChange = {this.handleChange}
					/>
					<RaisedButton label="Send" primary={true} onClick={this.sendMyMessage}/>
				</div>
				<div>
					Messages({this.state.messages.length})
					<ul>
						{this.state.messages
							.sort(function(left, right){
								return left.seq <= right.seq
							})
							.map((msg) => {
								return <li key={msg.seq}>{msg.ts} : <h3 style={{display:'inline'}}>{msg.message}</h3></li>
							}
						)}
					</ul>
				</div>
			</div>);
	}
}
