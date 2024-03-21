exports.icon = 'ti ti-cog';
exports.name = '@(Configuration)';
exports.permissions = [{ id: 'setup', name: 'Setup' }];
exports.position = 20;
exports.visible = user => user.sa || user.permissions.includes('setup');

exports.install = function() {
	ROUTE('+API    ?    -setup_read       --> setup_read');
	ROUTE('+API    ?    +setup_save       --> setup_save');
	ROUTE('+API    ?    -account          --> account');
};