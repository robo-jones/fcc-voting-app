import React from 'react';
import Poll from './poll.js';

class Polls extends React.Component {
    render() {
        return (<div>{this.props.polls.map((poll) => (<Poll key={poll._id} poll={poll} />))}</div>);
    }
}

export default Polls;