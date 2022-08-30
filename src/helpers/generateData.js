import {v4 as uuidv4} from 'uuid';
import {driver} from "neo4j-driver";
import {result} from "lodash";

const deb=true;
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
        return 'CREATE (k:' + this.name.toString() +
            ' {name: $name, from: $from, end:$end, component: $component })'
    }
    //create a relation between two items
    getCreatRelationWith(myName, withType, withName, relationName) {
        return ' match (obj1:' + this.name.toString() + ' {name:"' + myName + '"})' + 'match (obj2:' + withType + ' {name:"' + withName + '"})' + 'MERGE (obj1)-[:' + relationName + ' {from: $from, end:$end } ]->(obj2)'
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
    //to get the component name of a node by id
    async getNodeComponentById(id) {
        var query='match (n) where id(n)='+id+' return n.component'
        return await this.readQuery(query).then
        ((result)=>{
            console.log('1'+result.records[0]._fields[0])
            return result.records[0]._fields[0]});
    }
    getDriver() {return this.driver}
    //do a write query
    async writeQuery(query, par) {
        this.session = this.driver.session();
        if (par === undefined) {
            await this.session.writeTransaction(async txc => {

                var result = await txc.run(query)
            });
        } else {
            await this.session.writeTransaction(async txc => {

                var result = await txc.run(query, par)
            });
        }
    }
    //do a read query
    async readQuery(query) {
        this.session = this.driver.session();
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
        let query = 'match (n {end:0})-[r1{end:0}]->(a) where Id(n)='+id+' optional match (b)-[r2{end:0}]-> (n {end:0}) where id(n)='+id+' set n.end=' + date.valueOf() + ' ,r1.end=' + date.valueOf() + ',r2.end=' + date.valueOf();
        await this.readQuery(query);

    }
    //clear the database (delete all nodes and relations)
    async clear() {
        // let deleteRelationQuery ="CALL apoc.periodic.iterate( 'MATCH (n) RETURN id(n) AS id',"+
        //     "'MATCH (n)  DELETE n' ,"+
        //     "{batchSize: 5000})" //'Match ()-[r]->() delete r

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

export class ComponentManagment {
    database;
    component;
    constructor(database, component) {
        this.database = database;
        this.component = component;

    }
    //get all components in the database
    async getAllComponent_withoutDeleted() {

        return await this.database.readQuery(this.component.getAllQuery_withDeleted());
    }
    ///todo test
    async getAllComponentName() {
        var query='match (n) return distinct n.component'
        return await this.database.readQuery(query);
    }
    //get all nodes without component nodes (which NOT DELETED)
    ///todo test getAllNodesWithoutComponent
    async getAllNodesWithoutDeletedNodes() {
        //let query = 'Match (n) where (Not n:Component) and (n.end=0) return n'
        let query = 'Match (n) where (n.end=0) return n'
        return await this.database.readQuery(query)
    }
    //delete the complete component and its nodes
    async deleteCompleteComponent(name, date) {
        let query = 'MATCH (node) Where node.component= "' + name + '" set node.end= $date';
        await this.database.writeQuery(query, {date: date.valueOf()});
    }
    //delete a complete random component with its nodes
    async deleteRandomComponent(count, date) {
        console.log('deleteRandomComponent(count, date)')
        let components = await this.getAllComponentName()//getAllComponent_withoutDeleted();// NOT DELETED
        let len = components.records.length

        count = (count > len) ? len : count;
        for (let i = 0; i < count; i++) {
            let rand = Math.round(Math.random() * (len - 1));
            console.log('deleteing component '+components.records[rand]._fields[0])
            var componentName= components.records[rand]._fields[0]
            await this.deleteCompleteComponent(componentName, date);
        }

    }
    //for all valid components, add new random nodes
    async addRandomNodesForAllComponentsToDataBase(date, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfAdd) {
        console.log('addRandomNodesForAllComponentsToDataBase')
        let components = await this.getAllComponentName()// getAllComponent_withoutDeleted();// NOT DELETED
        let len = components.records.length;

        let count = (numOfAdd === undefined) ? Math.round(Math.random() * (len - 1)) : numOfAdd;

        for (let i = 0; i < count; i++) {
            let rand = Math.round(Math.random() * (len - 1));
            let compName = components.records[rand]._fields[0]//['properties'].name

            await this.addNodesByCompNameToDataBase(date, compName, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)

        }
    }
    //add random nodes by component name
    async addNodesByCompNameToDataBase(date, compName, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine) {

         for (let k = 0; k < keeper.count; k++)// keepers  for each component
        {
            let keeperName = keeper.getNewName();
            await this.database.writeQuery(keeper.getCreatQuery(), {
                name: keeperName,
                from: date.valueOf(),
                end: 0,
                component: compName
            })
            //no relation between component and keeper
            // await this.database.writeQuery(component.getCreatRelationWith(compName, keeper.name, keeperName, "contains"),
            //     {from: date.valueOf(), end: 0})
            for (let m = 0; m < marketPlace.count; m++)// market
            {
                let marketName = marketPlace.getNewName();
                await this.database.writeQuery(marketPlace.getCreatQuery(), {
                    name: marketName,
                    from: date.valueOf(),
                    end: 0,
                    component: compName
                })
                await this.database.writeQuery(keeper.getCreatRelationWith(keeperName, marketPlace.name, marketName, "has"), {
                    from: date.valueOf(), end: 0
                })
                //generate execution manager
                for (let e = 0; e < exeManager.count; e++) {
                    let exeManagerName = exeManager.getNewName();
                    await this.database.writeQuery(exeManager.getCreatQuery(), {
                        name: exeManagerName, from: date.valueOf(), end: 0, component: compName
                    })
                    await this.database.writeQuery(marketPlace.getCreatRelationWith(marketName, exeManager.name, exeManagerName, "manageBy"), {
                        from: date.valueOf(), end: 0
                    })
                    ////// creat nodeExecutor
                    for (let e = 0; e < nodeExecutor.count; e++) {
                        let nodeExecutorName = nodeExecutor.getNewName();
                        await this.database.writeQuery(nodeExecutor.getCreatQuery(), {
                            name: nodeExecutorName, from: date.valueOf(), end: 0, component: compName
                        })
                        await this.database.writeQuery(exeManager.getCreatRelationWith(exeManagerName, nodeExecutor.name, nodeExecutorName, "manages"), {
                            from: date.valueOf(), end: 0
                        })
                        ////// creat assetManager
                        for (let e = 0; e < assetManager.count; e++) {
                            let assetManagerName = assetManager.getNewName();
                            await this.database.writeQuery(assetManager.getCreatQuery(), {
                                name: assetManagerName, from: date.valueOf(), end: 0, component: compName
                            })
                            await this.database.writeQuery(nodeExecutor.getCreatRelationWith(nodeExecutorName, assetManager.name, assetManagerName, "has"), {
                                from: date.valueOf(), end: 0
                            })

                        }
                    }
                }
            }

            for (let s = 0; s < searchEngine.count; s++)
            {
                let sEngName = searchEngine.getNewName();
                await this.database.writeQuery(searchEngine.getCreatQuery(), {
                    name: sEngName, from: date.valueOf(), end: 0, component: compName
                })
                await this.database.writeQuery(keeper.getCreatRelationWith(keeperName, searchEngine.name, sEngName, 'has'), {
                    from: date.valueOf(), end: 0
                })
            }
        }
    }
    //add num of complete components to the database
    async addCompleteComponentsToDataBase(date, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine) {
        if(deb) console.log('addCompleteComponentsToDataBase')
        let component = this.component
        for (let i = 0; i < component.count; i++) {
            let compName = component.getNewName();
            await this.addNodesByCompNameToDataBase(date, compName, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)
        }
    }
     addNodesByCompNameToList(date, compName, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine) {
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
                    component: compName
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
                        component: compName
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
                            component: compName
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

                    ////// creat nodeExecutor
                    for (let e = 0; e < nodeExecutor.count; e++) {
                        let nodeExecutorName = nodeExecutor.getNewName();


                        nodeList.push(
                            {
                                Label: nodeExecutor.name,
                                name: nodeExecutorName,
                                from: date.valueOf(),
                                end: 0,
                                component: compName
                            }
                        )
                        relationList.push(
                            {
                                source: exeManagerName,

                                relation: "manages",

                                target: nodeExecutorName,
                                from: date.valueOf(), end: 0
                            }
                        )
                        ////// creat assetManager
                        for (let e = 0; e < assetManager.count; e++) {
                            let assetManagerName = assetManager.getNewName();
                            nodeList.push(
                                {
                                    Label: assetManager.name,
                                    name: assetManagerName,
                                    from: date.valueOf(),
                                    end: 0,
                                    component: compName
                                }
                            )
                            relationList.push(
                                {
                                    source: nodeExecutorName,

                                    relation: "has",

                                    target: assetManagerName,
                                    from: date.valueOf(), end: 0
                                }
                            )
                        }
                    }
                }
            }

            for (let s = 0; s < searchEngine.count; s++)// 3
            {
                let sEngName = searchEngine.getNewName();
                nodeList.push(
                    {
                        Label: searchEngine.name,
                        name: sEngName,
                        from: date.valueOf(),
                        end: 0,
                        component: compName
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
    //add complete components to the csv file (to list)
    addCompleteComponentsToList(date, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine) {
        if (deb) console.log('addCompleteComponentsToList')
        let nodeList =[];
        var relationList = [];
        for (let i = 0; i < component.count; i++) {
            let compName = component.getNewName();
            let lists= this.addNodesByCompNameToList(date, compName, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)

            nodeList=[...nodeList,...lists[0]]
            relationList=[...relationList,...lists[1]];

        }
        return [nodeList, relationList]
    }
    //for all valid components, add new random nodes (to list, csv file)
    async addRandomNodesForAllComponentsToList(date, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfAdd) {
        if(deb) console.log('addRandomNodesForAllComponentsToList')
        let components = await this.getAllComponentName()//.getAllComponent_withoutDeleted();// NOT DELETED
        let len = components.records.length;
        var addedNodes = [];
        var addedRelations = [];
        let count = (numOfAdd === undefined) ? Math.round(Math.random() * (len - 1)) : numOfAdd;
        for (let i = 0; i < count; i++) {
            let rand = Math.round(Math.random() * (len - 1));
            let compName = components.records[rand]._fields[0]//['properties'].name
            var lists = this. addCompleteComponentsToList(date, compName, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)

            addedNodes=[...addedNodes,...lists[0]];
            addedRelations=[...addedRelations,...lists[1]];
        }

        return  [addedNodes, addedRelations]
    }
    // delete random nodes (NOT by component name)
    async deleteRandomNodes_NoComponent(date, numOfdelete) {
        let nodes = await this.getAllNodesWithoutDeletedNodes();
        let len = nodes.records.length;
        let countToDelete = (numOfdelete === undefined) ?
            Math.random() * (len - 1) :
            numOfdelete;
        for (let i = 0; i < countToDelete; i++) {
            let rand = Math.round(Math.random() * (len - 1))
            let name = nodes.records[rand]._fields[0]['properties'].name
            await this.database.deleteNode(name, date);
        }

    }

}

export async function clearDataBase() {
    let database = new DataBase();
    await database.clear();
}

export async function startGenerateToFile(numOfDays, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfAdd, numOfDelete, numOfEdit) {

    var date = new Date(Date.now());
    date.setHours(0, 0, 0, 0);
    date.setDate(1)

    numOfDays -= 1;

    let database = new DataBase();

    var componentManagment = new ComponentManagment(database, component);
    var lists = componentManagment.addCompleteComponentsToList(date, component,
        keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)

    var addNodeList = lists[0];
    var addRelationList = lists[1];
    console.log('added nodes1:'+ addNodeList.length)
    for (let i = numOfDays; i >= 0; i--) {
        date.setDate(date.getDate() + 1)
        let component2 = (numOfAdd === undefined) ? new Item('Component', component.min / 2, component.max / 2) :
            new Item('Component', numOfAdd);

        componentManagment.component = component2;
       lists = componentManagment.addCompleteComponentsToList(date, component2, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine);
        //Array.prototype.push.apply(addNodeList,lists[0])

        addNodeList=[...addNodeList,...lists[0]]
        console.log('added nodes:'+ addNodeList.length)
        //Array.prototype.push.apply(addRelationList,lists[1])
        addRelationList=[...addRelationList,...lists[1]]
        i -= 1;
        if (i < 0) break;
        date.setDate(date.getDate() + 1)
        lists =await componentManagment.addRandomNodesForAllComponentsToList(date, component2, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfEdit)

        //Array.prototype.push.apply(addNodeList,lists[0])
        addNodeList=[...addNodeList,...lists[0]]
        console.log('added nodes:'+ addNodeList.length)
        addRelationList=[...addRelationList,...lists[1]]
        //Array.prototype.push.apply(addRelationList,lists[1])
    }

    return [addNodeList, addRelationList]

};
//
// export async function startDeleteOnline(numOfDays, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfAdd, numOfDelete, numOfEdit) {
//
//     var date = new Date(Date.now());
//     date.setHours(0, 0, 0, 0);
//     date.setDate(1)
//
//     numOfDays -= 1;
//     let database = new DataBase();
//     var componentManagment = new ComponentManagment(database, component);
//
//     for (let i = numOfDays; i >= 0; i--) {
//         date.setDate(date.getDate() + 1)
//
//         let del = (numOfDelete === undefined) ? Math.round(component.count / 2) : numOfDelete
//         console.log('try deleteing')
//         await componentManagment.deleteRandomComponent(del, date);
//         i -= 1;
//         if (i < 0) break;
//         date.setDate(date.getDate() + 1)
//         await componentManagment.addRandomNodesForAllComponentsToList(date, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfEdit)
//         await componentManagment.deleteRandomNodes_NoComponent(date, numOfEdit);
//     }
//     await database.close()
//
//
// };

export async function generateFromFile(Nodefile1,Relfile1) {

    var Nodefile= 'file:///'+ Nodefile1//'https://docs.google.com/spreadsheets/d/'+Nodefile1+'/export?format=csv'
    var Relfile='file:///'+Relfile1 // 'https://docs.google.com/spreadsheets/d/'+Relfile1+'/export?format=csv'

    console.log('node:'+Nodefile)
    console.log('rel:'+Relfile)
    var query = "load csv with headers from " +
        "'" + Nodefile + "' as row\n" +
        'call apoc.create.node([row.Label],' +
        '{ name:row.name, from:toInteger(row.from),end:toInteger(row.end), component:row.component}) \n' +
        'yield node return count(node)';
    let dataBase = new DataBase();
    console.log(query)
    console.log('adding nodes...')
    await dataBase.writeQuery(query);

    console.log('done adding nodes')
    console.log('rel:'+Relfile)
    query="load csv with headers from "
        +"'"+ Relfile + "' as row " +
        'match (p {name: row.source}) '+
        'match (m {name: row.target}) '+
        'CALL apoc.create.relationship(p, row.relation, {from:toInteger(row.from),end:toInteger(row.end)}, m) '+
        'YIELD rel '+
        'RETURN rel '



    console.log('query '+ query)
    console.log('adding relations...')
    await dataBase.writeQuery(query);

    console.log('done adding relations')
 }


export async function startGenerateToDataBase(numOfDays, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfAdd, numOfDelete, numOfEdit) {

    var date = new Date(Date.now());
    date.setHours(0, 0, 0, 0);
    date.setDate(1)
    numOfDays -= 1;
    let database = new DataBase();
    var componentManagment = new ComponentManagment(database, component);
    await componentManagment.addCompleteComponentsToDataBase(date,
        keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)
    console.log('added first day')
    for (let i = numOfDays;  i >= 0;i--) {
        date.setDate(date.getDate() +1 )
        let component2 = (numOfAdd === undefined) ? new Item('Component', component.min / 2, component.max / 2) :
            new Item('Component', numOfAdd);
        componentManagment.component = component2;
        await componentManagment.addCompleteComponentsToDataBase(date, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine);
       // console.log('added'+i-numOfDays+1+' day')
        let del = (numOfDelete === undefined) ? Math.round(component2.count / 2) : numOfDelete
        await componentManagment.deleteRandomComponent(del, date);

        i -= 1;
        if (i < 0) break;
        date.setDate(date.getDate() + 1)
        await componentManagment.addRandomNodesForAllComponentsToDataBase(date, component2, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfEdit)
       // console.log('added'+i-numOfDays+1+' day')
        await componentManagment.deleteRandomNodes_NoComponent(date, numOfEdit);
      //  console.log('deleted'+i-numOfDays+1+' day')
    }
    await database.close()


};