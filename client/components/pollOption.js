import React from 'react';

class PollOption extends React.Component {
    render() {
        return (<li onClick={this.props.boundVote}><a href="#">{this.props.name}:</a> {this.props.votes}</li>);
    }
}

export default PollOption;