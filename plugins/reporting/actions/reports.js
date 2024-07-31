const REG_NUMBER = /[0-9,.]+/;

function refresh_permissions() {

	OpenPlatform.permissions = OpenPlatform.permissions.remove(key => key[0] === '_');

	var categories = {};

	for (var item of MAIN.db.items) {
		var category = item.category;
		if (category) {
			var id = category.makeid();
			item.categoryid = id;
			categories[id] = { id: '_' + id, name: category };
		}
	}

	for (var key in categories)
		OpenPlatform.permissions.push(categories[key]);

}

function permitted($, item) {
	if ($.user.sa || item.userid === $.user.id || ($.user.permissions.includes('all') || (item.categoryid && $.user.permissions.includes('_' + item.categoryid))))
		return true;
}

NEWACTION('reports', {
	name: 'List of reports',
	permissions: 'reports',
	action: function($) {

		var arr = [];

		for (var item of MAIN.db.items) {
			if (permitted($, item))
				arr.push({ id: item.id, private: item.private, category: item.category, name: item.name, color: item.color, icon: item.icon, chart: item.chart, dtcreated: item.dtcreated, dtupdated: item.dtupdated });
		}

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
			if (permitted($, item)) {
				$.callback(item);
				return;
			}
		}

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
			if (permitted($, item)) {
				item = CLONE(item);
				item.userid = $.user.id;
				item.name += ' (cloned)';
				item.id = UID();
				MAIN.db.items.push(item);
				MAIN.db.save();
				$.success(item.id);
				refresh_permissions();
				return;
			}
		}

		$.invalid('@(Report not found)');
	}
});

NEWACTION('reports_create', {
	name: 'Create report',
	input: '*viewid, *name, category, icon:Icon, color:Color, group:[id:String], fields:[id:String,type:String], filter:[id:String,type:String,value:String], sort:[id:String,type:{asc|desc}], limit:number, chart:Boolean, x, y, series, private:Boolean',
	permissions: 'reports',
	action: function($, model) {
		model.id = UID();
		model.userid = $.user.id;
		model.dtcreated = NOW;
		model.categoryid = model.category ? model.category.makeid() : null;
		MAIN.db.items.push(model);
		MAIN.db.save();
		$.success(model.id);
		refresh_permissions();
	}
});

NEWACTION('reports_update', {
	name: 'Update report',
	input: '*viewid, *name, category, icon:Icon, color:Color, group:[id:String], fields:[id:String,type:String], filter:[id:String,type:String,value:String], sort:[id:String,type:{asc|desc}], limit:number, chart:Boolean, x, y, series, private:Boolean',
	permissions: 'reports',
	params: '*id:UID',
	action: function($, model) {

		var params = $.params;
		var item = MAIN.db.items.findItem('id', params.id);

		if (item) {
			if (permitted($, item)) {
				COPY(model, item);
				item.dtupdated = NOW;
				item.categoryid = item.category ? item.category.makeid() : null;
				MAIN.db.save();
				$.success(params.id);
				refresh_permissions();
				return;
			}
		}

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
			var item = MAIN.db.items[index];
			if (permitted($, item)) {
				MAIN.db.items.splice(index, 1);
				MAIN.db.save();
				$.success(params.id);
				refresh_permissions();
				return;
			}
		}

		$.invalid('@(Report not found)');
	}
});

NEWACTION('reports_execute', {
	name: 'Execute report',
	permissions: 'reports',
	input: '*id:UID,filter:[id:String,type:String,value:String],chart:boolean',
	action: function($, model) {

		var item = MAIN.db.items.findItem('id', model.id);
		if (item) {
			if (permitted($, item)) {
				var view = Reports.read(item.viewid);
				if (model.filter && model.filter.length) {
					item = CLONE(item);
					item.filter = model.filter;
				}
				view.exec(item, function(err, response) {

					if (err) {
						$.invalid(err);
						return;
					}


					if (model.chart && item.chart) {
						makechart($, item, response, item);
						return;
					}

					$.callback(response);

				});
				return;
			}
		}

		$.invalid(404);
	}
});

