// Copyright (c) 2024, Abhishek Yadav and contributors
// For license information, please see license.txt


async function remove_some_action_button() {
    $('.grid-duplicate-row').remove()
    $('.btn-danger').remove()
    $('.grid-insert-row-below').remove()
    $('.grid-insert-row').remove()
    $('.grid-move-row').remove()
    $('.grid-footer-toolbar').remove()
}


// Function to generate monthly compliance dates and add to the child table
async function generateMonthlyComplianceDates(frm, response) {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    if (frm.doc.quarterly_table.length > 0) {
        await frm.clear_table('monthly_table');
    }
    const compliance_due_date = [];
    const currentYear = frm.doc.year.split("-")[0];
    response.message.forEach(data => {
        if (!data.is_group && data.frequency === 'Monthly') {
            let complianceDateInfo = {
                name: data.name,
                type: 'Month',
                compliance_name: data.name1
            };
            // Iterate through the months starting from this one to add future months' dates
            monthNames.forEach((nextMonth, i) => {
                let dueYear = currentYear; // Keep it as current year
                let dueMonthIndex = i; // Use i directly for the month index
                let dueDate;
                if (data.day === 'Start of the month') {
                    dueDate = new Date(dueYear, dueMonthIndex, 1); // 1st day of the month
                } else if (data.day === 'End of the month') {
                    dueDate = new Date(dueYear, dueMonthIndex + 1, 0); // Last day of the month
                } else if (!isNaN(parseInt(data.day))) {
                    dueDate = new Date(dueYear, dueMonthIndex, parseInt(data.day)); // Specific day of the month
                }
                complianceDateInfo[nextMonth] = frappe.datetime.obj_to_str(dueDate);
            });
            compliance_due_date.push(complianceDateInfo);
        }
    });

    // Now add the compliance dates to the monthly table in the form
    compliance_due_date.forEach(item => {
        if (item.compliance_name !== 'Child Protection' &&
            item.compliance_name !== 'Whistle-blower' &&
            item.compliance_name !== 'Grievances Redressal' &&
            item.compliance_name !== 'POSH (Prevention of Sexual Harassment)') {

            const childRow = frm.add_child('monthly_table');
            childRow.compliance = item.name;
            childRow.compliance_name = item.compliance_name;
            // Add custom fields for each month with due dates
            monthNames.forEach(month => {
                childRow[month.toLowerCase()] = item[month]; // Use lowercase for field names
            });
        }
    });

    frm.refresh_field('monthly_table');
}

async function generateQuarterlyComplianceDates(frm, response) {
    const currentYear = frm.doc.year.split("-")[0];
    if (frm.doc.quarterly_table.length > 0) {
        frm.clear_table('quarterly_table');
    }
    response.message.forEach(data => {
        if (!data.is_group && data.frequency === 'Quarterly') {
            // Create an object to store quarterly due dates
            let complianceDateInfo = {
                name: data.name,
                compliance_name: data.name1,
                type: 'Quarter',
                Q1_due: null,
                Q2_due: null,
                Q3_due: null,
                Q4_due: null
            };
            // Handle Quarterly Frequency
            if (data.frequency === 'Quarterly') {

                // Set quarterly due dates based on the financial year
                complianceDateInfo.Q1_due = frappe.datetime.obj_to_str(new Date(currentYear, 5, 30));  // End of Q1: June 30
                complianceDateInfo.Q2_due = frappe.datetime.obj_to_str(new Date(currentYear, 8, 30));  // End of Q2: September 30
                complianceDateInfo.Q3_due = frappe.datetime.obj_to_str(new Date(currentYear, 11, 31)); // End of Q3: December 31
                complianceDateInfo.Q4_due = frappe.datetime.obj_to_str(new Date(Number(currentYear) + 1, 2, 31)); // End of Q4: March 31 next year

                // Adjust due dates based on data.day
                if (data.day === 'End of the quarter') {

                    // No need to change as they are already end dates
                } else if (data.day === 'Start of the quarter') {
                    complianceDateInfo.Q1_due = frappe.datetime.obj_to_str(new Date(currentYear, 3, 1)); // Start of Q1: April 1
                    complianceDateInfo.Q2_due = frappe.datetime.obj_to_str(new Date(currentYear, 6, 1)); // Start of Q2: July 1
                    complianceDateInfo.Q3_due = frappe.datetime.obj_to_str(new Date(currentYear, 9, 1)); // Start of Q3: October 1
                    complianceDateInfo.Q4_due = frappe.datetime.obj_to_str(new Date(Number(currentYear) + 1, 0, 1)); // Start of Q4: January 1 next year
                } else if (!isNaN(parseInt(data.day))) {
                    const day = parseInt(data.day);
                    complianceDateInfo.Q1_due = frappe.datetime.obj_to_str(new Date(currentYear, 5, day)); // Specific day in Q1
                    complianceDateInfo.Q2_due = frappe.datetime.obj_to_str(new Date(currentYear, 8, day)); // Specific day in Q2
                    complianceDateInfo.Q3_due = frappe.datetime.obj_to_str(new Date(currentYear, 11, day)); // Specific day in Q3
                    complianceDateInfo.Q4_due = frappe.datetime.obj_to_str(new Date(Number(currentYear) + 1, 2, day)); // Specific day in Q4
                }
                // Add a new row in the quarterly_table
                const row = frm.add_child('quarterly_table'); // Assuming you have a child table for quarterly data
                row.compliance = complianceDateInfo.name;      // Assign name to compliance
                row.compliance_name = complianceDateInfo.compliance_name; // Assign compliance_name to compliance_
                row.april_june = complianceDateInfo.Q1_due;       // Assign due dates to respective fields
                row.july_september = complianceDateInfo.Q2_due;
                row.october_december = complianceDateInfo.Q3_due;
                row.january_march = complianceDateInfo.Q4_due;
            }
        }
    });
    frm.refresh_field('quarterly_table'); // Refresh the quarterly table after adding rows
}

