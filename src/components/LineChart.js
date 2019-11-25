import React from 'react';
import Line from 'react-chartjs2';
import 'chartjs-plugin-streaming';
import axios from 'axios';


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
                            dataset.data.push({
                                x: Date.now(),
                                y: point[0]
                            });
                        }).catch((error) => {
                            window.location.reload();
                        });
                    });
                },
                delay: 2000
            }
        }]
    }
};


export default class LineChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            userID: this.props.userID
        }
    }

    componentDidMount() {
        userID = this.state.userID;
    }

    // streamUserData(userID) {
    //     ws = new WebSocket('ws://localhost:8095/get_queue');
    //     ws.onopen = function () {
    //         console.log(userID);
    //         ws.send(userID);
    //     };
    //     ws.onmessage = function (receivedData) {
    //         let obj = JSON.parse(receivedData.data);
    //         data.datasets[0].data.push(obj.xyz);
    //         data.labels.push(obj.timestamp);
    //     };
    // }

    render() {
        return (
            <Line type='line' data={data} options={options}/>
        )
    }
}