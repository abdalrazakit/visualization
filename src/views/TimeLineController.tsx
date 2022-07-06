import {useSigma} from "react-sigma-v2";
import {FC, useEffect, useState} from "react";
import {constant, filter, keyBy, mapValues, omit, values} from "lodash";
import React from "react";

import {Dataset, EdgeData, FiltersState, NodeData} from "../types";
import neo4j, {DateTime} from "neo4j-driver";
import {log} from "util";
import {notDeepEqual} from "assert";

const TimeLineController: FC<{ dataset: Dataset, startLoading: number, setGraphChanged: (any) => void }> =
    ({dataset, startLoading, setGraphChanged, children}) => {
        const sigma = useSigma();
        const graph = sigma.getGraph();
        const [times, setTimes] = useState<any[]>([]);


        useEffect(() => {
            let dic = {};
            console.log('loading time')
            dataset.nodes.forEach((node: NodeData) => {
                if(node.fromTime==node.endTime) return;
                if(node.fromTime!=0)
                (dic[node.fromTime] || (dic[node.fromTime] = [])).push({type: 0, object: node});
                if(node.endTime!=0)
                (dic[node.endTime] || (dic[node.endTime] = [])).push({type: 0, object: node});
            })

            dataset.edges.forEach((edge: EdgeData) => {
                if(edge.endTime==edge.fromTime) return;
                if(edge.fromTime!=0)
                (dic[edge.fromTime] || (dic[edge.fromTime] = [])).push({type: 1, object: edge});
                if(edge.endTime!=0)
                (dic[edge.endTime] || (dic[edge.endTime] = [])).push({type: 1, object: edge});
            })

            var t = Object.keys(dic).map((key) => [Number(key), dic[key]]);
            t.sort((first, second) => first[0] - second[0]);
            setTimes(t);
            console.log(t)

        }, [dataset])

        useEffect(() => {
            console.log('start Loading')
            if(times && times.length<startLoading) startLoading=0;
            if (!dataset || !times[startLoading])
                return;
            console.log(times[startLoading])
            var key = times[startLoading][0];
            var items = times[startLoading][1];
            var clusters = keyBy(dataset.clusters, "key");

            items.forEach((item) => {
                console.log(item.type)
                if (item.type == 0) {
                    var node = item.object;
                    console.log('node start='+ node.fromTime + 'node End='+node.endTime)
                    if (node.fromTime == key) {
                        // add to graph
                        console.log("add node"+ node.key);
                       if(!graph.nodes().find((value) => value==node.key))
                       {
                       let s= graph.addNode(node.key,
                            {
                                ...omit(clusters[node.cluster], "key"),
                                ...node,
                                image: `${process.env.PUBLIC_URL}/images/${clusters[node.cluster].image}`,
                            });
                        console.log('added'+s)
                       }
                    } else if (node.endTime == key) {
                        console.log("drop node"+ node.key);
                        graph.dropNode(node.key);
                    }
                }
                // else if (item.type == 1) { // edge
                //     var edge = item.object;
                //     console.log("try add edge from"+ edge.start + " to " + edge.end);
                //     if (edge.fromTime == key) {
                //         if (graph.nodes().find((value) => value == edge.start.toString()) && graph.nodes().find((value) => value == edge.end.toString())) {
                //             console.log("node found"+ edge.start+"   &    " + edge.end)
                //             graph.addEdge(edge.start, edge.end, {size: 1})
                //         }else
                //             console.log("node not found"+ edge.start+"       "  + edge.end)
                //         // add to graph
                //     }//else delete edge
                    ////TODO
               // }

            });

            setGraphChanged(true)
            //return () => graph.clear();
        }, [startLoading]);


        return <>{children}</>;
    }
;

export default TimeLineController;

