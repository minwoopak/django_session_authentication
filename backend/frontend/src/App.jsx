import React from "react";
import Cookies from "universal-cookie";

const cookies = new Cookies();

export default class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      username: "",
      password: "",
      error: "",
      isAuthenticated: false,
    };
  }

  componentDidMount = () => {
    this.getSession();
  }

  getSession = () => {
    fetch("/api/session/", {
      credentials: "same-origin",
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      if(data.isAuthenticated){
        this.setState({ isAuthenticated: true });
      }
      else {
        this.setState({ isAuthenticated: false });
      }
    })
    .catch(err => console.log(err));
  }

  whoami = () => {
    fetch("/api/whoami/", {
      headers:{
        "Content-Type": "application/json"
      },
      credentials: "same-origin",
    })
    .then(res => res.json())
    .then(data => {
      console.log("You're logged in as: " + data.username);
    })
    .catch(err => console.log(err));
  }

  handleUserNameChange = (event) => {
    this.setState({ username: event.target.value });
  }
  
  handlePasswordChange = (event) => {
    this.setState({ password: event.target.value });
  }

  isResponseOk(response){
    if (response.status >= 200 && response.status <= 299){
      return response.json();
    }
    else {
      throw Error(response.statusText);
    }
  }

  login = event => {
    event.preventDefault();
    fetch("/api/login/", {
      method: "POST",
      headers:{
        "Content-type": "application/json",
        "X-CSRFToken": cookies.get("csrftoken"), // Django needs this to prevent CSRF attacks
      },
      credentials: "same-origin",
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
      })
    })
    .then(this.isResponseOk)
    .then(data => {
      this.setState({ isAuthenticated: true, username: "", password: "", error: "" });
      console.log(data);
    })
    .catch(err => {
      console.log(err);
      this.setState({ error: "Invalid username or password" });
    })
  }

  logout = () => {
    fetch("/api/logout/", {
      headers:{
        "Content-Type": "application/json"
      },
      credentials: "same-origin",
    })
    .then(this.isResponseOk)
    .then(data => {
      this.setState({ isAuthenticated: false });
      console.log(data);
    })
    .catch(err => console.log(err));
  }


  render() {
    if (!this.state.isAuthenticated){
      return (
        <div className="form-group">
          <form onSubmit={this.login}>
            <label>
              Username:
              <input className="form-control" id="username" type="text" value={this.state.username} onChange={this.handleUserNameChange} />
            </label>
            <label>
              Password:
              <input className="form-control" id="password" type="password" value={this.state.password} onChange={this.handlePasswordChange} />
            </label>

            <div>
              {this.state.error && 
              <small className="text-danger">
                {this.state.error}
              </small>}
            </div>

            <button type="submit" className="btn btn-primary">Login</button>
          </form>
        </div>
      );
    }
    else {
      return (
        <div className="container-mt-3">
          <h1>React Cookie Auth</h1>
          <p>You are logged in!</p>
          <button onClick={this.whoami} className="btn btn-primary mr-2">Who am I?</button>
          <button onClick={this.logout} className="btn btn-danger">Logout</button>
        </div>
      );
    }

  }

}

