import {useSigma} from "react-sigma-v2";
import {FC, useEffect} from "react";
import {constant, filter, keyBy, mapValues, omit} from "lodash";
import React from "react";

import {Dataset, EdgeData, FiltersState, NodeData} from "../types";
import neo4j from "neo4j-driver";
import {log} from "util";
import SpringSupervisor from "graphology-layout-force/worker";
const GraphDataController: FC<{ dataset: Dataset, filters: FiltersState }> =
    ({dataset, filters, children}) => {

        const sigma = useSigma();
        const graph = sigma.getGraph();

        // const layout = new SpringSupervisor(graph, {});
        // layout.start();

        /**
         * Feed graphology with the new dataset:
         */
        // useEffect(() => {
        //
        //     if (!graph || !dataset) return;
        //
        //     const clusters = keyBy(dataset.clusters, "key");
        //
        //     dataset.nodes.forEach((node) => {
        //         graph.addNode(node.key, {
        //             size: 5,
        //             ...node,
        //             ...omit(clusters[node.cluster], "key"),
        //             image: `localhost:3000/images/${clusters[node.cluster].image}`,
        //         });
        //     });
        //     dataset.edges.forEach((edge: EdgeData) => graph.addEdge(edge.start, edge.end, {size: 1}));
        //
        //
        //     return () => graph.clear();
        // }, [graph, dataset]);

        /**
         * Apply filters to graphology:
         */
        useEffect(() => {

            const {clusters} = filters;
            if (!dataset) return;
            dataset.nodes.forEach((node: NodeData) => {
                if (clusters[node.cluster])//show
                {
                    console.log("nodeCluser" + node.cluster)
                    if (!graph.nodes().find(value => value == node.key))//if its not on the graph.. add
                    {
                        const clusters = keyBy(dataset.clusters, "key");

                        // console.log("notfound")
                        graph.addNode(node.key,
                            {


                                ...omit(clusters[node.cluster], "key"),
                                ...node,
                            });
                    }

                    //   console.log("found")
                } else //hide
                {
                    console.log("hidding")
                    if (graph.nodes().find(value => value == node.key))//if its found on the graph.. delet
                        graph.dropNode(node.key);
                    //console.log("mustdetel")
                }
            })
            dataset.edges.forEach((edge: EdgeData) => {
                if (graph.nodes().find(value => value == edge.start) && graph.nodes().find(value => value == edge.end))
                    graph.addEdge(edge.start, edge.end, {size: 1})
            });//todo drop edges
            // graph.forEachNode((node, {cluster}) =>
            // {
            //     if
            //     console.log(cluster)
            //     graph.setNodeAttribute(node, "hidden", !clusters[cluster])}
            // );
            // graph.forEachNode((node, attributes) => {
            //     //node: id & att: object
            //     console.log("node"+node,"att"+ attributes);
            // });
            // console.log("clusters:"+clusters);

        }, [graph, filters]);

        return <>{children}</>;
    };

export default GraphDataController;