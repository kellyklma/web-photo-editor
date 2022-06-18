import './App.css';
import React from 'react';
import Content from './Content.js';

class Header extends React.Component {
  render() {
    return (
      <p>web photo editor</p>
    );
  }
}

function App() {
  return (
    <div className="App"> 
      <header className="App-header">
        <Header />
      </header>
      <Content />
    </div>
  );
}

export default App;
