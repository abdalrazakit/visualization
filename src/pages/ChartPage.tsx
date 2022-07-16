import React from 'react';
import { useState, useEffect } from "react"
import ChartController from "../views/ChartController"
import {  Chart } from "react-chartjs-2";


function ChartPage() {
    const [chartData, setChartData] = useState({
        datasets: [{
            data: [],
        }],
            labels: []
    })
    // <block:config:0>
    //for first and sec chart
    // const config = {
    //
    //         responsive: true,
    //         plugins: {
    //             title: {
    //                 display: true,
    //                 text: 'Chart.js Line Chart - Cubic interpolation mode'
    //             },
    //         },
    //         interaction: {
    //             intersect: false,
    //         },
    //         scales: {
    //             x: {
    //                 display: true,
    //                 title: {
    //                     display: true
    //                 }
    //
    //             },
    //             y: {
    //                 display: true,
    //                 title: {
    //                     display: true,
    //                     text: 'Value'
    //                 },
    //                 suggestedMin: -10,
    //                 suggestedMax: 200
    //             }
    //         }
    //     ,
    // };
    const config = {
            plugins: {
                title: {
                    display: true,
                    text: 'Chart.js Bar Chart - Stacked'
                },
            },
            responsive: true,
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true
                }
            }
            };
    return (
        <div style={{overflow: 'scroll'}}>

            <ChartController setChartData={setChartData} />
            {/*<Chart*/}
            {/*    type='line'*/}
            {/*    data={chartData }*/}
            {/*    options={config}*/}

            {/*/>*/}
            {/*<Chart*/}
            {/*    type='doughnut'*/}
            {/*    data={chartData }*/}
            {/*    options={config}*/}

            {/*/>*/}
            <Chart
                type='bar'
                data={chartData }
                options={config}

            />
        </div>

    );
}

export default ChartPage;