frappe.ui.form.AssignTo = class AssignTo extends frappe.ui.form.AssignTo {
	add() {
		var me = this;
		if (this.frm.is_new()) {
			frappe.throw(__("Please save the document before assignment"));
			return;
		}
		frappe.ui.form.make_quick_entry('ToDo',
			() => {
				cur_dialog.dialog.hide();
			},
			() => {},
			{doctype: 'ToDo','reference_type': me.frm.doctype,'reference_name': me.frm.docname}
		);
	}
};
frappe.ui.form.Sidebar = class CustomSidebar extends frappe.ui.form.Sidebar {
	make() {
		var sidebar_content = frappe.render_template('form_sidebar', {
			doctype: this.frm.doctype,
			frm: this.frm,
			can_write: frappe.model.can_write(this.frm.doctype, this.frm.docname),
		});
		this.sidebar = $('<div class="form-sidebar overlay-sidebar hidden-xs hidden-sm"></div>')
			.append($(sidebar_content).filter('.form-tags'))
			.append($(sidebar_content).filter('.form-assignments'))
			.appendTo(this.page.sidebar.empty());
		this.make_assignments();
		this.make_tags();
		this.refresh();
	}
	refresh() {
		if (this.frm.doc.__islocal) {
			this.sidebar.toggle(false);
			this.page.sidebar.addClass("hide-sidebar");
		} else {
			this.page.sidebar.removeClass("hide-sidebar");
			this.sidebar.toggle(true);
			this.frm.tags && this.frm.tags.refresh(this.frm.get_docinfo().tags);
		}
	}
}
