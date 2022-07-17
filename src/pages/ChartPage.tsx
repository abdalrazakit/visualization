import React from 'react';
import {useState, useEffect} from "react"
import ChartController from "../views/ChartController"
import {Chart} from "react-chartjs-2";


function ChartPage() {
    const [chartData1, setChartData1] = useState(null)
    const [chartData2, setChartData2] = useState(null)
    const [chartData3, setChartData3] = useState(null)

// <block:config:0>
//for first and sec chart
    const config = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Chart.js Line Chart - Cubic interpolation mode'
            },
        },
        interaction: {
            intersect: false,
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true
                }

            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Value'
                },
                suggestedMin: -10,
                suggestedMax: 200
            }
        }
        ,
    };

    const config2 = {
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

            <ChartController setChartData1={setChartData1}  setChartData2={setChartData2}  setChartData3={setChartData3}/>
            {chartData1 && <Chart
                type='line'
                data={chartData1}
                options={config}
            />}
            {chartData2 &&<Chart
                type='doughnut'
                data={chartData2}
                options={config}

            />}
            {chartData3 &&<Chart
                type='bar'
                data={chartData3}
                options={config2}

            />}
        </div>
    );
}

export default ChartPage;