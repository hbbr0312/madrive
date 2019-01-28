import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import CreateTodo from "./components/create-todo.component";
import EditTodo from "./components/edit-todo.component";
import TodosList from "./components/todos-list.component";
import Upload from "./upload.component";
import Download from "./components/download.component";
import Deleted from "./components/deleted.component";
import logo from "./logo.png";

class App extends Component {
  render() {
    return (
    	<Router>
	    	<div className="container">
	    		<nav className="navbar navbar-expand-lg navbar-light bg-light">
	    			<a className="navbar-brand" href="https://naver.com" target="_blank" rel="noopener noreferrer">
	    				<img src={logo} width="30" height="30" alt="CodingTheSmartWay.com"/>
	    			</a>
	    			<Link to ="/" className="navbar-brand">MAdrive</Link>
	    			<div className="collpse nav-collapse">
	    				<ul className="navbar-nav mr-auto">
							<li className="navbar-item">
	    						<Link to="/" className="nav-link">Todos</Link>
	    					</li>
	    					<li className="navbar-item">
	    						<Link to="/create" className="nav-link">Create Todos</Link>
	    					</li>
							<li className="navbar-item">
	    						<Link to="/upload" className="nav-link">Upload</Link>
	    					</li>
							<li className="navbar-item">
	    						<Link to="/download" className="nav-link">내 파일</Link>
	    					</li>
							<li className="navbar-item">
	    						<Link to="/deleted" className="nav-link">휴지통</Link>
	    					</li>
	    				</ul>
	    			</div>
	    		</nav>

	    		<Route path="/" exact component={TodosList} />
		    	<Route path="/edit/:id" component={EditTodo} />
		    	<Route path="/create" component={CreateTodo} />
				<Route path="/upload" component={Upload} />
				<Route path="/download" component={Download} />
				<Route path="/deleted" component={Deleted} />
	    	</div>
	    	
    	</Router>
      );
  }
}

export default App;
