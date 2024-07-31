var db = MAIN.db = MEMORIZE('data');

if (!db.config)
	db.config = {};

if (!db.items)
	db.items = [];

var config = db.config;

if (!config.name)
	config.name = 'OpenReports';

if (!config.cdn)
	config.cdn = '//cdn.componentator.com';

// Fixed settings
CONF.$customtitles = true;
CONF.version = '1';
CONF.op_icon = 'ti ti-database-alt';

// Loads configuration
LOADCONFIG(db.config);

CONF.database && require('querybuilderpg').init('default', CONF.database, 1, ERROR('DB'));

// UI components
COMPONENTATOR('ui', 'exec,codemirror,locale,aselected,input,page,importer,viewbox,box,validate,selected,loading,intranetcss,notify,message,errorhandler,empty,menu,ready,fileuploader,colorpicker,approve,icons,directory,miniform,movable,searchinput,search,datagrid,clipboard,filesaver,properties2,datepicker', true);

// Permissions
ON('ready', function() {
	OpenPlatform.permissions.push({ id: 'all', name: 'All reports' });
	for (var key in F.plugins) {
		var item = F.plugins[key];
		if (item.permissions)
			OpenPlatform.permissions.push.apply(OpenPlatform.permissions, item.permissions);
	}
});