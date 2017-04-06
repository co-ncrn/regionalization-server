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
		// root / test	
		method: 'GET',					
		path: '/',
		handler: Handlers.root,
		config: { security: true }
	},{
		// get all msa data
		method: 'GET',
		path: path + '/{msa}/{scenario}/{data}',
		handler: Handlers.get_MSA_scenario_data,
		config: {
			security: true,
			cache: cache
		}
	},{
		// get _metadata for menus
		method: 'GET',
		path: path + '/_metadata/{msa?}',
		handler: Handlers.get_metadata,
		config: {
			security: true,
			cache: cache
		}
	},{
		// default
		method: 'GET',
		path: path + '/{path*}',
		handler: Handlers.catchAll,
		config: { security: true }
	}


];	







