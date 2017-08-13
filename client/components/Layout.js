import React from 'react';
import { Route } from 'react-router-dom';

import IndexPage from './IndexPage.js';
import MypollsPage from './MypollsPage.js';
import CreatePollPage from './CreatePollPage.js';
import PollPage from './PollPage.js';
import NavBar from './NavBar.js';

class Layout extends React.Component {
    render() {
        return (<div>
                    <NavBar username={this.props.username}/>
                    <div className='container'>
                        <div className='row'>
                            <div className='col-md-8 col-md-offset-2'>
                                <Route exact path="/" component={IndexPage} />
                                <Route path="/mypolls" render={() => (React.createElement(MypollsPage, { username: this.props.username }))} />
                                <Route path="/create" render={() => (React.createElement(CreatePollPage, { username: this.props.username }))} />
                                <Route path="/poll/:id" render={({ match }) => (React.createElement(PollPage, { id: match.params.id, userId: this.props.userId }))} />
                            </div>
                        </div>
                    </div>
                </div>);
    }
}

export default function(props) {
    const { appUrl, apiRoot, username, userId } = props;
    return (<div>
                <NavBar username={username} appUrl={appUrl} />
                <div className='container'>
                    <div className='row'>
                        <div className='col-md-8 col-md-offset-2'>
                            <Route exact path="/" render={() => (React.createElement(IndexPage, { apiRoot }))} />
                            <Route path="/mypolls" render={() => (React.createElement(MypollsPage, { apiRoot, username }))} />
                            <Route path="/create" render={() => (React.createElement(CreatePollPage, { apiRoot, username }))} />
                            <Route path="/poll/:id" render={({ match }) => (React.createElement(PollPage, { id: match.params.id, apiRoot, userId, appUrl }))} />
                        </div>
                    </div>
                </div>
            </div>);
};