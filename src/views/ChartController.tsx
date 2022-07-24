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


const ChartController: FC<{  timeLabels: any[], setChartData: (any) => void }> =
    ({timeLabels, setChartData, children}) => {

         var database= new DataBase();
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
                    const dataForTime = await database.readQuery(
                        "match (node) where node.end=" + time + " return {label:'delete', count: count(node)} as info UNION ALL " +
                        "match (node) where node.from=" + time + " return {label:'add', count: count(node)} as info")
                        .then((result) => {
                             datapointsDELETE.push(result.records[0]._fields[0]['count'] * -1);
                            datapointsADD.push(result.records[1]._fields[0]['count']);
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
                setChartData({
                    labels: timeLabels,
                    datasets: datasets
                });

                await database.close();
            }
            getData();
        }, [timeLabels]);

        return (<div className="App" style={{overflow: 'auto'}}>
        </div>);
    };

export default ChartController;

