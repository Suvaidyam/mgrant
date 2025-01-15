// Copyright (c) 2025, Suvaidyam and contributors
// For license information, please see license.txt

frappe.ui.form.on("RFP", {
	async refresh(frm) {

	},

});
frappe.ui.form.on("Evaluation and Review Criteria", {
	refresh(frm) {

	},
    weightage:async function(frm, cdt, cdn){
        let row = frappe.get_doc(cdt, cdn);
        if(row.weightage < 0){
            frappe.throw('Negative weightage is not allowed.')
            return;
        }
        let _total = frm?.doc?.evaluation_criterias?.map(r=>r.weightage)?.reduce((weightage, currentValue) => weightage + currentValue, 0);
        if(_total > 100){
            row.weightage = row.weightage + (100 - _total);
            frm.refresh_fields('weightage');
            let total = frm?.doc?.evaluation_criterias?.map(r=>r.weightage)?.reduce((weightage, currentValue) => weightage + currentValue, 0);
            frm.set_value('total', total)
            frappe.throw('Total weitage should be in range of 0 to 100.'+row.weightage);
            return;
        }
    }
});
