import {useSigma} from "react-sigma-v2";
import {FC, useEffect} from "react";
import {constant, keyBy, mapValues, omit, result, toNumber} from "lodash";
import React from "react";

import {Dataset} from "../types";
import neo4j from "neo4j-driver";
import {useState} from "react"
import {Chart, registerables} from 'chart.js';

Chart.register(...registerables);

var concatArraysUniqueWithSort = function (thisArray, otherArray) {
    var newArray = thisArray.concat(otherArray).sort(function (a, b) {
        return a > b ? 1 : a < b ? -1 : 0;
    });
    var newArray2: any = []
    newArray.forEach((item) => {
        if (typeof item != 'object')
            newArray2.push(item)
    })

    //todo
    return newArray2.filter(function (item, index) {
        return newArray2.indexOf(item) === index;
    });

};

const ChartController: FC<{ setChartData: (any) => void }> =
    ({setChartData, children}) => {

        const [timeLabels, setTimeLabels] = useState<any[] | null>(null);
        const neo4j = require('neo4j-driver')

        const uri = 'neo4j+s://001bf928.databases.neo4j.io';
        const user = 'neo4j';
        const password = '0KTmA258EX7WFm7HduJai55xfkfE1XDUHFbQbVzLV2k';
        const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
        const session = driver.session();

        // async function getDataForTime(time) {
        //
        //     const times = await driver.session().run("match (n) where( (n.from<=" + time + ") and (n.end>" + time + " or n.end=0)) return count(n)")
        //
        //     return times//.records[0]._fields[0].toNumber();
        // }
        //
        // useEffect(() => {
        //     var backgroundColor=  [
        //         'rgb(255, 99, 132)',
        //         'rgb(255, 159, 64)',
        //         'rgb(255, 205, 86)',
        //         'rgb(75, 192, 192)',
        //         'rgb(54, 162, 235)',
        //         'rgb(153, 102, 255)',
        //         'rgb(201, 203, 207)'
        //     ]
        //     var items = ['Component', 'Marketplace', 'AssetManager', 'ExecutionManager', 'Keeper', 'SearchEngine', 'NodeExecutor']
        //     var datasets = [{}]
        //     const getData = async () => {
        //         if (timeLabels == null) return
        //         for (let item = 0; item < items.length; item++) {
        //             var datapoints: any = [];
        //             for (let i = 0; i < timeLabels.length; i++) {
        //                 var time = timeLabels[i];
        //                 const dataForTime = await driver.session().run("match (n:"+ items[item]+") where( (n.from<=" + time + ") and (n.end>" + time + " or n.end=0)) return count(n)")
        //                     .then((result) => {
        //                         console.log('result' + result.records[0]._fields[0].toNumber())
        //                         datapoints.push(result.records[0]._fields[0].toNumber());
        //
        //
        //                     })
        //             }
        //             datasets.push({
        //                 label: items[item],
        //                 data: datapoints,
        //                 borderColor:backgroundColor[item],
        //                 backgroundColor:backgroundColor[item]
        //
        //             })
        //         }
        //         setChartData({
        //             labels: timeLabels,
        //             datasets: datasets
        //         });
        //
        //
        //         await session.close();
        //
        //         await driver.close()
        //     }
        //     getData();
        // }, [timeLabels]);
        //
        //     useEffect(() => {
        //         var driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
        //         var session = driver.session();
        //         var fromTime = []
        //         var endTime = []
        //         const fillData = async () => {
        //             fromTime = await driver.session().run('Match (node) with node  order by node.from return collect(DISTINCT node.from) as times')
        //                 .then((result) => {
        //                     return result.records[0]._fields[0]
        //                 });
        //             console.log(fromTime)
        //             endTime = await driver.session().run('Match (node) with node  order by node.end where not node.end=0 return collect(DISTINCT node.end) as times')
        //                 .then((result) => {
        //
        //                     return result.records[0]._fields[0];
        //
        //                 });
        //             setTimeLabels(concatArraysUniqueWithSort(fromTime, endTime));
        //         }
        //         fillData();
        //
        //     }, []);

        async function getDataForTime(time) {

            const times = await driver.session().run("match (n) where( (n.from<=" + time + ") and (n.end>" + time + " or n.end=0)) return count(n)")
            return times//.records[0]._fields[0].toNumber();
        }

        useEffect(() => {

            var backgroundColor = [
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
                'rgb(201, 203, 207)'
            ]
            var items = ['Component', 'Marketplace', 'AssetManager', 'ExecutionManager', 'Keeper', 'SearchEngine', 'NodeExecutor']
            var datasets = [{}]
            const getData = async () => {
                console.log('kjfs')
                var datapoints: any = [];
                for (let item = 0; item < items.length; item++) {

                    const dataForTime = await driver.session().run("match (n:" + items[item] + ") where( n.end=0) return count(n)")
                        .then((result) => {
                            console.log('result' + result.records[0]._fields[0].toNumber())
                            datapoints.push(result.records[0]._fields[0].toNumber());
                        })


                }
                console.log(datapoints)
                setChartData({
                    labels: items,
                    datasets:
                        [{
                            data:datapoints,
                            borderColor: backgroundColor,
                            backgroundColor: backgroundColor,
                        }],
                    hoverOffset: 100
                });
                await session.close();
                await driver.close()
            }
            getData();
        },[]);
        return (<div className="App" style={{overflow: 'auto'}}>
        </div>);
    };

export default ChartController;

