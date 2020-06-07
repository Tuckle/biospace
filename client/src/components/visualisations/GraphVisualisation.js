import React, {useEffect, useState, useCallback, useRef} from 'react';
import {ForceGraph3D} from "react-force-graph";

function GraphVisualisation({data, width=500}) {
    const fgRef = useRef();

    const handleClick = useCallback(node => {
        // Aim at node from outside it
        const distance = 40;
        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

        fgRef.current.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
            node, // lookAt ({ x, y, z })
            3000  // ms transition duration
        );
    }, [fgRef]);

    return (
        <ForceGraph3D
            ref={fgRef}
            graphData={data}
            linkWidth={2}
            width={width}
            onNodeClick={handleClick}
            />
    );
}

const styles = {

};

export default GraphVisualisation;
