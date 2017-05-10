
exports.goodReportingOptions = {		// Good options for what to report
    ops: { interval: 1000 },
    reporters: {					// specify range of reporters


    	// log to console
        console: [{
            module: 'good-squeeze',	// filter events
            name: 'Squeeze',
            args: [{ 
            	// specify the tags to filter for 
            	// https://github.com/hapijs/good/blob/master/examples/good-squeeze-tips.md
				//ops: '*',			// report all ops events (memory, etc)
				//log: ['log','request','response','error'], // report only log events w/ these tags
				log: '*', 			// report all log events
				error: '*' ,		// report all error events
				request: '*', 		// report all request events
				response: '*'		// report all response events
            }]	
        }, {
            module: 'good-console'	// select the reporter to use
        }, 'stdout'],


        // log server events to file
        // https://github.com/hapijs/good/blob/master/examples/log-to-file.md
		server: [{
		    module: 'good-squeeze',	// filter events
		    name: 'Squeeze',
		    args: [{ 
		    	//ops: '*', 		// good for testing log rotation
		    	log: 'start',
		    	/*
		    	// consider turning these off because Apache logs these to .../apache2/access_log 
		    	log: '*', 		
		    	request: '*' 
		    	*/
				
		   	}] 
		}, {
		    module: 'good-squeeze', // in addition to filtering, also changes how lines are written
		    name: 'SafeJson',		// https://github.com/hapijs/good-squeeze#safejsonoptions-stringify
		    args: [
		        //null, { separator: ',' }	// , only
		        null,  { separator: ",\n" } // , + new line
		    ]
		}, {
		    module: 'rotating-file-stream', // handles log rotation
		    args: [ 
		        'access.log',
		        {
					path: './logs',	// base path
					size: '10M' 	// rotate every 'n' MegaBytes written
					//interval: '1d' 	// rotate daily
		        }
		    ]
		}],


		// log error events to file
		errors: [{
		    module: 'good-squeeze',
		    name: 'Squeeze',
		    args: [{ 
				log: 'error',  
				error: '*',
				request: 'error'
		    }] 
		}, {
		    module: 'good-squeeze',
		    name: 'SafeJson',
		    args: [ null,  { separator: ",\n" } ]
		}, {
		    module: 'rotating-file-stream', // handles log rotation
		    args: [ 
		        'error.log',
		        {
					path: './logs',
					size: '10M'
		        }
		    ]
		}]
    }
};