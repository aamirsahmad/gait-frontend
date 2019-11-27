import React from "react";
import LineChart from "./LineChart";
// import Inference from "./inference";
import { Grommet, Box, Button, Grid, Text, Image } from "grommet";
import UserInferenceButtons from './inferenceButtons'
const ws = new WebSocket("ws://localhost:8095/get_queue");


export default class AppContext extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "userID": props.userID,
            "show": true
        };
    }
    terminate = () => {
        console.log('terminated')
        this.setState({
            show: false
        })
    }
    render() {
        console.log(`user id is ${this.state.userID} in appcontext`)
        return (
            <Grid
                fill
                rows={["auto", "flex"]}
                columns={["auto", "flex"]}
                areas={[
                    { name: "header", start: [0, 0], end: [1, 0] },
                    { name: "main", start: [1, 1], end: [1, 1] }
                ]}
            >
                <Box gridArea="header"
                    direction="row"
                    align="center"
                    justify="between"
                    pad={{ horizontal: "small", vertical: "small" }}
                    background="white">
                    {/* {this.state.userID ? <Inference userID={this.state.userID}/> : <p>user id ded</p>} */}
                    <Box direction="row" align="center" pad="none" gap="small">
                        {this.state.show ? <UserInferenceButtons userID={this.state.userID} terminate={this.terminate} /> : <div/>}
                    </Box>
                </Box>
                <Box gridArea="main" justify="center" align="center" pad={{ horizontal: "small", vertical: "small" }}>
                    <div class="chart-container" style={{ position: 'relative', 'height': '150vh', 'width': '80vw' }}>
                        {this.state.show ? <LineChart userID={this.state.userID} terminate={this.terminate} /> : <div/>}
                    </div>
                </Box>
            </Grid>
        );
    }
}
