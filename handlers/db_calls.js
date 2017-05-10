/**
 *	db_calls.js: handle requests from routes.js
 */

'use strict';

// require globals
const Globals = require('../inc/globals.js');
const fs = require('../inc/functions.js');	// include functions file


/** 
 * 	root / status check
 *	TEST: http://localhost:3000/
 */
exports.root = function (request, reply) {
	var timer = new Date();
	var meta = {
		request: "/",
		took: new Date()-timer,
		status: "ok"
	};	
	reply(meta);  
};

/** 
 * 	Get all data for an MSA + scenario + data type
 *	
 *	TEST: http://localhost:3000/api/{msa}/{scenario}/{data}
 *		  http://localhost:3000/api/10180/hous/pctown
 *		  http://localhost:3000/api/16740/gen/married
 */
exports.get_MSA_scenario_data = function(request, reply) {
	var timer = new Date();
	var meta = { request: "get_MSA_scenario_data", params: {}, took: 0 }

	// check binding
	if (!this.db) request.log(['database'], "db: " + JSON.stringify(this.db));

	// store reference to meta info
	var scenariosData = Globals.getScenariosData();
	var scenarios = Globals.getScenarios();

	// log request
	//console.log(request.params);
	request.log(['params'], JSON.stringify(request.params));



	// SANITIZE & VALIDATE request.params

	// confirm required params received
	if (!request.params || (!request.params.msa || !request.params.scenario || !request.params.data)){
		request.log(['params','error'], 'Missing parameter(s)');
		return reply( this.Boom.badRequest('Missing parameter(s)') );
	}
	// sanitize input
	meta.params = { msa: this.Sanitizer.escape(request.params.msa), 
					scenario: this.Sanitizer.escape(request.params.scenario), 
					data: this.Sanitizer.escape(request.params.data) };

	// is msa a valid int between min/max? 
	if ( !this.Validator.isInt(meta.params.msa, { min: 10180, max: 49740 })){
		request.log(['params','error'], 'That MSA does not exist');
		return reply( this.Boom.badRequest('That MSA does not exist') );
	} 
	// does scenario exist inside scenariosData keys?
	if ( !this.Validator.isIn(meta.params.scenario, scenarios)){
		request.log(['params','error'], 'That scenario does not exist');
		return reply( this.Boom.badRequest('That scenario does not exist') );
	}
	// does data exist inside scenariosData object?
	if ( !this.Validator.isIn(meta.params.data, scenariosData[meta.params.scenario])){	
		request.log(['params','error'], 'That data does not exist');	
		return reply( this.Boom.badRequest('That data does not exist') );
	}



	var data = meta.params.data;
	var m_s = meta.params.msa +'_'+ meta.params.scenario;

	// join three tables with crosswalk
	/*
	SELECT t.TID, c.RID, t.drvloneE as t_drvloneE, r.drvloneE as r_drvloneE, 
		t.drvloneM as t_drvloneM, r.drvloneM as r_drvloneM, 
		t.drvloneCV as t_drvloneCV, r.drvloneCV as r_drvloneCV
	FROM 16740_trans_input_tracts t, 16740_trans_output_regions r, 16740_trans_crosswalk c
	WHERE t.TID = c.TID AND r.RID = c.RID
	ORDER BY RID;
	*/
	var sql = 'SELECT t.TID, c.RID, '+
					't.'+data+'E as t_'+data+'E, r.'+data+'E as r_'+data+'E, ' +
					't.'+data+'M as t_'+data+'M, r.'+data+'M as r_'+data+'M, ' + 
					't.'+data+'CV as t_'+data+'CV, r.'+data+'CV as r_'+data+'CV ' +
				'FROM '+ m_s +'_input_tracts t, '+
				    m_s +'_output_regions r, '+
				    m_s +'_crosswalk c ' +
				'WHERE t.TID = c.TID AND r.RID = c.RID ' +
				'ORDER BY RID;';
	//console.log("sql: ",sql);

	// perform query
	this.db.query(sql, function (error, results, fields) {
		if (error) throw error;
		//console.log('results[0].TID: ', results[0].TID); // test
		meta.response = results;		// return all results
		meta.took = new Date()-timer;	// update timer
		reply(meta);					// send response
	});
};





/** 
 * 	Return list of MSA + scenario + data types
 *	
 *	TEST: http://localhost:3000/_metadata/{msa?}
 *		  http://localhost:3000/_metadata		<---- all MSAs
 *		  http://localhost:3000/_metadata/10180 <---- specific MSA
 *		  http://localhost:3000/_metadata/16740
 */
// return all msa/scenarios
exports.get_metadata = function(request, reply) {
	var timer = new Date();
	var meta = { request: "get_metadata", took: 0 }
	var sql = "SELECT msa,scenario,data,description,lat,lng FROM _metadata ";

	// log request
	//console.log(request.params);
	request.log(['params'], JSON.stringify(request.params));

	// if params received
	if (request.params && request.params.msa){
		// sanitize input
		meta.params = { msa: this.Sanitizer.escape(request.params.msa) };

		// validate MSA: is there an MSA and is it a valid int between min/max?
		if ( !this.Validator.isInt(meta.params.msa, { min: 10180, max: 49740 })){
			request.log(['params','error'], 'That MSA does not exist');
			return reply( this.Boom.badRequest('That MSA does not exist') );
		} else {
			// otherwise assume no MSA
			sql += ' WHERE msa='+ meta.params.msa;
		}
	}
	// finish sql
	sql += ' ORDER BY msa;';
	//console.log(sql);


	// perform query
	this.db.query(sql, function (error, results, fields) {
		if (error) throw error;
		//console.log(results);

		// There are 3-4 of each MSA
		// - put them in objects with the msa code as their key
		// - format results like { msa: [ {scenario, scenario, ... }, ... ]
		//						 {"10380":[ { a:1,b:2},{ c:3,d:4}, ... ]}

		// response, temp array for scenarios, previous msa code
		var response = {}, temp = [], prev_msa = 0;

		// loop through objects
		for(var i=0; i<results.length; i++){
			
			var msa = results[i].msa;
			//console.log(msa);

			// convert data string to an array
			results[i].data = results[i].data.split(",");	

			// if this is the first run
			if (prev_msa == 0){
				prev_msa = msa;				// update msa
			}
			// if this is a new one
			else if (prev_msa != msa){
				temp = [];					// reset temp
				prev_msa = results[i].msa;	// update msa
			}
			response[msa] = temp; 			// push temp into response
			temp.push(results[i]);			// push current object
		}
		response[msa] = temp; // in case there was only one msa, push last temp into response

		meta.response = response;		// return all results
		meta.took = new Date()-timer;	// update timer
		reply(meta);					// send response
	});

};







// catch everything else
exports.catchAll = function(request, reply) {
	var error = 'The endpoint [ '+ request.path +' ] does not exist'
	request.log(['error'], error);	
	return reply( this.Boom.badRequest(error) );
};




