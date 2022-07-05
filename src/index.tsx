import React from 'react'
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Generate from "./pages/Generate";
import Graph from "./pages/Graph";
import NoPage from "./pages/NoPage";
import "./styles.css";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="Graph" element={<Graph />} />
                    <Route path="Generate" element={<Generate />} />
                    <Route path="*" element={<NoPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
ReactDOM.render(<App />, document.getElementById("root"));
