// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./Component/Home";
import Registration from "./Authentication/Registration";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Optional Home Route */}
        <Route path="/Registration" element={<Registration />} />{" "}
      </Routes>
    </Router>
  );
}

export default App;
