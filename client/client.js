import React from 'react';
import ReactDOM from 'react-dom';
import Layout from './components/layout.js';
import { BrowserRouter } from 'react-router-dom';

window.onload = () => {
  ReactDOM.render(<BrowserRouter><Layout /></BrowserRouter>, document.getElementById('main'));
};