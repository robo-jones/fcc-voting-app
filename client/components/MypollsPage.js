import React from 'react';
import PollPanel from './PollPanel.js';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

class MypollsPage extends React.Component {
    constructor() {
        super();
        this.state = {
            userId: '',
            polls: []
        };
    }
    
    componentDidMount() {
        if (this.props.username) {
            axios.get(`${this.props.apiRoot}/polls/mypolls`).then((response) => {
                this.setState({ userId: response.data.userId, polls: response.data.polls });
            });
        }
    }
    
    render() {
        const accordionId = 'myPollsList';
        const pollPanels = this.state.polls.map(
            (poll) => (<PollPanel key={poll._id} poll={poll} parentId={accordionId} />)
        );
        if (this.props.username) {
            return (
                <div>
                    <h2 className='text-center'>Your Polls</h2>
                    <h4>Click on a poll title to view its results</h4>
                    <div className='panel-group' id={accordionId} role='tablist' aria-multiselectable='true'>
                        {pollPanels}
                    </div>
                </div>
                );
        } else {
            return (<Redirect to='/' />);
        }
    }
}

export default MypollsPage;