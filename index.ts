import Graph from "graphology";
import Sigma from "sigma";
import forceAtlas2 from 'graphology-layout-forceatlas2';

// Retrieve the html document for sigma container
const container = document.getElementById("sigma-container") as HTMLElement;

const graph = new Graph({
    type: "directed", multi: false,
    allowSelfLoops: false
});
debugger
(async () => {
    debugger
    const neo4j = require('neo4j-driver')

    const uri = 'neo4j+s://001bf928.databases.neo4j.io';
    const user = 'neo4j';
    const password = '0KTmA258EX7WFm7HduJai55xfkfE1XDUHFbQbVzLV2k';

    var driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
    var session = driver.session();
    driver.session().run("MATCH (n)-[r]->(m) RETURN n,r,m LIMIT $limit", {limit: 50})
        .then((result) => {
            debugger
            result.records.forEach(record => {
                // for each column
                record.forEach((value, key) => {
                    // if it's a node
                    if (value && value.hasOwnProperty('labels')) {
                        graph.addNode(value.name, {});
                    }
                    // if it's an edge
                    if (value && value.hasOwnProperty('type')) {
                        graph.addEdge(value.from,value.to);
                    }

                });
            })
        })
    session.close();
    await driver.close()
})();
debugger
// Create the sigma
const renderer = new Sigma(graph, container);



