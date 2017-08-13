import React from 'react';
import ReactDOM from 'react-dom';
import Layout from './components/Layout.js';
import { BrowserRouter } from 'react-router-dom';

window.onload = () => {
  ReactDOM.render(<BrowserRouter><Layout apiRoot={window.apiRoot} appUrl={window.appUrl} username={window.currentUsername} userId={window.currentUserId}/></BrowserRouter>, document.getElementById('main'));
};