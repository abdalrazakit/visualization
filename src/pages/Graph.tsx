import React, {FC, useEffect, useState} from "react";
import {
    SigmaContainer,
    ZoomControl,
    FullScreenControl,
    SearchControl,
    ControlsContainer,
    ForceAtlasControl
} from "react-sigma-v2";
import {omit, mapValues, keyBy, constant, templateSettings, toNumber} from "lodash";


import getNodeProgramImage from "sigma/rendering/webgl/programs/node.image";

import GraphSettingsController from "../views/GraphSettingsController";
import GraphEventsController from "../views/GraphEventsController";
import GraphDataController from "../views/GraphDataController";
import {Dataset, FiltersState} from "../types";
import ClustersPanel from "../views/ClustersPanel";
import SearchField from "../views/SearchField";
import drawLabel from "../canvas-utils";
import GraphTitle from "../views/GraphTitle";

import "react-sigma-v2/lib/react-sigma-v2.css";
import {GrClose} from "react-icons/gr";
import {BiRadioCircleMarked, BiBookContent} from "react-icons/bi";
import {BsArrowsFullscreen, BsFullscreenExit, BsZoomIn, BsZoomOut} from "react-icons/bs";

import Graph from "graphology";
import Sigma from "sigma";

import "react-sigma-v2/lib/react-sigma-v2.css";
import neo4j from "neo4j-driver";
import DataSetController from "../views/DatasetController";
import {ForceAtlasControlProps} from "react-sigma-v2/lib/esm/controls/ForceAtlasControl";
import TimeLineController from "../views/TimeLineController";
import RangeSlider from "react-bootstrap-range-slider";
import TimeLabelController from "../views/TimeLableController";
import CommandsPanel from "../views/CommandsPanel";
import FillterController from "../views/FillterController";




// Create the sigma
const MyGraph: FC = () => {

    const [dataReady, setDataReady] = useState<boolean>(false);
    const [preDate, setPreDate] = useState(0);
    const [selectedDate, setSelectedDate] = useState(0);
    const [ timeLabels, setTimeLabels] = useState<any[] | null>(null);
    const [dataset, setDataset] = useState<Dataset | null>(null);
    const [filtersState, setFiltersState] = useState<FiltersState>({
        clusters: {},
    });
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

    useEffect(() => {
        if (timeLabels) {
            setSelectedDate(new Date(timeLabels[0]).getTime())
        }
    }, [timeLabels])

    return (
        <div id="app-root" className={"show-contents"}>

            <SigmaContainer
                graphOptions={ {type: "directed", multi: true,allowSelfLoops:true}}

                initialSettings={{
                        nodeProgramClasses: {
                            image: getNodeProgramImage(),

                        },
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

                {!timeLabels && (<TimeLabelController setTimesLabels={setTimeLabels}/>)}

                {timeLabels && !dataset && (<DataSetController

                    setDataReady={setDataReady}
                    timeLabels={timeLabels}
                    setDataset={setDataset}
                    filters={filtersState}
                    setFiltersState={setFiltersState}/>)}

                {timeLabels && dataset && (
                    <>
                        <FillterController filters={filtersState}/>
                        {(<TimeLineController dataset={dataset!}
                                              timeLabels={timeLabels}

                                              selectedDate={selectedDate}
                                                           filters={filtersState}
                                                           setFiltersState={setFiltersState}/>
                        )}
                        {/*<GraphSettingsController hoveredNode={hoveredNode}/>*/}
                        <GraphEventsController selectedDate={selectedDate} setHoveredNode={setHoveredNode}
                                               setSelectedNode={setSelectedNode} setSelectedEdge={setSelectedEdge}
                                               dataset={dataset!}/>
                        <GraphSettingsController hoveredNode={selectedNode}></GraphSettingsController>
                        <ControlsContainer position={"bottom-left"}>
                            <ZoomControl/>
                            <FullScreenControl/>
                            <ForceAtlasControl
                                settings={
                                    {
                                        settings: {
                                            adjustSizes: false,
                                            //barnesHutOptimize:true,
                                            //barnesHutTheta:0.001,
                                            //edgeWeightInfluence:10,
                                            //gravity: 0.5,
                                            linLogMode: true,
                                            //outboundAttractionDistribution : true,
                                            strongGravityMode: true,
                                            //slowDown: 3,
                                            //scalingRatio: 0.1
                                        }
                                    }}/>
                        </ControlsContainer>
                        <div className="contents">
                            <div className="panels">
                                <label>selected date: {new Date(selectedDate).toLocaleDateString("en-us")}</label> {preDate && (<label>previous date: {new Date(preDate).toLocaleDateString("en-us")}</label>)}
                                <GraphTitle filters={filtersState}/>
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
                                    startTimeLine={() => {
                                        debugger
                                        if (timeLabels) {
                                            var index = timeLabels.findIndex((e) => {
                                                return e[0] == selectedDate
                                            })
                                            if (index != -1 && index + 1 < timeLabels.length)
                                                setSelectedDate(new Date(timeLabels[index + 1]).getTime())
                                        }
                                    }}
                                    stopTimeLine={() => {
                                    }}
                                    toggleCluster={(cluster) => {
                                        setFiltersState((filters) => ({
                                            ...filters,
                                            clusters: filters.clusters[cluster]
                                                ? omit(filters.clusters, cluster)
                                                : {...filters.clusters, [cluster]: true},
                                        }));
                                    }}
                                />

                                <CommandsPanel dataset={dataset!} selectedDate={selectedDate}
                                               selectedEdge={selectedEdge} selectedNode={selectedNode}/>

                            </div>

                            <div className={"timeline"}>
                                <RangeSlider
                                    min={timeLabels ? new Date(timeLabels[0]).getTime() : 0}
                                    max={timeLabels ? new Date(timeLabels[timeLabels.length - 1]).getTime() : 0}
                                    size={'lg'}
                                    step={86400000}
                                    tooltip={"on"}
                                    tooltipPlacement={"top"}
                                    tooltipLabel={(numner) => {
                                        let custom = {year: "numeric", month: "short", day: "numeric"};
                                        return new Date(numner).toLocaleDateString("en-us");
                                    }
                                    }
                                    value={selectedDate}
                                    onChange={changeEvent =>{setPreDate(selectedDate); setSelectedDate(toNumber(changeEvent.target.value))}}
                                />
                            </div>)


                        </div>


                    </>
                )}
            </SigmaContainer>

        </div>
    );

}
export default MyGraph;
