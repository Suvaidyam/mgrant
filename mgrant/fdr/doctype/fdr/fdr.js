// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt

var minDate = new Date(new Date().getFullYear(), 0, 1);

function set_interest_as_per_fd(frm) {
    if (frm.doc.fd_principal_amount && frm.doc.actual_maturity_amount) {
        frm.set_value('interest_as_per_fd', (frm.doc.actual_maturity_amount || 0) - (frm.doc.fd_principal_amount || 0))
    }
}

async function set_maturity_amount_si_basis(frm) {
    const { date_of_issue, date_of_maturity, pre_matured_date, pre_matured_date_, fd_principal_amount, rate_of_interest } = frm.doc;

    const endDate = pre_matured_date_ === 'No' ? date_of_maturity : pre_matured_date;
    const number_of_days = endDate ? Math.ceil((new Date(endDate) - new Date(date_of_issue)) / (1000 * 3600 * 24)) + 1 : 0;

    const maturity_amount_si_basis = (fd_principal_amount || 0) * (1 + (number_of_days * (rate_of_interest || 0)) / (365 * 100));
    frm.set_value('maturity_amount_si_basis', maturity_amount_si_basis);
}


frappe.ui.form.on("FDR", {
    refresh(frm) {
        frm.fields_dict.date_of_issue.$input.datepicker({ minDate: minDate });
    },
    async validate(frm) {
        await validate_date(frm.doc.date_of_issue, '>', frm.doc.date_of_maturity, "The 'Date of Issue'  must be earlier than the 'Date of Maturity'.");
        await validate_date(frm.doc.date_of_issue, '>', frm.doc.pre_matured_date, "'Pre Matured Date' should be after 'Date of Issue'");
        await validate_date(frm.doc.date_of_maturity, '<', frm.doc.pre_matured_date, "'Pre Matured Date' should be earlier than 'Date of Maturity'");
        await validate_date(minDate, '>', frm.doc.date_of_issue, "The 'Date of Issue' can't be earlier than January 1st of the current year.");
    },
    async rate_of_interest(frm) {
        await set_maturity_amount_si_basis(frm)
        if (frm.doc.rate_of_interest > 99.99) {
            frappe.throw({ message: "Rate of Interest can't be greater than '99.99'." });
        }
    },
    async fd_receipt_no(frm) {

    },
    async fd_principal_amount(frm) {
        set_interest_as_per_fd(frm)
        await set_maturity_amount_si_basis(frm)
    },
    async actual_maturity_amount(frm) {
        set_interest_as_per_fd(frm)
    },
    async date_of_issue(frm) {
        frm.fields_dict.date_of_maturity.$input.datepicker({ minDate: new Date(frm.doc.date_of_issue) });
        frm.fields_dict.pre_matured_date.$input.datepicker({ minDate: new Date(frm.doc.date_of_issue), maxDate: new Date(frm.doc.date_of_maturity) });
        await set_maturity_amount_si_basis(frm)
        await validate_date(frm.doc.date_of_issue, '>', frm.doc.date_of_maturity, "The 'Date of Issue'  must be earlier than the 'Date of Maturity'.");
        await validate_date(minDate, '>', frm.doc.date_of_issue, "The 'Date of Issue' can't be earlier than January 1st of the current year.");
    },
    async date_of_maturity(frm) {
        frm.fields_dict.pre_matured_date.$input.datepicker({ minDate: new Date(frm.doc.date_of_issue), maxDate: new Date(frm.doc.date_of_maturity) });
        await validate_date(frm.doc.date_of_issue, '>', frm.doc.date_of_maturity, "The 'Date of Issue'  must be earlier than the 'Date of Maturity'.");
        await set_maturity_amount_si_basis(frm)
    },
    async pre_matured_date_(frm) {
        if (frm.doc.pre_matured_date_ == 'No') {
            frm.set_value('pre_matured_date', '')
        }
    },
    async pre_matured_date(frm) {
        await set_maturity_amount_si_basis(frm)
        await validate_date(frm.doc.date_of_issue, '>', frm.doc.pre_matured_date, "'Pre Matured Date' should be after 'Date of Issue'");
        await validate_date(frm.doc.date_of_maturity, '<', frm.doc.pre_matured_date, "'Pre Matured Date' should be earlier than 'Date of Maturity'");

        // Apply highlight to the field label of 'Actual Maturity Amount'
        if (frm.doc.pre_matured_date_ == 'Yes') {
            frm.fields_dict['actual_maturity_amount'].$wrapper.find('label').css("color", "red"); // Change label color to red
            // Optionally, reset the label color after a few seconds
            setTimeout(function () {
                frm.fields_dict['actual_maturity_amount'].$wrapper.find('label').css("color", "");
            }, 2000); // Reset after 2 seconds
        }
    },
});
