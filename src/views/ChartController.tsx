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

const ChartController: FC<{ setChartData1: (any) => void, setChartData2: (any) => void, setChartData3: (any) => void }> =
    ({setChartData1, setChartData2, setChartData3, children}) => {

        const [timeLabels, setTimeLabels] = useState<any[] | null>(null);
        const neo4j = require('neo4j-driver')

        const uri = 'neo4j+s://001bf928.databases.neo4j.io';
        const user = 'neo4j';
        const password = '0KTmA258EX7WFm7HduJai55xfkfE1XDUHFbQbVzLV2k';

        const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
        const session = driver.session();

        /// get time lables
        useEffect(() => {
            var driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
            var session = driver.session();
            var fromTime = []
            var endTime = []
            const fillData = async () => {
                fromTime = await driver.session().run('Match (node) with node  order by node.from return collect(DISTINCT node.from) as times')
                    .then((result) => {
                        return result.records[0]._fields[0]
                    });
                 endTime = await driver.session().run('Match (node) with node  order by node.end where not node.end=0 return collect(DISTINCT node.end) as times')
                    .then((result) => {

                        return result.records[0]._fields[0];

                    });
                setTimeLabels(concatArraysUniqueWithSort(fromTime, endTime));
            }
            fillData();

        }, []);

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
                 if (timeLabels == null) return

                for (let item = 0; item < items.length; item++) {
                    var datapoints: any = [];
                    for (let i = 0; i < timeLabels.length; i++) {
                        console.log("timeLabels[item]" + timeLabels[i])
                        var time = timeLabels[i];
                        const dataForTime = await driver.session().run("match (n:" + items[item] + ") where( (n.from<=" + time + ") and (n.end>" + time + " or n.end=0)) return count(n)")
                            .then((result) => {
                                 datapoints.push(result.records[0]._fields[0].toNumber());
                            })
                    }
                    console.log("items[item]" + items[item])

                    datasets.push({
                        label: items[item],
                        data: datapoints,
                        borderColor: backgroundColor[item],
                        backgroundColor: backgroundColor[item]

                    })
                    console.log(datasets)

                }
                console.log("end")

                setChartData1({
                    labels: timeLabels,
                    datasets: datasets
                });


                await session.close();

                await driver.close()
            }
            getData();
        }, [timeLabels]);



        // pie chart
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
                 var datapoints: any = [];
                for (let item = 0; item < items.length; item++) {

                    const dataForTime = await driver.session().run("match (n:" + items[item] + ") where( n.end=0) return count(n)")
                        .then((result) => {
                             datapoints.push(result.records[0]._fields[0].toNumber());
                        })


                }
                 setChartData2({
                    labels: items,
                    datasets:
                        [{
                            data: datapoints,
                            borderColor: backgroundColor,
                            backgroundColor: backgroundColor,
                        }],
                    hoverOffset: 4
                });
                await session.close();
                await driver.close()
            }
            getData();
        }, []);

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

            var datasets = [{}]
            const getData = async () => {
                if (timeLabels == null) return

                var datapointsADD: any = [];
                var datapointsDELETE: any = [];
                for (let i = 0; i < timeLabels.length; i++) {
                    var time = timeLabels[i];
                    const dataForTime = await driver.session().run(
                        "match (node{end:" + time + "}) return {label:'delete', count: count(node)} as info UNION ALL " +
                        "match (node{from:" + time + "}) return {label:'add', count: count(node)} as info")
                        .then((result) => {
                             datapointsDELETE.push(result.records[0]._fields[0]['count'].low * -1);
                            datapointsADD.push(result.records[1]._fields[0]['count'].low);


                        })
                }
                datasets.push({
                    label: ['Deleted'],
                    data: datapointsDELETE,
                    borderColor: backgroundColor[0],
                    backgroundColor: backgroundColor[0]

                })
                datasets.push({
                    label: ['Added'],
                    data: datapointsADD,
                    borderColor: backgroundColor[1],
                    backgroundColor: backgroundColor[1]

                })
                setChartData3({
                    labels: timeLabels,
                    datasets: datasets
                });

                await session.close();

                await driver.close()
            }
            getData();
        }, [timeLabels]);

        return (<div className="App" style={{overflow: 'auto'}}>
        </div>);
    };

export default ChartController;

