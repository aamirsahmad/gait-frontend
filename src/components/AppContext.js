import React from "react";
import LineChart from "./LineChart";

const ws = new WebSocket("ws://localhost:8095/get_queue");


export default class AppContext extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "userID": props.userID
        };
    }

    render() {
        return (
            <LineChart userID={this.state.userID}/>
        );
    }
}



