import {v4 as uuidv4} from 'uuid';

export class Item {
    name;
    min;
    max;
    count;


    constructor(name, min, max) {
        if (max === undefined)
            this.count = min;
        else {
            this.min = min;
            this.max = max;
            this.count = this.random();
        }
        this.name = name;

    }


    getCreatQuery() {
        return 'CREATE (k:' + this.name.toString() + ' {name: $name, from: $from, end:$end, component: $component })'
    }

    getCreatRelationWith(myName, withType, withName, relationName) {
        return ' match (obj1:' + this.name.toString() + ' {name:"' + myName + '"})' + 'match (obj2:' + withType + ' {name:"' + withName + '"})' + 'MERGE (obj1)-[:' + relationName + ' {from: $from, end:$end } ]->(obj2)'
    }

    static getCreatRelationWith(typeName, myName, withType, withName, relationName) {
        return ' match (obj1:' + typeName + ' {name:"' + myName + '"})' + 'match (obj2:' + withType + ' {name:"' + withName + '"})' + 'MERGE (obj1)-[:' + relationName + ' {from: $from, end:$end } ]->(obj2)'
    }

    //not deleted
    getAllQuery_withoutDeleted() {
        return 'match (obj:' + this.name + ') where obj.end=0 return obj';
    }

    getAllQuery_withDeleted() {
        return 'match (obj:' + this.name + ')  return obj';
    }

    random() {
        var rand = Math.round(Math.random() * (this.max - 1));
        if (rand < this.min) return this.min;
        return rand;
    }

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
        const uri = 'neo4j+s://58b8eed3.databases.neo4j.io';
        const user = 'neo4j';
        const password = 'rr_XdvvmaTyWRb8k_HMBaP7u0F-WGhBLtXsYQx9GmkM';

