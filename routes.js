/**
 *	routes.js: handle incoming paths
 */

'use strict';

const Handlers = require('./handlers/db_calls.js');

let path = "/api";	// original path, before server config
// may not need to reference /api in URL while using Apache/PHP proxy
path = "";	// after server config

const cache = { privacy: 'private', expiresIn: 86400 * 1000 }

// export routes to server
module.exports = [
	{
		config: { 
			description: "The root / test route",
			tags: ['root'],
			notes: ['For testing that server is online'],
			security: true 
		},
		method: 'GET',					
		path: '/',
		handler: Handlers.root
	},{
		config: { 
			description: "Returns all data for specified msa/scenario/data",
			tags: ['data'],
			notes: ['notes here'],
			security: true,
			cache: cache
		},
		method: 'GET',
		path: path + '/{msa}/{scenario}/{data}',
		handler: Handlers.get_MSA_scenario_data
	},{
		config: { 
			description: "Returns _metadata for building menus, etc.",
			tags: ['metadata'],
			notes: ['notes here'],
			security: true,
			cache: cache
		},
		method: 'GET',
		path: path + '/_metadata/{msa?}',
		handler: Handlers.get_metadata
		
	},{
		config: { 
			description: "The default / catchAll route",
			tags: ['default'],
			notes: ['Will catch eerything that has less|more than 3 params'],
			security: true 
		},
		method: 'GET',
		path: path + '/{path*}',
		handler: Handlers.catchAll
	}


];	







