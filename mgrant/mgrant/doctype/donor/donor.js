// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt
frappe.ui.form.on("Donor", {
	refresh(frm) {
        if(!frm.is_new() && !frm.doc.source_document) {
            frm.add_custom_button(__('Add to Central Repository'), async function() {
                let response = await frappe.call({
                    method: "mgrant.apis.ngo.donor.add_donor_to_central_repo",
                    args:{
                        donor_id: frm.doc.name
                    },
                });
                frappe.msgprint(response.message);
            });
        }
	},
    website(frm) {
        // if(frm.doc.website) {
        //     let website = frm.doc.website;
        //     console.log(website,'website');
        // }
    },
    validate(frm){
        if(frm.doc.website) {
            let website = frm.doc.website;
            validate_url_regex(website)
        }
        if(frm.doc.mobile_number){
            let mobile_number = frm.doc.mobile_number;
            validate_indian_phone_number_regex(mobile_number);
        }
    }
});
