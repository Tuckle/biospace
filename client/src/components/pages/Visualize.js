import React, {useEffect, useState} from 'react';
import {ForceGraph3D} from "react-force-graph";
import data from '../marvel/data';
import WidgetBot from "@widgetbot/react-embed";
import config from '../marvel/config';
import {getUrl} from "../res/urls";

// graph event callbacks
const onClickGraph = function () {
    console.log(`Clicked the graph background`);
};

const onClickNode = function (nodeId) {
    console.log(`Clicked node ${nodeId}`);
};

const onDoubleClickNode = function (nodeId) {
    console.log(`Double clicked node ${nodeId}`);
};

const onRightClickNode = function (event, nodeId) {
    console.log(`Right clicked node ${nodeId}`);
};

const onMouseOverNode = function (nodeId) {
    console.log(`Mouse over node ${nodeId}`);
};

const onMouseOutNode = function (nodeId) {
    console.log(`Mouse out node ${nodeId}`);
};

const onClickLink = function (source, target) {
    console.log(`Clicked link between ${source} and ${target}`);
};

const onRightClickLink = function (event, source, target) {
    console.log(`Right clicked link between ${source} and ${target}`);
};

const onMouseOverLink = function (source, target) {
    console.log(`Mouse over in link between ${source} and ${target}`);
};

const onMouseOutLink = function (source, target) {
    console.log(`Mouse out link between ${source} and ${target}`);
};

const onNodePositionChange = function (nodeId, x, y) {
    console.log(`Node ${nodeId} is moved to new position. New position is x= ${x} y= ${y}`);
};

function ViewKeywords(props) {
    const space_id = decodeURI(window.location.href).split('/s/')[1];
    const [myData, setData] = useState(data);
    const [graphWidth, setGraphWidth] = useState(window.innerWidth / 3 * 2 - 10);

    useEffect(() => {
        fetch(
            getUrl("space"), {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "id": space_id,
                })
            })
            .then(function (response) {
                return response.json()
            })
            .then(function (data) {
                const keys = data['keys']
                if (data['id']) {
                    fetch(getUrl("graph/sub?keys=") + keys)
                        .then(res => res.json())
                        .then((info) => {
                            info = info["info"];
                            let nodes = Array();
                            for (let key in info["nodes"]) {
                                let currentNode = info["nodes"][key];
                                currentNode["name"] = currentNode["id"];
                                nodes.push(currentNode);
                            }
                            let relations = Array();
                            for (let dst in info["relationships"]) {
                                for (let src in info["relationships"][dst]) {
                                    relations.push({
                                        source: src,
                                        target: dst,
                                        type: info["relationships"][dst][src]
                                    });
                                }
                            }
                            setData({
                                links: relations,
                                nodes: nodes
                            });
                        })
                        .catch(console.log)
                }
            })
    }, []);

    return (
        <div style={{display: "flex"}}>
            <ForceGraph3D
                graphData={myData}
                linkWidth={2}
                width={graphWidth}
            />
            <WidgetBot
                server="717755444646379600"
                channel="717835175635058816"
                shard="https://e.widgetbot.io"
                width={window.innerWidth - graphWidth}
            />
        </div>
    );
}

export default ViewKeywords;
