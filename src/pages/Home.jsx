import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  // Helper to handle HashRouter navigation
  const goTo = (path) => {
    navigate(`#${path}`);
  };

  return (
    <div className="w-full min-h-screen bg-rose-200">
      {/* Header */}
      <div className="flex justify-center items-center p-3 bg-indigo-700">
        <h2 className="font-bold text-3xl text-white">Mohapatra Family Web</h2>
      </div>

      {/* Buttons */}
      <div className="flex flex-col items-center gap-4 mt-10">
        {/* Chat Button */}
        <button
          onClick={() => goTo('/chat')}
          className="w-[90%] h-15 text-2xl rounded-2xl bg-indigo-700 text-white"
        >
          Start Chat
        </button>

        {/* Meeting Buttons */}
        <div className="flex items-center gap-4 w-[90%]">
          <button
            onClick={() => goTo('/meet?mode=join')}
            className="w-[50%] h-15 text-2xl font-bold rounded-2xl border-2 border-indigo-700 text-indigo-700"
          >
            Join Meeting
          </button>

          <button
            onClick={() => goTo('/meet?mode=start')}
            className="w-[50%] h-15 text-2xl rounded-2xl bg-indigo-700 text-white"
          >
            Start Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
