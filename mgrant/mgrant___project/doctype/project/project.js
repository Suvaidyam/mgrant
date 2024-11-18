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
    let field = frm.meta?.fields?.find(f => f.fieldname == tab_field)
    let _fields = frm.meta?.fields?.filter(f => field?.default?.split(',')?.includes(f.fieldname))

    for (let _f of _fields) {
        let link = frm.meta.links?.find(f => f.link_doctype == _f.default)
        if (link) {
            let datatable = new SvaDataTable({
                wrapper: document.querySelector(`#${_f.fieldname}`), // Wrapper element   // Pass your data
                doctype: link.link_doctype, // Doctype name
                crud: true,      // Enable CRUD operations (optional)
                frm: frm,       // Pass the current form object (optional)
                options: {
                    connection: link,
                    serialNumberColumn: true, // Enable serial number column (optional)
                    editable: false,      // Enable editing (optional),
                }
            });
        }
        if (_f.default === 'tasks') {
            getTaskList(_f, frm)
        }
    }
}
frappe.ui.form.on("Project", {
    // form-footer
    async refresh(frm) {
        $('.form-footer').remove()
        $('.layout-side-section').remove()
        document.querySelectorAll('.timeline-dot').forEach(function (dot) {
            dot.style.display = 'none'; // Hides the timeline dot
        });

        let tab_field = frm.get_active_tab()?.df?.fieldname;
        tabContent(frm, tab_field)
        $('a[data-toggle="tab"]').on('shown.bs.tab', async function (e) {
            let tab_field = frm.get_active_tab()?.df?.fieldname;
            tabContent(frm, tab_field)
        });
        console.log(frm.timeline.doc_info.versions);



        if (frm.timeline?.timeline_wrapper) {
            let timelineContent = frm.timeline.timeline_wrapper.html();
            document.getElementById('timeline').innerHTML = `
        <style>
            #timeline-container {
                width:100%;
                display: flex;
                justify-content: space-between;
            }
            #timeline {
                position: relative;
                // padding: 20px;
                // width: 50%; /* Set timeline to 50% width */
                overflow: auto; /* Handle overflow if needed */
            }
            #data-timeline{
                width: 70%;
                // padding-left:40px;
            }
            .timeline-item {
                position: relative;
                margin-bottom: 20px;
                padding-left: 40px;
                border-left: 2px solid #0066cc;
            }
            .timeline-item .timeline-content {
                padding: 10px;
                background: #f4f4f4;
                border-radius: 4px;
                display: inline-block;
                width: 100%;
                margin-right:40px;
                max-width: 400px;
                box-shadow: 0px 2px 5px rgba(0,0,0,0.1);
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
            .timeline-item.timeline-odd {
                border-left: 3px dashed #ccc;
            }
            .card {
                margin-bottom: 10px;
            }
            .card-header{
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .table th, .table td {
                text-align: left;
                // padding: 8px;
            },
            
        </style>
        <div id="timeline-container">
            <div id="timeline">${timelineContent}</div>
            <div id="data-timeline"></div>
        </div>
    `;
        } else {
            console.log('Timeline content not available');
        }

        let timelineHTML = '';
        frm.timeline.doc_info.versions.forEach(item => {
            const changes = JSON.parse(item.data).changed.map(change => `
        <tr>
            <td>${change[0]}</td>
            <td style="background-color:rgb(253,241,241)">${change[1]}</td>
            <td style="background-color:rgb(229,245,232)">${change[2]}</td>
        </tr>
    `).join('');
            let creationDate = new Date(item.creation);
            // let formattedTime = `${creationDate.getHours().toString().padStart(2, '0')}:${creationDate.getMinutes().toString().padStart(2, '0')}:${creationDate.getSeconds().toString().padStart(2, '0')}`;
            // let formattedDate = `${creationDate.getDate().toString().padStart(2, '0')}/${(creationDate.getMonth() + 1).toString().padStart(2, '0')}/${creationDate.getFullYear().toString().slice(-2)}`;
            timelineHTML += `
        <div class="card mb-3">
            <div class="card-header"><div>${item.owner}</div> <div><p><strong>Creation:</strong> ${creationDate.toLocaleDateString('en-GB')} ${creationDate.toLocaleTimeString()}</p></div></div>
            <div class="card-body">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Property</th>
                            <th>Old Value</th>
                            <th>New Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${changes}
                    </tbody>
                </table>
            </div>
        </div>
    `;
        });

        document.getElementById('data-timeline').innerHTML = timelineHTML;




        $('.timeline-dot').remove()
        $('.activity-title').remove()

    },


});