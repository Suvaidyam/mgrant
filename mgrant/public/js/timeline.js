const showTimelines = (frm, selector) => {
    let timeline_wrapper = document.querySelector(`[data-fieldname="${selector}"]`);
    if (!frm.is_new() && frm?.timeline?.timeline_wrapper) {
        timeline_wrapper.innerHTML = `
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
                <div id="timeline">
                    ${frm.timeline.action_history.map(item => `
                        <div class="timeline-item custom-timeline-border" data-timestamp="${item.creation}">
                            <div class="timeline-content">
                                ${item.content}
                                <span> .
                                    <span class="frappe-timestamp" 
                                            data-timestamp="${item.creation}" 
                                            title="${item.creation}">
                                        ${formatDateTime(item.creation, true, true)}
                                    </span>
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
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

    $(timeline_wrapper).find('.timeline-dot').remove();
    $(timeline_wrapper).find('.activity-title').remove();
}