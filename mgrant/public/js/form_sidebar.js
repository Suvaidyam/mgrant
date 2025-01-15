frappe.ui.form.Sidebar = class CustomSidebar extends frappe.ui.form.Sidebar {
    make() {
        var sidebar_content = frappe.render_template('form_sidebar', {
            doctype: this.frm.doctype,
            frm: this.frm,
            can_write: frappe.model.can_write(this.frm.doctype, this.frm.docname),
        });
        
		this.sidebar = $('<div class="form-sidebar overlay-sidebar hidden-xs hidden-sm"></div>')
			.html($(sidebar_content).filter('.form-tags'))
			.appendTo(this.page.sidebar.empty());
            
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