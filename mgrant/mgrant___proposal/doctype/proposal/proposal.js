// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt

function getMonthDifference(startDate, endDate) {
    // Parse the date strings into Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
        frappe.msgprint(__({ message: "End Date should be greater than Start Date" }));
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
frappe.model.on('Proposal', '*', function () {
    cur_frm.page.btn_primary.show();
})

frappe.ui.form.on("Proposal", {
    onload_post_render: (frm) => {
        renderRibbons(frm)
    },
    async onload(frm) {
        if (!frm.is_new()) {
            frm.page.btn_primary.hide();
        }

        if (frappe.mgrant_settings.module == "Donor") {
            if (frappe.user_roles.includes('NGO Admin') && frm.doc.application_status == "Completed") {
                frm.disable_form()
            }
        }
        let index = 0;
        let submit_banner;
        let interval = setInterval(() => {
            index++;
            submit_banner = document.querySelector('.form-message.blue');
            if (index > 20) {
                clearInterval(interval);
            }
            if (submit_banner) {
                submit_banner.style.display = 'none';
                clearInterval(interval);
            }
        }, 500);
    },
    async refresh(frm) {
        renderRibbons(frm)
        if (frm.is_new()) {
            let donor = await frappe.db.get_list('Donor', { limit: 1, pluck: 'name', order_by: 'creation desc' })
            if (donor.length > 0) {
                frm.set_value("donor", donor[0])
            }
            let ngo = await frappe.db.get_list('NGO', { limit: 1, pluck: 'name', filters: { 'is_blacklisted': 0 }, order_by: 'creation ASC' })
            if (ngo.length > 0) {
                frm.set_value("ngo", ngo[0])
            }
        } else {
            frm.page.btn_primary.hide();
        }
        // frm.trigger('change_indicator_pill_content')
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
        if (frappe?.mgrant_settings?.module == "Donor") {
            if (frm.doc?.rfp && !frm.doc?.donor) {
                let res = await frappe.db.get_value('RFP', frm.doc?.rfp, 'donor')
                if (res?.message?.donor) {
                    frm.set_value('donor', res?.message?.donor)
                    frm.refresh_field('donor')
                    // await frappe.db.set_value('Proposal',frm.doc?.name, 'donor',res?.message?.donor )
                }
            }
        }
        setup_multiselect_dependency(frm, 'District', 'states', 'state', 'districts', 'state');
        setup_multiselect_dependency(frm, 'Block', 'districts', 'district', 'blocks', 'district');
        setup_multiselect_dependency(frm, 'Village', 'blocks', 'block', 'villages', 'block');

        if (frm.doc?.rfp) {
            let rfp_doc = await frappe.db.get_doc('RFP', frm.doc?.rfp)
            if (rfp_doc?.additional_questions?.length) {
                const wrapper = document.querySelector('[data-fieldname="additional_questions"]');
                sva_render_form(wrapper, rfp_doc?.additional_questions, (doc) => {
                    // console.log("onSubmit", doc);
                });
            }
        }
        sign_off_prerequisite = await frappe.db.get_single_value('mGrant Settings', 'sign_off_prerequisite').then(value => {
            return value
        });
        if (frm.doc?.stage == sign_off_prerequisite) {
            frm.add_custom_button('Download MOU', async function () {
                let proposal = frm.doc.name;
                window.location.href = `/api/method/mgrant.controllers.proposal.proposal.generate_mou_doc?proposal=${proposal}`;
            });
        } else {
            frm.remove_custom_button('Download MOU');
        }

    },
    after_save(frm) {
        if (frappe.mgrant_settings.module == "Donor") {
            if (frappe.user_roles.includes('NGO Admin') && frm.doc.application_status == "Completed") {
                frm.set_df_property('application_status', 'read_only', 1)
            }
        }
    },
    before_save(frm) {
        if (frappe.mgrant_settings.module == "Donor") {
            if (frappe.user_roles.includes('NGO Admin') && frm.doc.application_status == "Completed") {
                frm.set_value('stage', 'Proposal Submitted')
            }
        }
    },
    // change_indicator_pill_content(frm) {
    //     let index = 0
    //     let interval = setInterval(() => {
    //         let indicatorPill = document.querySelector('.indicator-pill')
    //         if (indicatorPill) {
    //             indicatorPill.innerHTML = frm.doc?.docstatus == 1 ? "<span>Signed</span>" : "<span>Open</span>";
    //         }
    //         if (index > 20 || indicatorPill) {
    //             clearInterval(interval)
    //         }
    //         index++
    //     }, 500)
    // },
    mou_verified(frm) {
        if (!frm.doc.mou_signed_document) {
            frappe.msgprint(__("Please upload the MoU signed document"));
            frm.set_value('mou_verified', 0);
        }
    },
    mou_signed_document(frm) {
        if (!frm.doc.mou_signed_document) {
            frm.set_value('mou_verified', 0);
        }
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
    rfp: async (frm) => {
        if (frappe?.mgrant_settings?.module == "Donor") {
            if (frm.doc?.rfp && !frm.doc?.donor) {
                let res = await frappe.db.get_value('RFP', frm.doc?.rfp, 'donor')
                frm.set_value('donor', res?.message?.donor)
                frm.refresh_field('donor')
            }
        }
    },
    validate(frm) {
        if (frm.doc.start_date && frm.doc.end_date) {
            const start = new Date(frm.doc.start_date);
            const end = new Date(frm.doc.end_date);
            if (start > end) {
                frappe.throw(__({ message: "End Date should be greater than Start Date" }));
                frappe.validated = false
                return false;
            }
        }
        // if (!frm.doc.mou_signed_document || frm.doc.mou_verified == 0) {
        //     console.log(frm.doc.mou_signed_document, frm.doc.mou_verified);
        //     frappe.msgprint(__('You cannot proceed to the next stage until MoU is verified.'));
        //     frm.set_value('donor_stage', 'MoU Signing ongoing');
        //     frappe.validated = false;
        //     return false;
        // }
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

const renderRibbons = (frm) => {
    const stages = frappe.boot.mgrant_settings.proposal_stages.map((stage) => stage.stage);
    const positive = frappe.boot.mgrant_settings.positive;
    const negative = frappe.boot.mgrant_settings.negative;
    const currentStageIndex = stages.indexOf(frm.doc.stage);

    function getStageClass(stage, index) {
        if (index < currentStageIndex) return "complete";
        if (index === currentStageIndex) return "current";
        return "";
    }

    function getStageColor(stage, isCurrent, isComplete) {
        if (stage === negative && isCurrent) return "#e60000";
        if (stage === positive && isCurrent) return "#008000";
        if (isComplete) return "rgba(174, 172, 172, 0.71)"; // Gray color for completed stages
        return isCurrent ? "#801621" : "#F3F3F3";
    }

    const progress_bar = `
    <div class="custom-progress-bar">
        <button class="prev-button" onclick="scrollStepper(-1)">&#10094;</button>
        <ul class="stepper">
            ${stages
            .map((stage, index) => {
                const isComplete = index < currentStageIndex;
                const stageClass = getStageClass(stage, index);
                const stageColor = getStageColor(stage, index === currentStageIndex, isComplete);
                const icon = stage === positive ? "👍" : stage === negative ? "👎" : "";
                return `<li class="stepper__item ${stageClass}" style="background-color: ${stageColor};">${stage} ${icon}</li>`;
            })
            .join("")}
        </ul>
        <button class="next-button" onclick="scrollStepper(1)">&#10095;</button>
    </div>`;

    const style = `
<style>
    .custom-progress-bar {
        width: 100%;
        overflow: hidden;
        position: relative;
        padding: 8px 10px;
    }

    .stepper {
        display: flex;
        padding: 0;
        width: 100%;
        list-style: none;
        position: relative;
        justify-content: center;
        overflow: hidden;
        white-space: nowrap;
        scroll-behavior: smooth;
    }
    ul {
        padding: 0;
        margin: 0;
    }

    .stepper__item {
        flex: 1;
        padding: 0 30px;
        margin: 0 -3px;
        text-align: center;
        font-size: 14px;
        font-weight: 500;
        height: 32px; /* Set height to 32px */
        line-height: 32px; /* Center text vertically */
        -webkit-clip-path: polygon(10px 50%, 0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%);
    }

    .stepper__item.current {
        font-weight: bold;
        color: #FFFFFF;
    }

    .stepper__item.complete {
        color: white;
        background:rgba(169, 169, 169, 0.87); /* Gray color for completed stages */
    }

    .stepper__item:first-child {
        -webkit-clip-path: polygon(0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%);
    }

    .stepper__item:last-child {
        -webkit-clip-path: polygon(10px 50%, 0% 0%, 100% 0%, 100% 100%, 0% 100%);
    }

    .prev-button, .next-button {
        background-color: #ddd;
        border: none;
        color: black;
        cursor: pointer;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1;
        height: calc(100% - 16px); /* Adjust height to match stepper item height */
    }

    .prev-button {
        left: 0;
    }

    .next-button {
        right: 0;
    }

    .prev-button:hover, .next-button:hover {
        background-color: #bbb;
    }

    @media (max-width: 768px) {
        .stepper {
            padding-left: 15px; /* Add padding to make the first stage visible */
        }
        .stepper__item {
            padding: 0 15px;
            font-size: 12px;
        }
    }

    @media (max-width: 480px) {
        .stepper {
            padding-left: 10px; /* Add padding to make the first stage visible */
        }
        .stepper__item {
            padding: 0 10px;
            font-size: 10px;
        }
    }
</style>`;

    const wrapper = frm.$wrapper.find(".form-dashboard");
    wrapper.find(".custom-progress-bar").remove();
    wrapper.prepend(progress_bar + style);

    window.scrollStepper = (direction) => {
        const stepper = document.querySelector('.stepper');
        const scrollAmount = stepper.clientWidth / 2;
        stepper.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    };
};