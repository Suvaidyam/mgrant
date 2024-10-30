// Copyright (c) 2024, Abhishek Yadav and contributors
// For license information, please see license.txt

async function child_tables_rows_limit(frm) {
    await frappe.call({
        method: 'mgrant.apis.compliance_calendar.compliance.compliance_annual_plan',
        args: {
            doctype_name: 'Compliance Annual Plan',
            filter: { name: frm.doc.year_ },
        },
        callback(response) {
            if (response.message && response.message.length > 0) {
                let plan = response.message[0];

                // Get the grid for the monthly table and set its pagination length
                let { grid: monthly_grid } = frm.fields_dict['monthly_table'];
                monthly_grid.grid_pagination.page_length = plan.child_table_2.length;
                frm.get_field('monthly_table').grid.reset_grid();

                // Get the grid for the quarterly table and set its pagination length
                let { grid: quarterly_grid } = frm.fields_dict['quarterly_table'];
                quarterly_grid.grid_pagination.page_length = plan.child_table_3.length;
                frm.get_field('quarterly_table').grid.reset_grid();
            }
        }
    });
}

async function loadJSZip() {
    if (typeof JSZip === 'undefined') {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js";
            script.onload = () => resolve(JSZip ? console.log("JSZip loaded") : reject("Failed to load JSZip"));
            script.onerror = () => reject("Error loading JSZip");
            document.head.appendChild(script);
        });
    }
}
frappe.ui.form.on("Compliance Tracking", {
    async refresh(frm) {
        frm.add_custom_button(__('Go to Annual Plan'), function () {
            frappe.set_route("Form", "Compliance Annual Plan", frm.doc.year_);
        });

        frm.add_custom_button(__('Download Files in ZIP'), async () => {
            try {
                await loadJSZip();
                if (!JSZip) return frappe.msgprint("JSZip loading error.");

                const zip = new JSZip();
                const tableMap = {
                    Monthly: frm.doc.monthly_table,
                    Quarterly: frm.doc.quarterly_table,
                    Annual: frm.doc.annual_table,
                    Miscellaneous: frm.doc.miscellaneous_table,
                };

                const filesToFetch = (tableMap[frm.active_tab_map[frm.doc.year_].label] || []).filter(row => row.__checked && row.document_upload);

                await Promise.all(filesToFetch.map(async row => {
                    const response = await fetch(row.document_upload);
                    if (response.ok) zip.file(row.document_upload.split('/').pop(), await response.blob());
                }));

                const content = await zip.generateAsync({ type: 'blob' });
                if (!Object.keys(zip.files).length) return frappe.msgprint("Please select rows to download files.");

                const link = document.createElement('a');
                link.href = URL.createObjectURL(new Blob([content], { type: 'application/zip' }));
                link.download = `${frm.doc.name}-${frm.active_tab_map[frm.doc.name].label}.zip`;
                link.click();
            } catch (error) {
                console.error("ZIP creation error:", error);
                frappe.msgprint("An error occurred. Check console for details.");
            }
        });


        $('.grid-add-row').remove()
        $('.grid-remove-rows').remove()
        $('.grid-remove-all-rows').remove()
    },
    before_save(frm) {
        frm.set_value('year_', frm.doc.year)
    },
    onload: async function (frm) {
        await child_tables_rows_limit(frm)
    },

});

frappe.ui.form.on('Compliance Data Child', {
    form_render: async function (frm, cdt, cdn) {
        row = frappe.get_doc(cdt, cdn)
        $('.grid-duplicate-row').remove()
        $('.btn-danger').remove()
        $('.grid-insert-row-below').remove()
        $('.grid-insert-row').remove()
        $('.grid-move-row').remove()
        $('.grid-footer-toolbar').remove()
        frm.cur_grid.grid_form.fields_dict.extended_due_date.$input.datepicker({ minDate: new Date(row.due_date) });
        if (row.extended_due_date) {
            frm.cur_grid.grid_form.fields_dict.actual_date.$input.datepicker({ minDate: new Date(row.extended_due_date) });
        } else {
            frm.cur_grid.grid_form.fields_dict.actual_date.$input.datepicker({ minDate: new Date(row.due_date) });
        }

    },
    extended_due_date(frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        if (new Date(row.extended_due_date) < new Date(row.due_date)) {
            row.extended_due_date = ''
            frappe.throw({ message: "'Extended Due Date' must be grater than the 'Due Date'.", indicator: 'red' });
        }
        if (row.extended_due_date) {
            frm.cur_grid.grid_form.fields_dict.actual_date.$input.datepicker({ minDate: new Date(row.extended_due_date) });
        } else {
            frm.cur_grid.grid_form.fields_dict.actual_date.$input.datepicker({ minDate: new Date(row.due_date) });
        }
    },
    actual_date(frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        if (new Date(row.actual_date) < new Date(row.extended_due_date)) {
            row.actual_date = ''
            frappe.throw({ message: "'Actual Date' must be grater than the 'Extended due date'.", indicator: 'red' });
        }
        // if (new Date(row.actual_date_2) < new Date(row.extended_due_date)) {
        //     row.actual_date_2 = ''
        //     frappe.throw({ message: "'Actual Date' must be grater than the 'Extended due date'.", indicator: 'red' });
        // }
        // if (new Date(row.actual_date_3) < new Date(row.extended_due_date)) {
        //     row.actual_date_3 = ''
        //     frappe.throw({ message: "'Actual Date' must be grater than the 'Extended due date'.", indicator: 'red' });
        // }
    }
})