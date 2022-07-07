import {useSigma} from "react-sigma-v2";
import {FC, useEffect} from "react";
import {constant, filter, keyBy, mapValues, omit} from "lodash";
import React from "react";
import ForceSupervisor from "graphology-layout-force/worker";
import forceAtlas2 from "graphology-layout-forceatlas2";
import {animateNodes} from "sigma/utils/animate";
import {circular, rotation} from "graphology-layout";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import NoverlapLayout from 'graphology-layout-noverlap/worker';
// Alternatively, to load only the relevant code:
import {Dataset, EdgeData, FiltersState, NodeData} from "../types";
import neo4j from "neo4j-driver";
import {log} from "util";
import SpringSupervisor from "graphology-layout-force/worker";
import noverlap from "graphology-layout-noverlap";
import {random} from 'graphology-layout';
import forceLayout from "graphology-layout-force";
import Graph from "graphology";

const GraphDataController: FC<{ dataset: Dataset, filters: FiltersState }> =
    ({dataset, filters, children}) => {

        const sigma = useSigma();
        const graph = sigma.getGraph();

        /**
         * Apply filters to graphology:
         */
        useEffect(() => {

            const {clusters} = filters;
            if (!dataset) return;

            dataset.nodes.forEach((node: NodeData) => {
                if (clusters[node.cluster])//show
                {
                    if (!graph.nodes().find(value => value == node.key))//if its not on the graph.. add
                    {
                        const clusters = keyBy(dataset.clusters, "key");
                        graph.addNode(node.key,
                            {
                                ...node,
                                ...omit(clusters[node.cluster], "key"),
                                type: "image",
                                image: `http://localhost:3000/images/${clusters[node.cluster].image}`,
                            });
                    }
                } else //hide
                {
                    if (graph.nodes().find(value => value == node.key))
                        graph.dropNode(node.key);
                }
            })
            dataset.edges.forEach((edge: EdgeData) => {
                var node1 = graph.nodes().find(value => value == edge.start);
                var node2 = graph.nodes().find(value => value == edge.end);
                if (node1 && node2)
                {
                    graph.addEdge(edge.start, edge.end, {size: 2})
                }
            });

            //todo drop edges

        }, [graph, filters]);

        return <>{children}</>;
    };

export default GraphDataController;