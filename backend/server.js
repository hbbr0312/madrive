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

//
var session = require('express-session');
var path = require("path");
var user = require('./user')
var post = require('./post')

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
let Deleted = require('./models/deleted.model');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//app.use('/users',express.static('uploads'));  //:3980/users/filename 입력하면 uploads folder에 있는 file볼수 있음.
app.use(session({secret: 'my-secret'}));
var sessions;
app.use(express.static(path.join(__dirname,"/html")));

mongoose.connect('mongodb://127.0.0.1:27017/todos',{ useNewUrlParser: true});
const connection = mongoose.connection;

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
    var name = req.files[0].filename;
    var date = Date(Date.now());
    date = date.replace(" GMT+0900 (Korean Standard Time)","");

    var newInfo = {'user_id': user_id, 'filename' : name, 'date':date};

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
            res.json(data);
        }
	});
});

/*User deleted files list*/ 
app.get('/deletedfiles/:id',function(req,res){
	var user_id = req.params.id;
	var condition = {'user_id':user_id};///TODO: user마다
	Deleted.find(condition, function(err,data){
		if(err){
            console.log(err);
        }else{
            res.json(data);
        }
	});
});

/**Recover deleted file*/
app.get('/recovery/:id/:filename',function(req,res){
	var user_id = req.params.id;
	var filename = req.params.filename;
	var newpath = 'uploads/'+user_id+'/';
	var path = 'uploads/deleted/'+user_id+'/';
	console.log("delete file "+filename);
	var condition = {user_id:user_id, filename:filename};
	Deleted.find(condition,function(err,data){
		if(err){
			console.log(err);
		}else{
			console.log(data);
			//console.log(data[0].date);
			var datai = data[0];
			var newInfo = {'user_id':datai.user_id, 'filename':datai.filename, 'date': datai.date};
			Files.create(newInfo, function(error){
		        if (error){
		            console.log(error);
		        }else{
		            console.log('deleted temporary success');
		        }
		    });
		}
	}).deleteOne().exec(); //user file remove in db
	try {
        stat = fs.statSync(newpath);
        } catch (err) {
        fs.mkdirSync(newpath);
        }
	fs.rename(path+filename,newpath+filename,function (err) {
	  if (err) throw err
	  console.log('Successfully moved file!')
	});
	res.end('ok');
});

/**Temporary delete one file*/
app.get('/tdelete/:id/:filename',function(req,res){
	var user_id = req.params.id;
	var filename = req.params.filename;
	var path = 'uploads/'+user_id+'/';
	var newpath = 'uploads/deleted/'+user_id+'/';
	console.log("delete file "+filename);
	var condition = {user_id:user_id, filename:filename};
	Files.find(condition,function(err,data){
		if(err){
			console.log(err);
		}else{
			console.log(data);
			//console.log(data[0].date);
			var datai = data[0];
			var newInfo = {'user_id':datai.user_id, 'filename':datai.filename, 'date': datai.date};
			Deleted.create(newInfo, function(error){
		        if (error){
		            console.log(error);
		        }else{
		            console.log('deleted temporary success');
		        }
		    });
		}
	}).deleteOne().exec(); //user file remove in db
	try {
        stat = fs.statSync(newpath);
        } catch (err) {
        fs.mkdirSync(newpath);
        }
	fs.rename(path+filename,newpath+filename,function (err) {
	  if (err) throw err
	  console.log('Successfully moved file!')
	});
	res.end('ok');
});

/**Recover deleted user directory*/
app.get('/recoveryall/:id',function(req,res){
	var user_id = req.params.id;
	var newpath = 'uploads/'+user_id+'/';
	var path = 'uploads/deleted/'+user_id+'/';
	console.log("delete directory /"+user_id);
	try {
        stat = fs.statSync(newpath);
        } catch (err) {
        fs.mkdirSync(newpath);
        }
	Deleted.find({user_id:user_id},function(err,data){
		if(err){
			console.log(err);
		}else{
			var size = data.length;
			console.log("data size is");
			console.log(size);
			data.forEach(function(element){
				var newInfo = {'user_id':element.user_id, 'filename':element.filename, 'date': element.date};
				Files.create(newInfo, function(error){
			        if (error){
			            console.log(error);
			        }else{
			            console.log('deleted temporary success');
		        }
		        fs.rename(path+element.filename,newpath+element.filename,function (err) {
					if (err) throw err
					console.log('Successfully moved file!')
				});
		    	});
			});
			//rimraf.sync('./'+path); //user directory remove
		}
	}).deleteMany().exec().then(function(respnose){
				rimraf.sync('./'+path); //user directory remove
			});; //user inform remove in db; //user inform remove in db

	res.end('ok');
});

