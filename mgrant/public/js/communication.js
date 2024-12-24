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
    .timeline {
        position: relative;
        padding-left: 12px;
    }
    .active_tab{
        border-bottom: 1px solid blue;
        border-color:blue !important;
    }
    .fa-envelope{
        font-size: 13px;
        color: #7c7c7c;
    }
    .timeline::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 12px;
        width: 2px;
        background-color: #ccc;
    }

    .timeline-dot {
        position: relative;
        width: 10px;
        height: 10px;
        background-color: #000;
        border-radius: 50%;
        left: -4px;
        z-index: 1; 
        display: none; 
    }

    .timeline-dot:first-of-type,
    .timeline-dot:last-of-type {
        display: block; 
    }

    .timeline-icon {
        background-color: #f1f1f1;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        left: -14px;
        top: 65px;
        transition: background-color 0.3s; /* Smooth background change */
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
    <div class="container" style="display: flex; height: 100%; overflow: hidden;">
            <div style="width: 350px;  overflow-y: auto; background-color: #fff; display: flex; flex-direction: column; border: 1px solid #D9D9D9; align-items: start;  gap: 16px;">
                    <div style="width: 335px; padding:0px 10px; margin-top:8px; margin-bottom:-7px; display: flex; align-items: center; justify-content: space-between;">
                        <div style="display: flex; gap:4px;align-items: center; justify-content: space-between;">
                            <div><i class="fa fa-refresh" id="refresh_email_list" style="font-size: 18px; cursor:pointer;"></i></div>
                        </div>
                        <div>
                            <div><i class="fa fa-plus" id="add_email" style="font-size: 18px; cursor:pointer;"></i></div>
                        </div>
                    </div>

                <!-- Tab Section -->
                <div style="display: flex; justify-content: space-between; width: 334px; height: 40px; border: 1px solid #D9D9D9; gap: 12px; padding: 0px 20px;">
                    <div id="allEmailButton" class="active_tab" style="cursor:pointer; height: 33px; padding: 6px 0 1px 0;">
                        <span>📧</span><span style="font-size: 12px; color: #0E1116;">All</span>
                    </div>
                    <div id="unreadEmailButton" style="height: 33px; cursor:pointer; padding: 6px 0 1px 0;">
                        <span>📧</span><span style="font-size: 12px; color: #6E7073;">Unread</span>
                    </div>
                    <div id="readEmailButton" style="height: 33px; cursor:pointer; padding: 6px 0 1px 0;">
                        <span>📧</span><span style="font-size: 12px; color: #6E7073;">Read</span>
                    </div>
                </div>
                <!-- Email Sections -->
    `;

    if (email_list.length == "") {
        emailHtml += `
            <div style="width: 335px; height: 100vh; text-align: center; line-height: 100vh;">
                <h4>No Emails Found</h4>
            </div>


    `;
    } else {
        sortedGroups.forEach(group => {
            emailHtml += `
                <div style="width: 335px; margin: 0 auto;">
                    <p style="margin: 0 0 8px; padding-left: 20px; color: #6E7073;">${group}</p>
                    ${groupedEmails[group].map((item) => `
                        <div class="emailListCard" emailId="${item.name}" style="display: flex; border-bottom: 1px solid #e5e5e5; padding: 10px 20px;">
                            <div class="avatar" style="width: 24px; height: 24px; border-radius: 50%; background-color: #3f51b5; color: #fff; display: flex; justify-content: center; align-items: center;">
                                ${item?.sender[0]?.toUpperCase()}
                            </div>
                            <div style="margin-left: 10px; flex: 1;">
                                <h4 style="font-size: 12px; color: #6E7073;">${item?.sender_full_name}</h4>
                                <span style="font-size: 10px; color: #0E1116;">${timeAgo(item?.communication_date)}</span>
                                <p style="font-size: 14px; color: #0E1116;">${item?.subject}</p>
                            </div>
                        </div>
                        `).join('')}
                </div>
            `;
        });
    }

    emailHtml += `
            </div>
            <div id="emailBodyContent" style="flex-grow: 1; display: flex; align-items: center; flex-direction: column;">
                <div style="height:80vh; display: flex; align-items: center; justify-content: center;">
                    <div>
                        <h3 style="font-size: 19px; color: #0E1116;">Select an item to read</h3>
                    <p style="font-size: 12px; color: #808080; text-align:center;">Nothing is selected</p>
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
    $('#add_email').on('click', async () => {
        cur_frm.email_doc("")
    });
    $('.emailListCard').on('click', async (e) => {
        let docName = e.currentTarget.getAttribute('emailId');
        let replies = await getDocList('Communication', [
            ['Communication', 'in_reply_to', '=', docName]
        ], ['subject', 'content', 'communication_date']);
        await set_value("Communication", e.currentTarget.getAttribute('emailId'))
        let emailDoc = communication_list.find(item => item.name === docName);
        const emails = [...replies, emailDoc];
        let emailBody = `
            <div id="emailContent" style="width:100%;">
                <div id="header">
                    <div
                        class="d-flex justify-content-between align-items-center"
                        style="border-bottom: 1px solid #ddd; padding: 10px 15px; font-family: Arial, sans-serif; background-color: #f8f9fa;"
                    >
                        <!-- Left Section -->
                        <div class="d-flex align-items-center">
                            <div
                                class="avatar"
                                style="width: 40px; height: 40px; background-color: #d9b2d9; color: #fff; font-weight: bold; font-size: 20px; text-align: center; line-height: 40px; border-radius: 50%; margin-right: 10px;"
                            >
                                ${emailDoc?.sender[0]?.toUpperCase()}
                            </div>
                            <div>
                                <div style="font-weight: bold;">
                                ${emailDoc?.sender_full_name} &lt;${emailDoc?.sender}&gt;
                                </div>
                                <div>To: ${emailDoc?.recipients}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="body" style="padding: 15px;">
                    ${emails.map((email) => {
            return `<div class="d-flex justify-content-between align-items-center">
                        <h4>Subject : ${email?.subject}</h4>
                        <div class="d-flex align-items-center">
                            <span style="font-size: 12px; color: #6c757d; margin-right: 10px;">
                                ${timeAgo(email?.communication_date)}
                            </span>
                        </div>
                    </div>
                    <div  style="border-bottom:1px solid gray;">${email?.content}</div>`
        }).join('\n')}
                    </div>
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