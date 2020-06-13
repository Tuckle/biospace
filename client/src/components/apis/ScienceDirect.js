import React, {useState} from 'react';

const querystring = require('querystring');
// const originalFetch = require('isomorphic-fetch');
// const fetch = require('fetch-retry')(originalFetch, {
//     retries: 5,
//     retryDelay: 1000
// });
const root = "https://www.sciencedirect.com";
const url = root + "/search/api"
const articleTypes = {
    "Review articles": "REV",
    "Research articles": "FLA",
    "Encyclopedia": "EN",
    "Book chapters": "CH",
    "Conference abstracts": "ABS",
    "Book reviews": "BRV",
    "Case reports": "CRP",
    "Conference info": "CNF",
    "Correspondence": "COR",
    "Data articles": "DAT",
    "Discussion": "DIS",
    "Editorials": "EDI",
    "Errata": "ERR",
    "Examinations": "EXM",
    "Mini reviews": "SSU",
    "News": "NWS",
    "Patent reports": "PNT",
    "Practice guidelines": "PGL",
    "Product reviews": "PRV",
    "Replication studies": "RPL",
    "Short communications": "SCO",
    "Software publications": "OSP",
    "Video articles": "VID",
    "Other": "OT"
}
// const reverseArticleTypes = Object.keys(articleTypes).reduce((ret, key) => {
//     ret[articleTypes[key]] = key;
//     return ret;
// }, {});
const resultsPerPage = 20;

function getScienceDirectUrl(link) {
    if(link.startsWith("/")) {
        link = root + link;
    }
    return link;
}

function filterQuery(inputQuery) {
    let query = {qs: inputQuery["text"]};
    if (inputQuery["date-range"]) {
        let date = "";
        if (inputQuery["date-range"][0] === inputQuery["date-range"][1]) {
            date = inputQuery["date-range"][0].getFullYear().toString();
        } else {
            date = inputQuery["date-range"][0].getFullYear().toString() +
                "-" + inputQuery["date-range"][1].getFullYear().toString();
        }
        query["date"] = date;
    }
    for (let key in ["authors", "affiliations", "title", "reference"]) {
        if (inputQuery[key]) {
            query[key] = inputQuery[key]
        }
    }
    if (inputQuery["types"]) {
        let types = inputQuery["types"]
            .filter((item) => item in articleTypes)
            .map((item) => articleTypes[item]);
        if (types.length > 0) {
            query["articleTypes"] = types.join(",");
        }
    }
    query["show"] = inputQuery["resultsPerPage"] || resultsPerPage;
    if (inputQuery["page"]) {
        query["offset"] = query["show"] * inputQuery["page"];
    }
    if (inputQuery["specificKeywords"]) {
        query["tak"] = inputQuery["specificKeywords"]
    }
    return query
}

function filterResult(result, data) {
    // get only a part of data from result
    let info = {"title": result["title"].replace(/<[^>]+>/g, ''),
        "doi": result["doi"]};
    if(result["sortDate"]) {
        info["date"] = new Date(result["sortDate"]);
    }
    if((result["authors"] || []).length > 0) {
        info["authors"] = [];
        for(let i = 0; i < result["authors"].length; i++) {
            const authorInfo = result["authors"][i];
            if(authorInfo["order"] === i) {
                info["authors"].push(authorInfo["name"]);
            }
        }
    }
    if (result["articleType"]) {
        info["type"] = result["articleTypeDisplayName"];
    }
    if(result["score"]) {
        info["score"] = result["score"];
    }
    if(result["link"]) {
        info["link"] = getScienceDirectUrl(result["link"]);
    }
    if(result["pdf"] && result["pdf"]["downloadLink"]) {
        info["download"] = getScienceDirectUrl(result["pdf"]["downloadLink"]);
    }
    return info;
}

export function searchScienceDirect(query, addData) {
    const myQuery = filterQuery(query);
    const myUrl = url + "?" + querystring.stringify(myQuery);
    console.log(myUrl);

    fetch(myUrl, {
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
            addData(data["searchResults"]
                .map((item) => filterResult(item, data)));
        })
}