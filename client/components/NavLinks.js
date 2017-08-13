import React from 'react';
import { Link } from 'react-router-dom';

export default function(props) {
    if (props.username) {
        return (<div>
                    <ul className='nav navbar-nav'>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/mypolls">My Polls</Link></li>
                        <li><Link to="/create">New Poll</Link></li>
                    </ul>
                    <div className='navbar-right'>
                        <p className='navbar-text'>Currently logged in as: {props.username}</p>
                        <a className='btn btn-default navbar-btn' href={`${props.appUrl}/auth/logout`}>Sign out</a>
                    </div>
                </div>);
    } else {
        return (<div>
                    <ul className='nav navbar-nav'>
                        <li><Link to="/">Home</Link></li>
                    </ul>
                    <div className='navbar-right'>
                        <a className='btn btn-default navbar-btn' href={`${props.appUrl}/auth/github`}>Sign in with GitHub</a>
                    </div>
                </div>);
    }
    
}