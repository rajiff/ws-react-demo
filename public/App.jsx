import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

import WebSocketClient from './components/WebSocketClient.jsx';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

injectTapEventPlugin();

ReactDOM.render((
  <MuiThemeProvider>
    <div style={{'margin': '10px'}}>
      <h1>Websocket Example</h1>
      <h3>Messages</h3>
      <WebSocketClient></WebSocketClient>
    </div>
  </MuiThemeProvider>
), document.getElementById('app'));
