import React from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import PollChart from './PollChart.js';
import PollOption from './PollOption.js';

export default class PollPage extends React.Component {
    constructor() {
        super();
        this.state = {
            poll: {title: '', options: [] },
            pollName: 'poll',
            pollLink: '',
            selectedOption: -1,
            userHasVoted: false,
            userOwnsThisPoll: false,
            fireRedirect: false
        };
    }
    
    componentDidMount() {
        axios.get(`${this.props.apiRoot}/polls/${this.props.id}`).then((response) => {
            this.setState({
                poll: response.data,
                userHasVoted: response.data.alreadyVoted.reduce((hasVoted, voter) => {
                    if (voter === this.props.userId) {
                        return true;
                    } else {
                        return hasVoted;
                    }
                }, false),
                userOwnsThisPoll: response.data.creator === this.props.userId
            });
        });
    }
    
    handleInputChange(event) {
        this.setState({ selectedOption: Number(event.target.value) });
    }
    
    vote() {
        if (this.state.selectedOption < 0) {
            alert('Please select an option');
        } else {
            axios.post(`${this.props.apiRoot}/polls/${this.state.poll._id}/vote`, { option: this.state.selectedOption })
            .then((response) => {
                if (response.data.error) {
                    alert(response.data.error);
                } else {
                    axios.get(`${this.props.apiRoot}/polls/${this.props.id}`)
                        .then((response) => {
                            this.setState({
                                poll: response.data,
                                userHasVoted: true
                            });
                        });
                }
            });
        }
    }
    
    addOption() {
        const newOption = prompt('Enter a new option');
        if (newOption) {
            axios.post(`${this.props.apiRoot}/polls/${this.state.poll._id}/options`, { option: String(newOption) })
                .then(() => {
                    axios.get(`${this.props.apiRoot}/polls/${this.props.id}`).then((response) => {
                        this.setState({
                            poll: response.data
                        });
                    });
                });
        }
    }
    
    deleteThisPoll() {
        axios.delete(`${this.props.apiRoot}/polls/${this.state.poll._id}`)
            .then((response) => {
                if (response.data.error) {
                    alert(response.data.error);
                }  else {
                    this.setState({ fireRedirect: true });
                }
            });
    }
    
    render() {
        const { fireRedirect, userHasVoted, userOwnsThisPoll } = this.state;
        return (
            <div className='well'>
                {fireRedirect && <Redirect to='/mypolls' />}
                
                <h2 className='text-center'>{this.state.poll.title}</h2>
                
                {userHasVoted ? (
                    <div>
                        <h4>Results:</h4>
                        <PollChart poll={this.state.poll} />
                    </div>
                ) : (
                    <div className='form'>
                        <div className='form-group'>
                        {this.state.poll.options.map(
                            (option, index) => (<PollOption key={index} index={index} pollName={this.state.pollName} optionName={option.name} handleChange={this.handleInputChange.bind(this)}/>))}
                        </div>
                        <div className='form-group'>
                            <button className='btn btn-primary' onClick={this.vote.bind(this)}>Vote!</button>
                        </div>
                    </div>
                )}
                
                <h5><strong>Share this poll:</strong> {`${this.props.appUrl}/poll/${this.state.poll._id}`}</h5>
                
                {userOwnsThisPoll &&
                    <div>
                        <button className='btn btn-danger' onClick={this.deleteThisPoll.bind(this)}>Delete This Poll</button>
                        <button className='btn btn-default' onClick={this.addOption.bind(this)}>Add another Option</button>
                    </div>
                }
            </div>);
    }
}