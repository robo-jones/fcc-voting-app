'use strict'

import React from 'react';
import { matchPath, StaticRouter } from 'react-router';
import ReactDOMServer from 'react-dom/server';
import Layout from '../../client/components/Layout.js';
import { server } from '../config/config.js';

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
        const appUrl = server.url;
        const apiRoot = `${server.url}/api`;
        if (req.isAuthenticated()) {
            const markup = ReactDOMServer.renderToString(<StaticRouter context={{}} location={req.url}><Layout apiRoot={apiRoot} appUrl={appUrl} username={req.user.userName} userId={req.user._id}/></StaticRouter>);
            res.render('index', { markup, apiRoot, appUrl, username: req.user.userName, userId: req.user._id });
        } else {
            const markup = ReactDOMServer.renderToString(<StaticRouter context={{}} location={req.url}><Layout apiRoot={apiRoot} appUrl={appUrl} username={null} userId={req.get('X-Forwarded-For').split(',')[0]}/></StaticRouter>);
            res.render('index', { markup, apiRoot, appUrl, username: null, userId: req.get('X-Forwarded-For').split(',')[0] });
        }
    }
};