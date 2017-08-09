import React from 'react';
import PollOption from './pollOption.js';
import axios from 'axios';
import PollChart from './pollChart.js';
import { Link, Redirect } from 'react-router-dom';

class Poll extends React.Component {
    constructor() {
        super();
        this.state = {
            fireRedirect: false
        };
    }
    
    vote(optionIndex) {
        axios.post(`https://fcc-dynamicwebapp-projects-robojones.c9users.io/api/polls/${this.props.poll._id}/vote`, { option: optionIndex })
            .then((response) => {
                if (response.data.error) {
                    alert(response.data.error);
                }
            });
    }
    
    addOption() {
        const newOption = prompt('Enter a new option');
        axios.post(`https://fcc-dynamicwebapp-projects-robojones.c9users.io/api/polls/${this.props.poll._id}/options`, { option: newOption });
    }
    
    deleteThisPoll() {
        axios.delete(`https://fcc-dynamicwebapp-projects-robojones.c9users.io/api/polls/${this.props.poll._id}`)
            .then((response) => {
                if (response.data.error) {
                    alert(response.data.error);
                }  else {
                    this.setState({ fireRedirect: true });
                }
            });
    }
    
    render() {
        if (this.state.fireRedirect) {
            return (<Redirect to='/mypolls' />);
        }
        return (
            <div>
                <Link to={`/poll/${this.props.poll._id}`}>{this.props.poll.title}</Link>
                <button onClick={this.deleteThisPoll.bind(this)}>Delete This Poll</button>
                <button onClick={this.addOption.bind(this)}>Add another Option</button>
                <ul>
                    {this.props.poll.options.map(
                        (option, index) => (<PollOption key={index} boundVote={this.vote.bind(this, index)} name={option.name} votes={option.votes} />))}
                </ul>
                <PollChart poll={this.props.poll} />
            </div>
        );
    }
}

export default Poll;