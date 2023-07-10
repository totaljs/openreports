NEWACTION('setup_save', {
	name: 'Save configuration',
	permissions: 'setup',
	input: '*name, *database, op_reqtoken, op_restoken',
	action: function($, model) {
		COPY(model, MAIN.db.config);
		LOADCONFIG(model);
		MAIN.db.save();
		CONF.database && require('querybuilderpg').init('default', CONF.database, 1, ERROR('DB'));
		$.success();
	}
});

NEWACTION('setup_read', {
	name: 'Read configuration',
	permissions: 'setup',
	action: function($) {
		$.callback(MAIN.db.config);
	}
});

NEWACTION('account', {
	name: 'Read account data',
	action: function($) {
		$.callback($.user.json ? $.user.json() : $.user);
	}
});
