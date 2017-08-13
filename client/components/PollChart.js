import React from 'react';
import * as d3 from 'd3';
import ChartRow from './ChartRow.js';

export default function(props) {
    const xScale = d3.scaleLinear()
            .domain([0, d3.max(props.poll.options.map((option) => (option.votes)))])
            .range([2, 100]);
    const chartRows = props.poll.options.map(
        (option, index) => {
            const color = d3.schemeCategory10[index % 10];
            const width = `${xScale(option.votes)}%`;
            return (<ChartRow key={index} name={option.name} color={color} width={width} votes={option.votes} />);
        });
        
        return (<div id={`chart${props.poll._id}`}>
                    {chartRows}
                </div>);
}