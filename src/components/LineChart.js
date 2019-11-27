import React from 'react';
import Line from 'react-chartjs2';
import 'chartjs-plugin-streaming';
import 'chartjs-plugin-zoom';
import axios from 'axios';


var userID = -1;

var data = {
    datasets: [{
        label: 'Gait Plot',
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        lineTension: 0.1,
        borderDash: [8, 4],
        data: []
    },]
};


var options = {
    // Assume x axis is the realtime scale
    animation: {
        duration: 100000000000000000,
        easing: 'easeInOutElastic'
    },
    scales: {
        xAxes: [{
            type: 'realtime',
            realtime: {}
        }],
        yAxes: [{
            ticks: {
                min: 0,
                max: 50,
                stepSize: 1
            }
        }]
    },
    // animation: {
    //     duration: 0                    // general animation time
    // },
    // hover: {
    //     animationDuration: 0           // duration of animations when hovering an item
    // },
    // responsiveAnimationDuration: 0,    // animation duration after a resize
    plugins: {
        streaming: {
            frameRate: 30             // chart is drawn 5 times every second
        }
    }
    // pan: {
    //     enabled: true,    // Enable panning
    //     mode: 'x',        // Allow panning in the x direction
    //     rangeMin: {
    //         x: null       // Min value of the delay option
    //     },
    //     rangeMax: {
    //         x: null       // Max value of the delay option
    //     }
    // },
    // zoom: {
    //     enabled: true,    // Enable zooming
    //     mode: 'x',        // Allow zooming in the x direction
    //     rangeMin: {
    //         x: null       // Min value of the duration option
    //     },
    //     rangeMax: {
    //         x: null       // Max value of the duration option
    //     }
    // }
};


export default class LineChart extends React.Component {
    chartReference = {};
    ws = new WebSocket('ws://localhost:8095/get_queue');
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            userID: this.props.userID,
        }
    }

    componentDidMount() {
        userID = this.state.userID;
        this.streamUserData(this.state.userID);
    }

    componentWillUnmount() {
        console.log(this.chartReference);
        this.props.terminate()
    }

    // If this isn't the hackiest code I have ever written so far then I don't know what is. -- Ege
    streamUserData(userID) {
        let chart = this.chartReference;
        let ws = this.ws;
        console.log(chart);
        console.log(chart.data);

        ws.onopen = function () {
            console.log(userID);
            ws.send(userID);
        };
        ws.onmessage = function (receivedData) {
            let obj = JSON.parse(receivedData.data);
            // console.log(obj);
            if (chart.chart.data.datasets[0].length > 50) chart.chart.data.datasets[0].shift();
            if (obj && obj.timestamp && obj.xyz) {
                let xpoint = new Date(parseInt(obj.timestamp)); // + 1500
                chart.chart.data.datasets[0].data.push({x: xpoint, y: obj.xyz});
                chart.chart.update({
                    preservation: true
                });
                // console.log(xpoint + ' ' + obj.xyz)
                // data.datasets[0].data.push(obj.xyz);
                // data.labels.push(obj.timestamp);
            }

        };
    }


    render() {
        return (
            <Line type='line' ref={(reference) => this.chartReference = reference} data={data} options={options}/>
        )
    }
}
// data={data} options={options}