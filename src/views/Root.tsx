import React, {FC, useEffect, useState} from "react";
import {
    SigmaContainer,
    ZoomControl,
    FullScreenControl,
    SearchControl,
    ControlsContainer,
    ForceAtlasControl
} from "react-sigma-v2";
import {omit, mapValues, keyBy, constant, templateSettings} from "lodash";
import Timeline, {calendar} from 'react-interactive-timeline';


import getNodeProgramImage from "sigma/rendering/webgl/programs/node.image";

import GraphSettingsController from "./GraphSettingsController";
import GraphEventsController from "./GraphEventsController";
import GraphDataController from "./GraphDataController";
import {Dataset, FiltersState} from "../types";
import ClustersPanel from "./ClustersPanel";
import SearchField from "./SearchField";
import drawLabel from "../canvas-utils";
import GraphTitle from "./GraphTitle";

import "react-sigma-v2/lib/react-sigma-v2.css";
import {GrClose} from "react-icons/gr";
import {BiRadioCircleMarked, BiBookContent} from "react-icons/bi";
import {BsArrowsFullscreen, BsFullscreenExit, BsZoomIn, BsZoomOut} from "react-icons/bs";

import Graph from "graphology";
import Sigma from "sigma";

import "react-sigma-v2/lib/react-sigma-v2.css";
import neo4j from "neo4j-driver";
import DataSetController from "./DatasetController";
import {ForceAtlasControlProps} from "react-sigma-v2/lib/esm/controls/ForceAtlasControl";
import TimeLineController from "./TimeLineController";

// Retrieve the html document for sigma container
const container = document.getElementById("sigma-container") as HTMLElement;
var i = 0;

// Create the sigma
const Root: FC = () => {

    const [graphChanged, setGraphChanged] = useState(false);

    //const [showContents, setShowContents] = useState(false);
    //const [dataReady, setDataReady] = useState(false);
    const [startLoading, setStartLoading] = useState( 0);
    const [dataset, setDataset] = useState<Dataset | null>(null);
    const [filtersState, setFiltersState] = useState<FiltersState>({
        clusters: {},
    });
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    useEffect(() => {
            setInterval(() => setStartLoading(i++), 200);
    }, [])


    return (
        <div id="app-root" className={ "show-contents"}>
            <SigmaContainer
                graphOptions={{type: "directed", multi: true}}
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
                    <ZoomControl/>
                    <FullScreenControl/>
                    <ForceAtlasControl settings={{settings: {adjustSizes: true}}}/>
                </ControlsContainer>
                <ControlsContainer position={"top-right"}>
                    <SearchControl/>
                </ControlsContainer>

                <GraphSettingsController hoveredNode={hoveredNode}/>
                <GraphEventsController setHoveredNode={setHoveredNode}/>
                {!dataset && (<DataSetController setDataset={setDataset} setFiltersState={setFiltersState}/>)}
                {/*{<GraphDataController dataset={dataset!} filters={filtersState}/>}*/}
                {dataset && (
                    <>
                        <TimeLineController dataset={dataset!} startLoading={startLoading}  setGraphChanged={setGraphChanged}/>

                        <div className="contents">


                            <GraphTitle filters={filtersState} graphChanged={graphChanged}/>
                            <div className="panels">
                                <SearchField filters={filtersState}/>
                                <ClustersPanel
                                    clusters={dataset!.clusters}
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
                        {/*<div>    <Timeline startDate={"2018-09-01"} endDate={"2019-06-30"}>*/}
                        {/*    <Timeline.Row>*/}
                        {/*        <Timeline.Event date="2018-12-12" label="My event" />*/}
                        {/*    </Timeline.Row>*/}
                        {/*    <Timeline.Row fixedHeight>*/}
                        {/*        <Timeline.StepLabels />*/}
                        {/*    </Timeline.Row>*/}
                        {/*</Timeline></div>*/}
                    </>
                )}
            </SigmaContainer>
        </div>
    );

}
export default Root;
