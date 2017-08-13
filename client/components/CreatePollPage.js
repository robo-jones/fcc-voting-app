import React from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

class CreatePollPage extends React.Component {
    constructor() {
        super();
        this.state = {
            title: '',
            options: ['', ''],
            fireRedirect: false,
            redirectTo: undefined
        };
    }
    
    createPoll() {
        const newPoll = {
            title: this.state.title,
            options: this.state.options
        };
        axios.post(`${this.props.apiRoot}/polls`, newPoll).then((response) => {
            this.setState({ fireRedirect: true, redirectTo: `/poll/${response.data.poll._id}` });
        });
    }
    
    addOption() {
        this.setState((prevState) => ({ options: prevState.options.concat('') }));
    }
    
    removeOption(optionIndex) {
        if (this.state.options.length < 3) {
            alert('must have at least two options');
        } else {
            this.setState((prevState) => ({ options: prevState.options.filter((option, index) => (index !== optionIndex)) }));
        }
    }
    
    handleTitleChange(event) {
        this.setState({ title: event.target.value });
    }
    
    handleOptionChange(optionIndex, event) {
        const newValue = event.target.value;
        this.setState(
            (prevState) => ({
                options: prevState.options.map((option, index) => {
                    if (index === optionIndex) { return newValue; }
                    return option;
                })
            })
        );
    }
    
    render() {
        const { fireRedirect, redirectTo } = this.state;
        if (fireRedirect) {
            return (<Redirect to={redirectTo} />);
        }
        if (!this.props.username) {
            return (<Redirect to='/' />);
        }
        return (
            <div>
                <h2 className='text-center'>Create a New Poll</h2>
                <div className='form-horizontal'>
                    <div className='form-group'>
                        <label htmlFor="titleEntry" className='col-sm-2 control-label'>Title: </label>
                        <div className='col-sm-10'>
                            <input id="titleEntry" type="text" className="form-control" onChange={this.handleTitleChange.bind(this)}/>
                        </div>
                    </div>
                    {this.state.options.map((option, index) => (
                        <div key={index} className='form-group'>
                            <label htmlFor={'optionEntry' + index} className='col-sm-2 control-label'>{this.state.options.length > 2 && <a href="#" onClick={this.removeOption.bind(this, index)}><span className='glyphicon glyphicon-remove' style={{color: 'red'}} /></a>}{` Option ${index + 1}: `}</label>
                            <div className='col-sm-10'>
                                <input id={'optionEntry' + index} type="text" className="form-control" value={option} onChange={this.handleOptionChange.bind(this, index)}/>
                            </div>
                        </div>
                    ))}
                    <div className='form-group'>
                        <div className='col-sm-offset-2 col-sm-10'>
                            <button className='btn btn-success' onClick={this.addOption.bind(this)}>Add Another Option</button>
                            <button className='btn btn-primary' onClick={this.createPoll.bind(this)}>Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default CreatePollPage;