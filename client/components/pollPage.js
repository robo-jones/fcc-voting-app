import React from 'react';
import Poll from './poll.js';
import axios from 'axios';

export default class PollPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { poll: {title: '', options: [] } };
    }
    
    componentDidMount() {
        axios.get(`https://fcc-dynamicwebapp-projects-robojones.c9users.io/api/polls/${this.props.id}`).then((response) => {
            this.setState({ poll: response.data });
        });
    }
    
    render() {
        return (<Poll poll={this.state.poll} />);
    }
}