async function send_email(frm) {
    await frappe.call({
        method: 'mgrant.apis.compliance_calendar.compliance.send_email',
        args: {
            doctype_name: 'Compliance Annual Plan',
        },
        callback(response) {
            console.log('response :>> ', response);
        }
    });
}
let year_valid_log;
async function cp_five_early_validation(frm) {
    await frappe.call({
        method: 'mgrant.apis.compliance_calendar.compliance.cp_five_early_validation',
        args: {
            year: frm.doc.year
        },
        freeze: true,
        callback(response) {
            year_valid_log = response.message
        }
    });
}
let freeze_annual_rows;
let freeze_monthly_rows;
let freeze_quarterly_rows;
let freeze_miscellaneous_row;

function customFreeze() {
    if (!document.getElementById('freeze-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'freeze-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = 1000;
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.color = '#fff';
        overlay.style.fontSize = '20px';
        overlay.innerHTML = 'Loading...';
        document.body.appendChild(overlay);
    }
}

function customUnfreeze() {
    const overlay = document.getElementById('freeze-overlay');
    if (overlay) {
        document.body.removeChild(overlay);
    }
}
async function locked_due_Date(frm) {
    try {
        // Custom freeze the UI before all API calls
        customFreeze();

        // Annual
        let res = await frappe.call({ method: 'mgrant.apis.compliance_calendar.compliance.anm_tracking', args: { year: frm.doc.year, table_name: 'annual_table' } });
        freeze_annual_rows = res.message;

        // Monthly
        let monthly = await frappe.call({ method: 'mgrant.apis.compliance_calendar.compliance.monthly_quarterly_tracking', args: { year: frm.doc.year, table_name: 'monthly_table' } });
        freeze_monthly_rows = monthly.message;

        // Quarterly
        let quarterly = await frappe.call({ method: 'mgrant.apis.compliance_calendar.compliance.monthly_quarterly_tracking', args: { year: frm.doc.year, table_name: 'quarterly_table' } });
        freeze_quarterly_rows = quarterly.message;

        // Miscellaneous
        let miscellaneous = await frappe.call({ method: 'mgrant.apis.compliance_calendar.compliance.anm_tracking', args: { year: frm.doc.year, table_name: 'miscellaneous_table' } });
        freeze_miscellaneous_row = miscellaneous.message;

    } catch (error) {
        console.error("Error fetching data:", error);
        frappe.show_alert({ message: `An error occurred: ${error.message || "Unknown error"}`, indicator: 'red' });
    } finally {
        // Custom unfreeze the UI after all API calls
        customUnfreeze();
    }
}



frappe.ui.form.on("Compliance Annual Plan", {
    async refresh(frm) {
        hide_print_button(frm)
        frm.add_custom_button(__('Send Email'), async function () {
            await send_email();
        });
        frm.add_custom_button(__('Go to Tracking'), function () {
            frappe.set_route("Form", "Compliance Tracking", frm.doc.year);
        });
        // Remove the default button to add rows in the grid
        $('.grid-add-row').remove()
        // Remove the default button to remove rows in the grid
        $('.grid-remove-rows').remove()
        // Remove the default button to remove all rows in the grid
        $('.grid-remove-all-rows').remove()
    },
    async onload(frm) {
        if (!frm.is_new()) {
            await locked_due_Date(frm)
        } else {
            let currentYear = new Date().getFullYear();
            let years = Array.from({ length: 11 }, (_, i) => `${currentYear - 5 + i}-${(currentYear - 4 + i).toString().slice(-2)}`);
            // let defaultYear = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;  // Current financial year
            // frm.set_value('year', defaultYear);  // Set the default value to the current financial year
            frm.set_df_property('year', 'options', years.join('\n'));
            frm.refresh_field('year');
        }

    },
    validate(frm) {
        frm.set_value('year_', frm.doc.year)
    },
    async year(frm) {
        if (frm.is_new()) {
            await cp_five_early_validation(frm)
        }
        await frappe.call({
            method: 'mgrant.apis.api.get_list_event',
            args: {
                doctype_name: 'Compliance', filter: { 'is_group': false }, fields: ['name', 'name1', 'parent_compliance', 'frequency', 'start_year', 'month', 'day', 'due_date_reminder_days', 'is_group']
            },
            callback: function (response) {
                const compliance_due_date = [];
                const currentYear = frm.doc.year.split("-")[0];
                generateMonthlyComplianceDates(frm, response);
                generateQuarterlyComplianceDates(frm, response)
                response.message.forEach(data => {
                    if (!data.is_group) {
                        let complianceDateInfo = {};
                        // Handling For Annual frequency compliance
                        if (data.frequency === 'Annual') {
                            const month = new Date(`${data.month} 1, ${currentYear}`).getMonth();
                            const specificDay = data.day === 'Start of the month' ? 1 :
                                data.day === 'End of the month' ? new Date(currentYear, month + 1, 0).getDate() :
                                    parseInt(data.day);
                            complianceDateInfo = {
                                name: data.name,
                                compliance_name: data.name1,
                                date: frappe.datetime.obj_to_str(new Date(currentYear, month, specificDay)),
                                type: 'Annual Date'
                            };
                        }
                        // Handling for 5-year frequency compliance
                        else if (data.frequency === '5 Years') {
                            const fiveYearDate = new Date(parseInt(data.start_year) + 5, new Date(`${data.month} 1`).getMonth(), parseInt(data.day));
                            if (!isNaN(fiveYearDate.getTime())) {
                                complianceDateInfo = {
                                    name: data.name,
                                    compliance_name: data.name1,
                                    frequency: data.frequency,
                                    date: frappe.datetime.obj_to_str(fiveYearDate),
                                    type: '5-Year',
                                    start_year: data.start_year
                                };
                            }
                        }
                        // Push valid compliance date info to the array
                        if (complianceDateInfo.name && complianceDateInfo.date) {
                            compliance_due_date.push(complianceDateInfo);
                        }
                    }
                });
                // Call the function to handle monthly due dates and add them to the child table
                if (frm.doc.annual_table.length > 0) {
                    frm.clear_table('annual_table');
                }
                if (frm.doc.miscellaneous_table.length > 0) {
                    frm.clear_table('miscellaneous_table');
                }
                compliance_due_date.forEach(item => {
                    if (item.type === 'Annual Date') {
                        const childRow = frm.add_child('annual_table');
                        childRow.compliance = item.name;
                        childRow.compliance_name = item.compliance_name;
                        childRow.due_date = item.date;
                    }
                });
                frm.refresh_field('annual_table');

                compliance_due_date.forEach(item => {
                    if ((item.type === '5-Year' && parseInt(item.start_year, 10) <= frm.doc.year.split("-")[0]) &&
                        !year_valid_log.some(log => log.compliance === item.name)) {
                        const childRow = frm.add_child('miscellaneous_table');
                        Object.assign(childRow, {
                            compliance: item.name,
                            compliance_name: item.compliance_name,
                            frequency: item.frequency,
                            due_date: item.date
                        });
                    }
                });
                response.message.forEach(item => {
                    if (item.frequency === 'Ad hoc' || item.frequency === 'One time' && !year_valid_log.some(log => log.compliance === item.name)) {
                        const childRow = frm.add_child('miscellaneous_table');
                        childRow.compliance = item.name;
                        childRow.compliance_name = item.name1;
                        childRow.frequency = item.frequency;
                    }
                });
                frm.refresh_field('miscellaneous_table');
            }
        });
    }
});

function check_row_due_date(frm, cdt, cdn, due_date) {
    let row = frappe.get_doc(cdt, cdn);
    if (new Date(row[due_date]) < new Date(frm.doc.year.split("-")[0], 0, 1)) {
        frappe.model.set_value(cdt, cdn, due_date, '')
        frappe.throw({ message: 'Due Date must be greater than the start of the year.', indicator: 'red' });
    }
}
frappe.ui.form.on('Annual Compliance Child', {
    form_render: async function (frm, cdt, cdn) {
        await remove_some_action_button()
        if (!frm.is_new() && freeze_annual_rows && freeze_annual_rows.includes(frm.cur_grid.doc.name)) {
            frm.cur_grid.set_field_property('due_date', 'read_only', 1)
        }
    },
    due_date(frm, cdt, cdn) {
        check_row_due_date(frm, cdt, cdn, 'due_date')
    }
})

frappe.ui.form.on('Monthly Compliance Child', {
    form_render: async function (frm, cdt, cdn) {
        await remove_some_action_button()
        if (!frm.is_new() && freeze_monthly_rows && freeze_monthly_rows[frm.cur_grid.doc.name]) {
            for (let field of freeze_monthly_rows[frm.cur_grid.doc.name]) {
                frm.cur_grid.set_field_property(field, 'read_only', 1)
            }
        }
        // frm.fields_dict.due_date.$input.datepicker({ minDate: new Date() });
    },
    january(frm, cdt, cdn) {
        row = frappe.get_doc(cdt, cdn)
        check_row_due_date(frm, cdt, cdn, 'january')
    },
    february(frm, cdt, cdn) {
        check_row_due_date(frm, cdt, cdn, 'february')
    },
    march(frm, cdt, cdn) {
        check_row_due_date(frm, cdt, cdn, 'march')
    },
    april(frm, cdt, cdn) {
        check_row_due_date(frm, cdt, cdn, 'april')
    },
    may(frm, cdt, cdn) {
        check_row_due_date(frm, cdt, cdn, 'may')
    },
    june(frm, cdt, cdn) {
        check_row_due_date(frm, cdt, cdn, 'june')
    },
    july(frm, cdt, cdn) {
        check_row_due_date(frm, cdt, cdn, 'july')
    },
    august(frm, cdt, cdn) {
        check_row_due_date(frm, cdt, cdn, 'august')
    },
    september(frm, cdt, cdn) {
        check_row_due_date(frm, cdt, cdn, 'september')
    },
    october(frm, cdt, cdn) {
        check_row_due_date(frm, cdt, cdn, 'october')
    },
    november(frm, cdt, cdn) {
        check_row_due_date(frm, cdt, cdn, 'november')
    },
    december(frm, cdt, cdn) {
        check_row_due_date(frm, cdt, cdn, 'december')
    },
})
frappe.ui.form.on('Quarterly Compliance Child', {
    form_render: async function (frm, cdt, cdn) {
        await remove_some_action_button()
        if (!frm.is_new() && freeze_quarterly_rows && freeze_quarterly_rows[frm.cur_grid.doc.name]) {
            for (let field of freeze_quarterly_rows[frm.cur_grid.doc.name]) {
                frm.cur_grid.set_field_property(field.replace('-', '_'), 'read_only', 1)
            }
        }
    },
    april_june(frm, cdt, cdn) {
        check_row_due_date(frm, cdt, cdn, 'april_june')
    },
    july_september(frm, cdt, cdn) {
        check_row_due_date(frm, cdt, cdn, 'july_september')
    },
    october_december(frm, cdt, cdn) {
        check_row_due_date(frm, cdt, cdn, 'october_december')
    },
    january_march(frm, cdt, cdn) {
        check_row_due_date(frm, cdt, cdn, 'january_march')
    },
})

frappe.ui.form.on('Miscellaneous Compliance Child', {
    form_render: async function (frm, cdt, cdn) {
        await remove_some_action_button()
        var minDate = new Date(frm.doc.year.split("-")[0], 0, 1);
        frm.cur_grid.grid_form.fields_dict.due_date.$input.datepicker({ minDate: minDate });
        if (!frm.is_new() && freeze_miscellaneous_row && freeze_miscellaneous_row.includes(frm.cur_grid.doc.name)) {
            frm.cur_grid.set_field_property('due_date', 'read_only', 1)
        }
    },
    due_date(frm, cdt, cdn) {
        check_row_due_date(frm, cdt, cdn, 'due_date')
    }
})