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
    return (
        <div style={{overflow: 'scroll'}}>

            <ChartController setChartData={setChartData} />
            {/*<Chart*/}
            {/*    type='line'*/}
            {/*    data={chartData }*/}
            {/*    options={config}*/}

            {/*/>*/}
            <Chart
                type='doughnut'
                data={chartData }
                options={config}

            />
        </div>

    );
}

export default ChartPage;