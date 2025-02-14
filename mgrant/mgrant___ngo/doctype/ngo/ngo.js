// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt

frappe.ui.form.on("NGO", {
    setup(frm) {
        window.SVAHandleParentFieldProps = (fields, doctype, name, mode)=>{
            if(doctype=='NGO Due Diligence'){
                for(let field of fields){
                    if(field.fetch_from && field.fetch_from?.startsWith('ngo.')){
                        field.default = frm.doc[field.fetch_from.split('.')[1]];
                        field.fetch_from = '';
                        if(field.default){
                            field.read_only = 1;
                        }
                    }
                    if(field.fieldname=="_reasons"){
                        console.log("Field",field);

                    }
                }
            }
            return fields;
        };
    },
    async refresh(frm) {
        frm.set_df_property('active_documents', 'cannot_delete_rows', 1);
        frm.set_df_property('expired_documents', 'cannot_delete_rows', 1);
        frm.set_df_property('expired_documents', 'cannot_add_rows', 1);
        if (frm.is_new()) {
            let docs = await frappe.db.get_list('Statutory Documents', { filters: { status: 'Active' }, fields: ['*'] })
            frm.set_value('active_documents', [])
            frm.set_value('active_documents', [...docs.map(d => { return { document: d.name, ...d } })])
            frm.refresh_field('active_documents')
            let default_reasons = await frappe.db.get_list('DDFR', { filters: { name: ['IN',['Others','Other']] }, pluck: 'name' })
            if (default_reasons.length > 0) {
                frm.add_child('reasons', { reason: default_reasons[0] })
                frm.refresh_field('reasons')
                frm.set_value('reason_for_due_diligence_fail','Due Diligence not added/approved.')
            }
        }
        if (!frm.is_new()) {
            if (frm.doc.is_blacklisted) {
                frm.add_custom_button(__('Whitelist'), async function () {
                    frappe.confirm('Are you sure you want to whitelist this NGO?', async function () {
                        let res = await frappe.db.set_value("NGO", frm.doc.name, { "is_blacklisted": 0, 'reason_for_blacklisting': '' })
                        if (res) {
                            frappe.show_alert({ message: __('NGO whitelisted successfully'), indicator: 'green' });
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
                            let res = await frappe.db.set_value("NGO", frm.doc.name, { "is_blacklisted": 1, 'reason_for_blacklisting': values.reason, 'ngo_status': '' })
                            if (res) {
                                frappe.show_alert({ message: __('NGO blacklisted successfully'), indicator: 'green' });
                                frm.reload_doc();
                            }
                        });
                });
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
            } else {
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
