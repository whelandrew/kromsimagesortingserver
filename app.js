const express = require('express');
const app = express();
const axios = require('axios');
const fetch = require('node-fetch');
const { Dropbox } = require('dropbox');

const config = {
  fetch,
  clientId: '61of45kw9796ww9',
  clientSecret: 'z9xmba8h2sozo52',
};

const token = 'Bearer EpRJFxG887UAAAAAAAAAASVn-5KxUdFgvlT8sQE_tqnjkvSq-7iAlTeGk5oo-0m4'

const dbx = new Dropbox(config);

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.set('view engine', 'pug');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
  next();
});

// parse application/json
app.use(express.json());

////////// AUTH ////////////
const redirectUri = `https://kromsimagesortingserver.herokuapp.com/auth`;

app.get('/login', (req,res) => {
	console.log('login');
	dbx.auth.getAuthenticationUrl(redirectUri, null, 'code', 'offline', null, 'none', false)
	.then((authUrl) =>	{
		
		res.writeHead(302, {Location : authUrl});
		res.end();
	});
});

app.get('/auth', function(req, res) {
	const {code} = req.query;
	console.log(`code:${code}`);
	dbx.auth.getAccessTokenFromCode(redirectUri, code)
		.then((token) => {
			console.log(`Token Result:${JSON.stringify(token)}`);
			dbx.auth.setRefreshToken(token.result.refresh_token);			
			dbx.usersGetCurrentAccount()
				.then((response) =>
				{
					console.log('response', response);					
				})
				.catch((error) =>
				{
					console.log(error);
				});
		})
		.catch((error) =>
		{
			console.log(error);
		});
});
////////////////////////////

app.post('/GetMetaData', function(req, res) 
{			
	console.log('GetMetaData');	
	axios({
		method: 'post',
		url: 'https://api.dropboxapi.com/2/sharing/get_file_metadata',		
		headers: {
				'Content-Type' : 'application/json', 
				'Authorization' : token
			},
		data : 
		{
			file:req.body.id
		}
	})	
	.then(function (response) {
		res.send(response.data.path_lower);		
	})
	.catch(function (error) {
		console.log(error);
		res.status(500).send(error);
	});
})

app.post('/ListSharedLinks', function(req, res) 
{			
	console.log('ListSharedLinks');	
	axios({
		method: 'post',
		url: 'https://api.dropboxapi.com/2/sharing/list_shared_links',		
		headers: {
				'Content-Type' : 'application/json', 
				'Authorization' : token
			},
		data : 
		{
			path:req.body.id
		}
	})	
	.then(function (response) {
		let data = [];
		for(let i=0;i<response.data.links.length;i++)
		{
			let newD = response.data.links[i];
			newD.newHTML = "<img src=\""+newD.path_lower.replace('dl=0','dl=1')+"\" alt=\"An Image\"/>";
			data.push(newD);
		}		
		
		res.send(JSON.stringify(data));
	})
	.catch(function (error) {
		console.log(error);
		res.status(500).send(error);
	});
})

app.post('/ListFolder', function(req, res) 
{			
	console.log("ListFolder");	
	axios({
		method: 'post',
		url: 'https://api.dropboxapi.com/2/files/list_folder',
		data: {
			path : req.body.folderLoc,
			recursive : false,
			include_media_info : false,
			include_deleted : false,
			include_has_explicit_shared_members : false,
			include_mounted_folders : true,
			include_non_downloadable_files : true
		},
		headers: {
				'Content-Type' : 'application/json', 
				'Authorization' : token
			}
		})
		.then(function (response)
		{
			console.log(res);
			res.send(JSON.stringify(response.data.entries));
		})
		.catch(function (error) {
			console.log(error);
			res.status(500).send(error);
		});			
})

app.post('/GetAllFolders', function (request, response, next)
{  		
	console.log('GetAllFolders');	
	axios({
		method: 'post',
		url: 'https://api.dropboxapi.com/2/files/list_folder',
		data:{
				'path': '',
				'recursive': false,
				'include_media_info': false,
				'include_deleted': false,
				'include_has_explicit_shared_members': false,
				'include_mounted_folders': true,
				'include_non_downloadable_files': false
			},
		headers: {
				'Content-Type' : 'application/json', 
				'Authorization' : token
			}
	})
	 .then(function (res)
	 {			
		response.send(JSON.stringify(res.file_requests));
	})
	.catch(function (error) {		
		console.log(error);
		response.status(500).send(error);
	});	
});	

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});