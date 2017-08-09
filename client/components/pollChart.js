import React from 'react';
import * as d3 from 'd3';

export default class PollChart extends React.Component {
    plotChart() {
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(this.props.poll.options.map((option) => (option.votes)))])
            .range([10, 400]);
        
        const chartDivs = d3.select(`#chart${this.props.poll._id}`)
            .selectAll('div')
                .data(this.props.poll.options)
                .enter()
                .append('div')
                    .style('overflow', 'auto');
                
        chartDivs.append('div')
                    .style('display', 'inline-block')
                    .style('text-align', 'right')
                    .style('padding', '3px')
                    .style('width', '150px')
                    .text((option) => (`${option.name}:`));
                
        chartDivs.append('div')
                    .style('display', 'inline-block')
                    .style('width', (option) => (`${xScale(option.votes)}px`))
                    .style('background-color', (option, index) => (d3.schemeCategory10[index]))
                    .style('padding', '3px')
                    .style('margin', '1px')
                    .style('color', 'white')
                    .style('text-align', 'right')
                    .text((option) => (option.votes));
    }
    
    componentDidMount() {
        this.plotChart();
    }
    
    componentDidUpdate() {
        this.plotChart();
    }
    
    render() {
        return (<div id={`chart${this.props.poll._id}`}></div>);
    }
}