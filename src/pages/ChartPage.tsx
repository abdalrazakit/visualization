import React from 'react';
import {useState, useEffect} from "react"
import ChartController from "../views/ChartController"
import {Chart} from "react-chartjs-2";
import TimeLabelController from "../views/TimeLableController";
import LineChartController from "../views/LineChartController";
import PieChartController from "../views/PieChartController";


function ChartPage() {
    const [chartData1, setChartData1] = useState(null)
    const [chartData2, setChartData2] = useState(null)
    const [chartData3, setChartData3] = useState(null)
    const [timeLabels, setTimeLabels] = useState<any[] | null>(null);
    var charNum=0;
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
        <div>
            {!timeLabels && (<TimeLabelController setTimesLabels={setTimeLabels}/>)}

            {timeLabels && (<PieChartController  timeLabels={timeLabels} setChartData={setChartData2} />)
            }
            {chartData2 && <Chart
                type='doughnut'
                data={chartData2}
                options={config}

            />}
            {timeLabels && chartData2 && (<ChartController  timeLabels={timeLabels} setChartData={setChartData3} />)
            }
            {chartData3 && <Chart
                type='bar'
                data={chartData3}
                options={config2}

            />}
            {timeLabels && chartData2&&chartData3 && (<LineChartController  timeLabels={timeLabels} setChartData={setChartData1} />)
            }
            {chartData1 && <Chart
                type='line'
                data={chartData1}
                options={config}
            />}

        </div>
    );
}

export default ChartPage;