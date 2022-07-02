import {useSigma} from "react-sigma-v2";
import {FC, useEffect} from "react";
import {keyBy, omit} from "lodash";
import React from "react";

import {Dataset, FiltersState} from "../types";

const GraphDataController: FC<{ dataset: Dataset; filters: FiltersState }> = ({dataset, filters, children}) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();

     /**
     * Feed graphology with the new dataset:
     */
    useEffect(() => {
        if (!graph || !dataset) return;

        const clusters = keyBy(dataset.clusters, "key");

        dataset.nodes.forEach((node) => {
            debugger
            graph.addNode(node.key, {
                ...node,
                ...omit(clusters[node.cluster], "key"),
                image: `localhost:3000/images/${clusters[node.cluster].image}`,
            });
        });
        dataset.edges.forEach(([source, target]) => graph.addEdge(source, target, {size: 1}));

        // Use degrees as node sizes:
        const scores = graph.nodes().map((node) => graph.getNodeAttribute(node, "score"));
        const minDegree = Math.min(...scores);
        const maxDegree = Math.max(...scores);
        const MIN_NODE_SIZE = 3;
        const MAX_NODE_SIZE = 30;
        graph.forEachNode((node) =>
            graph.setNodeAttribute(
                node,
                "size",
                5,
            ),
        );

        return () => graph.clear();
    }, [graph, dataset]);

    /**
     * Apply filters to graphology:
     */
    useEffect(() => {
        const {clusters} = filters;
        graph.forEachNode((node, {cluster, tag}) =>
            graph.setNodeAttribute(node, "hidden", !clusters[cluster]),
        );
    }, [graph, filters]);

    return <>{children}</>;
};

export default GraphDataController;
