// Copyright (c) 2025, Suvaidyam and contributors
// For license information, please see license.txt

frappe.ui.form.on("Vendor", {
	refresh(frm) {
        if (!frm.is_new()) {
            if (frappe.boot.mgrant_settings.module == 'Donor') {
                if (frm.doc.is_blacklisted) {
                    frm.add_custom_button(__('Whitelist'), async function () {
                        frappe.confirm('Are you sure you want to whitelist this Vendor?', async function () {
                            let res = await frappe.db.set_value("Vendor", frm.doc.name, { "is_blacklisted": 0, 'reason_for_blacklisting': '' })
                            if (res) {
                                frappe.show_alert({ message: __('Vendor whitelisted successfully'), indicator: 'green' });
                                frm.reload_doc();
                            }
                        })
                    });
                } else {
                    frm.add_custom_button(__('Blacklist'), async function () {
                        frappe.prompt([{
                            fieldname: 'reason',
                            fieldtype: 'Small Text',
                            label: 'Reason',
                            reqd: 1
                        }],
                            async function (values) {
                                let res = await frappe.db.set_value("Vendor", frm.doc.name, { "is_blacklisted": 1, 'reason_for_blacklisting': values.reason })
                                if (res) {
                                    frappe.show_alert({ message: __('Vendor blacklisted successfully'), indicator: 'green' });
                                    frm.reload_doc();
                                }
                            });
                    });
                }
            }
        }
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
