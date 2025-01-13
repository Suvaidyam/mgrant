
function timeAgo(timestamp) {
    if (!timestamp) return '--:--';
    const now = Date.now();
    timestamp = new Date(timestamp);
    const diff = now - timestamp;
    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;

    // If the timestamp is less than 1 minute ago
    if (diff < minute) {
        const seconds = Math.round(diff / second);
        return seconds === 1 ? "1 second ago" : `${seconds} seconds ago`;
    }

    // If the timestamp is less than 1 hour ago
    if (diff < hour) {
        const minutes = Math.round(diff / minute);
        return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    }

    // If the timestamp is less than 1 day ago
    if (diff < day) {
        const hours = Math.round(diff / hour);
        return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    }

    // If the timestamp is less than 2 days ago
    if (diff < day * 2) {
        return "Yesterday";
    }

    // If the timestamp is less than 1 week ago
    if (diff < week) {
        const days = Math.round(diff / day);
        return days === 1 ? "1 day ago" : `${days} days ago`;
    }

    // If the timestamp is less than 1 month ago
    if (diff < month) {
        const weeks = Math.round(diff / week);
        return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    }

    // If the timestamp is less than 1 year ago
    if (diff < year) {
        const months = Math.round(diff / month);
        return months === 1 ? "1 month ago" : `${months} months ago`;
    }

    // If the timestamp is more than 1 year ago
    const years = Math.round(diff / year);
    return years === 1 ? "1 year ago" : `${years} years ago`;
}

const style = document.createElement('style');
style.innerHTML = `
      .email-container {
        display: flex;
        height: 100vh;
        background-color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    .email-sidebar {
        width: 300px;
        border-right: 1px solid #e5e5e5;
        display: flex;
        flex-direction: column;
        background: #fff;
    }

    .top-header {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        border-bottom: 1px solid #e5e5e5;
        height: 48px;
        background: #fff;
    }

    .header-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex: 1;
    }

    .header-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #666;
        border-radius: 4px;
    }

    .header-icon:hover {
        background-color: #f5f5f5;
    }

    .compose-btn {
        width: 32px;
        height: 32px;
        background: #d73925;
        color: white;
        border: none;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .compose-btn:hover {
        background: #c72b1b;
    }

    .email-tabs {
        display: flex;
        border-bottom: 1px solid #e5e5e5;
        justify-content: space-between;
        background: #fff;
        padding: 0 16px;
    }

    .tab-item {
        padding: 12px 16px;
        cursor: pointer;
        color: #666;
        font-size: 14px;
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
       
    }

   

    .active_tab {
        color: #801621;
        border-bottom-color: #801621;
        }


    .email-list {
        overflow-y: auto;
        flex: 1;
    }

    .date-group {
        padding: 8px 16px;
        font-size: 12px;
        font-weight: 500;
        color: #666;
        background: #f9f9f9;
        text-transform: uppercase;
    }

    .email-item {
        padding: 12px 16px;
        border-bottom: 1px solid #e5e5e5;
        cursor: pointer;
        transition: background 0.2s;
    }

    .email-item:hover {
        background: #f5f5f5;
    }

    .email-header {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 4px;
    }

    .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 500;
        flex-shrink: 0;
    }

    .email-content {
        flex: 1;
        min-width: 0;
    }

    .sender-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2px;
    }

    .sender-name {
        font-size: 14px;
        font-weight: 500;
        color: #333;
        margin: 0;
    }

    .time-ago {
        font-size: 12px;
        color: #666;
        white-space: nowrap;
    }

    .email-subject {
        font-size: 14px;
        color: #333;
        margin: 0 0 4px 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .email-preview {
        font-size: 13px;
        color: #666;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .attachment-info {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 4px;
        color: #666;
        font-size: 12px;
    }

    .email-body {
        flex: 1;
        padding: 24px;
        background: #fff;
        overflow-y: auto;
    }

    .email-detail {
        // max-width: 800px;
        // margin: 0 auto;
    }

    .email-detail-header {
        margin-bottom: 24px;
    }

    .email-detail-subject {
        font-size: 24px;
        color: #333;
        margin: 0 0 16px 0;
        font-weight: normal;
    }

    .email-detail-meta {
        display: flex;
        gap: 12px;
    }

    .meta-content {
        flex: 1;
    }

    .meta-sender {
        font-size: 14px;
        font-weight: 500;
        color: #333;
        margin-bottom: 4px;
    }

    .meta-recipient {
        font-size: 14px;
        color: #666;
    }

    .meta-time {
        font-size: 12px;
        color: #666;
        text-align: right;
    }

    .email-detail-body {
        font-size: 14px;
        line-height: 1.6;
        color: #333;
    }

    .attachments {
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #e5e5e5;
    }

    .attachments-header {
        font-size: 12px;
        color: #666;
        margin-bottom: 8px;
        text-transform: uppercase;
    }

    .attachment-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .attachment-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: #f5f5f5;
        border-radius: 4px;
        font-size: 13px;
        color: #333;
        cursor: pointer;
    }

    .attachment-item:hover {
        background: #eee;
    }

    @media (max-width: 768px) {
        .email-sidebar {
            width: 100%;
        }

        .email-container {
            flex-direction: column;
        }

        .email-body {
            display: none;
        }

        .email-body.active {
            display: block;
        }
    }
    `;
