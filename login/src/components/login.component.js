// var Router = window.ReactRouter.Router;
// var Route = window.ReactRouter.Route;
// var hashHistory = window.ReactRouter.hashHistory;
// var Link = window.ReactRouter.Link;
import React, {Component} from 'react';
import axios from 'axios';
import signup from './signup.component';

import { Link } from 'react-router-dom';

export default class Signin extends Component {
    constructor(props) {
      super(props);
      this.signIn = this.signIn.bind(this);
      this.handleEmailChange = this.handleEmailChange.bind(this);
      this.handlePasswordChange = this.handlePasswordChange.bind(this);
      this.state = {
        email:'',
        password:'',
        islogin:false
      };
    }
    
    signIn(){
      axios.post('http://socrip4.kaist.ac.kr:3980/signin', {
        email: this.state.email,
        password: this.state.password,
      })
      .then(function (response) {
        if(response.data === 'success'){
          window.location.assign('http://localhost:3000/todos');
          this.setState({islogin:true})
          //this.props.onSuccess(this.state.email);
          //console.log(this.state.islogin.toString());
          this.props.appContext.setState({
            id:this.state.email
          })
          //this.props.login.bind(this,this.state.email);
        }else{
          alert("로그인에 실패하였습니다. 아이디와 패스워드를 확인하세요.");
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    }
    handleEmailChange(e){
      this.setState({email:e.target.value})
    }
    handlePasswordChange(e){
      this.setState({password:e.target.value})
    }
    render() {
      return (
        <div>
          <form className="form-signin">
            <h2 className="form-signin-heading">LOGIN</h2>
            <label for="inputEmail" className="sr-only">Email address</label>
            <input type="email" onChange={this.handleEmailChange} id="inputEmail" className="form-control" placeholder="Email address" required autofocus />
            <label for="inputPassword" className="sr-only">Password</label>
            <input type="password" onChange={this.handlePasswordChange} id="inputPassword" className="form-control" placeholder="Password" required />
            <button className="btn btn-lg btn-primary btn-block" onClick={this.signIn} type="button">Sign In</button>
            {/* <Link to="/todos" className="btn btn-lg btn-primary btn-block">{'Sign In'}</Link> */}
          </form>
          <div>
            <Link to="/signup" component={signup}>{'Sign Up'}</Link>
          </div>
        </div>

      )
    }
  }


// ReactDOM.render(
//     <Router history={HashRouter}>
//         <Route component={Signin} path="/"></Route>
//         <Route component={Signup} path="/signup"></Route>
//     </Router>,
// document.getElementById('app'));