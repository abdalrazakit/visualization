var session
var driver

export class Item {
    name;
    min;
    max;
    count;
    generated;

    constructor(name, min, max) {
        if (max === undefined)
            this.count = min;
        else {
            this.min = min;
            this.max = max;
            this.count = this.random();
        }
        this.name = name;
        this.generated = 0;
    }

    setGenerated(gene) {
        this.generated = gene;
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
        let name = this.name + this.generated;
        this.generated += 1
        return name;
    }
}

export class DataBase {
    driver;
    session;

    constructor() {
        const neo4j = require('neo4j-driver')
        const uri = 'neo4j+s://001bf928.databases.neo4j.io';
        const user = 'neo4j';
        const password = '0KTmA258EX7WFm7HduJai55xfkfE1XDUHFbQbVzLV2k';
        this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

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
            await this.deleteCompleteComponent(components.records[rand]._fields[0]['properties'].name, date);
        }

    }

    async addCompleteComponent(date, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine) {
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

    async addRandomNodesForAllComponents(date, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfAdd) {

        let components = await this.getAllComponent_withoutDeleted();// NOT DELETED
        let len = components.records.length;
        let count = (numOfAdd === undefined) ? Math.round(Math.random() * (len - 1)) : numOfAdd;
        for (let i = 0; i < count; i++) {
            let rand = Math.round(Math.random() * (len - 1));
            let compName = components.records[rand]._fields[0]['properties'].name

            await this.addNodes(date, compName, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)

        }
    }

    async addNodes(date, compName, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine) {


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

    // async deleteRandomNodesForAllComponents(date, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)
    // {
    //
    //     let components=await this.getAllComponent();// NOT DELETED
    //     let len= components.records.length
    //     let count = Math.round(Math.random() * (len - 1));
    //     for(let i=0; i<count;i++) {
    //         let rand = Math.round(Math.random() * (len - 1));
    //         //let compName=components.records[rand]._fields[0]['properties'].name
    //         this.deleteNodes(date)
    //
    //     }
    // }
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

export async function startGenerateLogicaly(numOfDays, numOfAdd, numOfDelete, numOfEdit, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine) {
    var date = new Date(Date.now() - numOfDays);
    numOfDays -= 1;
    date.setHours(0, 0, 0, 0);
    let database = new DataBase();
    await component.setGenerated(await database.getLength_withDeleted(component));
    await keeper.setGenerated(await database.getLength_withDeleted(keeper));
    await marketPlace.setGenerated(await database.getLength_withDeleted(marketPlace));
    await exeManager.setGenerated(await database.getLength_withDeleted(exeManager));
    await nodeExecutor.setGenerated(await database.getLength_withDeleted(nodeExecutor));
    await assetManager.setGenerated(await database.getLength_withDeleted(assetManager));
    await searchEngine.setGenerated(await database.getLength_withDeleted(searchEngine));
    var componentManagment = new ComponentManagment(database, component);
    await componentManagment.addCompleteComponent(date,
        keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)

    for (let i = numOfDays; i--; i >= 0) {
        date.setDate(date.getDate() - i)
        let component2 = new Item('Component', component.min / 2, component.max / 2);
        component2.setGenerated(await database.getLength_withDeleted(component2));
        componentManagment.component = component2;
        await componentManagment.addCompleteComponent(date, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine);
        await componentManagment.deleteRandomComponent(component2.count / 2, date);
        i -= 1;
        if (i < 0) break;
        date.setDate(date.getDate() - i)
        await componentManagment.addRandomNodesForAllComponents(date, component2, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)
        await componentManagment.deleteRandomNodes_NoComponent(date);
    }
}

export async function startGenerate(numOfDays, component, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfAdd, numOfDelete, numOfEdit) {

    var date = new Date(Date.now());

    date.setHours(0, 0, 0, 0);
    date.setDate(1)
    numOfDays -= 1;
    let database = new DataBase();
    await component.setGenerated(await database.getLength_withDeleted(component));
    await keeper.setGenerated(await database.getLength_withDeleted (keeper));
    await marketPlace.setGenerated(await database.getLength_withDeleted(marketPlace));
    await exeManager.setGenerated(await database.getLength_withDeleted(exeManager));
    await nodeExecutor.setGenerated(await database.getLength_withDeleted(nodeExecutor));
    await assetManager.setGenerated(await database.getLength_withDeleted(assetManager));
    await searchEngine.setGenerated(await database.getLength_withDeleted(searchEngine));
    var componentManagment = new ComponentManagment(database, component);
    await componentManagment.addCompleteComponent(date,
        keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)

    for (let i = numOfDays;  i >= 0;i--) {
        date.setDate(date.getDate() +1 )
        let component2 = (numOfAdd === undefined) ? new Item('Component', component.min / 2, component.max / 2) :
            new Item('Component', numOfAdd);


        component2.setGenerated(await database.getLength_withDeleted(component2));
        componentManagment.component = component2;
        await componentManagment.addCompleteComponent(date, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine);
        let del = (numOfDelete === undefined) ? Math.round(component2.count / 2) : numOfDelete
        await componentManagment.deleteRandomComponent(del, date);
        i -= 1;
        if (i < 0) break;
        date.setDate(date.getDate() + 1)
        await componentManagment.addRandomNodesForAllComponents(date, component2, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine, numOfEdit)
        await componentManagment.deleteRandomNodes_NoComponent(date, numOfEdit);
    }
    await database.close()


};


