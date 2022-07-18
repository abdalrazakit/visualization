import {useSigma} from "react-sigma-v2";
import {FC, useEffect} from "react";
import {constant, keyBy, mapValues, omit, toNumber} from "lodash";
import React from "react";

import {Dataset, EdgeData, FiltersState, NodeData} from "../types";
import neo4j from "neo4j-driver";
import {Subject} from 'rxjs'
import {bufferCount, takeUntil} from 'rxjs/operators'
import {concat, flatten, uniqBy, slice} from 'lodash'

function calculateX_Y(comId: number) {
    var x = 1;
    var y = 1;
    if (comId % 4 == 0) {
        x = 1;
        y = 1
    } else if (comId % 4 == 1) {
        x = 1;
        y = -1
    } else if (comId % 4 == 2) {
        x = -1;
        y = 1
    } else if (comId % 4 == 3) {
        x = -1;
        y = -1
    }
    return {x, y};
}

const DataSetController: FC<{ timeLabels: any[], filters: FiltersState, setDataset: (dataset: Dataset | null) => void, setFiltersState: (boolean) => void,setDataReady:(any)=>void }> =
    ({timeLabels,filters, setDataset,setDataReady, setFiltersState, children}) => {
        const sigma = useSigma();
        const graph = sigma.getGraph();

        const MAXIMUM_UNIQUE_NODES = 10000
        const BUFFER_SIZE = 10000
        let uniqueNodes = []


        useEffect(() => {
            const neo4j = require('neo4j-driver')

            const uri = 'neo4j+s://001bf928.databases.neo4j.io';
            const user = 'neo4j';
            const password = '0KTmA258EX7WFm7HduJai55xfkfE1XDUHFbQbVzLV2k';

            var driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

            var dataset: Dataset = {
                clusters: [
                    {
                        key: "Component",
                        size: 10,
                        color: "blue",
                        clusterLabel: "component",
                        image: "component"
                    },
                    {key: "Keeper", size: 8, color: "red", clusterLabel: "keeper", image: "keeper"},
                    {
                        key: "Marketplace",
                        size: 6,
                        color: "green",
                        clusterLabel: "marketpalce",
                        image: "marketplace"
                    },
                    {
                        key: "SearchEngine",
                        color: "yellow",
                        clusterLabel: "searchengine",
                        image: "searchengine",
                        size: 6
                    },
                    {
                        key: "ExecutionManager",
                        color: "grey",
                        clusterLabel: "execution manager",
                        image: "executionmanager", size: 4,
                    },
                    {
                        key: "NodeExecutor",
                        color: "pink",
                        clusterLabel: "node executor",
                        image: "nodeexecutor", size: 4,
                    }, {
                        key: "AssetManager",
                        color: "brown",
                        clusterLabel: "asset manager",
                        image: "assetmanager", size: 4,
                    }],
                edges: [],
                nodes: []
            };

            timeLabels.forEach((e) => {
                if (!dataset.nodes[e]) {
                    dataset.nodes[e] = [];
                    dataset.edges[e] = [];
                }
            });
            console.log(timeLabels)
            setFiltersState({
                clusters: mapValues(keyBy(dataset.clusters, "key"), constant(true)),
            });

            var MyClusters = keyBy(dataset.clusters, "key");

            const getData = async () => {

                var query = "MATCH (n)-[r]->(m) RETURN n,r,m";
                const rxSession = driver.rxSession({database: 'neo4j'})
                const notifier = new Subject()
                const emitNotifier = () => {
                    notifier.next()
                    notifier.complete()
                }

                const fetchResultsUsingReactiveDrivers = () =>
                    rxSession.readTransaction(tx => tx
                        .run(query, {})
                        .records()
                        .pipe(
                            bufferCount(BUFFER_SIZE),
                            takeUntil(notifier)
                        ))
                        .subscribe({
                            next: records => {
                                console.log("next")
                                 records.forEach(record => {
                                    // for each column
                                    record.forEach((value, key) => {
                                        // if it's a node
                                        if (value && value.hasOwnProperty('labels')) {
                                            var comId = toNumber(value.properties.component.substr(9, 1))
                                            var {x, y} = calculateX_Y(comId);
                                            var node = {
                                                cluster: value.labels[0],
                                                label: value.properties.name,
                                                x: Math.random() * 1000,// * x + comId * x,
                                                y: Math.random() * 1000 ,// * y + comId * y,
                                                key: value.identity.low,
                                                fromTime: value.properties.from,
                                                endTime: value.properties.end
                                            };
                                            if (node.fromTime != node.endTime) {
                                                if (!dataset.nodes[node.fromTime][node.key]) {
                                                    if (node.fromTime == timeLabels[0]) {
                                                        try {
                                                            graph.addNode(node.key,
                                                                {
                                                                    ...omit(MyClusters[node.cluster], "key"),
                                                                    ...node,
                                                                    "hidden": !filters[node.cluster],
                                                                    image: `${process.env.PUBLIC_URL}/images/${MyClusters[node.cluster].image}`,
                                                                });
                                                        } catch (e) {
                                                            console.log("exx")
                                                        }
                                                    }
                                                    dataset.nodes[node.fromTime][node.key] = node;
                                                }
                                                if (node.endTime != 0)
                                                    dataset.nodes[node.endTime][node.key] = node;
                                            }

                                        }
                                        // if it's an edge
                                        if (value && value.hasOwnProperty('type')) {
                                            var edge = {
                                                start: value.start,
                                                end: value.end,
                                                label: value.type,
                                                key: value.identity.low,
                                                fromTime: value.properties.from,
                                                endTime: value.properties.end
                                            };
                                             if (edge.endTime != edge.fromTime) {
                                                dataset.edges[edge.fromTime][edge.key]= edge;
                                                if (edge.endTime != 0)
                                                    dataset.edges[edge.endTime][edge.key]= edge;
                                            }
                                        }
                                    });


                                })

                                setDataset(dataset);
                               // setShowContents(true);
                               // setDataReady(true);
                                setFiltersState((filters) => ({...filters}));


                            },
                            complete: () => {
                                console.log('completed', uniqueNodes)
                                driver.close()
                                dataset.edges[timeLabels[0]].forEach((edge) => {
                                    if (edge.fromTime == timeLabels[0]) {
                                        try{
                                            graph.addEdge(edge.start, edge.end, {size: 1})
                                        }catch (e) {
                                            console.log("exx")
                                        }
                                    }
                                });
                                setDataset(dataset);
                               // setShowContents(true);
                               /// setDataReady(true);
                                setFiltersState((filters) => ({...filters}));


                            },
                            error: error => {
                                console.error(error)
                            }
                        })


                fetchResultsUsingReactiveDrivers();
            }
            getData();

        }, [timeLabels]);




        return <>{children}</>;
    };

export default DataSetController;

