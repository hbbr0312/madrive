import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import SignIn from "./components/login.component";

class Login extends Component {
    render() {
      return (
          <Router>
              <div className="container">
                  <Route path="/" exact component={SignIn} />
              </div>
          </Router>
        );
    }
  }
  
  export default Login;
  