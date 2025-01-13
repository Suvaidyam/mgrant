frappe.ui.form.Footer = class Footer extends frappe.ui.form.Footer{
    refresh() {
        this.frm.timeline.prepare_timeline_contents = function() {
            this.timeline_items.push(...this.get_comment_timeline_contents());
        };
        this.frm.timeline.render_timeline_items()
        this.frm.timeline.timeline_wrapper.find('.timeline-item.activity-title').remove()
        super.refresh();
    }
}