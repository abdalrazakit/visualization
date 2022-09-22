import {v4 as uuidv4} from 'uuid';
import {driver} from "neo4j-driver";
import {result} from "lodash";

const deb=false;
const pName= { //the parent type for each node
    'Keeper': null,
    'Marketplace': 'Keeper',
    'AssetManager':'Marketplace',
    'ExecutionManager':'Marketplace',
    'SearchEngine':'Keeper',
    'NodeExecutor':'Marketplace'
}
const chName= { //the child possible types for each node
    'Keeper': ['Marketplace','SearchEngine'],
    'Marketplace': ['ExecutionManager','NodeExecutor','AssetManager'],
    'AssetManager':[null],
    'ExecutionManager':[null],
    'SearchEngine':[null],
    'NodeExecutor':[null]
}
const relationName=
    {
        'Keeper->Marketplace': 'has',
        'Keeper->SearchEngine':'has',
        'Marketplace->ExecutionManager':'manageBy',
        'Marketplace->NodeExecutor':'manages',
        'Marketplace-AssetManager>':'has'
    }
 export class QueryManger{
    static getCreatRelationById(source, target, relationName) {
        return ' match (obj1) where id(obj1)='+source + ' match (obj2) where id(obj2)='+target + ' MERGE (obj1)-[r:' + relationName + ' {from: $from, end:$end } ]->(obj2) return id(r)'
    }
     static getDeleteRelationById(id) {
         return ' match ()-[r]->() where id(r)='+id + ' set r.end=$end  '
     }
    static getCreatQueryByType(type) {
         return 'CREATE (k:'+ type +
             ' {name:"'+ this.getNewNameByType(type)+'", from: $from, end:$end }) return id(k)'
     }
     static getNewNameByType(type) {
         let name = type + uuidv4();
         return name;
     }
}
export class Item {
    name; //kind of the Item
    min; //Minimum required to generate
    max; //Max required to generate
    count; //The specified number to be generated
    constructor(name, min, max) {
        if (max === undefined)
            this.count = min; //A specific number of generation has been set
        else {
            this.min = min;
            this.max = max;
            this.count = this.random(); // Generate a random number between minimum and maximum
        }
        this.name = name;
    }
    //returns a query to add an item to the Database
    getCreatQuery() {
        return   'CREATE (k:' + this.name.toString() +
                 ' {name: $name, from: $from, end:$end })'
    }
    //create a relation between two items
    getCreatRelationWith(myName, withType, withName, relationName) {
        return ' match (obj1:' + this.name.toString() + ' {name:"' + myName + '"})' //find the first node
                + ' match (obj2:' + withType + ' {name:"' + withName + '"})' //find the second node
                + ' MERGE (obj1)-[:' + relationName + ' {from: $from, end:$end } ]->(obj2)' //creat the relation
    }
    static getCreatRelationWith(typeName, myName, withType, withName, relationName) {
        return ' match (obj1:' + typeName + ' {name:"' + myName + '"})' + 'match (obj2:' + withType + ' {name:"' + withName + '"})' + 'MERGE (obj1)-[:' + relationName + ' {from: $from, end:$end } ]->(obj2)'
    }

    //get all item of this type without deleted items
    getAllQuery_withoutDeleted() {
        return 'match (obj:' + this.name + ') where obj.end=0 return obj';
    }
    //get all item of this type with deleted items
    getAllQuery_withDeleted() {
        return 'match (obj:' + this.name + ')  return obj';
    }

    //generate random number between min & max
    random() {
        var rand = Math.round(Math.random() * (this.max - 1));
        if (rand < this.min) return this.min;
        return rand;
    }
    // get unique name for the item
    getNewName() {
        let name = this.name + uuidv4();
        return name;
    }
}

