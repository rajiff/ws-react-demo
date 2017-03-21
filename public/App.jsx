import React from 'react';
import ReactDOM from 'react-dom';

import WebSocketClient from './components/WebSocketClient.jsx';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

ReactDOM.render((
    <MuiThemeProvider>
        <div>
            <h1>Websocket Example</h1>
            <h3>Messages</h3>
            <WebSocketClient></WebSocketClient>
        </div>
    </MuiThemeProvider>
), document.getElementById('app'));
