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
                                ...node,
                                ...omit(clusters[node.cluster], "key"),
                                type: "image",
                                image: `http://localhost:3000/images/${clusters[node.cluster].image}`,
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
                var node1 = graph.nodes().find(value => value == edge.start);
                var node2 = graph.nodes().find(value => value == edge.end);
                if (node1 && node2)
                {
                    graph.addEdge(edge.start, edge.end, {size: 2})
                }
            });



            //todo drop edges
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

             const layout1 = new ForceSupervisor(graph, {  // https://graphology.github.io/standard-library/layout-force#settings
                // settings: {
                //     attraction: 0.01,
                //     repulsion: 0.01,
                //=     //gravity: 0.1,
                //   inertia: 1,
                //    // maxMove: 100,
                // }
            });
            //layout1.start();
// Create the spring layout and start it
            const layout = new ForceSupervisor(graph, {
                settings: {
                    attraction: 0.0005,
                    repulsion: 0.01,
                    gravity: 0.00001,
                    inertia: 0.4,
                    maxMove: 200,

                },
                isNodeFixed: (_, attr) => attr.highlighted
            });
            // layout.start();

            const fa2Layout = new FA2Layout(graph, {  // https://graphology.github.io/standard-library/layout-forceatlas2
                settings: {
                    adjustSizes: false,
                    barnesHutOptimize: false,
                    //barnesHutTheta:0.001,
                    //edgeWeightInfluence:10,
                    gravity: 0,
                    linLogMode: true,
                    //outboundAttractionDistribution : true,
                    strongGravityMode: true,
                    slowDown: 10,
                    scalingRatio: 0.01
                },
            });
            // fa2Layout.start();

            // const positions = forceLayout(graph, {
            //     maxIterations: 50,
            //
            // });

// To directly assign the positions to the nodes:
            forceLayout.assign(graph, {
                maxIterations: 100,
            })

            // const layout = new NoverlapLayout(graph, {  // https://graphology.github.io/standard-library/layout-noverlap
            //     settings: {
            //         gridSize: 2000,
            //         margin: 3,
            //         expansion: 3.1,
            //         ratio: 0.01,
            //         speed: 0.1
            //     }
            // });
            // layout.start();


            // const positions = circular(graph, {scale: 100});

// To directly assign the positions to the nodes:
            //circular.assign(graph)

            // const positions = random(graph);

// With options:
            // const positions = random(graph, {rng: customRngFunction});

// To directly assign the positions to the nodes:
            //  random.assign(graph);


            // const circularPositions = circular(graph, { scale: 100 });
            //In other context, it's possible to apply the position directly we : circular.assign(graph, {scale:100})
            // animateNodes(graph, circularPositions, { duration: 2000, easing: "linear" });

        }, [graph, filters]);

        return <>{children}</>;
    };

export default GraphDataController;