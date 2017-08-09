import React from 'react';
import Polls from './polls.js';
import axios from 'axios';

class IndexPage extends React.Component {
    constructor() {
        super();
        this.state = {
            polls: []
        };
    }
    
    componentDidMount() {
        axios.get(`https://fcc-dynamicwebapp-projects-robojones.c9users.io/api/polls`).then((response) => {
            this.setState({ polls: response.data });
        });
    }
    
    render() {
        return (
            <div>
                <h3>All Polls:</h3>
                <Polls polls={this.state.polls} />
            </div>
        );
    }
}

export default IndexPage;