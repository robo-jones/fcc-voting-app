import React from 'react';

export default function(props) {
    const radioName = `${props.pollName}Options`;
    return (
        <div className='radio'>
            <label>
                <input type='radio' name={radioName} id={`${radioName}${props.index}`} value={props.index} onClick={props.handleChange} />
                {props.optionName}
            </label>
        </div>
        );
}