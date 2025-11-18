import './App.css';
import { Route, Routes } from 'react-router-dom';
import Chat from './pages/Chat';
import Meet from './pages/Meet';
import Home from './pages/Home';
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/meet" element={<Meet />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </div>
  );
}
export default App;