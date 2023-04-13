exports.icon = 'ti ti-layer-group';
exports.name = '@(Views)';
exports.position = 2;
exports.permissions = [{ id: 'views', name: 'Views' }];
exports.visible = user => user.sa || user.permissions.includes('views');

exports.install = function() {

	ROUTE('+API    /api/    -views');
	ROUTE('+API    /api/    -views_read');
	ROUTE('+API    /api/    +views_save');
	ROUTE('+API    /api/    -views_remove');

};