        this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password),  { disableLosslessIntegers: true })

    }

    async getLength_withDeleted(obj) {
        let arr = await this.readQuery(obj.getAllQuery_withDeleted());
        return arr.records.length;

    }

    async getLength_withoutDeleted(obj) {

        let arr = await this.readQuery(obj.getAllQuery_withoutDeleted());

        return arr.records.length;

    }

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

    async readQuery(query) {
        this.session = this.driver.session();
        let result = await this.session.run(query);

        return result;
    }

    async deleteNode(name, date) {
        let query = 'match (n {name:"' + name + '"} )-[r1{end:0}]->(a) optional match (b)-[r2{end:0}]-> (n {end:0}) set n.end=' + date.valueOf() + ' ,r1.end=' + date.valueOf() + ',r2.end=' + date.valueOf();
        await this.readQuery(query);

    }

    async clear() {
        let deleteRelationQuery = 'Match ()-[r]->() delete r'
        let deleteNodeQuery = 'Match (a) delete a'
        await this.writeQuery(deleteRelationQuery);
        await this.writeQuery(deleteNodeQuery)
    }


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

    async getAllComponent_withoutDeleted() {
        return await this.database.readQuery(this.component.getAllQuery_withDeleted());
    }

    async getAllNodesWithoutComponent() {
        let query = 'Match (n) where (Not n:Component) and (n.end=0) return n'
        return await this.database.readQuery(query)
    }

    async deleteCompleteComponent(name, date) {
        let query = 'MATCH (node) Where node.component= "' + name + '" set node.end= $date';
        await this.database.writeQuery(query, {date: date.valueOf()});
    }

    async deleteRandomComponent(count, date) {

        let components = await this.getAllComponent_withoutDeleted();// NOT DELETED
        let len = components.records.length

        count = (count > len) ? len : count;
        for (let i = 0; i < count; i++) {
            let rand = Math.round(Math.random() * (len - 1));
            console.log(components.records[rand]._fields[0])
            console.log(components.records[rand]._fields[0]['properties'].name)
            await this.addRandomNodesForAllComponentsToDataBase(components.records[rand]._fields[0]['properties'].name, date);
        }

    }

    async addRandomNodesForAllComponentsToDataBase(date, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfAdd) {

        let components = await this.getAllComponent_withoutDeleted();// NOT DELETED
        let len = components.records.length;

        let count = (numOfAdd === undefined) ? Math.round(Math.random() * (len - 1)) : numOfAdd;

        for (let i = 0; i < count; i++) {
            let rand = Math.round(Math.random() * (len - 1));
            let compName = components.records[rand]._fields[0]['properties'].name

            await this.addNodesToDataBase(date, compName, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)

        }
    }

    async addNodesToDataBase(date, compName, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine) {

        console.log('keeper count='+ keeper.count)
        for (let k = 0; k < keeper.count; k++)// keepers  for each component
        {
            let keeperName = keeper.getNewName();
            await this.database.writeQuery(keeper.getCreatQuery(), {
                name: keeperName,
                from: date.valueOf(),
                end: 0,
                component: compName
            })
            await this.database.writeQuery(component.getCreatRelationWith(compName, keeper.name, keeperName, "contains"),
                {from: date.valueOf(), end: 0})
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

            for (let s = 0; s < searchEngine.count; s++)// 3
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


    async addCompleteComponentToDataBase(date, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine) {
        let component = this.component
        for (let i = 0; i < component.count; i++) {

            let compName = component.getNewName();

            await this.database.writeQuery(component.getCreatQuery(), {
                name: compName,
                from: date.valueOf(), component: compName,
                end: 0,

            });
            for (let k = 0; k < keeper.count; k++)// keepers  for each component
            {
                let keeperName = keeper.getNewName();
                await this.database.writeQuery(keeper.getCreatQuery(), {
                    name: keeperName,
                    from: date.valueOf(),
                    end: 0,
                    component: compName
                })
                await this.database.writeQuery(component.getCreatRelationWith(compName, keeper.name, keeperName, "contains"),
                    {from: date.valueOf(), end: 0})
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

                for (let s = 0; s < searchEngine.count; s++)// 3
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
    }

    addCompleteComponentToList(date, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine) {

        var nodeList = [];
        var relationList = [];
        for (let i = 0; i < component.count; i++) {
            let compName = component.getNewName();
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
                            source_Label: keeper.name,
                            relation: "has",
                            target_Label: marketPlace.name,
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
                                source_Label: marketPlace.name,
                                relation: "managedBy",
                                target_Label: exeManager.name,
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
                                    source_Label: exeManager.name,
                                    relation: "manages",
                                    target_Label: nodeExecutor.name,
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
                                        source_Label: nodeExecutor.name,
                                        relation: "has",
                                        target_Label: assetManager.name,
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
                            source_Label: keeper.name,
                            relation: "has",
                            target_Label: searchEngine.name,
                            target: sEngName,
                            from: date.valueOf(), end: 0
                        }
                    )
                }
            }
        }
        return [nodeList, relationList]
    }

    async addRandomNodesForAllComponentsToList(date, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfAdd) {

        let components = await this.getAllComponent_withoutDeleted();// NOT DELETED
        let len = components.records.length;
        var addedNodes = null;
        var addedRelations = null;
        let count = (numOfAdd === undefined) ? Math.round(Math.random() * (len - 1)) : numOfAdd;
        for (let i = 0; i < count; i++) {
            let rand = Math.round(Math.random() * (len - 1));
            let compName = components.records[rand]._fields[0]['properties'].name
            var lists = this.addCompleteComponent(date, compName, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)
            addedNodes.concat(lists[0]);
            addedRelations.concat(lists[1]);
        }
        return [addedNodes, addedRelations]
    }


    async deleteRandomNodes_NoComponent(date, numOfdelete) {
        let nodes = await this.getAllNodesWithoutComponent();
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
    database.clear();
}

