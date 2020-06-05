import React from "react";

export const SITE = "/"

export const getUrl = (path) => {
    return SITE + path
}

export function fetchUrl(url, json, callback, error=null, method="post") {
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
