import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Button } from "grommet";
import * as _ from 'lodash';


class UserInferenceButtons extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            userID: props.userID,
        }
    }

    axiosFunc = () => {
        axios({
            method: "GET",
            url: "http://localhost:8095/get_inference",
            params: {
                user_id: this.state.userID
            }
        }).then((res) => {
            // console.log('response successful')
            // console.log(res)
            if (res.data && res.data.items) {
                // let fakedata = [{ "confidency": 0.98, "inferred_user_id": 5, "actual_user_id": 1 }, 
                // { "confidency": 0.2, "inferred_user_id": 1, "actual_user_id": 1 },
                // { "confidency": 0.6, "inferred_user_id": 2, "actual_user_id": 1 },
                // { "confidency": 0.4, "inferred_user_id": 3, "actual_user_id": 1 },
                // { "confidency": 0, "inferred_user_id": 4, "actual_user_id": 1 }];
                this.setState({ data: res.data.items });
                // this.setState({ data: fakedata });
            } else {

             }
        }).catch((err) => {
            console.log(`Error with for /get_inference : ${err}`)
        })
    };

    timer = time => {
        const date = new Date(time);
        return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    };

    ButtonBoi = (data) => {
        data.sort((a, b) => (a.confidency < b.confidency ? 1 : a.confidency === b.confidency ? (a.confidency < b.confidency ? 1 : -1) : -1));
        return data.map(user => {
            let confidency = parseFloat(user.confidency)
            return <Button
                key={`${user.inferred_user_id}`}
                primary
                color={confidency > 0.8 ? "green" : confidency > 0.6 ? "blue" : confidency > 0.3 ? "orange" : "red"}
                label={`${confidency * 100}% user:${user.inferred_user_id}`}
                onClick={() => { }}
            />
        })
    }

    emptyDataset = () => {
        return <Button
            primary
            color="grey"
            label="calculating..."
            onClick={() => { }}
        />
    }
    componentDidMount() {
        this.axiosFunc();
        this.interval = setInterval(this.axiosFunc, 5000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        this.props.terminate()
    }

    render() {
        return (
            <div>{this.state.data && this.state.data.length > 0 ? this.ButtonBoi(this.state.data) : this.emptyDataset()}</div>
        )
    }
}
export default UserInferenceButtons;
