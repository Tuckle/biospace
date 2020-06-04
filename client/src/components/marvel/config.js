// only with pure configuration it's easy to replicate graphs such as
// http://bl.ocks.org/eesur/be2abfb3155a38be4de4 using react-d3-graph
import React from 'react';

const config = {
    directed: true,
    automaticRearrangeAfterDropNode: true,
    collapsible: true,
    height: 800,
    highlightDegree: 2,
    highlightOpacity: 0.2,
    linkHighlightBehavior: true,
    maxZoom: 12,
    minZoom: 0.05,
    nodeHighlightBehavior: true,
    panAndZoom: false,
    staticGraph: false,
    width: 1000,
    d3: {
        alphaTarget: 0.05,
        gravity: -250,
        linkLength: 120,
        linkStrength: 2,
    },
    node: {
        color: "#d3d3d3",
        fontColor: "black",
        fontSize: 10,
        fontWeight: "normal",
        highlightColor: "red",
        highlightFontSize: 14,
        highlightFontWeight: "bold",
        highlightStrokeColor: "red",
        highlightStrokeWidth: 1.5,
        labelProperty: n => n.id,
        mouseCursor: "crosshair",
        opacity: 0.9,
        renderLabel: true,
        size: 200,
        strokeColor: "none",
        strokeWidth: 1.5,
        symbolType: "circle",
        viewGenerator: null,
    },
    link: {
        color: "lightgray",
        highlightColor: "red",
        mouseCursor: "pointer",
        opacity: 1,
        semanticStrokeWidth: true,
        strokeWidth: 3,
        type: "STRAIGHT",
    },
};

export default config;