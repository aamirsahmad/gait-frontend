import { Chart } from 'react-chartjs-2';

import React, { Component } from 'react';

import { Line } from 'react-chartjs-2';

import 'chartjs-plugin-streaming';
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
                label: 'Gait Plot',
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
            text: 'Line chart (hotizontal scroll) sample'
        },
        scales: {
            xAxes: [{
                type: 'realtime',
                realtime: {
                    duration: 35000,
                    refresh: 30,
                    delay: 2000,
                    pause: false,
                    ttl: undefined,
                    onRefresh: onRefresh
                },
                gridLines: {
                    display: true,
                },
                display: 'true'
            }],
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'value'
                },
                // ticks: {
                //     max: 30,
                //     min: 0,
                //     stepSize: 1
                // }
            }]
        },
        // tooltips: {
        //     mode: 'nearest',
        //     intersect: false
        // },
        // hover: {
        //     mode: 'nearest',
        //     intersect: false
        // }
    },
    plugins: {
        streaming: {            // per-chart option
            frameRate: 30       // chart is drawn 30 times every second
        }
    }
}

export default class LineChart extends React.Component {
    ws = new WebSocket('ws://localhost:8095/get_queue');
    constructor(props) {
        super(props);
        this.chartReference = React.createRef();
        this.state = {
            data: {},
            userID: this.props.userID,
        }
    }

    componentDidMount() {
        userID = this.state.userID;
        const myChartRef = this.chartReference.current.getContext("2d");
        new Chart(myChartRef, config);
        this.streamUserData(this.state.userID);
    }

    componentWillUnmount() {
        console.log(this.chartReference);
        this.props.terminate()
    }

    render() {
        return (
            <canvas 
                id="myChart"
                ref={this.chartReference}
            />
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
