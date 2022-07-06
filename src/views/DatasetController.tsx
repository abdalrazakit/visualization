import {useSigma} from "react-sigma-v2";
import {FC, useEffect} from "react";
import {constant, keyBy, mapValues, omit} from "lodash";
import React from "react";

import {Dataset} from "../types";
import neo4j from "neo4j-driver";

const DataSetController: FC<{ setDataset: (dataset: Dataset | null) => void, setFiltersState: (any) => void }> =
    ({setDataset, setFiltersState, children}) => {
        const sigma = useSigma();
        const graph = sigma.getGraph();


        useEffect(() => {

            const neo4j = require('neo4j-driver')

            const uri = 'neo4j+s://5755b0fb.databases.neo4j.io';
            const user = 'neo4j';
            const password = 'TSR9dRpkY8ZxjhL4GX8TLVaX7UJGdO8ArQo96PwOt5o';
            var driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
            var session = driver.session();
            console.log("loading data")
            const getData = async () => {

                await driver.session().run("MATCH (n)-[r]->(m) RETURN n,r,m", {})
                    .then((result) => {
                        var i = 0;
                        var dataset: Dataset = {
                            clusters: [
                                {key: "Keeper", size: 15, color: "red", clusterLabel: "keeper", image: "keeper"},
                                {
                                    key: "Component",
                                    size: 20,
                                    color: "blue",
                                    clusterLabel: "component",
                                    image: "component"
                                },
                                {
                                    key: "Marketplace",
                                    size: 10,
                                    color: "green",
                                    clusterLabel: "marketpalce",
                                    image: "marketplace"
                                },
                                {
                                    key: "SearchEngine",
                                    color: "yellow",
                                    clusterLabel: "searchengine",
                                    image: "searchengine", size: 10,
                                },
                                {
                                    key: "ExecutionManager",
                                    color: "grey",
                                    clusterLabel: "execution manager",
                                    image: "executionmanager", size: 5,
                                },
                                {
                                    key: "NodeExecutor",
                                    color: "pink",
                                    clusterLabel: "node executor",
                                    image: "nodeexecutor", size: 5,
                                }, {
                                    key: "AssetManager",
                                    color: "brown",
                                    clusterLabel: "asset manager",
                                    image: "assetmanager", size: 5,
                                }],
                            edges: [],
                            nodes: []
                        };
                        i = 1;
                        result.records.forEach(record => {
                            // for each column
                            record.forEach((value, key) => {
                                // if it's a node
                                if (value && value.hasOwnProperty('labels')) {
                                    if (dataset && !dataset.nodes.find(x => x.key == value.identity.low)) {
                                        dataset.nodes.push({
                                            cluster: value.labels[0],
                                            label: value.properties.name,
                                            x: Math.random(),
                                            y: Math.random(),
                                            key: value.identity.low,
                                            fromTime: value.properties.from,
                                            endTime: value.properties.end
                                        })
                                    }
                                }
                                // if it's an edge
                                if (value && value.hasOwnProperty('type')) {
                                    dataset.edges.push({
                                        start: value.start,
                                        end: value.end,
                                        label: value.type,
                                        fromTime: value.properties.from,
                                        endTime: value.properties.end
                                    })
                                }
                            });
                        })
                        // dataset.nodes.forEach((node) => {
                        //     var nephore = dataset.edges.filter((value) => {
                        //         node.key == value.start
                        //
                        //     })
                        //
                        //
                        //
                        // })
                        setDataset(dataset);
                        setFiltersState({
                            clusters: mapValues(keyBy(dataset.clusters, "key"), constant(true)),
                        });
                        // requestAnimationFrame(() => setDataReady(true));
                    })
                await session.close();
                //const renderer = new Sigma(graph, container);
                await driver.close()
            }
            getData();

        }, []);
        return <>{children}</>;
    };


export default DataSetController;

