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

            dataset.nodes.forEach((node: NodeData) => {
                (dic[node.fromTime] || (dic[node.fromTime] = [])).push({type: 0, object: node});
            })

            dataset.edges.forEach((edge: EdgeData) => {
                (dic[edge.fromTime] || (dic[edge.fromTime] = [])).push({type: 1, object: edge});
            })

            var t = Object.keys(dic).map((key) => [Number(key), dic[key]]);
            t.sort((first, second) => first[0] - second[0]);
            setTimes(t);

        }, [dataset])

        useEffect(() => {

            if (!dataset || !times[startLoading])
                return;
            var key = times[startLoading][0];
            var items = times[startLoading][1];
            var clusters = keyBy(dataset.clusters, "key");

            items.forEach((item) => {
                console.log(item.type)
                if (item.type == 0) {
                    var node = item.object;
                    if (node.fromTime == key) {
                        // add to graph
                        console.log("add node"+ node.key);
                        graph.addNode(node.key,
                            {
                                size: 10,
                                ...omit(clusters[node.cluster], "key"),
                                ...node,
                            });
                    } else if (node.endTime == key) {
                        console.log("drop node"+ node.key);
                        graph.dropNode(node.key);
                    }
                } else if (item.type == 1) { // edge
                    var edge = item.object;
                    console.log("try add edge from"+ edge.start + " to " + edge.end);
                    if (edge.fromTime == key) {
                        if (graph.nodes().find((value) => value == edge.start) && graph.nodes().find((value) => value == edge.end)) {
                            console.log("node found"+ edge.start+"   &    " + edge.end)
                            graph.addEdge(edge.start, edge.end, {size: 1})
                        }else
                            console.log("node not found"+ edge.start+"       "  + edge.end)
                        // add to graph
                    }//else delete edge
                }

            });

            setGraphChanged(true)
            //return () => graph.clear();
        }, [startLoading]);


        return <>{children}</>;
    }
;

export default TimeLineController;

