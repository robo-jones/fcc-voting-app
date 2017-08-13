import React from 'react';
import NavLinks from './NavLinks.js';

export default function(props) {
    return (<nav className='navbar navbar-default navbar-fixed-top' style={{height: '50px'}}>
                <div className='container-fluid'>
                    <div className="navbar-header">
                        <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-links" aria-expanded="false">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                        </button>
                        <p className="navbar-brand">SHT Voting</p>
                    </div>
                    
                    <div className='collapse navbar-collapse' id='navbar-links'>
                        <NavLinks username={props.username} appUrl={props.appUrl} />
                    </div>
                </div>
            </nav>);
}