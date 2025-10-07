exports.icon = 'ti ti-database-alt';
exports.name = '@(Reports)';
exports.position = 1;
exports.permissions = [{ id: 'reports', name: 'Reports' }];
exports.visible = user => user.sa || user.permissions.includes('reports');

exports.install = function() {

	ROUTE('+API    ?    -reports                      --> reports');
	ROUTE('+API    ?    +reports_read/{id}            --> reports_read');
	ROUTE('+API    ?    +reports_create               --> reports_create');
	ROUTE('+API    ?    +reports_update/{id}          --> reports_update');
	ROUTE('+API    ?    -reports_remove/{id}          --> reports_remove');
	ROUTE('+API    ?    -reports_clone/{id}           --> reports_clone');
	ROUTE('+API    ?    +reports_execute       <60s   --> reports_execute');

	ROUTE('GET     /reports/                          --> reports_ex_info');
	ROUTE('POST    /reports/                   <60s   --> reports_ex_exec');

};