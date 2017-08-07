import React from 'react';
import ReactDOM from 'react-dom';
import Layout from './components/layout.js';

window.onload = () => {
  ReactDOM.render(<Layout/ >, document.getElementById('main'));
};