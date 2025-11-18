import React from 'react';
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className='w-full h-275 bg-rose-200'>
      
      <div className='flex justify-center items-center p-3 bg-indigo-700'>
        <h2 className='font-bold text-3xl text-white'>Mohapatra Family Web</h2>
      </div>

      <div className='flex flex-col items-center gap-1 mt-5'>
        
        <button
          onClick={() => navigate("/chat")}
          className=' w-[90%] h-15 text-2xl rounded-2xl bg-indigo-700 text-white'
        >
          Start Chat
        </button>

        <div className='flex items-center gap-2 mt-2  w-[90%]'>

          <button
            onClick={() => navigate("/meet?mode=join")}
            className=' w-[50%] h-15 text-2xl font-bold rounded-2xl border-5 border-indigo-700 text-indigo-700'
          >
            Join Meeting
          </button>

          <button
            onClick={() => navigate("/meet?mode=start")}
            className=' w-[50%] h-15 text-2xl rounded-2xl bg-indigo-700 text-white'
          >
            Start Meeting
          </button>

        </div>
      </div>

    </div>
  );
};

export default Home;
