NEWACTION('setup_save', {
	name: 'Save configuration',
	permissions: 'setup',
	input: '*name, *db, op_reqtoken, op_restoken',
	action: function($, model) {
		COPY(model, MAIN.db.config);
		LOADCONFIG(model);
		MAIN.db.save();
		CONF.db && require('querybuilderpg').init('default', CONF.db, 1, ERROR('DB'));
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
