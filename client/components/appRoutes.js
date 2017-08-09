import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import IndexPage from './indexPage.js';
import MypollsPage from './mypollsPage.js';
import Layout from './layout.js';

class AppRoutes extends React.Component {
    render() {
        return (
            <BrowserRouter>
                    <Switch>
                        <Route exact path="/" component={IndexPage} />
                        <Route path="/mypolls" component={MypollsPage} />
                    </Switch>
            </BrowserRouter>
        );
    }
}

export default AppRoutes;