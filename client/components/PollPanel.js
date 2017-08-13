import React from 'react';
import { Link } from 'react-router-dom';
import PollChart from './PollChart.js';

export default function(props) {
    const pollHeadingId = `pollHeading${props.poll._id}`;
    const pollContainerId = `pollContent${props.poll._id}`;
    return (<div className='panel panel-default'>
                <div id={pollHeadingId} className='panel-heading' role='tab'>
                    <h4 className='panel-title'>
                        <a className='collapsed' role='button' data-toggle='collapse' data-parent={`#${props.parentId}`} href={`#${pollContainerId}`} aria-expanded='false' aria-controls={pollContainerId}>
                            {props.poll.title}
                        </a>
                    </h4>
                </div>
                <div id={pollContainerId} className='panel-collapse collapse' role='tabpanel' aria-labelledby={pollHeadingId}>
                    <div className='panel-body'>
                        <PollChart poll={props.poll} />
                        <Link to={`/poll/${props.poll._id}`}>View this Poll</Link>
                    </div>
                </div>
            </div>);
}