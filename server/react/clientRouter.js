'use strict'

import React from 'react';
import { matchPath, StaticRouter } from 'react-router';
import ReactDOMServer from 'react-dom/server';
import Layout from '../../client/components/layout.js';

const routes = [
    '/',
    '/mypolls',
    '/poll/:id',
    'create'
    ];
    
module.exports = async (req, res, next) => {
    const match = routes.reduce((acc, route) => matchPath(req.url, route, { exact: true }) || acc, undefined);
    if (!match) {
        next();
    } else {
        const markup = ReactDOMServer.renderToString(<StaticRouter context={{}} location={req.url}><Layout /></StaticRouter>);
        if (req.isAuthenticated()) {
            res.render('index', { markup, username: req.user.userName, userId: req.user._id });
        } else {
            res.render('index', { markup, username: 'nobody', userId: '' });
        }
    }
};