document.head.appendChild(style);
var communication_list = []
var email_wrapper = document.querySelector(`[data-fieldname="email"]`);
async function renderEmails(email_list, frm, selector = null) {
    if (selector != null) {
        email_wrapper = document.querySelector(`[data-fieldname="${selector}"]`).style.height = "80vh";
        email_wrapper = document.querySelector(`[data-fieldname="${selector}"]`);
    }
    const formatDateGroup = (emailDate) => {
        const today = new Date();
        const yesterday = new Date();
        today.setHours(0, 0, 0, 0);
        yesterday.setDate(today.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const emailDateFormatted = new Date(emailDate);
        emailDateFormatted.setHours(0, 0, 0, 0);

        if (emailDateFormatted.getTime() === today.getTime()) return "Today";
        if (emailDateFormatted.getTime() === yesterday.getTime()) return "Yesterday";
        return "Older"; // Group all other dates under "Older"
    };

    // Group emails by date
    const groupedEmails = email_list.reduce((groups, email) => {
        const group = formatDateGroup(email.communication_date);
        groups[group] = groups[group] || [];
        groups[group].push(email);
        return groups;
    }, {});

    // Sort groups: Today, Yesterday, Older
    const sortedGroups = Object.keys(groupedEmails).sort((a, b) => {
        if (a === "Today") return -1;
        if (b === "Today") return 1;
        if (a === "Yesterday") return -1;
        if (b === "Yesterday") return 1;
        if (a === "Older") return 1; // Keep "Older" at the end
        return 0;
    });

    // Build email list HTML
    let emailHtml = `
   <div class="email-container">
            <div class="email-sidebar">
                <div class="top-header">
                    <div class="header-actions">
                    <button class="header-icon">
                        <i class="fa fa-refresh" id="refresh_email_list" style="font-size: 18px; cursor: pointer; color: #666;"></i>
                    </button>
                        <button class="btn-primary compose-btn">
                            <i class="fa fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="email-tabs">
                    <div id="allEmailButton" class="tab-item active_tab">All</div>
                    <div id="unreadEmailButton" class="tab-item">Unread</div>
                    <div id="readEmailButton" class="tab-item">Read</div>
                </div>
                <div class="email-list">
    `;

    if (email_list.length == "") {
        emailHtml += `
         <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
                <div class="note_message"><img style="width: 60px; height: 60px;" src="/assets/mgrant/images/no-data-found.png"></div>
            </div>


    `;
    } else {
        sortedGroups.forEach(group => {
            emailHtml += `
                <div class="date-group">${group}</div>
                ${groupedEmails[group].map((item) => `
                    <div  class="email-item " emailId="${item.name}">
                        <div class="email-header">
                            <div class="avatar" style="background-color: ${getRandomColor()};">
                                ${item?.sender[0]?.toUpperCase()}
                            </div>
                            <div class="email-content">
                                <div class="sender-line">
                                    <h4 class="sender-name">${item?.sender_full_name}</h4>
                                    <span class="time-ago">${timeAgo(item?.communication_date)}</span>
                                </div>
                                <p class="email-subject">${item?.subject}</p>
                                <p class="email-preview">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur...</p>
                                ${item.attachments ? `
                                    <div class="attachment-info">
                                        <i class="fa fa-paperclip"></i>
                                        <span>${item.attachments} Attachment${item.attachments !== 1 ? 's' : ''}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            `;
        });
    }

    emailHtml += `
            </div>
            </div>
            <div id="emailBodyContent" class="email-body">
                <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
                    <div style="text-align: center;">
                        <h3 style="font-size: 19px; color: #333;">Select an item to read</h3>
                        <p style="font-size: 12px; color: #666;">Nothing is selected</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    email_wrapper.innerHTML = emailHtml;
    $('#refresh_email_list').on('click', async () => {
        try {
            communication_list = await getDocList('Communication', [
                ['Communication', 'reference_name', '=', frm.doc.name],
                ['Communication', 'in_reply_to', '=', '']
            ], ['*']);
            await renderEmails(communication_list, frm)
        } catch (error) {
            console.error(error)
        }
    });
    $('#allEmailButton').on('click', async () => {
        try {
            communication_list = await getDocList('Communication', [
                ['Communication', 'reference_name', '=', frm.doc.name],
                ['Communication', 'in_reply_to', '=', '']
            ], ['*']);
            await renderEmails(communication_list, frm)
            $('#allEmailButton').addClass('active_tab');
            $('#unreadEmailButton').removeClass('active_tab');
            $('#readEmailButton').removeClass('active_tab');
        } catch (error) {
            console.error(error)
        }
    });
    $('#unreadEmailButton').on('click', async () => {
        try {
            communication_list = await getDocList('Communication', [
                ['reference_name', '=', frm.doc.name],
                ['seen', '=', 0],
                ['in_reply_to', '=', '']
            ], ['*']);
            await renderEmails(communication_list, frm)
            $('#allEmailButton').removeClass('active_tab');
            $('#unreadEmailButton').addClass('active_tab');
            $('#readEmailButton').removeClass('active_tab');
        } catch (error) {
            console.error(error)
        }
    });
    $('#readEmailButton').on('click', async () => {
        try {
            communication_list = await getDocList('Communication', [
                ['reference_name', '=', frm.doc.name],
                ['seen', '=', 1],
                ['in_reply_to', '=', '']
            ], ['*']);
            await renderEmails(communication_list, frm)
            $('#allEmailButton').removeClass('active_tab');
            $('#unreadEmailButton').removeClass('active_tab');
            $('#readEmailButton').addClass('active_tab');
        } catch (error) {
            console.error(error)
        }
    });
    $('.compose-btn').on('click', async () => {
        cur_frm.email_doc("")
    });
    $('.email-item').on('click', async (e) => {
        let docName = e.currentTarget.getAttribute('emailId');
        let replies = await getDocList('Communication', [
            ['Communication', 'in_reply_to', '=', docName]
        ], ['subject', 'content', 'communication_date']);
        await set_value("Communication", e.currentTarget.getAttribute('emailId'))
        let emailDoc = communication_list.find(item => item.name === docName);
        const emails = [...replies, emailDoc];
        let emailBody = `
            <div class="email-detail">
                <div class="email-detail-header">
                    <h1 class="email-detail-subject">${emailDoc?.subject}</h1>
                    <div class="email-detail-meta">
                        <div class="avatar" style="background-color: ${getRandomColor()};">
                            ${emailDoc?.sender[0]?.toUpperCase()}
                        </div>
                        <div class="meta-content">
                            <div class="meta-sender">${emailDoc?.sender_full_name} &lt;${emailDoc?.sender}&gt;</div>
                            <div class="meta-recipient">To: ${emailDoc?.recipients}</div>
                        </div>
                        <div class="meta-time">
                            ${new Date(emailDoc?.communication_date).toLocaleString()}
                        </div>
                    </div>
                </div>
                <div class="email-detail-body">
                    ${emails.map((email) => `
                        ${email?.content}
                    `).join('')}
                </div>
                ${emailDoc?.attachments ? `
                    <div class="attachments">
                        <h4 class="attachments-header">Attachments</h4>
                        <div class="attachment-list">
                            <span class="attachment-item">
                                <i class="fa fa-file-o"></i>
                                document.csv
                            </span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        document.getElementById('emailBodyContent').innerHTML = emailBody;
    });
    $('#createCominucation').on('click', () => {
        cur_frm.email_doc();
    });
}
const communication = async (frm, selector) => {
    communication_list = await getDocList('Communication', [
        ['Communication', 'reference_name', '=', frm.doc.name],
        ['Communication', 'in_reply_to', '=', '']
    ], ['*']);
    await renderEmails(communication_list, frm, selector)
}


function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
