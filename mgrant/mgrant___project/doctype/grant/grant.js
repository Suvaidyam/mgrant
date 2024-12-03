// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt

const getDocList = (doctype, filters, fields = ['*']) => {
    return new Promise((resolve, reject) => {
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype,
                filters,
                fields,
                order_by: 'creation desc'
            },
            callback: function (response) {
                resolve(response.message);
            },
            error: (err) => {
                reject(err)
            }
        });
    })
}

async function set_value(doctype_name, name) {
    frappe.call({
        "method": "frappe.client.set_value",
        "args": {
            "doctype": doctype_name,
            "name": name,
            "fieldname": {
                "seen": 1
            },
        }
    });
}

const getViewSettings = (doctype) => {
    return new Promise((resolve, reject) => {
        frappe.call({
            method: "frappe_theme.api.get_my_list_settings",
            args: { doctype: doctype },
            callback: function (response) {
                if (response.message) {
                    resolve(response.message);
                } else {
                    reject(new Error('No message returned from server.'));
                }
            },
            error: (err) => {
                console.error('Permission error:', err);
                reject(new Error('You do not have permission to access this resource.'));
            }
        });
    });
}

const tabContent = async (frm, tab_field) => {
    if (tab_field === 'gallery_tab') {
        gallery_image(frm);
    }
    if (tab_field === 'email_tab') {
        cominucation(frm);
    }
    if (tab_field === 'tasks_tab') {
        getTaskList(frm)
    }
}

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

frappe.ui.form.on("Grant", {
    // form-footer
    async refresh(frm) {
        $('.form-footer').remove()
        document.querySelectorAll('.timeline-dot').forEach(function (dot) {
            dot.style.display = 'none'; // Hides the timeline dot
        });

        let tab_field = frm.get_active_tab()?.df?.fieldname;
        tabContent(frm, tab_field)
        $('a[data-toggle="tab"]').on('shown.bs.tab', async function (e) {
            let tab_field = frm.get_active_tab()?.df?.fieldname;
            tabContent(frm, tab_field)
        });
        setup_multiselect_dependency(frm, 'District', 'states', 'state', 'districts', 'state');
        setup_multiselect_dependency(frm, 'Block', 'districts', 'district', 'blocks', 'district');
        setup_multiselect_dependency(frm, 'Village', 'blocks', 'block', 'villages', 'block'); 
        if (!frm.is_new() && frm?.timeline?.timeline_wrapper) {
            document.getElementById('timeline').innerHTML = `
        <style>
            #timeline-container {
                width: 100%;
                display: flex;
                justify-content: space-between;
            }
            #timeline{
                min-width:450px;
            }
            #data-timeline{
                width:100%;
                margin-left:30px;
            }
            #timeline, #data-timeline {
                height: 100vh;
                overflow-y: auto; 
                // padding: 10px;
                scrollbar-width: none;
            }
                
            .timeline-item {
                position: relative;
                margin-bottom: 20px;
                padding-left: 30px;
                width: 100%;
                // border-left: 2px solid #0066cc;
            }
            .custom-timeline-border {
                border-left: 2px solid #0066cc !important;
            }
            .timeline-item .timeline-content {
                padding: 10px;
                background: #f4f4f4;
                border-radius: 4px;
                display: inline-block;
                width: 100%;
                max-width: 400px;
                box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
            }
            .timeline-item .timeline-date {
                font-size: 12px;
                color: #aaa;
                position: absolute;
                top: 0;
                left: -40px;
                background: #fff;
                padding: 2px 5px;
                border-radius: 4px;
            }
            .card { margin-bottom: 10px; }
            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .table { margin: 0px; }
            .table th, .table td { text-align: left; }
        </style>
        <div id="timeline-container">
            <div id="timeline">${frm.timeline.timeline_wrapper.html()}</div>
            <div id="data-timeline"></div>
        </div>
    `;
            // Add new border class to timeline items
            document.querySelectorAll('.timeline-item').forEach(item => {
                item.classList.add('custom-timeline-border');
            });
        } else {
            document.getElementById('timeline').innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; margin: 0; padding: 0; width: 100%; position: absolute; top: 0; left: 0;">
            Timeline not available
        </div>
        `;
        }

        document.getElementById('data-timeline').innerHTML = frm.timeline.doc_info.versions.map(item => {
            const changes = JSON.parse(item.data).changed.map(change => `
        <tr>
            <td style="width:35%;">${change[0].split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}</td>
            <td style="background-color:rgb(253,241,241)">${change[1]}</td>
            <td style="background-color:rgb(229,245,232)">${change[2]}</td>
        </tr>`).join('');
            const creationDate = new Date(item.creation);
            return `
        <div class="card mb-3">
            <div class="card-header">
                <div>${item.owner}</div>
                <div><p><strong>Creation:</strong> ${creationDate.toLocaleDateString('en-GB')} ${creationDate.toLocaleTimeString()}</p></div>
            </div>
            <div class="card-body">
                <table class="table table-bordered">
                    <thead>
                        <tr><th>Property</th><th>Old Value</th><th>New Value</th></tr>
                    </thead>
                    <tbody>${changes}</tbody>
                </table>
            </div>
        </div>
    `;
        }).join('');

        $('.timeline-dot').remove()
        $('.activity-title').remove()
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