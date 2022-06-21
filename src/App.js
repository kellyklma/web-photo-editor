import './App.css';
import React from 'react';
import Content from './Content.js';
import Worker from 'web-worker';

class Header extends React.Component {
  render() {
    return (
      <p>web photo editor</p>
    );
  }
}

function App() {
  const numWorkers = 4;
  // const numWorkers = navigator.hardwareConcurrency - 1;
  console.log("threads " + navigator.hardwareConcurrency);
  const workers = [];

  for (let i=0; i<numWorkers; i++) {
    workers.push(new Worker('filter-worker.js'));
  }
  
  return (
    <div className="App"> 
      <header className="App-header">
        <Header />
      </header>
      <Content workers={workers} />
    </div>
  );
}

export default App;
