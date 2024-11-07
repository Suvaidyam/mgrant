// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt

frappe.ui.form.on("Proposal", {
    refresh(frm) {
        if (!frm.doc.__unsave && frm.doc.stages == "Grant Letter Signed") {
            frm.disable_form();
        }
    },
});
