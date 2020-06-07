import React from "react";
import {fetchUrl} from "./urls";


export function convertToGraphData(info) {
    let nodes = Array();
    for (let key in info["nodes"]) {
        let currentNode = info["nodes"][key];
        if(currentNode["type"] === "paper") {
            currentNode["url"] = currentNode["id"]
            if (currentNode["url"].startsWith("doi:/")) {
                currentNode["url"] = currentNode["url"].replace("doi:/", "https://doi.org")
            }
            else if (currentNode["url"].startsWith("pubmed:/")) {
                currentNode["url"] = currentNode["url"].replace('pubmed:/', 'https://pubmed.ncbi.nlm.nih.gov')
            }
        }
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
    return {
        links: relations,
        nodes: nodes
    }
}

export function fetchGraphData(space_id, setData) {
    fetchUrl("space", {
        "id": space_id
    }, (data) => {
        const keys = data['keys']
        fetchUrl("graph/sub?keys=" + keys, null, (info) => {
            info = info["info"];
            setData(convertToGraphData(info));
        }, null, "get")
    })
}

export function filterByType(data, infoType) {
    if (infoType === 0) {
        infoType = "paper"
    } else if (infoType === 1) {
        infoType = "field"
    } else if (infoType === 2) {
        infoType = "connections"
    }
    let newData = JSON.parse(JSON.stringify(data));
    newData["nodes"] = newData["nodes"].filter(nodeInfo => nodeInfo["type"] === infoType)
    return newData;
}
