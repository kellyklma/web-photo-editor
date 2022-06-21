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
  const worker = new Worker('filter-worker.js');
  return (
    <div className="App"> 
      <header className="App-header">
        <Header />
      </header>
      <Content worker={worker} />
    </div>
  );
}

export default App;
