// Copyright (c) 2025, Suvaidyam and contributors
// For license information, please see license.txt

frappe.ui.form.on("Vendor", {
	refresh(frm) {
        // if (!frm.is_new() && !frm.doc.source_document) {
        //     frm.add_custom_button(__('Add to Central Repository'), async function () {
        //         let response = await frappe.call({
        //             method: "mgrant.apis.ngo.ngo.add_ngo_to_central_repo",
        //             args: {
        //                 ngo_id: frm.doc.name
        //             },
        //         });
        //         frappe.msgprint(response.message);
        //     });
        // }
        setup_single_dependent(frm, "state", "state", "district");
    },
    state(frm) {
        setup_single_dependent(frm, "state", "state", "district");
        frm.set_value("district", "");
    },
    async fetch_bank_details(frm) {
        let ifsc_code = frm.doc.ifsc_code;
        if (ifsc_code && ifsc_code.length == 11) {
            frappe.dom.freeze("Fetching bank details...");
            let bd = await frappe.get_bank_with_ifsc(ifsc_code)
            if (bd) {
                if (bd.BANK) {
                    frm.set_value("bank_name", bd.BANK)
                }
                if (bd.BRANCH) {
                    frm.set_value("branch_name", bd.BRANCH)
                }
                if (bd.SWIFT) {
                    frm.set_value("swift_code", bd.SWIFT)
                }
                frappe.dom.unfreeze();
            }else{
                frappe.dom.unfreeze();
                frappe.msgprint("Bank details not found. Please enter valid IFSC code.")
            }
        }
        
    },
    validate(frm) {
        let ifsc_code = frm.doc.ifsc_code;
        if (ifsc_code) {
            validate_ifsc(ifsc_code);
        }
        if (frm.doc.website) {
            let website = frm.doc.website;
            validate_url_regex(website)
        }
        if (frm.doc.pan_number) {
            let pan_number = frm.doc.pan_number;
            validate_indian_pan_number(pan_number);
        }
    }
});
