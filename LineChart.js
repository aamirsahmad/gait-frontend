import React from 'react'
import {Grommet, Box} from 'grommet'
import ReactApexChart from 'react-apexcharts'
import ApexCharts from 'apexcharts'



var lastDate = 0;
var data = [];
var TICKINTERVAL = 86400000;
let XAXISRANGE = 777600000;

function getDayWiseTimeSeries(baseval, count, yrange) {
    var i = 0;
    while (i < count) {
        var x = baseval;
        var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

        data.push({
            x, y
        });
        lastDate = baseval;
        baseval += TICKINTERVAL;
        i++;
    }
}

getDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 10, {
    min: 10,
    max: 90

});

function getNewSeries(baseval, yrange) {
    let newDate = baseval + TICKINTERVAL;
    lastDate = newDate;

    for (let i = 0; i < data.length - 10; i++) {
        // IMPORTANT
        // we reset the x and y of the data which is out of drawing area
        // to prevent memory leaks
        data[i].x = newDate - XAXISRANGE - TICKINTERVAL
        data[i].y = 0
    }

    data.push({
        x: newDate,
        y: Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min
    })

}

function resetData() {
    // Alternatively, you can also reset the data at certain intervals to prevent creating a huge series
    data = data.slice(data.length - 10, data.length);
}

export default class LineChart extends React.Component {
    ws = new WebSocket("ws://localhost:8095/get_queue");
    constructor(props) {
        super(props);

        this.state = {
            options: {
                chart: {
                    id: 'realtime',
                    animations: {
                        enabled: true,
                        easing: 'linear',
                        dynamicAnimation: {
                            speed: 1000
                        }
                    },
                    toolbar: {
                        show: false
                    },
                    zoom: {
                        enabled: false
                    }
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    curve: 'smooth'
                },

                title: {
                    text: 'Dynamic Updating Chart',
                    align: 'left'
                },
                markers: {
                    size: 0
                },
                xaxis: {
                    type: 'datetime',
                    range: XAXISRANGE,
                },
                yaxis: {
                    max: 100
                },
                legend: {
                    show: false
                }
            },
            series: [{
                data: data.slice()
            }],
        }
    }

    componentDidMount() {
        console.log(this.props.userID);
        this.streamUserData(this.props.userID);
        this.intervals()
    }

    streamUserData(userID) {
        // console.log(userID);
        this.ws.onopen = () => {
            // console.log(userID);
            this.ws.send(userID);
        };
        this.ws.onmessage = (receivedData) => {
            console.log(receivedData);
            data.push({
                x: new Date(receivedData.data.timestamp),
                y: receivedData.data.xyz
            })

            // console.log('Message from server ', receivedData);
        };
    }




    intervals() {
        window.setInterval(() => {
            ApexCharts.exec('realtime', 'updateSeries', [{
                data: data
            }])
        }, 1000)
    }

    render() {

        return (
            <Box id="chart">
                <ReactApexChart options={this.state.options} series={this.state.series} type="line" height="350"/>
            </Box>
        );
    }

}