import React, {Component} from 'react';
import axios from 'axios';

const Files = props => (
	<tr>
		<td>{props.files.filename}</td>
		<td>{props.files.date}</td>
		<td>{props.files.form}</td>
		<td>
		<input onClick = {()=>{axios.get(`http://socrip4.kaist.ac.kr:3980/recovery/kimbbr/${props.files.filename}`)
			.then(response=>(console.log(response)))}} value="복구" className="btn btn-primary"/>
		</td>
        <td>
		<input onClick = {()=>{axios.get(`http://socrip4.kaist.ac.kr:3980/delete/kimbbr/${props.files.filename}`)
			.then(response=>(console.log(response)))}} value="영구삭제" className="btn btn-warning"/>
		</td>
	</tr>
)

export default class Deleted extends Component{
	constructor(props){
        super(props);
		this.state = {files: []};
	}
	

	componentDidMount(){
		axios.get('http://socrip4.kaist.ac.kr:3980/deletedfiles/kimbbr/')
			.then(response=>{
				this.setState({files: response.data});
			})
			.catch(function(error){
				console.log(error);
			})
	}

	componentDidUpdate() {
		axios.get('http://socrip4.kaist.ac.kr:3980/deletedfiles/kimbbr/')
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
				<input onClick = {()=>{axios.get(`http://socrip4.kaist.ac.kr:3980/deleteall/kimbbr`)
				.then(response=>(console.log(response)))}} value="모두 영구 삭제" className="btn btn-danger"/>
				<input onClick = {()=>{axios.get(`http://socrip4.kaist.ac.kr:3980/recoveryall/kimbbr`)
				.then(response=>(console.log(response)))}} value="모두 복구" className="btn btn-success"/>
				<table className="table table-striped" style={{marginTop:20}}>
					<thead>
						<tr>
							<th>Filename</th>
							<th>Date</th>
							<th>Format</th>
							<th>Recovery</th>
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