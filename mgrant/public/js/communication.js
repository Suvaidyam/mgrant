let currentEmailIndex = 0;

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

    if (diff < minute) {
        const seconds = Math.round(diff / second);
        return seconds === 1 ? "1 second ago" : `${seconds} seconds ago`;
    }
    if (diff < hour) {
        const minutes = Math.round(diff / minute);
        return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    }
    if (diff < day) {
        const hours = Math.round(diff / hour);
        return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    }
    if (diff < day * 2) {
        return "Yesterday";
    }
    if (diff < week) {
        const days = Math.round(diff / day);
        return days === 1 ? "1 day ago" : `${days} days ago`;
    }
    if (diff < month) {
        const weeks = Math.round(diff / week);
        return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    }
    if (diff < year) {
        const months = Math.round(diff / month);
        return months === 1 ? "1 month ago" : `${months} months ago`;
    }
    const years = Math.round(diff / year);
    return years === 1 ? "1 year ago" : `${years} years ago`;
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const style = document.createElement('style');
style.innerHTML = `
    .email-container {
        display: flex;
        height:785px;
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
        align-items: center;
        padding: 8px 8px;
        border-bottom: 1px solid #e5e5e5;
        height: 48px;
        background:#f9f9f9 ;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: space-between;
       
    }
   

    .header-icon {
        width: 24px;
        height: 24px;
        display: flex;
        border: none;
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
        width: 24px;
        height: 24px; 
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
        padding: 8px 16px;
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

    .email-item.active {
        background: #e8f0fe;
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
        padding: 0px 24px 10px 24px; 
        background: #fff;
        overflow-y: auto;
    }

    // .email-detail {
    //     max-width: 785px;
    //     margin: 0 auto;
    // }

    .email-detail-header {
        margin-bottom: 24px;
        border-bottom: 1px solid #e5e5e5;
        padding-bottom: 10px;
    }

    .email-detail-subject {
        font-size: 14px;
        color: #333;
        font-weight: 500 !important;    
        margin: 0 ;
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
        padding-left: 45px;
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

    .email-detail-subject-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e5e5e5;
        padding-bottom: 11px;
        margin-bottom: 11px;
    }
    button.btn-primary > .es-icon {
        fill:white;
        stroke-width: 0;
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

    .action-buttons {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .nav-button {
        padding: 0.5rem;
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .nav-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .nav-button:not(:disabled):hover {
        color: #111827;
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
            height: 750px;
            overflow: auto;
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
        email_wrapper = document.querySelector(`[data-fieldname="${selector}"]`);
        email_wrapper.style.height = "80vh";
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
        return "Older";
    };

    const groupedEmails = email_list.reduce((groups, email) => {
        const group = formatDateGroup(email.communication_date);
        groups[group] = groups[group] || [];
        groups[group].push(email);
        return groups;
    }, {});

    const sortedGroups = Object.keys(groupedEmails).sort((a, b) => {
        if (a === "Today") return -1;
        if (b === "Today") return 1;
        if (a === "Yesterday") return -1;
        if (b === "Yesterday") return 1;
        if (a === "Older") return 1;
        return 0;
    });

    let emailHtml = `
    <div class="email-container">
        <div class="email-sidebar">
            <div class="top-header">
                <div class="header-actions">
                <span id="allEmailButton" class="tab-item active_tab">All</span>
                <span id="inboxEmailButton" class="tab-item">Inbox</span>
                <span id="sentEmailButton" class="tab-item">Sent</span>
                    <button class="header-icon">
                        <i class="fa fa-refresh" id="refresh_email_list" style="font-size: 18px; cursor: pointer; color: #666;"></i>
                    </button>
                    <button class="btn-primary compose-btn">
                        <svg  class="es-icon es-line icon-xs" aria-hidden="true">
                            <use href="#es-line-add"></use>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="email-list">
    `;

    if (email_list.length == 0) {
        emailHtml += `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
                <div class="note_message"><img style="width: 60px; height: 60px;" src="/assets/mgrant/images/no-data-found.png"></div>
            </div>
        `;
    } else {
        sortedGroups.forEach(group => {
            emailHtml += `
                <div class="date-group">${group}</div>
                ${groupedEmails[group].map((item, index) => `
                    <div class="email-item" data-email-id="${item.name}">
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

    if (email_list.length > 0) {
        setTimeout(() => {
            const latestEmail = document.querySelector('.email-item');
            if (latestEmail) {
                latestEmail.click();
            }
        }, 0);
    }

    $('#refresh_email_list').on('click', async () => {
        try {
            communication_list = await getDocList('Communication', [
                ['Communication', 'reference_name', '=', frm.doc.name],
                ['Communication', 'in_reply_to', '=', '']
            ], ['*']);
            await renderEmails(communication_list, frm);
        } catch (error) {
            console.error(error);
        }
    });

    ['all', 'inbox', 'sent'].forEach(type => {
        $(`#${type}EmailButton`).on('click', async () => {
            try {
                let filters = [['Communication', 'reference_name', '=', frm.doc.name]];
                if (type !== 'all') {
                    filters.push(['Communication', 'sent_or_received', '=', type === 'inbox' ? 'Received' : 'Sent']);
                }
                filters.push(['Communication', 'in_reply_to', '=', '']);

                communication_list = await getDocList('Communication', filters, ['*']);
                await renderEmails(communication_list, frm);

                $('.tab-item').removeClass('active_tab');
                $(`#${type}EmailButton`).addClass('active_tab');
            } catch (error) {
                console.error(error);
            }
        });
    });

    $('.compose-btn').on('click', async () => {
        cur_frm.email_doc("");
    });

    $('.email-item').on('click', async function () {
        $('.email-item').removeClass('active');
        $(this).addClass('active');

        let docName = $(this).data('email-id');
        currentEmailIndex = communication_list.findIndex(item => item.name === docName);

        let replies = await getDocList('Communication', [
            ['Communication', 'in_reply_to', '=', docName]
        ], ['subject', 'content', 'communication_date']);

        await set_value("Communication", docName);
        let emailDoc = communication_list.find(item => item.name === docName);
        const emails = [...replies, emailDoc];

        let emailBody = `
            <div class="email-detail">
                <div class="email-detail-header">
                    <div class="email-detail-subject-container">
                        <span class="email-detail-subject">Subject: ${emailDoc?.subject}</span>
                        <div class="action-buttons" id="action_icon">
                            <span class="email-counter">${currentEmailIndex + 1} of ${communication_list.length}</span>
                            <button class="nav-button" id="prev-email" ${currentEmailIndex === 0 ? 'disabled' : ''}>
                                <i class="fa fa-chevron-left"></i>
                            </button>
                            <button class="nav-button" id="next-email" ${currentEmailIndex === communication_list.length - 1 ? 'disabled' : ''}>
                                <i class="fa fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                    <div class="email-detail-meta">
                        <div class="avatar" style="background-color: ${getRandomColor()};">
                            ${emailDoc?.sender[0]?.toUpperCase()}
                        </div>
                        <div class="meta-content">
                            <div class="meta-sender">${emailDoc?.sender_full_name} &lt;${emailDoc?.sender}&gt;</div>
                            <div class="meta-recipient">To: ${emailDoc?.recipients}</div>
                        </div>
                        <div class="meta-time">
                            ${formatDateTime(emailDoc?.communication_date, true, true )}
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
        setupNavigation();
    });

    function setupNavigation() {
        $('#prev-email, #next-email').off('click').on('click', function () {
            const direction = this.id === 'prev-email' ? -1 : 1;
            const newIndex = currentEmailIndex + direction;

            if (newIndex >= 0 && newIndex < communication_list.length) {
                currentEmailIndex = newIndex;
                $('.email-item').eq(currentEmailIndex).click();
            }
        });
    }
}

const communication = async (frm, selector) => {
    toggleLoader(true, selector);
    communication_list = await getDocList('Communication', [
        ['Communication', 'reference_name', '=', frm.doc.name],
        ['Communication', 'in_reply_to', '=', '']
    ], ['*']);
    await renderEmails(communication_list, frm, selector);
    toggleLoader(false, selector);
    
}


