// Copyright (c) 2025, Suvaidyam and contributors
// For license information, please see license.txt

frappe.ui.form.on("Proposal Grant Receipts", {
    refresh(frm) {

    },
    validate(frm) {
        if (frm.doc.total_funds_planned < frm.doc.funds_requested) {
            frappe.throw({ message: "Total Funds Planned can't be granter then Funds Requested" })
        }
    },
    total_funds_planned(frm) {
        if (frm.doc.total_funds_planned < frm.doc.funds_requested) {
            frappe.throw({ message: "Total Funds Planned can't be granter then Funds Requested" })
        }
    },
    funds_requested(frm) {
        if (frm.doc.total_funds_planned < frm.doc.funds_requested) {
            frappe.throw({ message: "Total Funds Planned can't be granter then Funds Requested" })
        }
    }
});
