var session
var driver

class Item {
    name;
    min;
    max;
    count;
    generated;

    constructor(name, min, max) {
        this.name = name;
        this.min = min;
        this.max = max;
        this.count = this.random();
        this.generated = 0;
    }

    setGenerated(gene)
    {

        this.generated=gene;
    }
    getCreatQuery() {
        return 'CREATE (k:' + this.name.toString() + ' {name: $name, from: $from, end:$end, component: $component })'
    }

    getCreatRelationWith(myName, withType, withName, relationName) {
        return ' match (obj1:' + this.name.toString() + ' {name:"' + myName + '"})' + 'match (obj2:' + withType + ' {name:"' + withName + '"})' + 'MERGE (obj1)-[:' + relationName + ' {from: $from, end:$end } ]->(obj2)'
    }
    //not deleted
    getAllQuery() {
        console.log('in get all query'+ this.name)
        return 'match (obj:' + this.name + ') where obj.end=0 return obj';
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

class DataBase {
    driver;
    session;

    constructor() {
        const neo4j = require('neo4j-driver')

        const uri = 'neo4j+s://001bf928.databases.neo4j.io';
        const user = 'neo4j';
        const password = '0KTmA258EX7WFm7HduJai55xfkfE1XDUHFbQbVzLV2k';
        this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

    }

    async getLength(obj) {

        let arr = await this.readQuery(obj.getAllQuery());
        return Object.keys(arr).length;

    }

    async writeQuery(query, par) {
        this.session = this.driver.session();
        console.log(query)
        await this.session.writeTransaction(async txc => {

            var result = await txc.run(query, par)
        });
    }

    async readQuery(query) {
        this.session = this.driver.session();
        let result = await this.session.run(query);

        return result;
    }

    async deleteNode(name,date){
        let query='match (n {name:"'+ name+'"} )-[r1{end:0}]->(a) optional match (b)-[r2{end:0}]-> (n) set n.end=$date ,r1.end=$date,r2.end=$date';
        this.readQuery(query);

    }


    async close() {
        //     await this.session.close()
        await this.driver.close()
    }
}

class componentManagment {
    database;
    component;

    constructor(database, component) {
        this.database = database;
        this.component = component;

    }

    async getAllComponent() {
        return await database.readQuery(this.component.getAllQuery());
    }
    async getAllNodesWithoutComponent()
    {
        let query='Match (n) where Not n:Component and n.end=0 return n.name'
        return await  database.readQuery(query)
    }
    async deleteCompleteComponent(name,date) {
        let query='MATCH (node) Where node.component= "'+name+'" set node.end= $date';
        console.log("deleting" +name)
        await this.database.writeQuery(query, { date: date.valueOf() });
    }
    async deleteRandomComponent(count,date) {

        let components=await this.getAllComponent();// NOT DELETED
        let len= components.records.length

        console.log('num of components before delete' + len);
        count= (count>len)?len:count;
        for(let i=0;i<count ; i++) {
            let rand =Math.round( Math.random() * (len -1));
            console.log('rand='+ components.records[rand]._fields[0]['properties'].name)
            await this.deleteCompleteComponent(components.records[rand]._fields[0]['properties'].name,date);
        }

    }

    async addCompleteComponent(date, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine) {
        let component =this.component
        for (let i = 0; i < component.count; i++)//5 comp
        {

            let compName = component.getNewName();
            console.log(compName)
            await this.database.writeQuery(component.getCreatQuery(), {
                name: compName,
                from: date.valueOf(),component: compName,
                end: 0,

            });
            console.log('added ' + compName)
            for (let k = 0; k < keeper.count; k++)// keepers  for each component
            {
                let keeperName = keeper.getNewName();
                console.log(keeperName)
                await this.database.writeQuery(keeper.getCreatQuery(), {
                    name: keeperName,
                    from: date.valueOf(),
                    end: 0,
                    component: compName
                })
                await database.writeQuery(component.getCreatRelationWith(compName, keeper.name, keeperName, "contains"),
                    {from: date.valueOf(), end: 0})
                for (let m = 0; m < marketPlace.count; m++)// market
                {
                    let marketName = marketPlace.getNewName();
                    console.log(marketName);
                    await database.writeQuery(marketPlace.getCreatQuery(), {
                        name: marketName,
                        from: date.valueOf(),
                        end: 0,
                        component: compName
                    })
                    await database.writeQuery(keeper.getCreatRelationWith(keeperName, marketPlace.name, marketName, "has"), {
                        from: date.valueOf(), end: 0
                    })
                    //generate execution manager
                    for (let e = 0; e < exeManager.count; e++) {
                        let exeManagerName = exeManager.getNewName();
                        console.log(exeManagerName)
                        await database.writeQuery(exeManager.getCreatQuery(), {
                            name: exeManagerName, from: date.valueOf(), end: 0, component: compName
                        })
                        await database.writeQuery(marketPlace.getCreatRelationWith(marketName, exeManager.name, exeManagerName, "manageBy"), {
                            from: date.valueOf(), end: 0
                        })
                        ////// creat nodeExecutor
                        for (let e = 0; e < nodeExecutor.count; e++) {
                            let nodeExecutorName = nodeExecutor.getNewName();
                            console.log(nodeExecutorName)
                            await database.writeQuery(nodeExecutor.getCreatQuery(), {
                                name: nodeExecutorName, from: date.valueOf(), end: 0, component: compName
                            })
                            await database.writeQuery(exeManager.getCreatRelationWith(exeManagerName, nodeExecutor.name, nodeExecutorName, "manages"), {
                                from: date.valueOf(), end: 0
                            })
                            ////// creat assetManager
                            for (let e = 0; e < assetManager.count; e++) {
                                let assetManagerName = assetManager.getNewName();
                                console.log(assetManagerName)
                                await database.writeQuery(assetManager.getCreatQuery(), {
                                    name: assetManagerName, from: date.valueOf(), end: 0, component: compName
                                })
                                await database.writeQuery(nodeExecutor.getCreatRelationWith(nodeExecutorName, assetManager.name, assetManagerName, "has"), {
                                    from: date.valueOf(), end: 0
                                })

                            }
                        }
                    }
                }

                for (let s = 0; s < searchEngine.count; s++)// 3
                {
                    let sEngName = searchEngine.getNewName();
                    console.log(sEngName)
                    await database.writeQuery(searchEngine.getCreatQuery(), {
                        name: sEngName, from: date.valueOf(), end: 0, component: compName
                    })
                    await database.writeQuery(keeper.getCreatRelationWith(keeperName, searchEngine.name, sEngName, 'has'), {
                        from: date.valueOf(), end: 0
                    })
                }
            }
        }
    }

    async addRandomNodesForAllComponents(date, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine) {

        let components=await this.getAllComponent();// NOT DELETED
        let len= components.records.length
        let count = Math.round(Math.random() * (len - 1));
        for(let i=0; i<count;i++) {
            let rand = Math.round(Math.random() * (len - 1));
            let compName=components.records[rand]._fields[0]['properties'].name
            this.addNodes(date,compName,keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)

        }
    }
    async addNodes(date, compName, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine) {

                for (let k = 0; k < keeper.count; k++)// keepers  for each component
                {
                    let keeperName = keeper.getNewName();
                    console.log(keeperName)
                    await this.database.writeQuery(keeper.getCreatQuery(), {
                        name: keeperName,
                        from: date.valueOf(),
                        end: 0,
                        component: compName
                    })
                    await database.writeQuery(component.getCreatRelationWith(compName, keeper.name, keeperName, "contains"),
                        {from: date.valueOf(), end: 0})
                    for (let m = 0; m < marketPlace.count; m++)// market
                    {
                        let marketName = marketPlace.getNewName();
                        console.log(marketName);
                        await database.writeQuery(marketPlace.getCreatQuery(), {
                            name: marketName,
                            from: date.valueOf(),
                            end: 0,
                            component: compName
                        })
                        await database.writeQuery(keeper.getCreatRelationWith(keeperName, marketPlace.name, marketName, "has"), {
                            from: date.valueOf(), end: 0
                        })
                        //generate execution manager
                        for (let e = 0; e < exeManager.count; e++) {
                            let exeManagerName = exeManager.getNewName();
                            console.log(exeManagerName)
                            await database.writeQuery(exeManager.getCreatQuery(), {
                                name: exeManagerName, from: date.valueOf(), end: 0, component: compName
                            })
                            await database.writeQuery(marketPlace.getCreatRelationWith(marketName, exeManager.name, exeManagerName, "manageBy"), {
                                from: date.valueOf(), end: 0
                            })
                            ////// creat nodeExecutor
                            for (let e = 0; e < nodeExecutor.count; e++) {
                                let nodeExecutorName = nodeExecutor.getNewName();
                                console.log(nodeExecutorName)
                                await database.writeQuery(nodeExecutor.getCreatQuery(), {
                                    name: nodeExecutorName, from: date.valueOf(), end: 0, component: compName
                                })
                                await database.writeQuery(exeManager.getCreatRelationWith(exeManagerName, nodeExecutor.name, nodeExecutorName, "manages"), {
                                    from: date.valueOf(), end: 0
                                })
                                ////// creat assetManager
                                for (let e = 0; e < assetManager.count; e++) {
                                    let assetManagerName = assetManager.getNewName();
                                    console.log(assetManagerName)
                                    await database.writeQuery(assetManager.getCreatQuery(), {
                                        name: assetManagerName, from: date.valueOf(), end: 0, component: compName
                                    })
                                    await database.writeQuery(nodeExecutor.getCreatRelationWith(nodeExecutorName, assetManager.name, assetManagerName, "has"), {
                                        from: date.valueOf(), end: 0
                                    })

                                }
                            }
                        }
                    }

                    for (let s = 0; s < searchEngine.count; s++)// 3
                    {
                        let sEngName = searchEngine.getNewName();
                        console.log(sEngName)
                        await database.writeQuery(searchEngine.getCreatQuery(), {
                            name: sEngName, from: date.valueOf(), end: 0, component: compName
                        })
                        await database.writeQuery(keeper.getCreatRelationWith(keeperName, searchEngine.name, sEngName, 'has'), {
                            from: date.valueOf(), end: 0
                        })
                    }
                }
            }

    async deleteRandomNodesForAllComponents(date, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)
    {

        let components=await this.getAllComponent();// NOT DELETED
        let len= components.records.length
        let count = Math.round(Math.random() * (len - 1));
        for(let i=0; i<count;i++) {
            let rand = Math.round(Math.random() * (len - 1));
            let compName=components.records[rand]._fields[0]['properties'].name
            this.deleteNodes(date)

        }
    }
    async deleteRandomNodes_NoComponent(date)
    {
        let nodes=await this.getAllNodesWithoutComponent().records;
        let len=nodes.length;
        let countToDelete=Math.random()* (len-1)
        for (let i=0;i<countToDelete;i++)
        {
            let rand=Math.random()* (len-1)
            let name=nodes[rand]._fields[0]['properties'].name
            await database.deleteNode(name,date);
        }

    }

}

(async () => {


    var date = new Date(Date.now());

    date.setHours(0, 0, 0, 0);
    database = new DataBase();
    let component = new Item("Component", 2, 5);
    await component.setGenerated(await database.getLength(component));
    let keeper = new Item("Keeper", 2, 5);
    keeper.setGenerated(await database.getLength(keeper));
    let marketPlace = new Item("Marketplace", 2, 5);
    marketPlace.setGenerated(await database.getLength(marketPlace));
    let exeManager = new Item("ExecutionManager", 2, 5);
    exeManager.setGenerated(await database.getLength(exeManager));
    let nodeExecutor = new Item('NodeExecutor', 2, 3)
    nodeExecutor.setGenerated(await database.getLength(nodeExecutor));
    let assetManager = new Item('AssetManager', 2, 3)
    assetManager.setGenerated(await database.getLength(assetManager));
    let searchEngine = new Item("SearchEngine", 2, 5);
    searchEngine.setGenerated(await database.getLength(searchEngine));
    componentManagment = new componentManagment(database, component);
    await componentManagment.addCompleteComponent(date,
         keeper,marketPlace,exeManager,nodeExecutor,assetManager,searchEngine)

    date.setDate(date.getDate() + 1)


    component2 = new Item('Component', 1, 2);
    component2.setGenerated(await database.getLength(component2));
    componentManagment.component= component2;
    await componentManagment.addCompleteComponent( date, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine);
    console.log('going to delete random')
    await componentManagment.deleteRandomComponent(1,date);


    date.setDate(date.getDate() + 1)
    await componentManagment.addRandomNodesForAllComponents(date, keeper, marketPlace, exeManager, nodeExecutor, assetManager, searchEngine)
    await componentManagment.deleteRandomNodes_NoComponent(date);
    await database.close()
    console.log('done')



})();


