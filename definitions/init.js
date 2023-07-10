var db = MAIN.db = MEMORIZE('data');

if (!db.config)
	db.config = {};

if (!db.items)
	db.items = [];

if (db.views) {
	for (let m of db.views)
		REPORTS.create(m);
} else
	db.views = [];

var config = db.config;

if (!config.name)
	config.name = 'App';

// Fixed settings
CONF.allow_custom_titles = true;
CONF.version = '1';
CONF.op_icon = 'ti ti-database-alt';

// Loads configuration
LOADCONFIG(db.config);

if (!CONF.cdn)
	CONF.cdn = '//cdn.componentator.com';

CONF.db && require('querybuilderpg').init('default', CONF.db, 1, ERROR('DB'));

// UI components
COMPONENTATOR('ui', 'exec,locale,codemirror,aselected,page,viewbox,input,importer,box,validate,loading,selected,intranetcss,notify,message,errorhandler,empty,menu,ready,fileuploader,colorpicker,approve,icons,directory,miniform,movable,searchinput,search,datagrid,clipboard,filesaver,properties2', true);

// Permissions
ON('ready', function() {
	for (var key in F.plugins) {
		var item = F.plugins[key];
		if (item.permissions)
			OpenPlatform.permissions.push.apply(OpenPlatform.permissions, item.permissions);
	}
});