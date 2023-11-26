exports.icon = 'ti ti-database-alt';
exports.name = '@(Reports)';
exports.position = 1;
exports.permissions = [{ id: 'reports', name: 'Reports' }];
exports.visible = user => user.sa || user.permissions.includes('reports');

exports.install = function() {

	ROUTE('+API    /api/    -reports                      --> reports');
	ROUTE('+API    /api/    +reports_read/{id}            --> reports_read');
	ROUTE('+API    /api/    +reports_create               --> reports_create');
	ROUTE('+API    /api/    +reports_update/{id}          --> reports_update');
	ROUTE('+API    /api/    -reports_remove/{id}          --> reports_remove');
	ROUTE('+API    /api/    -reports_clone/{id}           --> reports_clone');
	ROUTE('+API    /api/    +reports_execute/{id}         --> reports_execute');


};