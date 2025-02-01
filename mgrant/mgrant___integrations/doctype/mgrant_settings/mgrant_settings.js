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
    async validate(frm) {
        const stages = frm.doc.proposal_stages.reduce((acc, stage) => {
            acc[stage.closure] = acc[stage.closure] || [];
            acc[stage.closure].push(stage);
            return acc;
        }, {});

        const closureFields = {
            'Sign-Off Prerequisite': { field: 'sign_off_prerequisite', required: true },
            'Positive': { field: 'positive', required: true },
            'Negative': { field: 'negative', required: true },
            'Neutral': { field: 'neutral', required: false }
        };

        Object.entries(closureFields).forEach(([type, { field, required }]) => {
            const typeStages = stages[type] || [];

            if (typeStages.length > 1) {
                frappe.throw({ message: `Only one "${type}" closure is allowed in Proposal Stages.` });
            }
            if (required && typeStages.length === 0) {
                frappe.throw({ message: `Only one "${type}" closure is required in Proposal Stages.` });
            }
            frm.set_value(field, typeStages.length ? typeStages[0].stage : '');
        });
    }

});