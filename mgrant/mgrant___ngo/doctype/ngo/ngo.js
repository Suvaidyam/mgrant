// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt

frappe.ui.form.on("NGO", {
    refresh(frm) {
        if(!frm.is_new() && !frm.doc.source_document) {
            frm.add_custom_button(__('Add to Central Repository'), async function() {
                let response = await frappe.call({
                    method: "mgrant.apis.ngo.ngo.add_ngo_to_central_repo",
                    args:{
                        ngo_id: frm.doc.name
                    },
                });
                frappe.msgprint(response.message);
            });
        }
        setup_single_dependent(frm, "state", "state", "district");
    },
    state(frm){
        setup_single_dependent(frm, "state", "state", "district");
        frm.set_value("district", "");
    },
    validate(frm){
        if(frm.doc.website) {
            let website = frm.doc.website;
            validate_url_regex(website)
        }
        if (frm.doc.pan_number){
            let pan_number = frm.doc.pan_number;
            validate_indian_pan_number(pan_number);
        }
    }
});
