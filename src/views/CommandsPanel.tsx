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
import {DataBase, Item} from "../helpers/generateData";
import {log} from "util";

let sourceNode: string | null = null;
const clusters= [ "Keeper", "Marketplace", "SearchEngine", "ExecutionManager",
         "NodeExecutor","AssetManager"]
const CommandsPanel: FC<{
    dataset: Dataset, selectedDate: number, selectedNode: string | null, selectedEdge: string | null


}> = ({dataset, selectedNode, selectedDate, selectedEdge, children}) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    const database= new DataBase();

    function deleteNode() {
        console.log(dataset )
        if (!selectedNode) return
        var atr = graph.getNodeAttributes(selectedNode);
        console.log("delete node")
        const database=new DataBase();
        console.log('the deleted node:'+selectedNode)
        console.log('in the date:'+selectedDate)
        console.log(new Date(selectedDate))
         database.deleteNodeById(selectedNode,selectedDate)
        // deleteNodeFromNeo4J(atr["key"],selectedDate)  //todo
        let att1= graph.getNodeAttributes(selectedNode)
        console.log(att1["cluster"])
        let selNodeIndex=clusters.findIndex(n=> n==att1["cluster"])!
        console.log('in'+selNodeIndex)
        let nieg=graph.neighbors(selectedNode)
        nieg.forEach(node=> {
            let cl=graph.getNodeAttributes(node)["cluster"]
            console.log('cl'+cl)
            let index=clusters.findIndex(n=> n==cl)!
            console.log(index)
            if(index>selNodeIndex)
            {
                graph.setNodeAttribute(node, "color","black")
            }

        })
        graph.dropNode(selectedNode)
        //todo
        // console.log(dataset.nodes[selectedNode] )
        // dataset.nodes[selectedDate][atr["key"]].endTime = selectedDate;

    }

    async function copyNode() {
        if (!selectedNode) return
        console.log('copy:'+selectedNode)
        var atr = graph.getNodeAttributes(selectedNode);
        console.log("copy node")
        console.log(atr)

        var item= new Item(atr['cluster'],0,0)
        var database= new DataBase();
        var component=await database.getNodeComponentById(selectedNode)

        var tempName=item.getNewName();
        console.log('name='+ tempName)
        await database.writeQuery(item.getCreatQuery(),{from:selectedDate,end:0,name:tempName,component:component})
        const idForNewNode= await database.getNodeIdByName(tempName)
        console.log('added with id: '+Number(idForNewNode))


        // var key = storeNodeInNeo4J(node)  //todo


        var newNode = {
            cluster: atr["cluster"],
            clusterLabel: atr["clusterLabel"],
            color: atr["color"],
            image: atr["image"],
            size: atr["size"],
            hidden: atr["hidden"],
            label: String( idForNewNode), //+ randomUUID(),
            x: toNumber(atr["x"]) + 1,
            y: toNumber(atr["y"]),
            fromTime: selectedDate,
            endTime: 0,
            key:String( idForNewNode)
        };

        console.log('key:'+ newNode.key)
        graph.addNode( String(idForNewNode), newNode)
        if(idForNewNode)
        dataset.nodes[selectedDate][String(idForNewNode)] = newNode;


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
