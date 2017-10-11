import React from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import io from 'socket.io-client';
import P2PSocket from 'socket.io-p2p';

export default class WebSocketClient extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isWebRTCReady: false,
			isSwitchedToWebRTC: false,
			messages:[],
			myMessage: '',
			error: undefined
		}
	} // end of constructor

	componentDidMount() {
		this.wsSocket = io();

		let options = {peerOpts: {trickle: false}, autoUpgrade: false};

		this.p2pSocket = new P2PSocket(this.wsSocket, options, () => {
			//This take time
			this.p2pSocket.emit('peer-obj', 'Hello there. I am ' + this.p2pSocket.peerId);
			console.log("New PEER ", this.p2pSocket.peerId, " is Ready");
			this.setState({isWebRTCReady: true});
		});

		this.p2pSocket.on('peer-msg', (newMsg) => {
			console.log('Got message ', newMsg);
			newMsg = JSON.parse(newMsg);

    	let messages = this.state.messages;
    	messages.push(newMsg);
			this.setState({messages: messages});
  	});

  	this.p2pSocket.on('go-private', (newMsg) => {
  		console.log("Switching to WebRTC..! ", newMsg);

			this.upgradeToWebRTC();
  	});
	} // end of componentDidMount

	componentWillUnmount() {
    if (this.wsSocket) {
    	try {
    		this.wsSocket.close();
    	} catch (e) {
    		console.log('Error in closing web socket: ', err);
    	}
    }

    if(this.p2pSocket) {
    	try {
    		this.p2pSocket.close();
    	} catch (e) {
    		console.log('Error in closing web socket: ', err);
    	}
    }
	}

	handleNewMessage = (event) => {
		this.setState({myMessage: event.target.value});
	}

	switchToWebRTC = () => {
		console.log("Going to switch to WebRTC..!");

		this.upgradeToWebRTC();

		this.p2pSocket.emit('go-private', true)
	}

	upgradeToWebRTC = () => {
		// this.p2pSocket.upgrade();
		this.p2pSocket.useSockets = false;

		this.setState({isWebRTCReady: false, isSwitchedToWebRTC: true});
	}

	sendMyMessage = () => {
		if( (this.wsSocket && this.p2pSocket) && this.state.myMessage) {
			console.log("Sending message..!");
			let now = new Date();
			let msg = {
				peer: this.p2pSocket.peerId,
				ts: (now.toDateString() + ' ' + now.toTimeString()),
				message: `[${this.p2pSocket.peerId}] ${this.state.myMessage}`
			};
			this.p2pSocket.emit('peer-msg', JSON.stringify(msg), function(result) {
				// console.log('Test this', result);
				if(!result) {
					console.log('Error in sending message ', result);
					this.setState({error: result});
				}
				console.log('message sent..!');
			});
		} else {
			console.log(":-(");
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
						onChange = {this.handleNewMessage}
					/>
					<RaisedButton label="Send" primary={true} onClick={this.sendMyMessage} style={{margin: '5px'}}/>
				</div>
				<div>
					<FlatButton label="Switch to WebRTC" disabled={!this.state.isWebRTCReady} primary={true} onClick={this.switchToWebRTC} style={{margin: '5px'}}/>
					{ (this.state.isSwitchedToWebRTC) ? <h2>WebRTC enabled</h2> : '' }
				</div>
				<div>
					Messages({this.state.messages.length})
					<ul>
						{this.state.messages
							.sort(function(left, right){
								return left.ts <= right.ts
							})
							.map((msg, index) => {
								return <li key={index}>{msg.ts} : <h3 style={{display:'inline'}}>{msg.message}</h3></li>
							}
						)}
					</ul>
				</div>
			</div>);
	}
}