export class DataBase {
    driver;
    session;
    constructor() {
        const neo4j = require('neo4j-driver')
        const uri = 'bolt://localhost:7687';
        const user = 'neo4j';
        const password = '12345678';
        this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password),
            { disableLosslessIntegers: true })

    }
    //to get node id from database by name
    getNodeIdByName(name) {
        return this.readQuery('match (n) where n.name="'+ name+'" return id(n)').then((result)=>{
            return result.records[0]._fields[0]
        })
    }


    getDriver() {return this.driver}
    //do a write query
    async writeQuery(query, par) {
        this.session = this.driver.session( {database: 'neo4j'});
        let id=null
        if (par === undefined) {
           id= await this.session.writeTransaction(async txc => {

                var result = await txc.run(query)
               return result
            });
        } else {
            id= await this.session.writeTransaction(async txc => {

                var result = await txc.run(query, par)
                return result
            });
        }
        return id
    }
    //do a read query
    async readQuery(query) {
        this.session = this.driver.session( {database: 'neo4j'});
        let result = await this.session.run(query);

        return result;
    }
    //delete a node by name (by setting the end date)
    async deleteNode(name, date) {
        let query = 'match (n {name:"' + name + '"} )-[r1{end:0}]->(a) optional match (b)-[r2{end:0}]-> (n {end:0}) set n.end=' + date.valueOf() + ' ,r1.end=' + date.valueOf() + ',r2.end=' + date.valueOf();
        await this.readQuery(query);

    }
    //delete a node by id (by setting the end date)
    async deleteNodeById(id, date) {
        let query = 'match (n)-[r1]->(a) where (Id(n)='+id+' and (n.end>'+date+' or n.end=0)) optional match (b)-[r2]-> (n ) where (Id(n)='+id+' and (n.end>'+date+' or n.end=0)) set n.end=' + date.valueOf() + ' ,r1.end=' + date.valueOf() + ',r2.end=' + date.valueOf();
        await this.readQuery(query);

    }
    //clear the database (delete all nodes and relations)
    async clear() {
       let deleteNodeQuery =  "CALL apoc.periodic.iterate("+
            "'MATCH ()-[r]->() RETURN id(r) AS id',"+
            "'MATCH ()-[r]->() WHERE id(r)=id DELETE r',"+
            "{batchSize: 5000});"
        await this.writeQuery(deleteNodeQuery);
        let deleteRelationQuery =
        " CALL apoc.periodic.iterate("+
        "    'MATCH (n) RETURN id(n) AS id',"+
            "'MATCH (n) WHERE id(n)=id DELETE n',"+
            "{batchSize: 5000});"

        await this.writeQuery(deleteRelationQuery);
    }
    //close the session
    async close() {
        //     await this.session.close()
        await this.driver.close()
    }
}

