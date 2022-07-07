import {useSigma} from "react-sigma-v2";
import {FC, useEffect} from "react";
import {constant, keyBy, mapValues, omit, toNumber} from "lodash";
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
            const getData = async () => {

                await driver.session().run("MATCH (n)-[r]->(m) RETURN n,r,m", {})
                    .then((result) => {
                        var i = 0;
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
                        i = 1;
                        result.records.forEach(record => {
                            // for each column
                            record.forEach((value, key) => {
                                // if it's a node
                                if (value && value.hasOwnProperty('labels')) {


                                    if (dataset && !dataset.nodes.find(x => x.key == value.identity.low)) {
                                        var comId = toNumber(value.properties.component.substr(9, 1))

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
                                        dataset.nodes.push({
                                            cluster: value.labels[0],
                                            label: value.properties.name,
                                            x: Math.random() * x  + comId  * x ,
                                            y: Math.random() * y  + comId * y,
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

