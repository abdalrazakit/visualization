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

const PieChartController: FC<{  timeLabels: any[], setChartData: (any) => void }> =
    ({timeLabels,setChartData, children}) => {

        // const neo4j = require('neo4j-driver')
        //
        // const uri = 'neo4j+s://001bf928.databases.neo4j.io';
        // const user = 'neo4j';
        // const password = '0KTmA258EX7WFm7HduJai55xfkfE1XDUHFbQbVzLV2k';
        //
        // const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
        // const session = driver.session();
        const database= new DataBase();

        //pie chart
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
          //  var items = ['Component', 'Marketplace', 'AssetManager', 'ExecutionManager', 'Keeper', 'SearchEngine', 'NodeExecutor']
            var items:any=[];
            var datasets = [{}]
            const getData = async () => {
                 var datapoints: any = [];
                 var query= 'MATCH (n) where n.end=0\n' +
                     'RETURN DISTINCT count(labels(n)), labels(n)'
                const dataForTime = await database.readQuery(query)
                    .then((result) => {
                        console.log(result.records)
                        result.records.forEach((record)=>
                        {
                            datapoints.push(record._fields[0].low)
                            items.push(record._fields[1]);
                            console.log(datapoints)
                            console.log(items)
                        })
                    })

                 setChartData({
                    labels: items,
                    datasets:
                        [{
                            data: datapoints,
                            borderColor: backgroundColor,
                            backgroundColor: backgroundColor,
                        }],
                    hoverOffset: 4
                });
                await database.close()
            }
            getData();
        }, []);



        return (<div className="App" style={{overflow: 'auto'}}>
        </div>);
    };

export default PieChartController;

