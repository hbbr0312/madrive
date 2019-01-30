import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import Signin from "./components/login.component";
import SignUp from "./components/signup.component";

class App extends Component {
  render() {
    return (
      <Router><div className="App">
      <Route path="/"  exact component={Signin} />
    <Route path="/signup" component={SignUp} />
    </div></Router>
      
    );
  }
}

export default App;
