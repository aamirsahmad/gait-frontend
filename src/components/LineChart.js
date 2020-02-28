import { Chart } from 'react-chartjs-2';

import React, { Component } from 'react';

import { Line } from 'react-chartjs-2';

import * as zoom from 'chartjs-plugin-zoom';


import 'chartjs-plugin-streaming';

import './LineChart.css';


console.log(React.version);
var g_data = []

var chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};
var color = Chart.helpers.color;

var userID = -1;
var global_data_point = {}
var theChart

function onRefresh(chart) {
    // chart.data.datasets[0].data.push(global_data_point);
    // append the new data array to the existing chart data
    Array.prototype.push.apply(chart.data.datasets[0].data, g_data.slice());
    g_data = [];
    // update chart datasets keeping the current animation
    chart.update({
        preservation: true
    });
}

var config = {
    type: "line",
    data: {
        datasets: [
            {
                label: 'Gait data',
                backgroundColor: color(chartColors.blue).alpha(0.5).rgbString(),
                borderColor: chartColors.blue,
                fill: false,
                cubicInterpolationMode: 'monotone',
                data: [],
                pointRadius: 0,
                // borderWidth: 2,
            }
            ,]
    },
    options: {
        title: {
            display: true,
            text: '' // put heading here
        },
        scales: {
            xAxes: [{
                type: 'realtime',
                realtime: {
                    duration: 30000,
                    refresh: 30,
                    delay: 2000,
                    pause: false,
                    ttl: undefined,
                    onRefresh: onRefresh
                },
                gridLines: {
                    display: false,
                },
                display: 'true'
            }],
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'value'
                },
                gridLines: {
                    display: true,
                },
                // ticks: {
                //     max: 30,
                //     min: 0,
                //     stepSize: 1
                // }
            }]
        },
        tooltips: {
            mode: 'nearest',
            intersect: false
        },
        hover: {
            mode: 'nearest',
            intersect: false
        },
        pan: {
            enabled: true,    // Enable panning
            mode: 'x',        // Allow panning in the x direction
            rangeMin: {
                x: null       // Min value of the delay option
            },
            rangeMax: {
                x: null       // Max value of the delay option
            }
        },
        zoom: {
            enabled: false,    // Enable zooming
            mode: 'x',        // Allow zooming in the x direction
            rangeMin: {
                x: null       // Min value of the duration option
            },
            rangeMax: {
                x: null       // Max value of the duration option
            }
        }
    },
    plugins: {
        streaming: {            // per-chart option
            frameRate: 60       // chart is drawn 30 times every second
        }
    },
}

export default class LineChart extends React.Component {
    ws = new WebSocket('ws://localhost:8095/get_queue');
    constructor(props) {
        super(props);
        this.chartReference = React.createRef();
        this.state = {
            data: {},
            userID: this.props.userID,
            buttonText: "Pause"
        }
    }

    componentDidMount() {
        userID = this.state.userID;
        const myChartRef = this.chartReference.current.getContext("2d");
        theChart = new Chart(myChartRef, config);
        Chart.plugins.register(zoom);
        this.streamUserData(this.state.userID);
    }

    componentWillUnmount() {
        console.log(this.chartReference);
        this.props.terminate()
    }

    pauseHandler = () => {
        const { buttonText } = this.state //destucture state
        if(buttonText == 'Play'){
            this.setState({buttonText: "Pause"}); 
        }
        else{
            this.setState({buttonText: "Play"}); 
        }
        config.options.scales.xAxes[0].realtime.pause = !(config.options.scales.xAxes[0].realtime.pause);
        theChart.update({duration: 0});
    } 

    render() {
        const { buttonText } = this.state //destucture state
        return (
            <div>
                <canvas
                    id="myChart"
                    ref={this.chartReference}
                />
                <button class="pure-material-button-contained button-center" onClick={() => this.pauseHandler()}>{buttonText}</button>
            </div>

        )
    }

    // If this isn't the hackiest code I have ever written so far then I don't know what is. -- Ege
    streamUserData(userID) {
        let ws = this.ws;
        ws.onopen = function () {
            console.log(userID);
            ws.send(userID);
        };
        ws.onmessage = function (receivedData) {
            let obj = JSON.parse(receivedData.data);
            console.log(obj.timestamp);
            global_data_point = { x: new Date(parseInt(obj.timestamp)), y: obj.xyz };

            g_data.push(global_data_point);
        };
    }


}