/**Temporary delete user directory*/
app.get('/tdeleteall/:id',function(req,res){
	var user_id = req.params.id;
	var path = 'uploads/'+user_id+'/';
	var newpath = 'uploads/deleted/'+user_id+'/';
	console.log("delete directory /"+user_id);
	try {
        stat = fs.statSync(newpath);
        } catch (err) {
        fs.mkdirSync(newpath);
        }
	Files.find({user_id:user_id},function(err,data){
		if(err){
			console.log(err);
		}else{
			var size = data.length;
			console.log("data size is");
			console.log(size);
			data.forEach(function(element){
				var newInfo = {'user_id':element.user_id, 'filename':element.filename, 'date': element.date};
				Deleted.create(newInfo, function(error){
			        if (error){
			            console.log(error);
			        }else{
			            console.log('deleted temporary success');
		        }
		        fs.rename(path+element.filename,newpath+element.filename,function (err) {
					if (err) throw err
					console.log('Successfully moved file!')
				});
		    	});
			})
		}
	}).deleteMany().exec().then(function(respnose){
				rimraf.sync('./'+path); //user directory remove
			}); //user inform remove in db

	res.end('ok');
});

/**Delete one file*/
app.get('/delete/:id/:name1',function(req,res){
	var user_id = req.params.id;
	var filename = req.params.name1;
	var path = './uploads/deleted/'+user_id+'/'+filename;
	console.log("delete file "+filename);
	Deleted.find({user_id:user_id, filename:filename}).deleteOne().exec(); //user file remove in db
	fs.unlinkSync(path); //user file remove in server directory
	res.end('ok');
});

/**Delete user directory*/
app.get('/deleteall/:id',function(req,res){
	var user_id = req.params.id;
	var path = './uploads/deleted/'+user_id;
	console.log("delete directory /"+user_id);
	Deleted.find({user_id:user_id}).deleteMany().exec(); //user inform remove in db
	rimraf.sync(path); //user directory remove
	res.end('ok');
});

/**Download each file*/
app.get('/download/:id/:name',function(req,res){
	var filename = req.params.name;
	var user_id = req.params.id;
	var path = './uploads/'+user_id+'/'+filename;
	console.log("downloading... "+filename);
	res.download(path);
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
	archive.finalize().then(function(response){
		res.download(fileName).then(function(res){
			fs.unlinkSync(fileName);
		});
	});
});


/**home*/
app.get('/', function(req,res){
  res.sendFile(__dirname + '/html/index.html');
})

app.get('/home', function (req, res) {
  if(sessions && sessions.username){
    res.sendFile(__dirname + '/html/home.html');
  }
  else{
    res.send('unauthorized');
  }
})

app.post('/signin', function (req, res) {
  sessions=req.session;
  var user_name=req.body.email;
  var password=req.body.password;
  user.validateSignIn(user_name,password,function(result){
    if(result){
      sessions.username = user_name;
      res.send('success');
    }
  });
})

app.post('/signup', function (req, res) {
  var name=req.body.name;
  var email=req.body.email;
  var password=req.body.password;

  if(name && email && password){
  	user.signup(name, email, password)
  }
  else{
  	res.send('Failure');
  }
})

app.post('/addpost', function (req, res) {
    var title = req.body.title;
    var subject = req.body.subject;
    var id = req.body.id;
    if(id == '' || id == undefined){
      console.log('add');
      post.addPost(title, subject ,function(result){
        res.send(result);
      }); 
    }
    else{
      console.log('update',title,subject);
      post.updatePost(id, title, subject ,function(result){
        res.send(result);
      }); 
    }
  })

  app.post('/updateProfile', function(req, res){
    var name = req.body.name;
    var password = req.body.password;
    
    user.updateProfile(name, password, sessions.username, function(result){
        res.send(result);
    })
  })

  app.post('/getpost', function (req, res) {
    post.getPost(function(result){
      res.send(result);
    });
  })
  
  app.post('/deletePost', function(req,res){
    var id = req.body.id;
    post.deletePost(id, function(result){
      res.send(result)
    })
  })
  
  app.post('/getProfile', function(req,res){
    user.getUserInfo(sessions.username, function(result){
      res.send(result)
    })
  })

  app.post('/getPostWithId', function(req,res){
    var id = req.body.id;
    post.getPostWithId(id, function(result){
      res.send(result)
    })
  })

/**todo list*/
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