import React from "react";
import {fetchUrl} from "./urls";
import {node} from "prop-types";


export function convertId(givenId) {
    let id = givenId;
    if (id.startsWith('doi:/')) {
        id = id.replace("doi:/", "https://doi.org")
    } else if (id.startsWith('pubmed:/')) {
        id = id.replace('pubmed:/', 'https://pubmed.ncbi.nlm.nih.gov')
    }
    return id;
}

export function convertToGraphData(info) {
    let nodes = Array();
    for (let key in info["nodes"]) {
        let currentNode = info["nodes"][key];
        if (currentNode["type"] === "paper") {
            currentNode["url"] = currentNode["id"]
            if (currentNode["url"].startsWith("doi:/")) {
                currentNode["url"] = currentNode["url"].replace("doi:/", "https://doi.org")
            } else if (currentNode["url"].startsWith("pubmed:/")) {
                currentNode["url"] = currentNode["url"].replace('pubmed:/', 'https://pubmed.ncbi.nlm.nih.gov')
            }
        }
        if (!("name" in currentNode)) {
            currentNode["name"] = currentNode["id"]
        }
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

export function addDois(doiList, callback, keys = [], err = null) {
    let body = {
        "doi": doiList
    };
    if(keys.length > 0) {
        body["keys"] = keys
    }
    fetchUrl("add_dois", body, (data) => {
        callback(data["info"]);
    }, err)
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

export function filterByRules(data, rules) {
    let nodeIds = {};
    data["nodes"] = data["nodes"].filter((item) => {
        if (item["type"] === "field") {
            if ("keys" in rules && !(item["id"] in rules["keys"])) {
                return false;
            }
            nodeIds[item["id"]] = true;
            return true;
        }
        if (item["type"] !== "paper") {
            return false;
        }
        if ("title" in rules) {
            let elem = item["name"] || item["id"] || "";
            let found = false;
            for (let i = 0; i < rules["title"].length; i++) {
                if (elem.indexOf(rules["title"][i]) !== -1) {
                    found = true
                    break
                }
            }
            if (!found) {
                return false;
            }
        }
        if ("types" in rules && !(item["t"] in [...rules["types"], "0", "1"])) {
            return false;
        }
        if ("dates" in rules) {
            let paperDate = null;
            if ("ts" in item) {
                paperDate = new Date(parseInt(item["ts"]));
            } else if ("y" in item) {
                paperDate = new Date(0, 0, 1, 0, 0);
                paperDate.setYear(parseInt(item["y"]));
            } else {
                return false;
            }
            if (!(paperDate >= rules["dates"][0] && paperDate <= rules["dates"][1])) {
                return false;
            }
        }
        nodeIds[item["id"]] = true
        return true;
    })
    data["links"] = data["links"].filter((item) => {
        return item["source"] in nodeIds && item["target"] in nodeIds
    })
    return data;
}
