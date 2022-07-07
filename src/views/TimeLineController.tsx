import {useSigma} from "react-sigma-v2";
import {Dispatch, FC, useEffect, useState} from "react";
import {constant, filter, keyBy, mapValues, omit, values} from "lodash";
import React from "react";

import {Dataset, EdgeData, FiltersState, NodeData} from "../types";
import neo4j, {DateTime} from "neo4j-driver";
import {log} from "util";
import {notDeepEqual} from "assert";
import forceAtlas2 from "graphology-layout-forceatlas2";

const TimeLineController: FC<{ dataset: Dataset, timeDataset: any[] | null, setTimesDataset: (timeDataSet: any[]) => void, filters: FiltersState, selectedDate: number,setFiltersState: (any) => void, setShowContents: (boolean) => void }> =
    ({dataset, timeDataset, setTimesDataset, filters, selectedDate,setFiltersState, setShowContents, children}) => {
        const sigma = useSigma();
        const graph = sigma.getGraph();

        useEffect(() => {
            let dic = {};
            dataset.nodes.forEach((node: NodeData) => {
                if (node.fromTime == node.endTime) return;
                if (node.fromTime != 0)
                    (dic[node.fromTime] || (dic[node.fromTime] = [])).push({type: 0, object: node});
                if (node.endTime != 0)
                    (dic[node.endTime] || (dic[node.endTime] = [])).push({type: 0, object: node});
            })

            dataset.edges.forEach((edge: EdgeData) => {
                if (edge.endTime == edge.fromTime) return;
                if (edge.fromTime != 0)
                    (dic[edge.fromTime] || (dic[edge.fromTime] = [])).push({type: 1, object: edge});
                if (edge.endTime != 0)
                    (dic[edge.endTime] || (dic[edge.endTime] = [])).push({type: 1, object: edge});
            })

            var t = Object.keys(dic).map((key) => [Number(key), dic[key]]);
            t.sort((first, second) => first[0] - second[0]);

            setTimesDataset(t);

            //console.log(t)

        }, [dataset])

        useEffect(() => {

            if (!dataset || !timeDataset)
                return;

            var index = timeDataset.findIndex((e) => e[0] == selectedDate);
            if (index == -1 || !timeDataset[index])
                return;
            var previousIndex = index;
            var MyClusters = keyBy(dataset.clusters, "key");

            const x = async () => {
                const { clusters } = filters;

                for (var i = previousIndex; i <= index; i++) {
                    var key = timeDataset[i][0];
                    var items = timeDataset[i][1];

                    items.forEach((item) => {
                        if (item.type == 0) {
                            var node = item.object;
                            if (node.fromTime == key) {
                                // add to graph
                                if (!graph.nodes().find((value) => value == node.key)) {
                                    graph.addNode(node.key,
                                        {
                                            ...omit(MyClusters[node.cluster], "key"),
                                            ...node,
                                            "hidden":!clusters[node.cluster],
                                            image: `${process.env.PUBLIC_URL}/images/${MyClusters[node.cluster].image}`,
                                        });
                                    //  forceAtlas2.assign(graph, {iterations: 1,});
                                }
                            } else if (node.endTime == key) {
                                graph.dropNode(node.key);
                                // forceAtlas2.assign(graph, {iterations: 1,});
                            }
                        }

                        if (item.type == 1) { // edge
                            var edge = item.object;
                            if (edge.fromTime == key) {
                                if (graph.nodes().find((value) => value == edge.start.toString()) && graph.nodes().find((value) => value == edge.end.toString())) {
                                    graph.addEdge(edge.start, edge.end, {size: 1})
                                    // } else {
                                    //     console.log("node not found" + edge.start + "       " + edge.end)
                                    //  }
                                    // add to graph
                                }
                            }
                            //  } else if (edge.endTime == key) {
                            //     graph.dropEdge(edge.start, edge.end)

                            // }
                        }


                    });
                }

            }
            x();
            setFiltersState((filters) => ({ ...filters}));
            setShowContents(true);

        }, [selectedDate]);

        useEffect(() => {
            const { clusters } = filters;
            graph.forEachNode((node, { cluster, tag }) =>
                graph.setNodeAttribute(node, "hidden", !clusters[cluster] ),
            );
        }, [graph, filters]);

        return <>{children}</>;
    }
;

export default TimeLineController;

