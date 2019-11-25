import React from 'react';
import Line from 'react-chartjs2';
import 'chartjs-plugin-streaming';
import axios from 'axios';
// LAST

var ws = null;
var userID = -1;

var data = {
    datasets: [{
        label: 'Gait Plot',
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        lineTension: 0,
        borderDash: [8, 4],
        data: []
    },]
};

var options = {
    scales: {
        xAxes: [{
            type: 'realtime',
            realtime: {
                onRefresh: function (chart) {
                    chart.data.datasets.forEach(function (dataset) {
                        axios({
                            method: "GET",
                            url: "http://localhost:8095/get_queue_http",
                            params: {
                                user_id: userID
                            }
                        }).then((res) => {
                            let point = res.data;
                            console.log(point);
                            dataset.data.push({
                                x: Date.now(),
                                y: point[0]
                            });
                        });
                    });
                },
                delay: 2000
            }
        }]
    }
};

// const options = {
//     scales: {
//         xAxes: [
//             {
//                 type: "realtime",
//                 realtime: {
//                     onRefresh: function() {
//                         data.datasets[0].data.push({
//                             x: Date.now(),
//                             y: Math.random() * 100
//                         });
//                     },
//                     delay: 2000
//                 }
//             }
//         ]
//     }
// };


export default class LineChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            userID: this.props.userID
        }
    }

    componentDidMount() {
        // console.log(this.state.userID);
        userID = this.state.userID;
        // this.streamUserData(this.state.userID);
    }

    streamUserData(userID) {
        console.log(userID);
        console.log(ws);
        ws = new WebSocket('ws://localhost:8095/get_queue');
        ws.onopen = function () {
            console.log(userID);
            ws.send(userID);
        };
        // console.log(data.datasets[0].data);
        // data.datasets[0].data.push(1);
        // console.log(data.datasets[0].data);
        ws.onmessage = function (receivedData) {
            // console.log(data);
            // console.log('Message from server ', receivedData);
            let obj = JSON.parse(receivedData.data);
            data.datasets[0].data.push(obj.xyz);
            data.labels.push(obj.timestamp);
            // console.log(data);
        };
    }

    render() {
        return (
            <Line type='line' data={data} options={options}/>
        )
    }
}