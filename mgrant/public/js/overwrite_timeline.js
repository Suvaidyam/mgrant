frappe.ui.form.Footer = class Footer extends frappe.ui.form.Footer{
    refresh() {
        this.frm.timeline.prepare_timeline_contents = function() {
            this.timeline_items.push(...this.get_comment_timeline_contents());
            this.action_history = [];
            this.action_history.push(this.get_creation_message());
            this.action_history.push(this.get_modified_message());
            if (!this.only_communication) {
                this.action_history.push(...this.get_workflow_timeline_contents());
                this.action_history.push(...this.get_custom_timeline_contents());
            }
        };
        this.frm.timeline.render_timeline_items()
        this.frm.timeline.timeline_wrapper.find('.timeline-item.activity-title').remove()
        super.refresh();
    }
}