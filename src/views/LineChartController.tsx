import {useSigma} from "react-sigma-v2";
import {FC, useEffect} from "react";
import {constant, keyBy, mapValues, omit, result, toNumber} from "lodash";
import React from "react";

import {Dataset} from "../types";
import neo4j from "neo4j-driver";
import {useState} from "react"
import {Chart, registerables} from 'chart.js';
import {DataBase} from "../helpers/generateData";

Chart.register(...registerables);

const LineChartController: FC<{  timeLabels: any[], setChartData: (any) => void }> =
    ({timeLabels,setChartData, children}) => {

        const neo4j = require('neo4j-driver')


        const database= new DataBase();


        useEffect(() => {
            var backgroundColor = [

                'rgb(255, 159, 64)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
                'rgb(201, 203, 207)'
            ]
            var items = [ 'MarketPlace', 'AssetManager', 'ExecutionManager', 'Keeper', 'SearchEngine', 'NodeExecutor']
            var datasets = [{}]

            const getData = async () => {

                if (timeLabels == null) return

                for (let item = 0; item < items.length; item++) {
                    var datapoints: any = [];
                    for (let i = 0; i < timeLabels.length; i++) {
                        var time = timeLabels[i];
                        var query = "match (n:" + items[item] + ") where( (n.from<=" + time + ") and (n.end>" + time + " or n.end=0)) return count(n)";

                        const dataForTime = await database.readQuery(query)
                            .then((result) => {
                                datapoints.push(result.records[0]._fields[0]);

                            })
                    }

                    datasets.push({
                        label: items[item],
                        data: datapoints,
                        borderColor: backgroundColor[item],
                        backgroundColor: backgroundColor[item]
                    })


                }
                let times:any[] = []
                for (let i = 0; i < timeLabels.length; i++) {

                    var d = new Date(timeLabels[i])
                    times.push(d.toDateString())
                }
                console.log(times)
                setChartData({
                    labels: times,
                    datasets: datasets
                });
            }
            getData();
        }, [timeLabels]);

        return (<div className="App" style={{overflow: 'auto'}}>
        </div>);
    };

export default LineChartController;

