NEWACTION('setup_save', {
	name: 'Save configuration',
	permissions: 'setup',
	input: '*name, totalapi, allow_tms:Boolean, secrets_tms, op_reqtoken, op_restoken',
	action: function($, model) {
		COPY(model, MAIN.db.config);
		LOADCONFIG(model);
		MAIN.db.save();
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
	permissions: 'setup',
	action: function($) {
		$.callback($.user.json ? $.user.json() : $.user);
	}
});
