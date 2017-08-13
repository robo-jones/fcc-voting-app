import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

class IndexPage extends React.Component {
    constructor() {
        super();
        this.state = {
            polls: []
        };
    }
    
    componentDidMount() {
        axios.get(`${this.props.apiRoot}/polls`).then((response) => {
            this.setState({ polls: response.data });
        });
    }
    
    render() {
        const polls = this.state.polls.map(
            (poll) => (<Link key={poll._id} className='list-group-item' to={`/poll/${poll._id}`}>{poll.title}</Link>)
        );
        return (
            <div>
                <h2 className='text-center'>Home</h2>
                <h4>All polls created by our users:</h4>
                <div className='list-group'>
                    {polls}
                </div>
            </div>
        );
    }
}

export default IndexPage;