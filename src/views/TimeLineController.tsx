import {useSigma} from "react-sigma-v2";
import {Dispatch, FC, useEffect, useState} from "react";
import {constant, filter, keyBy, mapValues, omit, values} from "lodash";
import React from "react";

import {Dataset, EdgeData, FiltersState, NodeData} from "../types";
import neo4j, {DateTime} from "neo4j-driver";
import {log} from "util";
import {notDeepEqual} from "assert";
import forceAtlas2 from "graphology-layout-forceatlas2";
import {Simulate} from "react-dom/test-utils";

var previousDate = 0;
var colorNotNormalState = false;
const TimeLineController: FC<{ timeLabels: any[], dataset: Dataset, filters: FiltersState, selectedDate: number, setFiltersState: (any) => void }> =
    ({timeLabels, dataset, filters, selectedDate, setFiltersState, children}) => {
        const sigma = useSigma();
        const graph = sigma.getGraph();

        useEffect(() => {

            var startTime = performance.now()

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

            // delete all black color

            if (colorNotNormalState) {
                graph.nodes().forEach((node) => {
                    if (graph.getNodeAttributes(node)['color'] == 'black')
                        graph.dropNode(node)
                    else {
                        graph.setNodeAttribute(node, "color", "#bbb")
                    }
                })
            }

            if (previousDate < selectedDate) {
                console.log("Go a head")
                timeLabels.forEach(function (val) {
                    var index = val
                    if (index > previousDate) { // next the previous Date
                        if (index > selectedDate) // end;
                            return;
                       // console.log("day:" + selectedDate + " - " + new Date(selectedDate).toLocaleDateString("en-us"))

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
                        //console.log("day:" + selectedDate + " - " + new Date(selectedDate).toLocaleDateString("en-us"))

                        dataset.edges[index].forEach((edge) => {
                            //if (edge.fromTime == index)
                            {
                                try {
                                    graph.addEdge(edge.start, edge.end, {...edge})
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

                        dataset.edges[index].forEach((edge) => {
                            if (edge.endTime == index) {
                                try {
                                    if (colorNotNormalState)
                                        graph.setEdgeAttribute(edge.key, "color", 'black')
                                    else
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
                        //console.log("day:" + selectedDate + " - " + new Date(selectedDate).toLocaleDateString("en-us"))
                        dataset.nodes[index].forEach((node) => {
                            if (node.endTime == index) {
                                try {
                                    //
                                    if (colorNotNormalState)
                                        graph.setNodeAttribute(node.key, 'color', 'black')
                                    else
                                        graph.dropNode(node.key);
                                } catch (e) {
                                    console.log("error in drop node" + e)
                                }
                            }
                        });
                    }
                })
                if (colorNotNormalState)
                    graph.nodes().forEach((node) => {
                        if (graph.getNodeAttributes(node)['color'] != 'black') {
                            if (graph.getNodeAttributes(node)['cluster'] != 'Keeper') {
                                let neighbors = graph.inNeighbors(node)

                                if (neighbors.length == 0 && graph.getNodeAttributes(node)['cluster'] != 'Keeper') {
                                    graph.setNodeAttribute(node, 'color', 'red')
                                    //    graph.setNodeAttribute(node, 'size', '20')
                                } else {
                                    let change = true;
                                    neighbors.forEach(n => {
                                        if (graph.getNodeAttributes(n)['color'] != 'black')
                                            change = false;
                                    })
                                    if (change)
                                        graph.setNodeAttribute(node, 'color', 'red')
                                }
                            }
                        }
                    })
            }

            if (previousDate > selectedDate) {
                console.log("Go back")
                var reversTimeLabel = timeLabels.slice().reverse()

                reversTimeLabel.forEach(function (val) {
                    var index = val;
                    if (index <= previousDate) {
                        if (index < selectedDate) // end;
                            return;
                        dataset.nodes[index].forEach((node) => {
                            if (node.endTime == index && node.fromTime <= selectedDate) {
                                try {
                                    graph.addNode(node.key,
                                        {
                                            ...omit(MyClusters[node.cluster], "key"),
                                            ...node,

                                            "hidden": !filters[node.cluster],
                                        });
                                    if (node.endTime == selectedDate)
                                        if (colorNotNormalState)
                                            graph.setNodeAttribute(node.key, 'color', 'black')
                                } catch (e) {
                                    console.log("error in add node" + e)
                                }
                            }
                        });
                    }
                });

                graph.clearEdges()
                reversTimeLabel.forEach(function (val) {
                    var index = val;
                    if (index <= selectedDate) {
                        dataset.edges[index].forEach((edge) => {
                            if (edge.fromTime == index && (edge.endTime >= selectedDate || edge.endTime == 0)) {
                                try {
                                    graph.addEdge(edge.start, edge.end, {...edge})
                                } catch (e) {
                                    console.log("error in add edge")
                                }
                            }
                        });
                    }
                });
                reversTimeLabel.forEach(function (val) {
                    var index = val;
                    if (index <= previousDate) {
                        if (index <= selectedDate) // end;
                            return;

                        dataset.edges[index].forEach((edge) => {
                            if (edge.fromTime == selectedDate) {
                                try {
                                    if (colorNotNormalState)
                                        graph.setEdgeAttribute(edge.key, "color", 'black')
                                    else
                                        graph.dropEdge(edge.start, edge.end)
                                } catch (e) {
                                }
                            }
                        });
                    }
                });

                reversTimeLabel.forEach(function (val) {
                    var index = val;
                    if (index <= previousDate) {
                        if (index <= selectedDate) // end;
                            return;
                        dataset.nodes[index].forEach((node) => {
                            if (node.fromTime == index) {
                                try {
                                    if (colorNotNormalState)
                                        //     graph.setNodeAttribute(node.key,'size','15')
                                        graph.setNodeAttribute(node.key, 'color', 'black');
                                    else
                                        graph.dropNode(node.key);
                                } catch (e) {
                                    console.log("error in delete node")
                                }
                            }
                        });
                    }
                });

                if(colorNotNormalState)
                graph.nodes().forEach((node) => {
                    if( graph.getNodeAttributes(node)['color']!='black') {
                        let neighbors = graph.inNeighbors(node)
                        if (graph.getNodeAttributes(node)['cluster'] != 'Keeper') {
                            if (neighbors.length == 0 ) {
                                graph.setNodeAttribute(node, 'color', 'red')
                                //  graph.setNodeAttribute(node,'size','20')
                            } else {
                                let change = true;
                                neighbors.forEach(n => {
                                    if (graph.getNodeAttributes(n)['color'] != 'black')
                                        change = false;
                                })
                                if (change)
                                    graph.setNodeAttribute(node, 'color', 'red')
                            }
                        }
                    }
                })
            }


            previousDate = selectedDate;
            setFiltersState((filters) => ({...filters}));
            // setShowContents(true);
            var endTime = performance.now()
            var time = endTime - startTime
            console.log('The transition took '+ time+' milliseconds')
        }, [selectedDate]);


        return <>{children}</>;
    }
;

export default TimeLineController;

