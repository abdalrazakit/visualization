import React, {FC, useEffect, useMemo, useState} from "react";
import {useSigma} from "react-sigma-v2";
import {sortBy, values, keyBy, mapValues, toNumber, parseInt, omit} from "lodash";
import {MdGroupWork} from "react-icons/md";
import {AiOutlineCheckCircle, AiOutlineCloseCircle} from "react-icons/ai";
import RangeSlider from 'react-bootstrap-range-slider';
import 'bootstrap/dist/css/bootstrap.css'; // or include from a CDN
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import {Cluster, Dataset, FiltersState, NodeData} from "../types";
import Panel from "./Panel";
import {InitForm} from "../helpers/InitForm";
import {DataBase, Item, QueryManger} from "../helpers/generateData";
import {log} from "util";
import {Date} from "neo4j-driver";
import {setDatasets} from "react-chartjs-2/dist/utils";

let sourceNode: string | null = null;
const clusters= [ "Keeper", "Marketplace", "SearchEngine", "ExecutionManager",
         "NodeExecutor","AssetManager"]
const CommandsPanel: FC<{
    dataset: Dataset, selectedDate: number, selectedNode: string | null, selectedEdge: string | null


}> = ({dataset, selectedNode, selectedDate, selectedEdge, children}) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    const database= new DataBase();

   async function deleteNode() {
       // console.log(dataset )
        if (!selectedNode) return

        console.log("delete node")
        const database=new DataBase();
        console.log('the deleted node:'+selectedNode)
        console.log('in the date:'+selectedDate)
       // console.log(new Date(selectedDate))
        await database.deleteNodeById(selectedNode,selectedDate)
        // deleteNodeFromNeo4J(atr["key"],selectedDate)  //todo
        let att1= graph.getNodeAttributes(selectedNode)
        console.log(att1)
        let selNodeIndex=clusters.findIndex(n=> n==att1["cluster"])!
        console.log('in'+selNodeIndex)
        let nieg=graph.outNeighbors(selectedNode)
       console.log(nieg)
       graph.dropNode(selectedNode)
       nieg.forEach(node=> {
           if(graph.getNodeAttributes(node)['color'] != 'black') {
               let change = true;
               graph.inNeighbors(node).forEach(n => {
                   console.log('/t')
                   console.log(n)
                   console.log(graph.getNodeAttributes(n)['color'])
                   if (graph.getNodeAttributes(n)['color'] != 'black')
                       change = false;
               })
               if (change)
                   graph.setNodeAttribute(node, 'color', 'red')

           }
       })



       att1['endTime']=selectedDate

       var node = {
           cluster:att1['cluster'] ,
           label:att1['label'],
           x: att1['x']   ,//* x + comId * x,
           y: att1['y']   ,//* y + comId * y,
           key: att1['key'] ,
           fromTime:att1['fromTime'] ,
           endTime: att1['endTime'],
           clusterLabel: att1["clusterLabel"],
           color: att1["color"],

       };
        //todo
        // console.log(dataset.nodes[selectedNode] )
       dataset.nodes[selectedDate][att1["key"]] = node;

    }

    async function copyNode() {
        if (!selectedNode) return
        console.log('copy:'+selectedNode)
        var atr = graph.getNodeAttributes(selectedNode);
        console.log("copy node")
        console.log(atr)

        var database= new DataBase();

        let res=await database.writeQuery(QueryManger.getCreatQueryByType(atr['cluster']),{from:selectedDate,end:0})
        let idForNewNode=res.records[0]._fields[0]

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
            var database= new DataBase();
            const getData=async ()=>{
                const result= await database.writeQuery(QueryManger.getCreatRelationById(sourceNode,selectedNode,"random"),{from:selectedDate,end:0})
                let res=result.records[0]._fields[0]
                console.log('relation id:'+ res)
                newEdge.key =res;
                graph.addEdge(sourceNode, selectedNode, {size: 1,key:res})
                dataset.edges[selectedDate][newEdge.key] = newEdge;
                sourceNode = null;
            }

            getData()

        }
    }, [selectedNode])

   async function deleteEdge() {
        if (!selectedEdge) return
        var atr = graph.getEdgeAttributes(selectedEdge);
        console.log( atr)
        var database= new DataBase();
        await database.writeQuery(QueryManger.getDeleteRelationById(atr.key),{end:selectedDate})

        graph.dropEdge(selectedEdge)
       var newEdge = {
           start: atr['start'],
           end: atr['end'],
           label: atr['label'],
           key: atr['key'],
           fromTime: atr['fromTime'],
           endTime: selectedDate,
       };
       //todo
        dataset.edges[selectedDate][atr["key"]] = newEdge;
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
