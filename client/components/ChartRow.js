import React from 'react';

export default function(props) {
    const barStyle = {
        display: 'inline-block',
        width: props.width,
        backgroundColor: props.color,
        padding: '1px',
        margin: '1px',
        color: 'white',
        textAlign: 'right'
    };
    return (<div className='row'>
                <div className='col-sm-3 text-right' style={{paddingRight: '3px'}}>{`${props.name}:`}</div>
                <div className='col-sm-9' style={{paddingLeft: '3px'}}>
                    <div style={barStyle}>
                        {props.votes}
                    </div>
                </div>
            </div>);
}