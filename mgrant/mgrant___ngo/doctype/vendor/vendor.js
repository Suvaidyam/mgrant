// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt

frappe.ui.form.on("Vendor", {
	refresh(frm) {
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
