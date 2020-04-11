'use strict';
var React = require('react');
var ReactDOM = require('react-dom');
var PropTypes = require('prop-types');
var d3 = require('d3');
var dispatcher = require('@crsincca/xrd-dispatch-module');

class MainGraph extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        plugins.on('dataUpdated', this.generateGraph.bind(this));
    }

    generateGraph(data) {
        var margin = { top: 50, right: 70, bottom: 50, left: 70 };
        var width = this.props.width - margin.left - margin.right;
        var height = this.props.height - margin.top - margin.bottom;

        // setup x
        var xValue = function (d) { return d[0]; }; // data point -> x value
        var xScale = d3.scaleLinear()  // x value -> x display
            .domain([d3.min(data, xValue) - 1, d3.max(data, xValue) + 1])
            .range([0, width]);
        var xMap = function (d) { return xScale(xValue(d)); }; // data point -> x display
        var xAxis = d3.axisBottom(xScale).ticks(10).tickSize(-height, 0, 0).tickPadding(10).tickFormat(d3.format(',.0f'));

        // setup y
        var yValue = function (d) { return d[1]; }; // data point -> y value
        var yScale = d3.scaleLinear()  // y value -> y display
            .domain([d3.min(data, yValue) - 1, d3.max(data, yValue) + 1])
            .range([height, 0]);
        var yMap = function (d) { return yScale(yValue(d)); }; // data point -> y display
        var yAxis = d3.axisLeft(yScale).ticks(10).tickSize(-width, 0, 0).tickPadding(10).tickFormat(d3.format(',.0f'));

        var zoom = d3.zoom().scaleExtent([1, 100]).on('zoom', zoomed);

        // create svg chart
        var svg = d3.select(this.svgXrdChart);

        svg.append('defs').append('clipPath').attr('id', 'xrd-chart-clip')
            .append('rect')
            .attr('width', width)
            .attr('height', height);

        var container = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // bottom x-axis
        var gX = container.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        gX.append('text')
            .attr('class', 'label')
            .attr('x', width / 2)
            .attr('y', 30)
            .style('text-anchor', 'end')
            .text('2Theta, deg');

        // left y-axis
        var gY = container.append('g')
            .attr('class', 'axis')
            .call(yAxis);

        gY.append('text')
            .attr('class', 'label')
            .attr('transform', 'rotate(-90)')
            .attr('y', -margin.left + 20)
            .attr('x', -height / 2)
            .attr('dy', '.5em')
            .style('text-anchor', 'end')
            .text('Intensity, cps');

        // draw lines
        var linesGoup = container.append('g').attr('clip-path', 'url(#xrd-chart-clip)');
        var lines = linesGoup.append('path').attr('d', d3.line().x(xMap).y(yMap)(data))
            .attr('stroke', 'red')
            .attr('stroke-width', 1)
            .attr('fill', 'none');

        // draw dots
        var dotsGoup = container.append('g').attr('clip-path', 'url(#xrd-chart-clip)');
        var dots = dotsGoup.selectAll('.dot').data(data)
            .enter().append('circle')
            .attr('class', 'dot')
            .attr('r', 2)
            .attr('cx', xMap)
            .attr('cy', yMap);

        container.append('rect')
            .attr('class', 'zoom')
            .attr('width', width)
            .attr('height', height)
            .call(zoom);

        function zoomed() {
            lines.attr('transform', d3.event.transform);
            lines.style('stroke-width', 1 / d3.event.transform.k);
            dots.attr('transform', d3.event.transform);
            dots.attr('r', 2 / d3.event.transform.k);
            gX.call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
            gY.call(yAxis.scale(d3.event.transform.rescaleY(yScale)));
        }
    }

    render() {
        return (
            <div className='xrd-chart unselectable'>
                <svg ref={(c) => { this.svgXrdChart = c; }} className='xrd-chart-svg' width={this.props.width} height={this.props.height}></svg>
            </div>
        );
    }
}

MainGraph.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number
};

MainGraph.defaultProperties = {
    width: 800,
    height: 600
};

dispatcher.on('init-graph', function (payload) {
    ReactDOM.render(<MainGraph width={800} height={600} />, document.getElementById(payload.elementId));
});

dispatcher.emit('plugin-hand-shake', 'xrd-graph');
