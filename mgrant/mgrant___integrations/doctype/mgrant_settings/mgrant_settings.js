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

        ['Positive', 'Negative', 'Approval'].forEach(type => {
            const typeStages = stages[type] || [];
            if (typeStages.length > 1) {
                frappe.throw({ message: __(`Only one "${type}" closure is allowed in Proposal Stages.`) });
            }
            if (typeStages.length == 0) {
                frappe.throw({ message: __(`One "Positive" & "Negative" & "Approval" closure is required in Proposal Stages.`) });
            }

            frm.set_value(
                `final_${type.toLowerCase()}_stage`,
                typeStages.length ? typeStages[0].stage : ''
            );
        });
    }

});

// frappe.ui.form.on('Proposal Stages Child', {
//     closure(frm, cdt, cdn) {
//     }
// })