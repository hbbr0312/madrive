import React, {Component} from 'react';
import 'filepond/dist/filepond.min.css';
import axios from 'axios';

const Files = props => (
	<tr>
		<td>{props.files.filename}</td>
		<td>{props.files.date}</td>
		<td>{props.files.form}</td>
		<td>
        <a href={`http://socrip4.kaist.ac.kr:3980/download/kimbbr/${props.files.filename}`} target="_blank" rel="noopener noreferrer">
	    				Download</a>
		</td>
        <td>
        <a href={`http://socrip4.kaist.ac.kr:3980/delete/kimbbr/${props.files.filename}`} target="_blank" rel="noopener noreferrer">
	    				Delete</a>
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
				<a href={`http://socrip4.kaist.ac.kr:3980/deleteall/kimbbr`} target="_blank" rel="noopener noreferrer">
	    			Delete All </a>
				<a href={`http://socrip4.kaist.ac.kr:3980/downloadall/kimbbr`} target="_blank" rel="noopener noreferrer">
	    			Download All</a>
				<table className="table table-striped" style={{marginTop:20}}>
					<thead>
						<tr>
							<th>Filename</th>
							<th>Date</th>
							<th>Format</th>
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