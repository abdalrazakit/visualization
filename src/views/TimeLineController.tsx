import {useSigma} from "react-sigma-v2";
import {Dispatch, FC, useEffect, useState} from "react";
import {constant, filter, keyBy, mapValues, omit, values} from "lodash";
import React from "react";

import {Dataset, EdgeData, FiltersState, NodeData} from "../types";
import neo4j, {DateTime} from "neo4j-driver";
import {log} from "util";
import {notDeepEqual} from "assert";
import forceAtlas2 from "graphology-layout-forceatlas2";

const TimeLineController: FC<{ dataset: Dataset, filters: FiltersState, selectedDate: number, setFiltersState: (any) => void, setShowContents: (boolean) => void }> =
    ({dataset, filters, selectedDate, setFiltersState, setShowContents, children}) => {
        const sigma = useSigma();
        const graph = sigma.getGraph();


        useEffect(() => {
            console.log("in time line1")

            if (!dataset)
                return;

             if (!dataset.nodes[selectedDate])
                return;

            var previousIndex = selectedDate;
            var MyClusters = keyBy(dataset.clusters, "key");

            const x = async () => {
                console.log("in time line")
                const {clusters} = filters;
                // for (var i = previousIndex; i <= index; i++) {
                console.log("start draw node")

                dataset.nodes[selectedDate].forEach((node) => {
                    if (node.fromTime == selectedDate) {
                        // add to graph
                       // if (!graph.nodes().find((value) => value == node.key)) {
                            graph.addNode(node.key,
                                {
                                    ...omit(MyClusters[node.cluster], "key"),
                                    ...node,
                                    "hidden": !clusters[node.cluster],
                                    image: `${process.env.PUBLIC_URL}/images/${MyClusters[node.cluster].image}`,
                                });
                       // }
                    } else if (node.endTime == selectedDate) {
                        graph.dropNode(node.key);
                    }
                });
                console.log("start draw edge")

                dataset.edges[selectedDate].forEach((edge) => {
                    if (edge.fromTime == selectedDate) {
                       // if (graph.nodes().find((value) => value == edge.start.toString()) && graph.nodes().find((value) => value == edge.end.toString())) {
                        try{
                            graph.addEdge(edge.start, edge.end, {size: 1})

                        }catch (e) {
                            console.log("exx")

                        }
                            // } else {
                            //     console.log("node not found" + edge.start + "       " + edge.end)
                            //  }
                            // add to graph
                       // }
                    }

                });
                console.log("end draw edge")

            }
            x();

            setFiltersState((filters) => ({...filters}));
            setShowContents(true);

        }, [selectedDate]);

        useEffect(() => {
            const {clusters} = filters;
            graph.forEachNode((node, {cluster, tag}) =>
                graph.setNodeAttribute(node, "hidden", !clusters[cluster]),
            );
        }, [graph, filters]);

        return <>{children}</>;
    }
;

export default TimeLineController;

