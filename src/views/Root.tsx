import React, { FC, useEffect, useState } from "react";
import {
    SigmaContainer,
    ZoomControl,
    FullScreenControl,
    SearchControl,
    ControlsContainer,
    ForceAtlasControl
} from "react-sigma-v2";
import { omit, mapValues, keyBy, constant } from "lodash";

import getNodeProgramImage from "sigma/rendering/webgl/programs/node.image";

import GraphSettingsController from "./GraphSettingsController";
import GraphEventsController from "./GraphEventsController";
import GraphDataController from "./GraphDataController";
import { Dataset, FiltersState } from "../types";
import ClustersPanel from "./ClustersPanel";
import SearchField from "./SearchField";
import drawLabel from "../canvas-utils";
import GraphTitle from "./GraphTitle";

import "react-sigma-v2/lib/react-sigma-v2.css";
import { GrClose } from "react-icons/gr";
import { BiRadioCircleMarked, BiBookContent } from "react-icons/bi";

import Graph from "graphology";
import Sigma from "sigma";

import "react-sigma-v2/lib/react-sigma-v2.css";
import neo4j from "neo4j-driver";

// Retrieve the html document for sigma container
const container = document.getElementById("sigma-container") as HTMLElement;



// Create the sigma
const Root: FC = () => {

    const [showContents, setShowContents] = useState(false);
    const [dataReady, setDataReady] = useState(false);
    const [dataset, setDataset] = useState<Dataset | null>(null);
    const [filtersState, setFiltersState] = useState<FiltersState>({
        clusters: {},
    });
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    useEffect(() => {

    const neo4j = require('neo4j-driver')

    const uri = 'neo4j+s://001bf928.databases.neo4j.io';
    const user = 'neo4j';
    const password = '0KTmA258EX7WFm7HduJai55xfkfE1XDUHFbQbVzLV2k';
    var driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
    var session = driver.session();
    const getData = async () => {

        await driver.session().run("MATCH (n)-[r]->(m) RETURN n,r,m", {})
            .then((result) => {
                var i = 0;
                console.log("loading data")
                var dataset: Dataset = {
                    clusters: [
                        {key: "Keeper", color: "red", clusterLabel: "keeper", image: "keeper"},
                        {key: "Component", color: "blue", clusterLabel: "component", image: "component"},
                        {key: "Marketplace", color: "green", clusterLabel: "marketpalce", image: "marketplace"},
                        {key: "SearchEngine", color: "yellow", clusterLabel: "search engine", image: "searchengine"}],
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
                                    y:  Math.random() * 1000,
                                    key: value.identity.low
                                })
                            }
                        }
                        // if it's an edge
                        if (value && value.hasOwnProperty('type')) {
                            dataset.edges.push([value.start.low, value.end.low])
                        }
                    });
                })
                setDataset(dataset);
                setFiltersState({
                    clusters: mapValues(keyBy(dataset.clusters, "key"), constant(true)),
                });
                requestAnimationFrame(() => setDataReady(true));
             })
        await session.close();
        //const renderer = new Sigma(graph, container);
        await driver.close()

    }

    getData();



    }, []);

    if (!dataset)
        return null;

    return (
        <div id="app-root" className={showContents ? "show-contents" : ""}>
            <SigmaContainer
                graphOptions={{type: "directed",multi:true}}
                initialSettings={{
                    nodeProgramClasses: {image: getNodeProgramImage()},
                    labelRenderer: drawLabel,
                    defaultNodeType: "image",
                    defaultEdgeType: "arrow",
                    labelDensity: 0.07,
                    labelGridCellSize: 60,
                    labelRenderedSizeThreshold: 15,
                    labelFont: "Lato, sans-serif",
                    zIndex: true,
                }}
                className="react-sigma"
            >
                <ControlsContainer position={"bottom-left"}>
                    <ZoomControl />
                    <FullScreenControl />
                    <ForceAtlasControl  />
                </ControlsContainer>
                <GraphSettingsController hoveredNode={hoveredNode}/>
                <GraphEventsController setHoveredNode={setHoveredNode}/>
                <GraphDataController dataset={dataset} filters={filtersState}/>

                {dataReady && (
                    <>
                        <div className="controls">
                            <div className="ico">
                                <button
                                    type="button"
                                    className="show-contents"
                                    onClick={() => setShowContents(true)}
                                    title="Show caption and description"
                                >
                                    <BiBookContent/>
                                </button>
                            </div>
                        </div>
                        <div className="contents">
                            <div className="ico">
                                <button
                                    type="button"
                                    className="ico hide-contents"
                                    onClick={() => setShowContents(false)}
                                    title="Show caption and description"
                                >
                                    <GrClose/>
                                </button>
                            </div>
                            <GraphTitle filters={filtersState}/>
                            <div className="panels">
                                <SearchField filters={filtersState}/>
                                <ClustersPanel
                                    clusters={dataset.clusters}
                                    filters={filtersState}
                                    setClusters={(clusters) =>
                                        setFiltersState((filters) => ({
                                            ...filters,
                                            clusters,
                                        }))
                                    }
                                    toggleCluster={(cluster) => {
                                        setFiltersState((filters) => ({
                                            ...filters,
                                            clusters: filters.clusters[cluster]
                                                ? omit(filters.clusters, cluster)
                                                : {...filters.clusters, [cluster]: true},
                                        }));
                                    }}
                                />

                            </div>
                        </div>
                    </>
                )}
            </SigmaContainer>
        </div>
    );
};


export default Root;
