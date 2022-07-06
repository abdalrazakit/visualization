import { useRegisterEvents, useSigma } from "react-sigma-v2";
import { FC, useEffect } from "react";
import React from "react";
import {DataBase,Item} from "../helpers/generateData";
import {Dataset} from "../types";
import ForceSupervisor from "graphology-layout-force/worker";
function getMouseLayer() {
  return document.querySelector(".sigma-mouse");
}


const GraphEventsController: FC<{ dataset: Dataset, setHoveredNode: (node: string | null) => void }> = ({ dataset: Dataset, setHoveredNode, children }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const registerEvents = useRegisterEvents();

  const database= new DataBase();
  let draggedNode: string | null = null;
  let isDragging = false;
  const layout = new ForceSupervisor(graph, { isNodeFixed: (_, attr) => attr.highlighted });
  layout.start();

  /**
   * Initialize here settings that require to know the graph and/or the sigma
   * instance:
   */
  useEffect(() => {
    registerEvents({
      doubleClickNode({node})
      {
        console.log(node)
      },
      rightClickNode (e) {
      if (!isDragging || !draggedNode) return;

      // Get new position of node
     // const pos = sigma.viewportToGraph(e);
        console.log(e)
      // graph.setNodeAttribute(draggedNode, "x", pos.x);
      // graph.setNodeAttribute(draggedNode, "y", pos.y);

      // Prevent sigma to move camera:
      e.preventSigmaDefault();
      // e.original.preventDefault();
      // e.original.stopPropagation();
    }
      ,
      clickNode({ node }) {
        isDragging = true;
        draggedNode = node;
        graph.setNodeAttribute(draggedNode, "highlighted", true);
        console.log(node)
      },
      enterNode({ node }) {
        setHoveredNode(node);
        // TODO: Find a better way to get the DOM mouse layer:
        // const mouseLayer = getMouseLayer();
        // if (mouseLayer) mouseLayer.classList.add("mouse-pointer");
      },
      leaveNode() {
        setHoveredNode(null);
        // TODO: Find a better way to get the DOM mouse layer:
        // const mouseLayer = getMouseLayer();
        // if (mouseLayer) mouseLayer.classList.remove("mouse-pointer");
      },
      mousedown(e)
      {
        if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
      }
    });
  }, []);

  return <>{children}</>;
};

export default GraphEventsController;
