import React from "react";

const originalFetch = require('isomorphic-fetch');
const fetch = require('fetch-retry')(originalFetch, {
    retries: 5,
    retryDelay: 1000
});

export const SITE = "/"

export const getUrl = (path) => {
    return SITE + path
}

export function fetchUrl(url, json, callback, error=null, method="post") {
    if (method === "get") {
        fetch(
            getUrl(url))
            .then(function (response) {
                return response.json()
            })
            .then(function (data) {
                callback(data)
            })
            .catch((result) => {
                if(error) {
                    error(result)
                }
            })
        return;
    }
    fetch(
        getUrl(url), {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json)
        })
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
            callback(data)
        })
        .catch((result) => {
            if(error) {
                error(result)
            }
        })
}
