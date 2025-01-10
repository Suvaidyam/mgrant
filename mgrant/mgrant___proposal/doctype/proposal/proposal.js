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

let PREV_STATES = [];
frappe.ui.form.on("Proposal", {
    refresh(frm) {
        frm.trigger('change_indicator_pill_content')
        if (frm.doc.states.length) {
            PREV_STATES = frm.doc.states;
        } else {
            PREV_STATES = [];
        }
        if (frm.doc.docstatus == 1 && frm.doc.grant) {
            frm.add_custom_button('Go to Grant', function () {
                frappe.set_route('Form', 'Grant', frm.doc.grant);
            });
        }
        setup_multiselect_dependency(frm, 'District', 'states', 'state', 'districts', 'state');
        setup_multiselect_dependency(frm, 'Block', 'districts', 'district', 'blocks', 'district');
        setup_multiselect_dependency(frm, 'Village', 'blocks', 'block', 'villages', 'block');
    },
    change_indicator_pill_content(frm) {
        let index = 0
        let interval = setInterval(() => {
            let indicatorPill = document.querySelector('.indicator-pill')
            if (indicatorPill) {
                indicatorPill.innerHTML = frm.doc?.docstatus == 1 ? "<span>Signed</span>" : "<span>Open</span>";
            }
            if (index > 20 || indicatorPill) {
                clearInterval(interval)
            }
            index++
        }, 500)
    },
    prev_states(frm) {
        if (frm.doc.states.length) {
            PREV_STATES = frm.doc.states;
        } else {
            PREV_STATES = [];
        }
    },
    states(frm) {
        let current_states = frm.doc.states;
        const removedStates = PREV_STATES.filter(state => !current_states.includes(state));
        if (removedStates.length) {
            const demography_focuses_related_to_rm_state = frm.doc.demography_focus.filter(df => removedStates.map((state) => state.state).includes(df.state));
            if (demography_focuses_related_to_rm_state.length) {
                frappe.msgprint(__("Please remove the state from Demography Focus to remove the state from Grant"));
                frm.set_value('states', PREV_STATES);
            } else {
                frm.trigger('prev_states');
            }
        } else {
            setup_multiselect_dependency(frm, 'District', 'states', 'state', 'districts', 'state');
            frm.set_value({ districts: [], blocks: [], villages: [] });
            frm.trigger('prev_states');
        }
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

frappe.ui.form.on("Demography Group Child", {
    form_render(frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        frm.cur_grid.get_field('state').get_query = function (doc, cdt, cdn) {
            return {
                filters: {
                    'name': ['IN', frm.doc.states.length ? frm.doc.states.map(state => state.state) : []]
                }
            }
        }

        frm.cur_grid.get_field('district').get_query = function (doc, cdt, cdn) {
            return {
                filters: {
                    'state': row.state || `Please Select State`
                }
            }
        }

        frm.cur_grid.get_field('block').get_query = function (doc, cdt, cdn) {
            return {
                filters: {
                    'district': row.district || `Please Select District`
                }
            }
        }

        frm.cur_grid.get_field('gram_panchayat').get_query = function (doc, cdt, cdn) {
            return {
                filters: {
                    'block': row.block || `Please Select Block`
                }
            }
        }

        frm.cur_grid.get_field('village').get_query = function (doc, cdt, cdn) {
            return {
                filters: {
                    'gram_panchayat': row.gram_panchayat || `Please Select Gram Panchayat`
                }
            }
        }
    },
    demography_focus_add(frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        frm.cur_grid.get_field('state').get_query = function (doc, cdt, cdn) {
            return {
                filters: {
                    'name': ['IN', frm.doc.states.length ? frm.doc.states.map(state => state.state) : []]
                }
            }
        }

        frm.cur_grid.get_field('district').get_query = function (doc, cdt, cdn) {
            return {
                filters: {
                    'state': row.state || `Please Select State`
                }
            }
        }

        frm.cur_grid.get_field('block').get_query = function (doc, cdt, cdn) {
            return {
                filters: {
                    'district': row.district || `Please Select District`
                }
            }
        }

        frm.cur_grid.get_field('gram_panchayat').get_query = function (doc, cdt, cdn) {
            return {
                filters: {
                    'block': row.block || `Please Select Block`
                }
            }
        }

        frm.cur_grid.get_field('village').get_query = function (doc, cdt, cdn) {
            return {
                filters: {
                    'gram_panchayat': row.gram_panchayat || `Please Select Gram Panchayat`
                }
            }
        }
    },
    state(frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        if (row.state) {
            frm.cur_grid.get_field('district').get_query = function (doc, cdt, cdn) {
                return {
                    filters: {
                        'state': row.state || `Please Select State`
                    }
                }
            }
        }
        frappe.model.set_value(cdt, cdn, 'district', '');
    },
    district(frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        if (row.district) {
            frm.cur_grid.get_field('block').get_query = function (doc, cdt, cdn) {
                return {
                    filters: {
                        'district': row.district || `Please Select District`
                    }
                }
            }
        }
        frappe.model.set_value(cdt, cdn, 'block', '');
    },
    block(frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        if (row.block) {
            frm.cur_grid.get_field('gram_panchayat').get_query = function (doc, cdt, cdn) {
                return {
                    filters: {
                        'block': row.block || `Please Select Block`
                    }
                }
            }
        }
        frappe.model.set_value(cdt, cdn, 'gram_panchayat', '');
    },
    gram_panchayat(frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        if (row.gram_panchayat) {
            frm.cur_grid.get_field('village').get_query = function (doc, cdt, cdn) {
                return {
                    filters: {
                        'gram_panchayat': row.gram_panchayat || `Please Select Gram Panchayat`
                    }
                }
            }
        }
        frappe.model.set_value(cdt, cdn, 'village', '');
    }
});
