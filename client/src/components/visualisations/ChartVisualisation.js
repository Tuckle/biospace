import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    BarChart, Bar, Cell, ResponsiveContainer
} from 'recharts';
import ChartViewIcon from "../icons/ChartViewIcon";

function ChartVisualisation({myData, width = 500, maxHeight = window.innerHeight}) {
    const [chartType, setChartType] = useState(0);
    const [chartData, setChartData] = useState([]);
    const [renderCount, setRenderCount] = useState(0);

    useEffect(() => {
        updateChartData()
    }, [chartType])

    const setChart = (value) => {
        setChartType(value)
    }

    function updatePapersByYear() {
        const currentYear = new Date().getFullYear();
        const info = [...myData["nodes"]].reduce((result, currentValue) => {
            let year = currentValue.date ? currentValue.date.year :
                currentValue.year ? parseInt(currentValue.year) : null;
            if (year === null) {
                return result;
            }
            try {
                year = parseInt(year);
                if (isNaN(year) || year <= 0 || year > currentYear) {
                    return result;
                }
            } catch (e) {
                return result;
            }
            if (!(year in result)) {
                result[year] = 0
            }
            result[year] += 1
            return result;
        }, {});
        setChartData([...Object.keys(info)
            .map((key, index) => {
                return {
                    "date": key,
                    "value": info[key]
                }
            })
            .filter((item) => item.value === parseInt(item.value) && item.value > 0)
            .sort((a, b) => {
                return a.value < b.value
            })])
    }

    function getPapersByYear() {
        return (
            <LineChart
                key={renderCount}
                width={width}
                height={500}
                data={[...chartData]}
                margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="date"/>
                <YAxis key={renderCount}/>
                <Tooltip/>
                <Legend/>
                <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{r: 8}}/>
            </LineChart>
        )
    }

    function updateCitationsByYear() {
        const currentYear = new Date().getFullYear();
        const info = [...myData["nodes"]].reduce((result, currentValue) => {
            let year = currentValue.date ? currentValue.date.year :
                currentValue.year ? parseInt(currentValue.year) : null;
            if (year === null) {
                return result;
            }
            const citations = currentValue.c ? parseInt(currentValue.c) : null;
            if (citations === null || isNaN(citations)) {
                return result;
            }
            try {
                year = parseInt(year);
                if (isNaN(year) || year <= 0 || year > currentYear) {
                    return result;
                }
            } catch (e) {
                return result;
            }
            console.log(result);
            if (!(year in result)) {
                result[year] = {"sum": 0, "count": 0}
            }
            result[year]["count"] += 1
            result[year]["sum"] += citations
            return result;
        }, {});
        setChartData([...Object.keys(info)
            .map((key, index) => {
                return {
                    "date": key,
                    "sum": info[key]["sum"],
                    "count": info[key]["count"],
                    "avg": Math.floor(info[key]["sum"] / info[key]["count"])
                }
            })
            .filter((item) => item.count === parseInt(item.count) && item.count > 0)
            .sort((a, b) => {
                return a.date < b.date
            })])
    }

    function getCitationsByYear() {
        return (
            <LineChart
                key={renderCount}
                width={width}
                height={500}
                data={[...chartData]}
                margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="date"/>
                <YAxis/>
                <Tooltip/>
                <Legend/>
                <Line type="monotone" dataKey="sum" stroke="#8884d8" activeDot={{r: 8}}/>
                <Line type="monotone" dataKey="count" stroke="#8884d8"/>
                <Line type="monotone" dataKey="avg" stroke="#8884d8"/>
                {/*<Line type="monotone" dataKey="uv" stroke="#82ca9d" />*/}
            </LineChart>
        )
    }

    function updatePapersByType() {
        const info = [...myData["nodes"]].reduce((result, currentValue) => {
            if (currentValue.type !== "paper") {
                return result;
            }
            let type = currentValue.t || null;
            if (type === null || type in ["0", "1"]) {
                type = "paper";
            }
            if (!(type in result)) {
                result[type] = 0
            }
            result[type] += 1
            return result;
        }, {});
        const result = Object.keys(info)
            .map((key, index) => {
                return {
                    "type": key,
                    "count": info[key]
                }
            })
            .filter((item) => item.count === parseInt(item.count) && item.count > 0)
        setChartData(result)
    }

    function getPapersByType() {
        return (
            <BarChart
                key={renderCount}
                width={width}
                height={500}
                data={[...chartData]}
                margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                }}
                barSize={20}
            >
                <XAxis dataKey="type" scale="point" padding={{left: 2}}/>
                <YAxis key={renderCount}/>
                <Tooltip/>
                <Legend/>
                <CartesianGrid strokeDasharray="3 3"/>
                <Bar dataKey="count" fill="#8884d8" background={{fill: '#eee'}}/>
            </BarChart>
        )
    }

    const charts = [
        [getPapersByYear, "Papers by year", updatePapersByYear],
        [getCitationsByYear, "Citations by year", updateCitationsByYear],
        [getPapersByType, "Papers by type", updatePapersByType]
    ];

    const updateChartData = () => {
        charts[chartType][2]()
        setRenderCount(renderCount + 1)
    }

    return (
        <div style={{width: width + 40, maxHeight: maxHeight}}>
            <div style={{paddingLeft: 10}}>
                <ChartViewIcon
                    charts={charts}
                    value={chartType}
                    setValue={setChart}
                />
            </div>
            <ResponsiveContainer maxHeight={maxHeight * 0.8} key={renderCount}>
                {charts[chartType][0]()}
            </ResponsiveContainer>
        </div>
    );
}

export default ChartVisualisation;