export class NodeManagement {
    database;
    constructor(database) {
        this.database = database;
    }
    //get nodes by ID and the type of node, which NOT deleted
    async getAllNodesIdByTypeDate(type,date)
    {
        let query='Match (n:'+type+') where (n.end>'+date.valueOf()+' or n.end=0 ) return Id(n)'
        return this.database.readQuery(query)
    }
    //get the supposed relation type between two nodes
    getRelationType(t1,t2)
    {
        return relationName[t1+'->'+t2];
    }
    //delete random nodes on a specific date and limited num
    async deleteRandomNodesToDataBase(date,numOfDelete)
    {
        if(deb) console.log('start deleting')
        let query='MATCH (n) where'+ //choose a node that has been added already, and hasn't been deleted yet:
            ' (n.from <'+date.valueOf()+' and (n.end=0 or n.end >'+date.valueOf()+' ))\n' +
            //choose number of random nodes that match the previews condition
            'WITH apoc.coll.randomItems(COLLECT(n),'+numOfDelete+') AS nodes\n' +
            //for each node:
            'UNWIND RANGE(0, SIZE(nodes), 1) AS i\n' +
            'WITH nodes[i] AS n\n' +
            //find the relation for this node:
            'match (n1)-[r]->(n2) where id(n)=id(n1) or id(n)=id(n2)\n' +
            //set the end time for the node and its relation (delete it)
            'set n.end='+date.valueOf()+', r.end='+date.valueOf()+'\n' +
            'return COLLECT(n)'
        let result= await this.database.writeQuery(query)
        if(deb) console.log('done deleting')
        if(deb) console.log(result)
    }
    //add random nodes to the database with relationships on a specific date
    async addRandomNodesToDataBase(date,numOfAdd)
    {
        for (let i=0; i<numOfAdd;i++)
        {
            //chose random type for the new node
            let index=Math.floor(Object.keys(chName).length* Math.random())
            let nType=Object.keys(chName)[index]

            //find the right parent type
            let pType=pName[nType];

            //child type
            let chType=null
            if(chName[nType]!=null)
            {
                let i=Math.floor( Object.values(chName[nType]).length * Math.random())
                chType=chName[nType][i]
            }

            //add the new node
            let res= await this.database.writeQuery(QueryManger.getCreatQueryByType(nType),
                {from:date.valueOf(),end:0})
            let nodeId=res.records[0]._fields[0]

            //adding Parent relation
            if(pType!=null) {
                //choose random parent
                let pList= await this.getAllNodesIdByTypeDate(pType,date)
                if(deb) console.log(pList.records)
                if(pList.records.length>0)// there is available parent node
                {
                    let i=Math.floor(pList.records.length* Math.random()) //chose random parent
                    let pNodeId = pList.records[i]._fields[0] //take the id of the parent

                    //adding the relation between the new node and the parent
                    await this.database.writeQuery(QueryManger.getCreatRelationById(pNodeId,nodeId,
                        this.getRelationType(pType,nType)),{from:date.valueOf(),end:0})
                }
            }
            //adding Child relation
            //console.log(chType)
            if(chType!=null) {
                //choose random child
                let pList= await this.getAllNodesIdByTypeDate(chType,date)

                if(pList.records.length>0) {// there is available child nodes
                    let i=Math.floor(pList.records.length* Math.random())//chose random child
                    let pNodeId = pList.records[i]._fields[0]

                    //adding the relation between the new node and the child
                    await this.database.writeQuery(QueryManger.getCreatRelationById(nodeId,pNodeId,
                        this.getRelationType(nType,chType)),{from:date.valueOf(),end:0})

                }
            }
            if(deb)  console.log('node '+ nodeId+' type of'+ nType+' the parent: '+pType+' the child '+chType)
        }
    }
    //add specific nodes (with determined type) to the database with relationships on a specific date
    async addCompleteDayToDataBase(date, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine) {
        if(deb) console.log('addCompleteDayToDataBase')
        for (let k = 0; k < keeper.count; k++)// num of keepers
        {
            let keeperName = keeper.getNewName();
            await this.database.writeQuery(keeper.getCreatQuery(), {
                name: keeperName,
                from: date.valueOf(),
                end: 0,
            })
            for (let m = 0; m < marketPlace.count; m++)// market
            {
                let marketName = marketPlace.getNewName();
                await this.database.writeQuery(marketPlace.getCreatQuery(), {
                    name: marketName,
                    from: date.valueOf(),
                    end: 0,
                })
                //make a relation between the keeper and marketplace
                if(deb) console.log(keeper.getCreatRelationWith(keeperName, marketPlace.name, marketName, "has"))
                await this.database.writeQuery(keeper.getCreatRelationWith(keeperName, marketPlace.name, marketName, "has"),
                    { from: date.valueOf(), end: 0})
                //generate execution manager
                for (let e = 0; e < exeManager.count; e++) {
                    let exeManagerName = exeManager.getNewName();
                    await this.database.writeQuery(exeManager.getCreatQuery(), {
                        name: exeManagerName, from: date.valueOf(), end: 0
                    })
                    await this.database.writeQuery(marketPlace.getCreatRelationWith(marketName, exeManager.name, exeManagerName, "manageBy"), {
                        from: date.valueOf(), end: 0
                    })
                }
                    ////// creat nodeExecutor
                    for (let e = 0; e < nodeExecutor.count; e++) {
                        let nodeExecutorName = nodeExecutor.getNewName();
                        await this.database.writeQuery(nodeExecutor.getCreatQuery(), {
                            name: nodeExecutorName, from: date.valueOf(), end: 0
                        })
                        await this.database.writeQuery(marketPlace.getCreatRelationWith(marketName, nodeExecutor.name, nodeExecutorName, "manages"), {
                            from: date.valueOf(), end: 0
                        })
                    }
                        ////// creat assetManager
                        for (let e = 0; e < assetManager.count; e++) {
                            let assetManagerName = assetManager.getNewName();
                            await this.database.writeQuery(assetManager.getCreatQuery(), {
                                name: assetManagerName, from: date.valueOf(), end: 0
                            })
                            await this.database.writeQuery(marketPlace.getCreatRelationWith(marketName, assetManager.name, assetManagerName, "has"), {
                                from: date.valueOf(), end: 0
                            })

                        }


            }

            for (let s = 0; s < searchEngine.count; s++)
            {
                let sEngName = searchEngine.getNewName();
                await this.database.writeQuery(searchEngine.getCreatQuery(), {
                    name: sEngName, from: date.valueOf(), end: 0
                })
                await this.database.writeQuery(keeper.getCreatRelationWith(keeperName, searchEngine.name, sEngName, 'has'), {
                    from: date.valueOf(), end: 0
                })
            }
        }

    }
    //add specific nodes (with determined type) to a list with relationships on a specific date
    addCompleteDayToList(date, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine) {
        var nodeList = [];
        var relationList = [];
        for (let k = 0; k < keeper.count; k++)// keepers  for each component
        {
            let keeperName = keeper.getNewName();
            nodeList.push(
                {
                    Label: 'Keeper',
                    name: keeperName,
                    from: date.valueOf(),
                    end: 0,
                }
            )
            for (let m = 0; m < marketPlace.count; m++)// market
            {
                let marketName = marketPlace.getNewName();
                nodeList.push(
                    {
                        Label: 'MarketPlace',
                        name: marketName,
                        from: date.valueOf(),
                        end: 0,
                    }
                )
                relationList.push(
                    {
                        source: keeperName,
                        relation: "has",
                        target: marketName,
                        from: date.valueOf(), end: 0
                    }
                )
                //generate execution manager
                for (let e = 0; e < exeManager.count; e++) {
                    let exeManagerName = exeManager.getNewName();
                    nodeList.push(
                        {
                            Label: 'ExecutionManager',
                            name: exeManagerName,
                            from: date.valueOf(),
                            end: 0,
                        }
                    )
                    relationList.push(
                        {
                            source: marketName,
                            relation: "managedBy",
                            target: exeManagerName,
                            from: date.valueOf(), end: 0
                        }
                    )
                }
                    ////// creat nodeExecutor
                    for (let e = 0; e < nodeExecutor.count; e++) {
                        let nodeExecutorName = nodeExecutor.getNewName();
                        nodeList.push(
                            {
                                Label: nodeExecutor.name,
                                name: nodeExecutorName,
                                from: date.valueOf(),
                                end: 0
                            }
                        )
                        relationList.push(
                            {
                                source: marketName,
                                relation: "manages",
                                target: nodeExecutorName,
                                from: date.valueOf(), end: 0
                            }
                        )
                    }
                        ////// creat assetManager
                        for (let e = 0; e < assetManager.count; e++) {
                            let assetManagerName = assetManager.getNewName();
                            nodeList.push(
                                {
                                    Label: assetManager.name,
                                    name: assetManagerName,
                                    from: date.valueOf(),
                                    end: 0,
                                }
                            )
                            relationList.push(
                                {
                                    source: marketName,
                                    relation: "has",
                                    target: assetManagerName,
                                    from: date.valueOf(), end: 0
                                }
                            )
                        }


            }
            for (let s = 0; s < searchEngine.count; s++)
            {
                let sEngName = searchEngine.getNewName();
                nodeList.push(
                    {
                        Label: searchEngine.name,
                        name: sEngName,
                        from: date.valueOf(),
                        end: 0,
                    }
                )
                relationList.push(
                    {
                        source: keeperName,
                        relation: "has",
                        target: sEngName,
                        from: date.valueOf(), end: 0
                    }
                )
            }
        }
    return [nodeList, relationList]

    }
    }

