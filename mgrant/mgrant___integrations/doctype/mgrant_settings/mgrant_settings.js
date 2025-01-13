// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt

frappe.ui.form.on("mGrant Settings", {
	refresh(frm) {
        if(!frm.doc.__islocal){
            if(frm.doc.module){
                frm.set_df_property('module', 'read_only', 1);
            }
        }
        if(frm.doc.primary_ngo){
            frm.set_df_property('primary_ngo', 'read_only', 1);
        }
	},
});