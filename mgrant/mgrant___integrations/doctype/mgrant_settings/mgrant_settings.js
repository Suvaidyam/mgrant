// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt

frappe.ui.form.on("mGrant Settings", {
    refresh(frm) {
        if (!frm.doc.__islocal) {
            if (frm.doc.module) {
                frm.set_df_property('module', 'read_only', 1);
            }
        }
        if (frm.doc.primary_ngo) {
            frm.set_df_property('primary_ngo', 'read_only', 1);
        }
    },
    update_stages(frm) {
        if (frm.doc.proposal_stages && frm.doc.proposal_stages.length > 0) {
            frappe.db.get_value('Workflow', { document_type: 'Proposal' }, 'name')
                .then(r => {
                    if (r && r.message && r.message.name) {
                        frappe.set_route('Form', 'Workflow', r.message.name);
                    } else {
                        frappe.msgprint(__('No Workflow found for Proposal.'));
                    }
                });
        }
    }
});