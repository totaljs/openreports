// Checks relations between views and reports
FUNC.check = function() {
	for (var view of REPORTS.views) {
		for (var report of MAIN.db.items) {
			if (report.viewid === view.id) {
				report.group = report.group.remove(n => view.fields.findItem('id', n.id) == null);
				report.filter = report.filter.remove(n => view.fields.findItem('id', n.id) == null);
				report.fields = report.fields.remove(n => view.fields.findItem('id', n.id) == null);
				report.sort = report.sort.remove(n => view.fields.findItem('id', n.id) == null);
			}
		}
	}
};