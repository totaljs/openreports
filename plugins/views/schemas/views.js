NEWACTION('views', {
	name: 'List of views',
	action: function($) {
		$.callback(REPORTS.export());
	}
});

NEWACTION('views_read', {
	name: 'Read view',
	query: '*id',
	permissions: 'views',
	action: function($) {
		var id = $.query.id;
		var item = REPORTS.read(id);
		if (item) {
			var obj = CLONE(item);
			delete obj.cache;
			for (var m of obj.fields)
				delete m.id;
			$.callback(obj);
		} else
			$.invalid(404);
	}
});

NEWACTION('views_save', {
	name: 'Create view',
	input: '*id, *name, *sql, fields:[*column, *name, *type, format:number, group:boolean]',
	permissions: 'views',
	action: function($, model) {

		var db = MAIN.db;
		var index = db.views.findIndex('id', model.id);

		if (index == -1)
			db.views.push(model);
		else
			db.views[index] = model;

		REPORTS.create(model);
		FUNC.check();
		db.save();
		$.success(model.id);
	}
});

NEWACTION('views_remove', {
	name: 'Remove view',
	query: '*id',
	permissions: 'views',
	action: function($) {
		var id = $.query.id;
		var db = MAIN.db;
		var index = db.views.findIndex('id', id);

		if (index !== -1) {

			var rem = [];

			for (var m of db.items) {
				if (m.viewid === id)
					rem.push(m.id);
			}

			for (var m of rem)
				db.items.splice(db.items.findIndex('id', m), 1);

			db.views.splice(index, 1);
			db.save();
			REPORTS.remove(id);
			$.success(id);
		} else
			$.invalid(404);
	}
});