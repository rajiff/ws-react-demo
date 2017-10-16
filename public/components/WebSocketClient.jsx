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
			pageScreenshotColln: [],
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

  	this.p2pSocket.on('peer-file', (data) => {
    	this.pushNewScreenShot(data.file);
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

  pushNewScreenShot = (data) => {
    let blob = data;
    // let blob = new window.Blob([new Uint8Array(data.file)], {type: 'test/html'});
    let urlCreator = window.URL || window.webkitURL
    let fileUrl = urlCreator.createObjectURL(blob)

    console.log("Received blob ", blob);
    console.log("URL ", fileUrl);
    // window.open(fileUrl);
    let colln = this.state.pageScreenshotColln;
    colln.push(fileUrl);
    this.setState({pageScreenshotColln: colln});
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

			let screenShotBlog = this.screenShotPage();
			console.log("Sending blob ", screenShotBlog);
  		this.p2pSocket.emit('peer-file', {file:screenShotBlog});

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

	takeScreenShotDirect = () => {
		let screenshot = document.documentElement.cloneNode(true);

		screenshot.style.pointerEvents = 'none';
  		screenshot.style.overflow = 'hidden';
  		screenshot.style.userSelect = 'none'; // Note: need vendor prefixes

  		let blob = new Blob([screenshot.outerHTML], {type: 'text/html'});

  		return blob;
	}

	takeMyScreenShot = (event) => {
		// window.open(window.URL.createObjectURL(this.screenShotPage()));
		// window.open(window.URL.createObjectURL(this.takeScreenShotDirect()));
    // let screenShotBlog = this.screenShotPage();
    this.pushNewScreenShot(this.screenShotPage());
	}

	urlsToAbsolute = (nodeList) => {
    if (!nodeList.length) {
      return [];
    }

    let attrName = 'href';
    if (nodeList[0].__proto__ === HTMLImageElement.prototype ||
      nodeList[0].__proto__ === HTMLScriptElement.prototype) {
      attrName = 'src';
    }

    nodeList = [].map.call(nodeList, function(el, i) {
      let attr = el.getAttribute(attrName);
      // If no src/href is present, disregard.
      if (!attr) {
        return;
      }

      let absURL = /^(https?|data):/i.test(attr);
      if (absURL) {
        return el;
      } else {
        // Set the src/href attribute to an absolute version. 
        // if (attr.indexOf('/') != 0) { // src="images/test.jpg"
        //        el.setAttribute(attrName, document.location.origin + document.location.pathname + attr);
        //      } else if (attr.match(/^\/\//)) { // src="//static.server/test.jpg"
        //        el.setAttribute(attrName, document.location.protocol + attr);
        //      } else {
        //        el.setAttribute(attrName, document.location.origin + attr);
        //      }

        // Set the src/href attribute to an absolute version. Accessing
        // el['src']/el['href], the browser will stringify an absolute URL, but
        // we still need to explicitly set the attribute on the duplicate.
        el.setAttribute(attrName, el[attrName]);
        return el;
      }
    });
    return nodeList;
  }

  // TODO: current limitation is css background images are not included.
  screenShotPage = () => {
    // 1. Rewrite current doc's imgs, css, and script URLs to be absolute before
    // we duplicate. This ensures no broken links when viewing the duplicate.
    this.urlsToAbsolute(document.images);
    this.urlsToAbsolute(document.querySelectorAll("link[rel='stylesheet']"));
    //urlsToAbsolute(document.scripts);

    // 2. Duplicate entire document.
    let screenshot = document.documentElement.cloneNode(true);

    // Use <base> to make anchors and other relative links absolute.
    let b = document.createElement('base');
    b.href = document.location.protocol + '/' + location.host;
    let head = screenshot.querySelector('head');
    head.insertBefore(b, head.firstChild);

    // 3. Screenshot should be readyonly, no scrolling, and no selections.
    screenshot.style.pointerEvents = 'none';
    screenshot.style.overflow = 'hidden';
    screenshot.style.webkitUserSelect = 'none';
    screenshot.style.mozUserSelect = 'none';
    screenshot.style.msUserSelect = 'none';
    screenshot.style.oUserSelect = 'none';
    screenshot.style.userSelect = 'none';

    // 4. Preserve current x,y scroll position of this page. See addOnPageLoad_().
    screenshot.dataset.scrollX = window.scrollX;
    screenshot.dataset.scrollY = window.scrollY;

    // 4.5. When the screenshot loads (e.g. as ablob URL, as iframe.src, etc.),
    // scroll it to the same location of this page. Do this by appending a
    // window.onDOMContentLoaded listener which pulls out the saved scrollX/Y
    // state from the DOM.
    let script = document.createElement('script');
    script.textContent = '(' + this.addOnPageLoad.toString() + ')();'; // self calling.
    screenshot.querySelector('body').appendChild(script);

    // 5. Create a new .html file from the cloned content.
    let blob = new Blob([screenshot.outerHTML], { type: 'text/html' });

    return blob;
  }

  // NOTE: Not to be invoked directly. When the screenshot loads, it should scroll
  // to the same x,y location of this page.
  addOnPageLoad = () => {
    window.addEventListener('DOMContentLoaded', function(e) {
      let scrollX = document.documentElement.dataset.scrollX || 0;
      let scrollY = document.documentElement.dataset.scrollY || 0;
      window.scrollTo(scrollX, scrollY);
    });
  }

  getImageFromBlob = (imgBlob) => {
    let urlCreator = window.URL || window.webkitURL;
    let blob = new Blob([imgBlob], {type: 'text/jpeg'});

  	return urlCreator.createObjectURL(imgBlob);
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
					<FlatButton label="Take Screenshot" primary={true} onClick={this.takeMyScreenShot} style={{margin: '5px'}}/>
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
				<div>
					{
						this.state.pageScreenshotColln.map((imgUrl, index) => {
							return <a key={index} href={imgUrl}>Click here</a>
						})
					}
				</div>
			</div>);
	}
}
