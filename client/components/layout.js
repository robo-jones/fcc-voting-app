import React from 'react';
import { Route, Link } from 'react-router-dom';

import IndexPage from './indexPage.js';
import MypollsPage from './mypollsPage.js';
import CreatePollPage from './createPollPage.js';
import PollPage from './pollPage.js';

class Layout extends React.Component {
    render() {
        return (<div>
                    <h1>Hello from React!</h1>
                    
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/mypolls">My Polls</Link></li>
                        <li><Link to="/create">New Poll</Link></li>
                    </ul>
                            
                    <Route exact path="/" component={IndexPage} />
                    <Route path="/mypolls" component={MypollsPage} />
                    <Route path="/create" component={CreatePollPage} />
                    <Route path="/poll/:id" render={({ match }) => (<PollPage id={match.params.id} />)} />
                    <p><a href="https://fcc-dynamicwebapp-projects-robojones.c9users.io/auth/github">Log in with GitHub</a></p>
                    <p><a href="https://fcc-dynamicwebapp-projects-robojones.c9users.io/auth/logout">Log out</a></p>
                </div>);
    }
}

export default Layout;