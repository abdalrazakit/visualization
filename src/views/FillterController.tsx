import {useSigma} from "react-sigma-v2";
import {Dispatch, FC, useEffect, useState} from "react";
import {constant, filter, keyBy, mapValues, omit, values} from "lodash";
import React from "react";

import {Dataset, EdgeData, FiltersState, NodeData} from "../types";
import neo4j, {DateTime} from "neo4j-driver";
import {log} from "util";
import {notDeepEqual} from "assert";
import forceAtlas2 from "graphology-layout-forceatlas2";

const FillterController: FC<{ filters: FiltersState}> =
    ({ filters, children}) => {
        const sigma = useSigma();
        const graph = sigma.getGraph();




        useEffect(() => {
            const {clusters} = filters;
            graph.forEachNode((node, {cluster, tag}) =>
                graph.setNodeAttribute(node, "hidden", !clusters[cluster]),
            );
        }, [graph, filters]);

        return <>{children}</>;
    }
;

export default FillterController;

