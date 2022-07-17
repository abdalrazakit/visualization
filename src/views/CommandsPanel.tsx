import React, {FC, useEffect, useMemo, useState} from "react";
import {useSigma} from "react-sigma-v2";
import {sortBy, values, keyBy, mapValues, toNumber} from "lodash";
import {MdGroupWork} from "react-icons/md";
import {AiOutlineCheckCircle, AiOutlineCloseCircle} from "react-icons/ai";
import RangeSlider from 'react-bootstrap-range-slider';
import 'bootstrap/dist/css/bootstrap.css'; // or include from a CDN
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import {Cluster, Dataset, FiltersState} from "../types";
import Panel from "./Panel";
import {InitForm} from "../helpers/InitForm";

let sourceNode: string | null = null;

const CommandsPanel: FC<{
    dataset: Dataset, selectedDate: number, selectedNode: string | null, selectedEdge: string | null


}> = ({dataset, selectedNode, selectedDate, selectedEdge, children}) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();


    function deleteNode() {
        if (!selectedNode) return
        var atr = graph.getNodeAttributes(selectedNode);
        console.log("delete node")
        // deleteNodeFromNeo4J(atr["key"],selectedDate)  //todo
        graph.dropNode(selectedNode)
        dataset.nodes[selectedDate][atr["key"]].endTime = selectedDate;
    }

    function copyNode() {
        if (!selectedNode) return

        var atr = graph.getNodeAttributes(selectedNode);
        console.log("copy node")
        console.log(atr)
        var newNode = {
            cluster: atr["cluster"],
            clusterLabel: atr["clusterLabel"],
            color: atr["color"],
            image: atr["image"],
            size: atr["size"],
            hidden: atr["hidden"],
            label: atr["clusterLabel"], //+ randomUUID(),
            x: toNumber(atr["x"]) + 1,
            y: toNumber(atr["y"]),
            fromTime: selectedDate,
            endTime: 0,
            key: "0"
        };
        // var key = storeNodeInNeo4J(node)  //todo
        var key = "key"
        newNode.key = key;
        graph.addNode(key, newNode)
        dataset.nodes[selectedDate][newNode.key] = newNode;


    }

    function createEdge() {
        if (!selectedNode) return
        sourceNode = selectedNode;
        console.log("sour1" + sourceNode)

    }

    useEffect(() => {
        console.log(selectedNode)
        console.log(sourceNode)

        if (sourceNode && selectedNode) {
            console.log("draw edge from " + sourceNode + "to" + selectedNode)
            var sourceType = graph.getNodeAttributes(sourceNode)["clusterLabel"];
            var targetType = graph.getNodeAttributes(selectedNode)["clusterLabel"];
            var newEdge = {
                start: sourceNode,
                end: selectedNode,
                label: "random", // todo
                key: "0",
                fromTime: selectedDate,
                endTime: 0,
            };
            // var key = storeEdgeInNeo4J(newEdge)  //todo
            var key = "key"
            newEdge.key = key;
            graph.addEdge(sourceNode, selectedNode, {size: 1})
            dataset.edges[selectedDate][newEdge.key] = newEdge;
            sourceNode = null;
        }
    }, [selectedNode])

    function deleteEdge() {
        if (!selectedEdge) return
        var atr = graph.getEdgeAttributes(selectedEdge);
        console.log("delete edge")
        // deleteEdgeFromNeo4J(atr["key"],selectedDate)  //todo
        graph.dropEdge(selectedEdge)
        dataset.edges[selectedDate][atr["key"]].endTime = selectedDate;
    }

    return (
        <Panel title={<span className="text-muted text-small">{"Command Panel"}</span>}>
            <p>


                <button className="btn" disabled={!selectedNode} onClick={() => deleteNode()}>
                    Delete Node
                </button>
                <button className="btn" disabled={!selectedNode} onClick={() => copyNode()}>
                    Copy Node
                </button>
                <button className="btn" disabled={!selectedNode} onClick={() => createEdge()}>
                    Create edge
                </button>

                <button className="btn" disabled={!selectedEdge} onClick={() => deleteEdge()}>
                    Delete edge
                </button>

            </p>
        </Panel>
    );
};

export default CommandsPanel;
