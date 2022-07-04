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

            const uri = 'neo4j+s://001bf928.databases.neo4j.io';
            const user = 'neo4j';
            const password = '0KTmA258EX7WFm7HduJai55xfkfE1XDUHFbQbVzLV2k';
            var driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
            var session = driver.session();
            console.log("loading data")
            const getData = async () => {

                await driver.session().run("MATCH (n)-[r]->(m) RETURN n,r,m", {})
                    .then((result) => {
                        var i = 0;
                        var dataset: Dataset = {
                            clusters: [
                                {key: "Keeper", color: "red", clusterLabel: "keeper", image: "keeper"},
                                {key: "Component", color: "blue", clusterLabel: "component", image: "component"},
                                {key: "Marketplace", color: "green", clusterLabel: "marketpalce", image: "marketplace"},
                                {
                                    key: "SearchEngine",
                                    color: "yellow",
                                    clusterLabel: "search engine",
                                    image: "searchengine"
                                }],
                            edges: [],
                            nodes: []
                        };
                        result.records.forEach(record => {
                            // for each column
                            record.forEach((value, key) => {
                                // if it's a node
                                if (value && value.hasOwnProperty('labels')) {
                                    console.log("set a node")
                                    if (dataset && !dataset.nodes.find(x => x.key == value.identity.low)) {
                                        dataset.nodes.push({
                                            cluster: value.labels[0],
                                            label: value.properties.name,
                                            x: Math.random() * 1000,
                                            y: Math.random() * 1000,
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

