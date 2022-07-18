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

// var concatArraysUniqueWithSort = function (thisArray, otherArray) {
//     var newArray = thisArray.concat(otherArray).sort(function (a, b) {
//         return a > b ? 1 : a < b ? -1 : 0;
//     });
//     var newArray2: any = []
//     newArray.forEach((item) => {
//         console.log('item'+ typeof item)
//         if (typeof item != 'object')
//         {
//             newArray2.push(item)
//             console.log('added')
//         }else
//             newArray2.push(item.toNumber())
//     })
//
//     //todo
//     return newArray2.filter(function (item, index) {
//         return newArray2.indexOf(item) === index;
//     });
//
// };

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
                // var addQuery='MATCH (n)\n' +
                //     'WITH n.from AS from ,count(distinct n) AS count\n' +
                //     'RETURN from, count ORDER BY from'
                // const dataForTime = await driver.session().run(addQuery)
                //     .then((result) => {
                //     //    datapointsDELETE.push(result.records[0]._fields[0]['count'].low * -1);
                //         datapointsADD.push(result.records[1]._fields[0]['count'].low);
                //     })
                // var delQuery='MATCH (n) where not n.end = 0 '+
                // 'WITH n.end AS end ,count(distinct n) AS count '+
                // 'RETURN end, count ORDER BY end'
                // const dataForTime2 = await driver.session().run(delQuery)
                //     .then((result) => {
                //         //    datapointsDELETE.push(result.records[0]._fields[0]['count'].low * -1);
                //         result.records.forEach((record)=>{
                //             console.log(record)
                //         })
                //
                //      //   datapointsDELETE.push(result.records[1]._fields[0]['count'].low);
                //     })
                for (let i = 0; i < timeLabels.length; i++) {
                    var time = timeLabels[i];
                    if(time == undefined) continue
                    const dataForTime = await database.readQuery(
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

