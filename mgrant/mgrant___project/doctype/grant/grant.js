// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt


function getMonthDifference(startDate, endDate) {
    // Parse the date strings into Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
        frappe.msgprint(__("End Date should be greater than Start Date"));
        frappe.validated = false
        return false;
    }
    // Calculate the difference in months
    const yearDifference = end.getFullYear() - start.getFullYear();
    const monthDifference = end.getMonth() - start.getMonth();

    // Total months difference
    return yearDifference * 12 + monthDifference;
}

const mgrantSettings = (frm) => {
    frm.add_custom_button(__('Grant Settings'), async () => {
        let meta = await frappe.call('frappe_theme.api.get_meta_fields', { doctype: "mGrant Settings Grant Wise" });
        let settings_doc = await frappe.db.get_doc('mGrant Settings Grant Wise', frm.doc.name);
        let fields = meta.message.map((field) => {
            if (field.fieldname == 'grant_name') {
                field.default = frm.doc.name;
                field.read_only = 1;
                field.hidden = 1;
            }
            if (settings_doc[field.fieldname]) {
                field.default = settings_doc[field.fieldname];
            }
            return field;
        });
        let setting_dialog = new frappe.ui.Dialog({
            title: __("Grant Settings"),
            fields: fields,
            primary_action_label: __("Save"),
            primary_action: async () => {
                let values = setting_dialog.get_values();
                if (!values) return setting_dialog.hide();
                let response = await frappe.xcall('frappe.client.set_value', { doctype: 'mGrant Settings Grant Wise', name: frm.doc.name, fieldname: values });
                if (response) {
                    frappe.show_alert({
                        message: __('Settings Saved'),
                        indicator: 'green'
                    });
                }
                setting_dialog.hide();
            }
        });
        setting_dialog.show();
    });
}
let MGRANT_SETTINGS;

frappe.ui.form.on("Grant", {
    async refresh(frm) {
        if (!frm.is_new()) {
            mgrantSettings(frm);
        }
        if (!MGRANT_SETTINGS) {
            MGRANT_SETTINGS = await frappe.db.get_doc('mGrant Settings');
        }
        if (MGRANT_SETTINGS) {
            if (MGRANT_SETTINGS.allow_subgranting) {
                frm.set_df_property('sub_granting_section', 'hidden', 0);
                frm.set_df_property('total_funds_subgranted', 'hidden', 0);
                frm.set_df_property('subgranting_status', 'hidden', 0);
                frm.set_df_property('total_subgrant_utilisation', 'total_funds_subgranted', 0);
                frm.$wrapper.find("[data-fieldname='sub_grants_tab']").show();
            } else {
                frm.set_df_property('sub_granting_section', 'hidden', 1);
                frm.set_df_property('total_funds_subgranted', 'hidden', 1);
                frm.set_df_property('subgranting_status', 'hidden', 1);
                frm.set_df_property('total_subgrant_utilisation', 'hidden', 1);
                frm.$wrapper.find("[data-fieldname='sub_grants_tab']").hide();
            }
        }
        if (frm.is_new() && frm.doc.implementation_type == "Self Implementation" && MGRANT_SETTINGS?.primary_ngo) {
            frm.set_value('ngo', MGRANT_SETTINGS.primary_ngo);
            frm.set_df_property('ngo', 'read_only', 1);
            frm.set_df_property('ngo', 'hidden', 1);
        }
        setup_multiselect_dependency(frm, 'District', 'states', 'state', 'districts', 'state');
        setup_multiselect_dependency(frm, 'Block', 'districts', 'district', 'blocks', 'district');
        setup_multiselect_dependency(frm, 'Village', 'blocks', 'block', 'villages', 'block');
    },
    states(frm) {
        setup_multiselect_dependency(frm, 'District', 'states', 'state', 'districts', 'state');
        frm.set_value({ districts: [], blocks: [], villages: [] });
    },
    districts(frm) {
        setup_multiselect_dependency(frm, 'Block', 'districts', 'district', 'blocks', 'district');
        frm.set_value({ blocks: [], villages: [] });
    },
    blocks(frm) {
        setup_multiselect_dependency(frm, 'Village', 'blocks', 'block', 'villages', 'block');
        frm.set_value({ villages: [] });
    },
    start_date(frm) {
        if (frm.doc.start_date && frm.doc.end_date) {
            let start_date = frm.doc.start_date;
            let end_date = frm.doc.end_date;
            let monthDifference = getMonthDifference(start_date, end_date);
            if (monthDifference) {
                frm.set_value('grant_duration_in_months', monthDifference);
            } else {
                frm.set_value('grant_duration_in_months', 0);
            }
        }
    },
    implementation_type(frm) {
        if (frm.is_new() && frm.doc.implementation_type == "Self Implementation" && MGRANT_SETTINGS?.primary_ngo) {
            frm.set_value('ngo', MGRANT_SETTINGS.primary_ngo);
            frm.set_df_property('ngo', 'read_only', 1);
            frm.set_df_property('ngo', 'hidden', 1);
        } else {
            if (frappe.user_roles.includes('NGO Admin')) {
                frm.set_df_property('ngo', 'read_only', 0);
                frm.set_df_property('ngo', 'hidden', 0);
            }
        }
    },
    end_date(frm) {
        if (frm.doc.start_date && frm.doc.end_date) {
            let start_date = frm.doc.start_date;
            let end_date = frm.doc.end_date;
            let monthDifference = getMonthDifference(start_date, end_date);
            if (monthDifference) {
                frm.set_value('grant_duration_in_months', monthDifference);
            } else {
                frm.set_value('grant_duration_in_months', 0);
            }
        }
    },
    validate(frm) {
        if (frm.doc.start_date && frm.doc.end_date) {
            const start = new Date(frm.doc.start_date);
            const end = new Date(frm.doc.end_date);
            if (start > end) {
                frappe.throw(__("End Date should be greater than Start Date"));
                frappe.validated = false
                return false;
            }
        }
    },
});