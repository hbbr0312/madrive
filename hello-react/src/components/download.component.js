import React, {Component} from 'react';
import 'filepond/dist/filepond.min.css';
import axios from 'axios';

const Files = props => (
	<tr>
		<td>{props.files.filename}</td>
		<td>{props.files.date}</td>
		<td>
			<a href={`http://socrip4.kaist.ac.kr:3980/download/kimbbr/${props.files.filename}`}>
				<input value="Download" className="btn btn-primary"/>
			</a>
		</td>
        <td>
		<input onClick = {()=>{axios.get(`http://socrip4.kaist.ac.kr:3980/tdelete/kimbbr/${props.files.filename}`)
			.then(response=>(console.log(response)))}} value="Delete" className="btn btn-warning"/>
		</td>
	</tr>
)

export default class Download extends Component{
	constructor(props){
        super(props);
		this.state = {files: []};
	}
	

	componentDidMount(){
		axios.get('http://socrip4.kaist.ac.kr:3980/files/kimbbr/')
			.then(response=>{
				this.setState({files: response.data});
			})
			.catch(function(error){
				console.log(error);
			})
	}

	componentDidUpdate() {
		axios.get('http://socrip4.kaist.ac.kr:3980/files/kimbbr/')
			.then(response=>{
				this.setState({files: response.data});
			})
			.catch(function(error){
				console.log(error);
			})
	}

	fileList(){
		return this.state.files.map(function(currentFile,i){
			return <Files files={currentFile} key={i} />;
		});
	}

	render(){
		return(
			<div>
				<h3>My File List</h3>
				<input onClick = {()=>{axios.get(`http://socrip4.kaist.ac.kr:3980/tdeleteall/kimbbr`)
				.then(response=>(console.log(response)))}} value="Delete All" className="btn btn-danger"/>
				<a href="http://socrip4.kaist.ac.kr:3980/downloadall/kimbbr"><input value="Download All" className="btn btn-success"/></a>
				<table className="table table-striped" style={{marginTop:20}}>
					<thead>
						<tr>
							<th>Filename</th>
							<th>Date</th>
							<th>Download</th>
                            <th>Delete</th>
						</tr>
					</thead>
					<tbody>
						{ this.fileList() }
					</tbody>
				</table>
			</div>
		);
	}
}