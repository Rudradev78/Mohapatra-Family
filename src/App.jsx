import React from 'react';
import "./App.css";
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Meet from './pages/Meet';
import Chat from './pages/Chat';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/meet" element={<Meet />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
