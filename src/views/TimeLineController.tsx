import {useSigma} from "react-sigma-v2";
import {Dispatch, FC, useEffect, useState} from "react";
import {constant, filter, keyBy, mapValues, omit, values} from "lodash";
import React from "react";

import {Dataset, EdgeData, FiltersState, NodeData} from "../types";
import neo4j, {DateTime} from "neo4j-driver";
import {log} from "util";
import {notDeepEqual} from "assert";
import forceAtlas2 from "graphology-layout-forceatlas2";

var previousDate = 0;

const TimeLineController: FC<{ timeLabels: any[], dataset: Dataset, filters: FiltersState, selectedDate: number, setFiltersState: (any) => void }> =
    ({timeLabels, dataset, filters, selectedDate, setFiltersState, children}) => {
        const sigma = useSigma();
        const graph = sigma.getGraph();

        useEffect(() => {

            if (!dataset)
                return;

            if (!dataset.nodes[selectedDate])
                return;

            if (!previousDate) {
                previousDate = selectedDate
                return;
            }

            if (previousDate == selectedDate)
                return;

            var MyClusters = keyBy(dataset.clusters, "key");


            graph.nodes().forEach((node) => {
                graph.setNodeAttribute(node, "color", "#bbb")
            })
            graph.edges().forEach((edge) => {
                graph.setEdgeAttribute(edge, "size", 1)
            })

            if (previousDate < selectedDate) {
                console.log("Go a head")
                timeLabels.forEach(function (val) {
                    var index = val
                    if (index > previousDate) { // next the previous Date
                        if (index > selectedDate) // end;
                            return;
                        console.log("day:" + selectedDate + " - " + new Date(selectedDate).toLocaleDateString("en-us"))

                        dataset.nodes[index].forEach((node) => {
                            if (node.fromTime == index) {
                                try {
                                    graph.addNode(node.key,
                                        {
                                            ...omit(MyClusters[node.cluster], "key"),
                                            ...node,
                                            "hidden": !filters[node.cluster],
                                        });
                                } catch (e) {
                                    console.log("error in add node: " + e + "node date: " + node.fromTime)
                                }
                            }
                        });

                    }
                })
                timeLabels.forEach(function (val) {
                    var index = val
                    if (index > previousDate) { // next the previous Date
                        if (index > selectedDate) // end;
                            return;
                        console.log("day:" + selectedDate + " - " + new Date(selectedDate).toLocaleDateString("en-us"))

                        dataset.edges[index].forEach((edge) => {
                            if (edge.fromTime == index) {
                                try {
                                    graph.addEdge(edge.start, edge.end)
                                } catch (e) {
                                    console.log("error in add edge")
                                }
                            }
                        });
                    }
                })
                timeLabels.forEach(function (val) {
                    var index = val
                    if (index > previousDate) { // next the previous Date
                        if (index > selectedDate) // end;
                            return;
                        console.log("day:" + selectedDate + " - " + new Date(selectedDate).toLocaleDateString("en-us"))

                        dataset.edges[index].forEach((edge) => {
                            if (edge.endTime == index) {
                                try {
                                    graph.dropEdge(edge.start, edge.end)
                                } catch (e) {
                                    console.log("error in remove edge1:" + e + " target: " + edge.start + "-" + edge.end + " time: " + edge.endTime)
                                }
                            }
                        });
                    }
                })
                timeLabels.forEach(function (val) {
                    var index = val
                    if (index > previousDate) { // next the previous Date
                        if (index > selectedDate) // end;
                            return;
                        console.log("day:" + selectedDate + " - " + new Date(selectedDate).toLocaleDateString("en-us"))
                        dataset.nodes[index].forEach((node) => {
                            if (node.endTime == index) {
                                try {
                                    graph.dropNode(node.key);
                                } catch (e) {
                                    console.log("error in drop node")
                                }
                            }
                        });
                    }
                })
            }

            if (previousDate > selectedDate) {
                console.log("Go back")
                var reversTimeLabel = timeLabels.slice().reverse()

                //     reversTimeLabel.forEach(function (val) {
                //         var index = val;
                //         if (index <= previousDate) {
                //             if (index <= selectedDate) // end;
                //                 return;
                //             console.log("day" + new Date(index).toLocaleDateString("en-us"))
                //
                //             dataset.edges[index].forEach((edge) => {
                //                 if (edge.fromTime > selectedDate) {
                //                     try {
                //                         graph.dropEdge(edge.start, edge.end)
                //                     } catch (e) {
                //                     }
                //                 }
                //             });
                //         }
                //     });

                reversTimeLabel.forEach(function (val) {
                    var index = val;
                    if (index <= previousDate) {
                        if (index <= selectedDate) // end;
                            return;
                        console.log("day" + new Date(index).toLocaleDateString("en-us"))
                        dataset.nodes[index].forEach((node) => {
                            if (node.fromTime > selectedDate) {
                                try {
                                    graph.dropNode(node.key);
                                } catch (e) {
                                    console.log("error in delete node")
                                }
                            }
                        });
                    }
                });
                graph.clearEdges()

                reversTimeLabel.forEach(function (val) {
                    var index = val;
                    if (index <= previousDate) {
                        if (index < selectedDate) // end;
                            return;
                        console.log("day" + new Date(index).toLocaleDateString("en-us"))
                        dataset.nodes[index].forEach((node) => {
                            if (node.endTime == index && node.fromTime <= selectedDate) {
                                try {
                                    graph.addNode(node.key,
                                        {

                                            ...omit(MyClusters[node.cluster], "key"),
                                            ...node,

                                            "hidden": !filters[node.cluster],
                                        });
                                } catch (e) {
                                    console.log("error in add node")
                                }
                            }
                        });
                    }
                });
                reversTimeLabel.forEach(function (val) {
                    var index = val;
                    if (index <= previousDate) {
                        console.log("day" + new Date(index).toLocaleDateString("en-us"))
                        console.log("day" + index)
                        dataset.edges[index].forEach((edge) => {
                            console.log(edge.label + " | " + edge.fromTime + " | " + edge.endTime)
                            if (edge.fromTime <= selectedDate) {
                                console.log(edge.label)
                                console.log("add edge")
                                try {
                                    graph.addEdge(edge.start, edge.end)
                                } catch (e) {
                                    console.log("error in add edge")
                                }
                            }
                        });
                    }
                });
            }


            previousDate = selectedDate;
            setFiltersState((filters) => ({...filters}));
            // setShowContents(true);

        }, [selectedDate]);


        return <>{children}</>;
    }
;

export default TimeLineController;

