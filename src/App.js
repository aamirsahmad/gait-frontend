import React, {useState, useEffect} from "react";
import {Grommet, Box, Button, Grid, Text, Image} from "grommet";
import {grommet} from "grommet/themes";
import AppContext from "./components/AppContext"
import axios from "axios";
import {CircularProgress} from '@material-ui/core'
import {green} from "@material-ui/core/colors";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "users": [],
            "sidebar": false,
            "currentUser": 0,
            "isConnected": false
        };
        this.changeCurrentUser = this.changeCurrentUser.bind(this);
    }

    componentDidMount() {
        axios({
            method: "GET",
            url: "http://localhost:8095/get_users",
        }).then((res) => {
            let tempUsers = []
            for (let each of res.data.user_ids) {
                tempUsers.push(each);
            }
            this.setState({users: tempUsers, isConnected: true, sidebar: true});
        }).catch((error) => {
            this.setState({isConnected: false, sidebar: false})
        });

        setInterval(() => axios({
            method: "GET",
            url: "http://localhost:8095/get_users",
        }).then((res) => {
            if (res.data.user_ids.length !== this.state.users.length) {
                let tempUsers = []
                for (let each of res.data.user_ids) {
                    tempUsers.push(each);
                }
                this.setState({users: tempUsers, isConnected: true, sidebar: true});
            }

            if (!this.state.isConnected) {
                window.location.reload();
            }

        }).catch((error) => {
            this.setState({isConnected: false, sidebar: false});
        }), 2000);

    }

    changeCurrentUser(name, e) {
        this.setState({currentUser: name});
    }

    render() {
        console.log(this.state.currentUser)
        let context;
        {/* <AppContext userID={this.state.currentUser}/> */}
        if (this.state.isConnected) {
            context = this.state.currentUser > 0 ? <AppContext userID={this.state.currentUser}/> :
                <Text>Click on a user to get started.</Text>
        } else {
            context =
                <Box direction="column" align="center"><CircularProgress size={80}/><Text> Connecting </Text></Box>
        }

        return (
            <Grommet full theme={grommet}>
                <Grid
                    fill
                    rows={["auto", "flex"]}
                    columns={["auto", "flex"]}
                    areas={[
                        {name: "header", start: [0, 0], end: [1, 0]},
                        {name: "sidebar", start: [0, 1], end: [0, 1]},
                        {name: "main", start: [1, 1], end: [1, 1]}
                    ]}
                >
                    <Box
                        gridArea="header"
                        direction="row"
                        align="center"
                        justify="between"
                        pad={{horizontal: "medium", vertical: "small"}}
                        background="dark-2"
                    >
                        {this.state.isConnected &&
                        <Button>
                            {/*<Button onClick={() => this.setState({"sidebar": !this.state.sidebar})}>*/}
                            Active Users : {this.state.users.length}
                        </Button>}
                        <Box direction="row" gap="xsmall" align="baseline">
                            {this.state.isConnected && <Box round={"xsmall"} background={{color: "green"}}><Text
                                color={"white"}>Connected</Text></Box>}
                            <Text size="large">Gait Identification & Analysis</Text>
                        </Box>
                    </Box>
                    {this.state.sidebar && (
                        <Box
                            gridArea="sidebar"
                            background="dark-3"
                            width="small"
                            animation={[
                                {type: "fadeIn", duration: 300},
                                {type: "slideRight", size: "xlarge", duration: 150}
                            ]}
                        >
                            {this.state.users.map(name => (
                                <Button key={name} id={name} hoverIndicator
                                        onClick={(e) => this.changeCurrentUser(name, e)}>
                                    <Box pad={{horizontal: "medium", vertical: "small"}}>
                                        <Text>{name}</Text>
                                    </Box>
                                </Button>
                            ))}
                        </Box>
                    )}
                    <Box gridArea="main" justify="center" align="center">
                        {context}
                    </Box>
                </Grid>
            </Grommet>);
    }


}

export default App;