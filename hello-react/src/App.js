import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import CreateTodo from "./components/create-todo.component";
import EditTodo from "./components/edit-todo.component";
import TodosList from "./components/todos-list.component";
import Upload from "./upload.component";
import Download from "./components/download.component";
import Deleted from "./components/deleted.component";
import Share from "./components/share.component";
import logo from "./logo.png";
import Signin from "./components/login.component";
import SignUp from "./components/signup.component";

class App extends Component {
	constructor(props) {
		super(props);
		this.state={
			text:'hellow',
			id:''
		}
	  }

	onLogin(adminId){
		this.setState({
			id:adminId
		});
	}

	onLogout(){
		this.setState({
			id:''
		});
		//cookie.remove('adminId', { path: '/'});
	}

	render() {
		
		let nav;
		
			nav = <div className="container">
			<nav className="navbar navbar-expand-lg navbar-light bg-light">
					<a className="navbar-brand" href="https://naver.com" target="_blank" rel="noopener noreferrer">
						<img src={logo} width="30" height="30" alt="CodingTheSmartWay.com"/>
					</a>
					<Link to ="/todos" className="navbar-brand">MAdrive</Link>
					<div className="collpse nav-collapse">
						<ul className="navbar-nav mr-auto">
							<li className="navbar-item">
								<Link to="/todos" className="nav-link">Todos</Link>
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
							<li className="navbar-item">
								<Link to="/" className="nav-link">로그아웃</Link>
							</li>
						</ul>
					</div>
				</nav>
			<Route path="/"  exact component={Signin} />
			<Route path="/signup" component={SignUp} />
			<Route path="/todos" component={TodosList}/>
			<Route path="/edit/:id" component={EditTodo} />
			<Route path="/create" component={CreateTodo} />
			<Route path="/upload" component={Upload} />
			<Route path="/download" component={Download} />
			<Route path="/deleted" component={Deleted} />
			<Route path="/share" component={Share} />
		</div>;
		
		return (
			<Router>
				{nav}
		</Router>
		);
  }
}


export default App;
