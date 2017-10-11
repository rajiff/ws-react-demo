import React from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import io from 'socket.io-client';
import P2PSocket from 'socket.io-p2p';

export default class WebSocketClient extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			messages:[],
			myMessage: '',
			error: undefined
		}
	} // end of constructor

	componentDidMount() {
		this.wsSocket = io();

		let options = { autoUpgrade: false, numClients: 10, peerOpts: { numClients: 10} };

		this.p2pSocket = new P2PSocket(this.wsSocket, options, () => {
			console.log("New PEER ", this.p2pSocket.peerId);

			this.p2pSocket.emit('event::onNewPEER', 'Hello there, I am ' + this.p2pSocket.peerId);
		});

		this.p2pSocket.on('ready', function() {
			this.p2pSocket.usePeerConnection = true;
  		this.p2pSocket.emit('peer-obj', { peerId: this.p2pSocket.peerId });
		});

		this.p2pSocket.on('peer-msg', function(data){
  		console.log("Peer msg data: ", data);
		});

		this.p2pSocket.on('upgrade', function (data) {
			console.log("Socket is upgrading to WebRTC with data: ", data);
		});

		this.p2pSocket.on('peer-error', function (err) {
			console.log("Error: ", err);
		});

		this.p2pSocket.on('event::PONG', (newMsg) => {
			newMsg = JSON.parse(newMsg);

			// console.log('Got message ', newMsg);
    	let messages = this.state.messages;
    	messages.push(newMsg);
			this.setState({messages: messages});
  	});

  	this.p2pSocket.on('event::onToWebRTC', (newMsg) => {
  		console.log("Switching to WebRTC..!");

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

		this.p2pSocket.emit('event::overToWebRTC', true);
	}

	upgradeToWebRTC = () => {
		this.p2pSocket.upgrade();
		// this.p2pSocket.useSockets = false;
	}

	sendMyMessage = () => {
		if( (this.wsSocket && this.p2pSocket) && this.state.myMessage) {
			console.log("Sending message..!");
			this.p2pSocket.emit('event::PING', ('New message @ browser ' + this.state.myMessage));
			/*this.p2pSocket.emit('event::PING', ('New message @ browser ' + this.state.myMessage), function(result){
				// console.log('Test this', result);
				if(!result) {
					console.log('Error in sending message ', result);
					this.setState({error: result});
				}
				console.log('message sent..!');
			});*/
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
				</div>
				<div>
					<RaisedButton label="Send" primary={true} onClick={this.sendMyMessage} style={{margin: '5px'}}/>

					<RaisedButton label="Over WebRTC" primary={false} onClick={this.switchToWebRTC} style={{margin: '5px'}}/>
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
