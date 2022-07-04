var session
var driver

class Object {
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

    getCreatQuery() {
        return 'CREATE (k:' + this.name.toString() + ' {name: $name, from: $from, end:$end ,component:$comp })'
    }

    getCreatRelationWith(myName, withType, withName, relationName) {
        return ' match (obj1:' + this.name + ' {name:"' + myName + '"})' + 'match (obj2:' + withType + ' {name:"' + withName + '"})' + 'MERGE (obj1)-[:' + relationName + ' {from: $from, end:$end } ]->(obj2)'
    }
    getAllQuery()
    {
        return 'match (obj:' + this.name +'return obj';
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

    async writeQuery(query, par) {
        this.session = this.driver.session();
        await this.session.writeTransaction(async txc => {
            var result = await txc.run(query, par)
        });
    }

    async deleteAllNodesRelations(name)
    {
        let query=' MATCH (root {name:"'+name+'"})-[r1*]->(x)'+
        'FOREACH(r IN r1 | DELETE r)'+
        'DELETE  root, x';
        await this.writeQuery(query,[]);
    }
    async close() {
   //     await this.session.close()
        await this.driver.close()
    }
}

class componentMangment
{
    deleteComponent(database,name)
    {
        database.deleteAllNodesRelations(name);
    }
    getAllComponent()
    {

    }

    deleteRandomComponent(database,count)
    {

    }
}
(async () => {


    var date = new Date(Date.now());

    date.setHours(0, 0, 0, 0);

    let component = new Object("Component", 2, 5);
    let keeper = new Object("Keeper", 2, 5);
    let marketPlace = new Object("Marketplace", 2, 5);
    let exeManager = new Object("ExecutionManager", 2, 5);
    let nodeExecutor = new Object('NodeExecutor', 2, 3)
    let assetManager = new Object('AssetManager', 2, 3)
    let searchEngine = new Object("SearchEngine", 2, 5);
    database = new DataBase();
    // await addCompleteComponent(database,date,
    //     component,keeper,marketPlace,exeManager,nodeExecutor,assetManager,searchEngine)

    date.setDate(d.getDate()+1)
    console.log(date.toDateString())

    component2= new Object('Component',1,2);
    await addCompleteComponent(database,date,component2,keeper, marketPlace,exeManager,nodeExecutor,assetManager,searchEngine);

    await database.deleteComponent()

    await database.close()
    console.log('done')


})();

async function addCompleteComponent(database,date,component,keeper,marketPlace,exeManager,nodeExecutor,assetManager,searchEngine)
{
    for (let i = 0; i < component.count; i++)//5 comp
    {

        compName = component.getNewName();
        database.writeQuery(component.getCreatQuery(), {name: compName, from: date.valueOf(), end: 0,compName});
        for (let k = 0; k < keeper.count; k++)// keepers  for each component
        {
            keeperName = keeper.getNewName();
            await database.writeQuery(keeper.getCreatQuery(), {name: keeperName, from: date.valueOf(), end: 0,compName})
            await database.writeQuery(component.getCreatRelationWith(compName, keeper.name, keeperName, "contains"),
                {from: date.valueOf(), end: 0})
            for (let m = 0; m < marketPlace.count; m++)// market
            {
                marketName = marketPlace.getNewName();
                await database.writeQuery(marketPlace.getCreatQuery(), {name: marketName, from: date.valueOf(), end: 0,compName})
                await database.writeQuery(keeper.getCreatRelationWith(keeperName, marketPlace.name, marketName, "has"), {
                    from: date.valueOf(), end: 0})
                //generate execution manager
                for (let e = 0; e < exeManager.count; e++) {
                    exeManagerName = exeManager.getNewName();
                    await database.writeQuery(exeManager.getCreatQuery(), {
                        name: exeManagerName, from: date.valueOf(), end: 0 ,compName })
                    await database.writeQuery(marketPlace.getCreatRelationWith(marketName, exeManager.name, exeManagerName, "manageBy"), {
                        from: date.valueOf(), end: 0
                    })
                    ////// creat nodeExecutor
                    for (let e = 0; e < nodeExecutor.count; e++) {
                        nodeExecutorName = nodeExecutor.getNewName();
                        await database.writeQuery(nodeExecutor.getCreatQuery(), {
                            name: nodeExecutorName, from: date.valueOf(), end: 0,compName
                        })
                        await database.writeQuery(exeManager.getCreatRelationWith(exeManagerName, nodeExecutor.name, nodeExecutorName, "manages"), {
                            from: date.valueOf(), end: 0
                        })
                        ////// creat assetManager
                        for (let e = 0; e < assetManager.count; e++) {
                            assetManagerName = assetManager.getNewName();
                            await database.writeQuery(assetManager.getCreatQuery(), {
                                name: assetManagerName, from: date.valueOf(), end: 0,compName
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
                sEngName = searchEngine.getNewName();
                await database.writeQuery(searchEngine.getCreatQuery(), {
                    name: sEngName, from: date.valueOf(), end: 0,compName
                })
                await database.writeQuery(keeper.getCreatRelationWith(keeperName, searchEngine.name, sEngName, 'has'), {
                    from: date.valueOf(), end: 0
                })
            }
        }
    }
}
