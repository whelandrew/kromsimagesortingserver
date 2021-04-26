const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/GetMetaData', function(req, res) 
{			
	console.log('GetMetaData');
	console.log(req.body);
	
	axios({
		method: 'post',
		url: 'https://api.dropboxapi.com/2/sharing/get_file_metadata',		
		headers: {
				'Content-Type' : 'application/json', 
				'Authorization' : 'Bearer sl.AvR_Pqu9CIgnwriHRnrmRm57Frf2ze4zFb4_yDiKGn6SSayHbekPyuuP72DwTyqvwei2xPWY7oqLfKesqHK1dq_edRhnrI-Aiqpi7Wy-0SoxhPOYJ6BPupqbfGwboebzzGQ-Nlo'
			},
		data : 
		{
			file:req.body.id
			actions:[create_view_link]
		}
	})
	.then(function (response)
	{	
		const folderLoc = response.path_lower;
		//	res.send(response.data);		
	})
	.catch(function (error) {
		console.log(error);
		res.status(500).send(error);
	});
})