import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Home from './components/Home';
import PdfPreview from './components/PdfPreview';

export default function App() {
  const [data, setData] = useState({});

  function handleCallback(dataFromComponentOne) {
    setData(dataFromComponentOne);
  }
  return (
    <>
      <Header />
      <div className='container'>
        <div className='left'>
          <Home callback={handleCallback} />
        </div>
        <div className='right'>
          <PdfPreview data={data} />
        </div>
      </div>
    </>
  );
}
