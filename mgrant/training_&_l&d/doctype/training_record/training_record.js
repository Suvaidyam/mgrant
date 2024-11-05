// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt

function calculate_total_days(frm) {
    // Check if both dates are present
    if (frm.doc.from_date && frm.doc.to_date) {
        // Calculate the total days between the two dates
        const totalDays = Math.ceil((new Date(frm.doc.to_date) - new Date(frm.doc.from_date)) / (1000 * 3600 * 24)) + 1;
        // Set the 'total_days' field, ensuring it is not negative
        frm.set_value('total_days', totalDays < 0 ? 0 : totalDays);
    } else {
        // If dates are not set, reset 'total_days' to 0
        frm.set_value('total_days', 0);
    }
}

function check_participants_length(frm) {
    if (frm.doc.participants && frm.doc.participants) {
        if (frm.doc.participants.length > frm.doc.number_of_participants) {
            frappe.throw({
                message: `The number of participants (${frm.doc.participants.length}) exceeds the specified limit of ${frm.doc.number_of_participants}.`
            });
        }
    }
}

frappe.ui.form.on("Training Record", {
    refresh(frm) {
        // hide_print_button(frm)
        // frm.set_df_property('theme', 'only_select', true);
        // frm.set_df_property('trainer', 'only_select', true);
    },
    validate(frm) {
        if (frm.doc.from_date > frm.doc.to_date) {
            frappe.throw({ message: "The 'From Date' must be earlier than then 'To Date'." })
        }

        check_participants_length(frm)
        if (frm.doc.participants.length < frm.doc.number_of_participants) {
            frappe.throw({
                message: `The number of participants ${frm.doc.participants.length} is less than the specified limit of ${frm.doc.number_of_participants}.`
            });
        }
    },
    from_date(frm) {
        frm.fields_dict.to_date.$input.datepicker({ minDate: new Date(frm.doc.from_date) });
        if (frm.doc.from_date > frm.doc.to_date) {
            frappe.show_alert({ message: "The 'From Date' must be earlier than then 'To Date'.", indicator: 'red' })
        }
        calculate_total_days(frm)
    },
    to_date(frm) {
        if (frm.doc.from_date > frm.doc.to_date) {
            frappe.show_alert({ message: "The 'From Date' date must be earlier than the 'To Date'.", indicator: 'red' })
        }
        calculate_total_days(frm)
    },
    trainer_type(frm) {
        if (frm.doc.trainer_type == 'External') {
            frm.set_value('trainer', '')
        } else {
            frm.set_value('trainer_name', '')
        }
    },
    number_of_participants(frm) {
        check_participants_length(frm)
    },
    participants(frm) {
        check_participants_length(frm)
    },
});
