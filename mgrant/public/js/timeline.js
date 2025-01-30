const showTimelines = async (frm, selector) => {
    let timeline_wrapper = document.querySelector(`[data-fieldname="${selector}"]`);

    if (!timeline_wrapper) {
        console.error(`Timeline wrapper for selector "${selector}" not found.`);
        return;
    }

    if (!frm.is_new() && frm?.timeline?.timeline_wrapper) {
        try {
            timeline_wrapper.innerHTML = `
                <style>
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
                    <div id="data-timeline"></div>
                </div>
            `;
            // Left Side Content
            // #timeline-container {
            //     width: 100%;
            //     display: flex;
            //     justify-content: space-between;
            // }
            // #timeline {
            //     min-width: 450px;
            // }
            // #data-timeline {
            //     width: 100%;
            //     margin-left: 30px;
            // }
            // #timeline, #data-timeline {
            //     height: 100vh;
            //     overflow-y: auto;
            //     scrollbar-width: none;
            // }
            // .timeline-item {
            //     position: relative;
            //     margin-bottom: 20px;
            //     padding-left: 30px;
            //     width: 100%;
            // }
            // .custom-timeline-border {
            //     border-left: 2px solid #0066cc !important;
            // }
            // .timeline-item .timeline-content {
            //     padding: 10px;
            //     background: #f4f4f4;
            //     border-radius: 4px;
            //     display: inline-block;
            //     width: 100%;
            //     max-width: 400px;
            //     box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
            // }
            // .timeline-item .timeline-date {
            //     font-size: 12px;
            //     color: #aaa;
            //     position: absolute;
            //     top: 0;
            //     left: -40px;
            //     background: #fff;
            //     padding: 2px 5px;
            //     border-radius: 4px;
            // }
            // <div id="timeline">
            //             ${frm.timeline.action_history.map(item => `
            //                 <div class="timeline-item custom-timeline-border" data-timestamp="${item.creation}">
            //                     <div class="timeline-content">
            //                         ${item.content}
            //                         <span> .
            //                             <span class="frappe-timestamp" 
            //                                     data-timestamp="${item.creation}" 
            //                                     title="${item.creation}">
            //                                 ${formatDateTime(item.creation, true, true)}
            //                             </span>
            //                         </span>
            //                     </div>
            //                 </div>
            //             `).join('')}
            //         </div>

            // Step 3: Populate the data-timeline
            const dataTimeline = document.getElementById('data-timeline');
            if (dataTimeline) {
                // let versions = await frappe.db.get_list('Version', { filters: { ref_doctype: frm.doctype, docname: frm.docname }, fields: ['*'], limit: 1000, order_by: 'creation desc' });
                let response = await frappe.call({
                    method: "mgrant.apis.api.get_versions",
                    args: {
                        dt: frm.doctype,
                        dn: frm.docname
                    }
                });

                console.log('response :>> ', response);
                let versions = response.message || [];

                dataTimeline.innerHTML = versions.map(item => {
                    let changes = [];
                    try {
                        changes = JSON.parse(item.changed);
                    } catch (error) {
                        console.error("Error parsing 'changed' field:", error, item.changed);
                    }

                    const changesHTML = changes.map(change => `
                        <tr>
                            <td style="width:35%;">${change[0].split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}</td>
                            <td style="background-color:rgb(253,241,241)">${change[1] ? change[1] : ''}</td>
                            <td style="background-color:rgb(229,245,232)">${change[2] ? change[2] : ''}</td>
                        </tr>`).join('');

                    return `
                        <div style="width: 100%;">
                            <span style="font-size:12px;font-weight:bold;">
                                ${__(item.custom_actual_doctype ? `${item.custom_actual_doctype}` : `${item.ref_doctype}`)}
                            </span>
                            <div style="width:100%;" class="card mb-3">
                                <div class="card-header">
                                    <div>${item.owner}</div>
                                    <div><p><strong>Updated on:</strong> ${item?.creation ? formatDateTime(item.creation, true, true) : '--:--'}</p></div>
                                </div>
                                <div class="card-body">
                                    <table class="table table-bordered">
                                        <thead>
                                            <tr><th>Field</th><th>Old Value</th><th>New Value</th></tr>
                                        </thead>
                                        <tbody>${changesHTML}</tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            // Add custom border to timeline items
            document.querySelectorAll('.timeline-item').forEach(item => {
                item.classList.add('custom-timeline-border');
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
            timeline_wrapper.innerHTML = `<p>Error loading timeline data. Please try again later.</p>`;
        }
    } else {
        timeline_wrapper.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; margin: 0; padding: 0; width: 100%; position: absolute; top: 0; left: 0;">
                Timeline not available
            </div>
        `;
    }
};
