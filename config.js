var environment = 'test', //当前的环境
	protocol = 'http://',
	hostCfg, HOST, config, _fn;

hostCfg = {//host
	test : protocol + '127.0.0.1'
};

_fn = {
	createHost : function( hostCfg, env ) {
		var result = {}, p, u;

		return hostCfg[environment]
	}
}


HOST = _fn.createHost( hostCfg, environment );

config = {
	env : environment,
	protocol : protocol,
	host : HOST
};

module.exports = config;