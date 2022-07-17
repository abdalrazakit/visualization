import React from 'react'
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Generate from "./pages/Generate";
import Graph from "./pages/Graph";
import NoPage from "./pages/NoPage";
import "./styles.css";
import ChartPage from "./pages/ChartPage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="Graph" element={<Graph />} />
                    <Route path="Generate" element={<Generate />} />
                    <Route path="chart"  element={<ChartPage />} />

                </Route>
            </Routes>
        </BrowserRouter>
    );
}
ReactDOM.render(<App />, document.getElementById("root"));