NEWACTION('reports_ex_info', {
	name: 'List of reports',
	action: function($) {

		if (!CONF.api) {
			$.invalid(401);
			return;
		}

		var token = $.headers['x-token'] || $.query.token;
		if (token !== CONF.token) {
			$.invalid(401);
			return;
		}

		var output = [];
		for (let item of MAIN.db.items) {

			var obj = {};
			var view = MAIN.db.views.findItem('id', item.viewid);

			if (!view || view.private)
				continue;

			obj.id = item.id;
			obj.name = item.name;
			obj.category = item.category;
			obj.filter = [];
			obj.fields = [];
			obj.chart = item.chart;

			if (item.chart) {
				obj.x = item.x;
				obj.y = item.y;
				obj.series = item.series;
			}

			for (let m of item.fields) {
				let tmp = CLONE(m);
				let field = view.fields.findItem('id', tmp.id);
				if (field) {
					if (!tmp.type)
						tmp.type = undefined;
					tmp.name = field.name;
					tmp.datatype = field.type;
					obj.fields.push(tmp);
				}
			}

			for (let m of item.filter) {
				if (m.value.includes('{')) {
					let tmp = CLONE(m);
					let field = view.fields.findItem('id', tmp.id);
					if (field) {
						tmp.name = field.name;
						tmp.datatype = field.type;
						obj.filter.push(tmp);
					}
				}
			}

			output.push(obj);
		}

		$.callback(output);
	}
});


function makechartvalue(axis) {

	if (typeof(axis.y) === 'string') {
		axis.y = axis.y ? axis.y.toString() : '0';
		if (axis.y) {
			if (!axis.format) {
				let match = axis.y.match(REG_NUMBER);
				if (match) {
					item.format = axis.y.replace(match, '{0}');
					axis.y = match.toString().parseFloat();
				} else
					axis.y = axis.y.parseFloat();
			}
		}
	}

	return axis;
}

function makechart($, view, response, report) {

	var output = null;

	if (view.series) {
		let cache = {};
		for (let m of response) {
			let key = m[view.series];
			let arr = cache[key];
			if (!arr)
				arr = cache[key] = [];
			let x = m[view.x];
			if (x == null)
				x = '';
			arr.push(makechartvalue({ x: x, y: m[view.y] }));
		}
		output = [];
		for (let key in cache)
			output.push({ id: report.id + '_' + HASH(key), name: key, icon: report.icon, color: report.color, data: cache[key] });
	} else {

		output = {};
		output.id = report.id;
		output.name = report.name;
		output.icon = report.icon;
		output.color = report.color;
		output.data = [];

		for (let m of response) {
			let x = m[view.x];
			if (!x)
				x = '';
			output.data.push(makechartvalue({ x: x, y: m[view.y] }));
		}

		output = [output];
	}

	$.callback(output);
}

NEWACTION('reports_ex_exec', {
	name: 'External report',
	input: '*id:UID,filter:[*id,value],chart:boolean',
	action: function($, model) {

		if (!CONF.api) {
			$.invalid(401);
			return;
		}

		var token = $.headers['x-token'] || $.query.token;
		if (token !== CONF.token) {
			$.invalid(401);
			return;
		}

		var item = MAIN.db.items.findItem('id', model.id);
		if (!item) {
			$.invalid(404);
			return;
		}

		var view = Reports.read(item.viewid);

		if (view && !view.private) {
			if (model.filter && model.filter.length) {
				item = CLONE(item);
				for (let filter of model.filter) {
					let tmp = item.filter.findItem('id', filter.id);
					if (tmp && tmp.value.includes('{'))
						tmp.value = filter.value;
				}

			}
			view.exec(item, function(err, response) {

				if (err) {
					$.invalid('Unhandled error');
					F.error(err, 'reports_ex_exec', $.url);
					return;
				}

				if (model.chart && view.chart) {
					makechart($, view, response, item);
					return;
				}

				var output = {};
				output.fields = [];

				for (let field of item.fields) {
					let tmp = view.cache[field.id];
					if (tmp)
						output.fields.push({ id: tmp.id, name: tmp.name, datatype: tmp.type, type: field.type || undefined, format: tmp.format });
				}

				output.rows = response;
				$.callback(output);

			});
		} else
			$.invalid(404);
	}
});

ON('ready', function() {
	refresh_permissions();
});