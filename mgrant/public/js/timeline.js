const showTimelines = async (frm, selector) => {
    let timeline_wrapper = document.querySelector(`[data-fieldname="${selector}"]`);
    toggleLoader(true, selector);
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
            const dataTimeline = document.getElementById('data-timeline');
            if (dataTimeline) {
                let response = await frappe.call({
                    method: "mgrant.apis.api.get_versions",
                    args: {
                        dt: frm.doctype,
                        dn: frm.docname
                    }
                });
                let versions = response.message || [];
                if (versions.length > 0) {
                    dataTimeline.innerHTML = versions.map(item => {
                        let changes = [];
                        try {
                            changes = JSON.parse(item.changed);
                        } catch (error) {
                            console.error("Error parsing 'changed' field:", error, item.changed);
                        }
                        const changesHTML = changes.map(change => `
                        <tr>
                            <td style="width:35%;">${change[0]}</td>
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
                } else {
                    dataTimeline.innerHTML = `
                    <div style="display: flex; justify-content: center; align-items: center; height: 75vh; width: 100%;">
                        No Changes Found
                    </div>`;
                }
            }

            // Add custom border to timeline items
            document.querySelectorAll('.timeline-item').forEach(item => {
                item.classList.add('custom-timeline-border');
            });

        } catch (error) {
            console.error('Error fetching user data:', error);
            timeline_wrapper.innerHTML = `<p>Error loading timeline data. Please try again later.</p>`;
        }
    }
    toggleLoader(false, selector);
};
