import {useRegisterEvents, useSigma} from "react-sigma-v2";
import {FC, useEffect} from "react";
import React from "react";
import {Dataset} from "../types";

const GraphEventsController: FC<{
    dataset: Dataset, selectedDate: number, setHoveredNode: (node: string | null) => void,
    setSelectedNode: (node: string | null) => void, setSelectedEdge: (edge: string | null) => void
}> =
    ({
         dataset,
         setHoveredNode,
         setSelectedNode,
         setSelectedEdge,
         selectedDate,
         children
     }) => {
        const sigma = useSigma();
        const graph = sigma.getGraph();
        const registerEvents = useRegisterEvents();

        let draggedNode: string | null = null;
        let selectedNode: string | null = null;
        let selectedEdge: string | null = null;

        let isDragging = false;

        function makeSelectedNodeNull() {
            if (!selectedNode) return
            graph.setNodeAttribute(selectedNode, "highlighted", false);
            selectedNode = null;
            setSelectedNode(null)
        }

        function makeSelectedEdgeNull() {
            if(!selectedEdge) return
            graph.setEdgeAttribute(selectedEdge, "size", 1);
            selectedEdge = null;
            setSelectedEdge(null)
        }

        /**
         * Initialize here settings that require to know the graph and/or the sigma
         * instance:
         */
        useEffect(() => {

            registerEvents({
                doubleClick(e){
                    e.preventSigmaDefault();

                    e.original.preventDefault();
                    e.original.stopPropagation();
                },
                doubleClickNode({node}) { // create copy of node
                    graph.setNodeAttribute(node, "highlighted", true);
                    selectedNode = node;
                    setSelectedNode(node)
                    makeSelectedEdgeNull();
                },
                doubleClickEdge({edge}) {
                    console.log(graph.getEdgeAttributes(edge).key)
                    graph.setEdgeAttribute(edge, "size", 2);
                    setSelectedEdge(edge)
                    makeSelectedNodeNull();
                }
                ,
                clickNode(e){
                    makeSelectedNodeNull();
                    makeSelectedEdgeNull();
                },
                clickEdge(e){
                    makeSelectedNodeNull();
                    makeSelectedEdgeNull();
                },
                enterNode({node}) {
                    setHoveredNode(node);
                },
                leaveNode() {
                    setHoveredNode(null);
                },

                downNode(e) {
                    console.log("downNode")

                    isDragging = true;
                    draggedNode = e.node;
                    graph.setNodeAttribute(draggedNode, "highlighted", true);
                },
                mousemove(e) {
                    if (!isDragging || !draggedNode) return;

                    const pos = sigma.viewportToGraph(e);

                    graph.setNodeAttribute(draggedNode, "x", pos.x);
                    graph.setNodeAttribute(draggedNode, "y", pos.y);

                    // Prevent sigma to move camera:
                    e.preventSigmaDefault();
                    e.original.preventDefault();
                    e.original.stopPropagation();
                },
                mouseup(e) {
                    if (draggedNode) {
                        graph.removeNodeAttribute(draggedNode, "highlighted");
                    }
                    isDragging = false;
                    draggedNode = null;
                },
                mousedown(e) {
                    if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
                }
            });
        }, []);

        return <>{children}</>;
    };

export default GraphEventsController;
