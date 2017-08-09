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
        axios.post('https://fcc-dynamicwebapp-projects-robojones.c9users.io/api/polls', newPoll).then((response) => {
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
        return (
            <div>
                <label htmlFor="titleEntry">Title: 
                    <input id="titleEntry" type="text" onChange={this.handleTitleChange.bind(this)}/>
                </label>
                {this.state.options.map((option, index) => (
                    <div key={index}>
                        <label htmlFor={'optionEntry' + index}>{`Option ${index + 1}:`}
                            <input id={'optionEntry' + index} type="text" value={option} onChange={this.handleOptionChange.bind(this, index)}/>
                        </label>
                        <a href="#" onClick={this.removeOption.bind(this, index)}>X</a>
                    </div>
                ))}
                <button onClick={this.addOption.bind(this)}>Add Another Option</button>
                <button onClick={this.createPoll.bind(this)}>Submit</button>
            </div>
        );
    }
}

export default CreatePollPage;