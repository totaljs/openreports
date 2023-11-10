NEWACTION('reports', {
	name: 'List of reports',
	permissions: 'reports',
	action: function($) {
		var arr = [];
		for (var item of MAIN.db.items)
			arr.push({ id: item.id, category: item.category, name: item.name, color: item.color, icon: item.icon, dtcreated: item.dtcreated, dtupdated: item.dtupdated });
		$.callback(arr);
	}
});

NEWACTION('reports_read', {
	name: 'Read report',
	permissions: 'reports',
	params: '*id:UID',
	action: function($) {
		var params = $.params;
		var item = MAIN.db.items.findItem('id', params.id);
		if (item) {
			$.callback(item);
		} else
			$.invalid('@(Report not found)');
	}
});

NEWACTION('reports_clone', {
	name: 'Clone report',
	permissions: 'reports',
	params: '*id:UID',
	action: function($) {
		var params = $.params;
		var item = MAIN.db.items.findItem('id', params.id);
		if (item) {
			item = CLONE(item);
			item.name += ' (cloned)';
			item.id = UID();
			MAIN.db.items.push(item);
			MAIN.db.save();
			$.success(item.id);
		} else
			$.invalid('@(Report not found)');
	}
});

NEWACTION('reports_create', {
	name: 'Create report',
	input: '*viewid, *name, category, icon:Icon, color:Color, group:[id:String], fields:[id:String,type:String], filter:[id:String,type:String,value:String], sort:[id:String,type:{asc|desc}], limit:number',
	permissions: 'reports',
	action: function($, model) {
		model.id = UID();
		model.dtcreated = NOW;
		MAIN.db.items.push(model);
		MAIN.db.save();
		$.success(model.id);
	}
});

NEWACTION('reports_update', {
	name: 'Update report',
	input: '*viewid, *name, category, icon:Icon, color:Color, group:[id:String], fields:[id:String,type:String], filter:[id:String,type:String,value:String], sort:[id:String,type:{asc|desc}], limit:number',
	permissions: 'reports',
	params: '*id:UID',
	action: function($, model) {
		var params = $.params;
		var item = MAIN.db.items.findItem('id', params.id);
		if (item) {
			COPY(model, item);
			item.dtupdated = NOW;
			MAIN.db.save();
			$.success(params.id);
		} else
			$.invalid('@(Report not found)');
	}
});

NEWACTION('reports_remove', {
	name: 'Remove report',
	permissions: 'reports',
	params: '*id:UID',
	action: function($) {
		var params = $.params;
		var index = MAIN.db.items.findIndex('id', params.id);
		if (index !== -1) {
			MAIN.db.items.splice(index, 1);
			MAIN.db.save();
			$.success(params.id);
		} else
			$.invalid('@(Report not found)');
	}
});

NEWACTION('reports_execute', {
	name: 'Execute report',
	permissions: 'reports',
	input: 'filter:[id:String,type:String,value:String]',
	params: '*id:UID',
	action: function($, model) {

		var params = $.params;
		var item = MAIN.db.items.findItem('id', params.id);
		var view = REPORTS.read(item.viewid);

		if (model.filter && model.filter.length) {
			item = CLONE(item);
			item.filter = model.filter;
		}

		view.exec(item, $.callback);
	}
});