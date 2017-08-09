import React from 'react';
import Polls from './polls.js';
import axios from 'axios';

class MypollsPage extends React.Component {
    constructor() {
        super();
        this.state = {
            userId: '',
            polls: []
        };
    }
    
    componentDidMount() {
        axios.get(`https://fcc-dynamicwebapp-projects-robojones.c9users.io/api/polls/mypolls`).then((response) => {
            this.setState({ userId: response.data.userId, polls: response.data.polls });
        });
    }
    
    render() {
        return (
            <div>
                <h3>Your polls:</h3>
                <Polls polls={this.state.polls} />
            </div>
        );
    }
}

export default MypollsPage;