const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const Loki = require('lokijs');
const cors = require('cors');
const formidable = require('formidable');
const fs = require('fs');
const grid = require('gridfs-stream');
const rimraf = require("rimraf");
const archiver = require('archiver');

const app = express();
const todoRoutes = express.Router();
const DB_NAME = 'db.json';
const UPLOAD_PATH = 'uploads';
const COLLECTION_NAME = 'images';

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
        var newDestination = 'uploads/' + req.params.id;
        var stat = null;
        try {
            stat = fs.statSync(newDestination);
        } catch (err) {
            fs.mkdirSync(newDestination);
        }
        if (stat && !stat.isDirectory()) {
            throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
        }       
        cb(null, newDestination);
    },
    /*destination : function(req, file, cb){
        cb(null,'uploads/') //cb callback function을 통해 전송된 file save directory setting
    },*/
    filename : function(req,file,cb){
        cb(null, file.originalname)  //callback function을 통해 전송된 file name setting
    }
})

const upload = multer({storage: storage});
const db = new Loki(`${UPLOAD_PATH}/${DB_NAME}`)
const PORT = 80;


let Todo = require('./models/todo.model');
let Files = require('./models/file.model');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/users',express.static('uploads'));  //:3980/users/filename 입력하면 uploads folder에 있는 file볼수 있음.

mongoose.connect('mongodb://127.0.0.1:27017/todos',{ useNewUrlParser: true});
const connection = mongoose.connection;

var Schema = mongoose.Schema;

grid.mongo = mongoose.mongo;

connection.once('open',function(){
    console.log("MongoDB database connection established successfully");
    const gfs = grid(connection.db);
});

/**drag and drop upload files*/
app.post('/upload/:id', upload.array('filepond',5),function (req, res) {

	var user_id = req.params.id;
	var path = './uploads/'+user_id; //
    
    if (!req.files) {
    console.log("No file received");
    return res.send({
      success: false
    });

  } else {
    console.log('file received');
    var form ='txt'; //
    var name = req.files[0].filename;
    var date = Date.now();

    var newInfo = {'user_id': user_id, 'form' : form, 'filename' : name, 'path' : path, 'date':date};

    Files.create(newInfo, function(error){
        if (error){
            console.log(error);
        }else{
            console.log('New file upload');
        }
    });
    return res.json(newInfo);
  }
    
});

/*User file list*/ 
app.get('/files/:id',function(req,res){
	var user_id = req.params.id;
	var condition = {'user_id':user_id};///TODO: user마다
	Files.find(condition, function(err,data){
		if(err){
            console.log(err);
        }else{
        	//console.log(data);
            res.json(data);
        }
	});
});

/**Delete one file*/
app.get('/delete/:id/:name1',function(req,res){
	var user_id = req.params.id;
	var filename = req.params.name1;
	var path = './uploads/'+user_id+'/'+filename;
	console.log("delete file "+filename);
	Files.find({user_id:user_id, filename:filename}).deleteOne().exec(); //user file remove in db
	fs.unlinkSync(path); //user file remove in server directory
	res.end('ok');
});

/**Delete user directory*/
app.get('/deleteall/:id',function(req,res){
	var user_id = req.params.id;
	var path = './uploads/'+user_id;
	console.log("delete directory /"+user_id);
	Files.find({user_id:user_id}).deleteMany().exec(); //user inform remove in db
	rimraf.sync(path); //user directory remove
	res.end('ok');
});

/**Download each file*/
app.get('/download/:id/:name',function(req,res){
	var filename = req.params.name;
	var user_id = req.params.id;
	var path = './uploads/'+user_id+'/'+filename;
	console.log("downloading... "+filename);
	res.attachment(path);
	res.end('hello,world\nkeesun,hi', 'UTF-8');
});

app.get('/test',function(req,res){
	res.attachment('kimbbr.zip');
	res.end('hello,world\nkeesun,hi', 'UTF-8');
});

/**Download all files in user directory*/
app.get('/downloadall/:id',function(req,res){
	var user_id = req.params.id;
	var path = 'uploads/'+user_id;
	console.log("download all files in directory /"+user_id);
	
	var fileName = user_id+'.zip'
	var fileOutput = fs.createWriteStream(fileName);
	var archive = archiver('zip');

	fileOutput.on('close', function () {
	    console.log(archive.pointer() + ' total bytes');
	    console.log('archiver has been finalized and the output file descriptor has closed.');
	});

	archive.pipe(fileOutput);
	archive.glob("../dist/**/*"); //some glob pattern here
	archive.glob("../dist/.htaccess"); //another glob pattern
	// add as many as you like
	archive.on('error', function(err){
	    throw err;
	});
	archive.directory(path, true, { date: new Date() });
	archive.finalize();
	res.attachment(fileName);
	//fs.unlinkSync(fileName);
	res.end('ok');
});


todoRoutes.route('/').get(function(req,res){
    Todo.find(function(err,todos){
        if(err){
            console.log(err);
        }else{
            res.json(todos)
        }
    });
});

todoRoutes.route('/:id').get(function(req,res){
    let id = req.params.id;
    Todo.findById(id,function(err,todo){
        res.json(todo);
    });
});

todoRoutes.route('/add').post(function(req,res){
    let todo = new Todo(req.body);
    todo.save()
        .then(todo => {
            res.status(200).json({'todo':'todo added successfully'});
    })
    .catch(err=>{
        res.status(400).send('adding new todo failed');
    });
});

todoRoutes.route('/update/:id').post(function(req,res){
    Todo.findById(req.params.id,function(err,todo){
        if(!todo)
            res.status(404).send('data is not found');
        else
            todo.todo_description = req.body.todo_description;
            todo.todo_responsible = req.body.todo_responsible;
            todo.todo_priority = req.body.todo_priority;
            todo.todo_completed = req.body.todo_completed;

            todo.save().then(todo=>{
                res.json('Todo updated');
            })
            .catch(err=>{
                res.status(400).send("Update not possible");
            });
    });
});

app.use('/todos',todoRoutes);

app.listen(PORT,function(){
    console.log("Server is running on Port: "+PORT);
});