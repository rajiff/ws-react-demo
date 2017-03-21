import React from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

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
		//Connect using native socket implementation to server
		this.socket = new WebSocket('ws://localhost:8080/');

		this.socket.addEventListener('open', (e) => {
			this.socket.send('sending from client@browser', function(err) {
				if(err){
					console.log('Error: ',  err);
					this.setState({error: err});
				}
				console.log('Send message');
			});
		});

		this.socket.addEventListener('message', (newMsg) => {
			console.log('received: %s ', newMsg);
			this.state.messages.push(newMsg.data);
			this.setState({messages: this.state.messages});
		});
	}

	componentWillUnmount() {
    if (!this.socket) return;

    try { this.socket.close();
    } catch (e) {
    	console.log('Error in closing socket: ', err);
    }
  }

	handleChange(event) {
		this.setState({myMessage: event.target.value});
	}

	sendMyMessage() {
		if(this.socket && this.state.myMessage) {
			this.socket.send('New message @ browser ' + this.state.myMessage, function(err) {
				if(err){
					console.log('Error: ',  err);
					this.setState({error: err});
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
					<ol>
						{this.state.messages.map((msg) => {
							return <li>{msg}</li>
						})}
					</ol>
				</div>
			</div>);
	}
}