export async function clearDataBase() {
    let database = new DataBase();
    await database.clear();
}

export async function startGenerateToFile(numOfDays, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfAdd, numOfDelete, numOfEdit) {

    var date = new Date(Date.now());
    date.setHours(0, 0, 0, 0);

    var nodeManagement = new NodeManagement();


    var lists = nodeManagement.addCompleteDayToList(date,
        keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)

    var addNodeList = lists[0];
    var addRelationList = lists[1];


    for (let i = numOfDays;  i > 0;i--) {
        date=date.addDays(1)
        lists =  await nodeManagement.addCompleteDayToList(date,keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)
        addNodeList=[...addNodeList,...lists[0]]
        addRelationList=[...addRelationList,...lists[1]]
    }

    return [addNodeList, addRelationList]

};


export async function generateFromFile(Nodefile1,Relfile1) {

    var Nodefile= 'file:///'+ Nodefile1//'https://docs.google.com/spreadsheets/d/'+Nodefile1+'/export?format=csv'
    var Relfile='file:///'+Relfile1 // 'https://docs.google.com/spreadsheets/d/'+Relfile1+'/export?format=csv'

    if(deb) console.log('node:'+Nodefile)
    if(deb) console.log('rel:'+Relfile)
    var query = "load csv with headers from " +
        "'" + Nodefile + "' as row\n" +
        'call apoc.create.node([row.Label],' +
        '{ name:row.name, from:toInteger(row.from),end:toInteger(row.end), component:row.component}) \n' +
        'yield node return count(node)';
    let dataBase = new DataBase();
    if(deb) console.log(query)
    if(deb) console.log('adding nodes...')
    await dataBase.writeQuery(query);

    if(deb) console.log('done adding nodes')
    if(deb) console.log('rel:'+Relfile)
    // query="load csv with headers from "
    //     +"'"+ Relfile + "' as row " +
    //     'match (p {name: row.source}) '+
    //     'match (m {name: row.target}) '+
    //     'CALL apoc.create.relationship(p, row.relation, {from:toInteger(row.from),end:toInteger(row.end)}, m) '+
    //     'YIELD rel '+
    //     'RETURN rel '
    query= "CALL apoc.periodic.iterate(\n" +
            "\"CALL apoc.load.csv('"+ Relfile+"') \n" +
            "        YIELD map AS row RETURN row\", \n" +
            "       \" match (p {name: row.source})\n" +
            "        match (m {name: row.target}) \n" +
            "        CALL apoc.create.relationship(p, row.relation,{from:toInteger(row.from),end:toInteger(row.end)}, m) \n" +
            "        YIELD rel \n" +
            "        RETURN rel\"\n" +
            "        ,{batchSize:1});"


    if(deb) console.log('query '+ query)
    if(deb) console.log('adding relations...')
    await dataBase.writeQuery(query);

    if(deb) if(deb) console.log('done adding relations')
 }

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
export async function startGenerateToDataBase(numOfDays, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfAdd, numOfDelete, numOfEdgeAdded,numOfEdgeDeleted) {

    var date = new Date(Date.now());
    date.setHours(0, 0, 0, 0);
    let database = new DataBase();

    var nodeManagement = new NodeManagement(database);

    await nodeManagement.addCompleteDayToDataBase(date,
        keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)
    if(deb) console.log('added first day')

    for (let i = numOfDays;  i > 0;i--) {
        date=date.addDays(1)
        await nodeManagement.addRandomNodesToDataBase(date,numOfAdd)
         await nodeManagement.deleteRandomNodesToDataBase(date,numOfDelete)
       //
       //  await nodeManagement.addRandomEdgesToDataBase(date,numOfAdd)
       //  await nodeManagement.deleteRandomEdgesToDataBase(date,numOfAdd)

    }
    await database.close()


};