// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt

async function set_options(frm) {
    const getRangeList = (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i);
    var days = getRangeList(1, 31)
    if (frm.doc.frequency === 'Monthly') {
        frm.set_df_property('date', 'options', ['', 'Start of the month', 'End of the month', ...days])
        if (frm.is_new()) {
            frm.set_value('due_date_reminder_days', 7)
        }
    } else if (frm.doc.frequency === 'Quarterly') {
        frm.set_df_property('date', 'options', ['', 'Start of the quarter', 'End of the quarter'])
        if (frm.is_new()) {
            frm.set_value('due_date_reminder_days', 15)
        }
    } else if (frm.doc.frequency === 'Annual') {
        frm.set_df_property('date', 'options', ['', 'Start of the month', 'End of the month', ...days])
        if (frm.is_new()) {
            frm.set_value('due_date_reminder_days', 30)
        }
    } else if (frm.doc.frequency === '5 Years') {
        frm.set_df_property('date', 'options', ['', ...days])
        if (frm.is_new()) {
            frm.set_value('due_date_reminder_days', 30)
        }
    }
}

function check_due_date_reminder_days(frm) {
    const maxReminderDays = {
        'Monthly': 15,
        'Quarterly': 30,
        'Annual': 30,
        '5 Years': 30,
        'One time': 30,
        'Ad hoc': 30
    };

    if (frm.doc.due_date_reminder_days > maxReminderDays[frm.doc.frequency]) {
        frappe.throw({
            message: `'Due Date Reminder (Days)' can't be greater than ${maxReminderDays[frm.doc.frequency]} Days.`
        });
    }
}

frappe.ui.form.on("Compliance", {
    async refresh(frm) {
        let allYears = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);
        frm.set_df_property('start_year', 'options', allYears.join('\n'));
        frm.refresh_field('start_year');
        frm.set_df_property('parent_compliance', 'only_select', true);
        await set_options(frm)
    },
    validate(frm) {
        check_due_date_reminder_days(frm)
    },
    is_group(frm) {
        if (frm.doc.is_group == true) {
            frm.set_value('parent_compliance', '')
            frm.set_value('frequency', '')
            frm.set_value('date', '')
            frm.set_value('month', '')
            frm.set_value('start_year', '')
            frm.set_value('due_date_reminder_days', '')
        }
    },
    async frequency(frm) {
        frm.set_value('start_year', '')
        frm.set_value('month', '')
        frm.set_value('date', '')
        await set_options(frm)
    },
    due_date_reminder_days(frm) {
        check_due_date_reminder_days(frm)
    }

});