export function startGenerateToFile(numOfDays, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfAdd, numOfDelete, numOfEdit) {

    var date = new Date(Date.now());
    date.setHours(0, 0, 0, 0);
    date.setDate(1)

    numOfDays -= 1;

    let database = new DataBase();

    var componentManagment = new ComponentManagment(database, component);
    var lists = componentManagment.addCompleteComponentToList(date, component,
        keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)

    var addNodeList = lists[0];
    var addRelationList = lists[1];
    console.log('added nodes1:'+ addNodeList.length)
    for (let i = numOfDays; i >= 0; i--) {
        date.setDate(date.getDate() + 1)
        let component2 = (numOfAdd === undefined) ? new Item('Component', component.min / 2, component.max / 2) :
            new Item('Component', numOfAdd);

        componentManagment.component = component2;
       lists = componentManagment.addCompleteComponentToList(date, component2, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine);
        Array.prototype.push.apply(addNodeList,lists[0])
        console.log('added nodes:'+ addNodeList.length)
        Array.prototype.push.apply(addRelationList,lists[1])
        i -= 1;
        if (i < 0) break;
        date.setDate(date.getDate() + 1)
        //await componentManagment.addRandomNodesForAllComponents(date, component2, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfEdit)

    }
    return [addNodeList, addRelationList]

};

export async function startDeleteOnline(numOfDays, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfAdd, numOfDelete, numOfEdit) {

    var date = new Date(Date.now());
    date.setHours(0, 0, 0, 0);
    date.setDate(1)

    numOfDays -= 1;
    let database = new DataBase();
    var componentManagment = new ComponentManagment(database, component);

    for (let i = numOfDays; i >= 0; i--) {
        date.setDate(date.getDate() + 1)

        let del = (numOfDelete === undefined) ? Math.round(component.count / 2) : numOfDelete
        await componentManagment.deleteRandomComponent(del, date);
        i -= 1;
        if (i < 0) break;
        date.setDate(date.getDate() + 1)
        await componentManagment.addRandomNodesForAllComponents(date, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfEdit)
        await componentManagment.deleteRandomNodes_NoComponent(date, numOfEdit);
    }
    await database.close()


};

export async function generateFromFile() {
    var path = 'https://docs.google.com/spreadsheets/d/15UwVT5jCG1nXd2FFyoK2ZJYT2B73gI_xVsSYEyDFJ2k/export?format=csv';

    var query = "load csv with headers from " +
        "'" + path + "' as row\n" +
        'call apoc.create.node([row.Label],' +
        '{ name:row.name, from:row.from,end:row.end, component:row.component}) \n' +
        'yield node return count(node)';
    let dataBase = new DataBase();
    console.log(query)
    console.log('adding nodes...')
    await dataBase.writeQuery(query);
    console.log('done adding nodes')

    query='load csv with headers from \'https://docs.google.com/spreadsheets/d/11LsbRlJUvwVlMT1Btts6xQBVMPeszrzcewwE31arNvA/export?format=csv\' as row\n' +
        'MATCH (p {name: row.source})\n' +
        'MATCH (m\n' +
        ' {name:row.target})\n' +
        'CALL apoc.create.relationship(p, row.relation, {from:row.from,end:row.end}, m)\n' +
        'YIELD rel\n' +
        '\n' +
        'RETURN rel'
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
    await componentManagment.addCompleteComponentToDataBase(date,
        keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)
    console.log('added first day')
    for (let i = numOfDays;  i >= 0;i--) {
        date.setDate(date.getDate() +1 )
        let component2 = (numOfAdd === undefined) ? new Item('Component', component.min / 2, component.max / 2) :
            new Item('Component', numOfAdd);
        componentManagment.component = component2;
        await componentManagment.addCompleteComponentToDataBase(date, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine);
        console.log('added'+i+' day')
        let del = (numOfDelete === undefined) ? Math.round(component2.count / 2) : numOfDelete
        await componentManagment.deleteRandomComponent(del, date);
        console.log('deleted'+i+' day')
        i -= 1;
        if (i < 0) break;
        date.setDate(date.getDate() + 1)
        await componentManagment.addRandomNodesForAllComponentsToDataBase(date, component2, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfEdit)
        console.log('added'+i+' day')
        await componentManagment.deleteRandomNodes_NoComponent(date, numOfEdit);
        console.log('deleted'+i+' day')
    }
    await database.close()


};