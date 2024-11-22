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
function renderEmails(email_list, frm) {
    // if (email_list.length > 0) {
    $('#email').html(
        `
            <div class="container" style="display: flex; height: 100%;overflow:auto;">
        <div
            style="width: 335px; background-color: rgb(255, 255, 255); display: flex; justify-content: flex-start; flex-direction: column; align-items: start; border: solid 1px #D9D9D9; gap: 16px;">
            <!-- tab section -->
            <div
                style="display: flex; width: 334px; height: 40px; border: 1px solid #D9D9D9; gap: 12px; padding-left: 20px;">
                <div
                    id="allEmailButton"
                    class="active_tab"
                    style="display: flex; align-items: center; width: 55px; height: 33px; border-bottom: 1px solid white; gap: 0px; padding: 6px 0 1px 0;">
                    <span style="margin-right: 4px;">📧</span> <!-- Email icon -->
                    <span
                        style="font-weight: 400; font-size: 12px; line-height: 13.2px; letter-spacing: 0.4%; color: #0E1116;">All</span>
                </div>

                <div
                    id="unreadEmailButton"
                    style="display: flex; align-items: center; width: 83px; height: 33px; border-bottom: 1px solid white; gap: 2px; padding: 6px 0 1px 0;">
                    <span style="margin-right: 4px;">📧</span> <!-- Email icon -->
                    <span
                        style="font-weight: 400; font-size: 12px; line-height: 13.2px; letter-spacing: 0.4%; color: #6E7073;">Unread</span>

                </div>
                <div
                    id="readEmailButton"
                    style="display: flex; align-items: center; width: 55px; height: 33px; border-bottom: 1px solid white; gap: 2px; padding: 6px 0 1px 0;">
                    <span style="margin-right: 4px;">📧</span> <!-- Email icon -->
                    <span
                        style="font-weight: 400; font-size: 12px; line-height: 13.2px; letter-spacing: 0.4%; color: #6E7073;">Read</span>

                </div>
            </div>
            <!--tab section close-->

            <!-- Today Section Open -->
            <div style="width: 335px; margin: 0 auto; border-radius: 8px;">
              ${email_list.length > 0 ?
            `<h3 style="margin: 0 0 8px; padding-left: 20px; color: #6E7073; font-size: 10px; font-weight: 500; line-height: 11px; letter-spacing: 1.5%;">
                    TODAY</h3>`
            :
            " Data Not Found"}
                ${email_list.map((item) => {
                return `
                        <div class="emailListCard" emailId="${item.name}" cardID=${item.name} style="max-height: 120px;height: 120px; display: flex;  border-bottom: 1px solid #e5e5e5; padding: 10px 20px; overflow: hidden;">
                        <!-- Avatar -->
                        <div class="avatar"
                            style="width: 24px; height: 24px; border-radius:  50%; background-color: #3f51b5; color: #fff; display: flex; justify-content: center; align-items: center; font-size: 12px; font-weight: 400 ; line-height: 12.2px; ; text-align: center;">
                            ${item?.sender[0]?.toUpperCase()}
                        </div>
                        <div style="margin-left: 10px; flex: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: center; ">
                                <h4
                                    style="margin: 0; font-size: 12px; color: #6E7073; font-weight: 400; line-height: 12px; letter-spacing: 0.4%;">
                ${item?.sender_full_name}</h4>
                                <span
                                    style="font-size: 10px; color: #0E1116; font-weight: 400; line-height: 11px; padding-right: 19px;">${timeAgo(item?.communication_date)}</span>
                            </div>
                            <p
                                style="margin: 8px 0 0; font-size: 14px; color: #0E1116; font-weight: 500; line-height: 15px; letter-spacing: 0.25%;">
                                ${item?.subject}
                            </p>
                            <p
                                class="text-truncate"
                                style="font-size: 10px; font-weight: 400; line-height: 11px; color: #6E7073; margin: 0; padding-top: 4px;">
                                ${item?.content}
                            </p>
                            <p style="margin: 8px 0; font-size: 12px; color: #888;">
                                <span style="font-size: 12px; color: #6E7073; height: 12px; width: 12px;">📎</span> <span
                                    style="font-size: 10px; font-weight: 400; line-height: 11px; color: #0E1116;"> 0
                                    Attachment</span>
                            </p>
                        </div>
                    </div>`
            }).join('')
        }
            </div>
        </div>
        <div id="emailBodyContent" style="flex-grow: 1; background-color: white; display: flex;width="100% !important;">
            <div style="flex-grow: 1; background-color: white; display: flex; justify-content: center; align-items: center; flex-direction: column; gap: 0px;">
                <h3 style="margin: 0px; margin-top: 12px; font-size: 19px; font-weight: 500; line-height: 20.9px; letter-spacing: 0.15%; color: #0E1116; text-align: center;">
                    Select an item to read
                </h3>

                <p style="margin: 0px; margin-top: 6px; color: #808080; font-size: 12px; line-height: 13.2px; letter-spacing: 0.4%; text-align: center;">
                    Nothing is selected
                </p>
            </div>
        </div>
    </div>
            `
    );
    // }
    // else {
    //     $('#email').html(
    //         `<div class="container" style="max-width:700px">
    //             <div class="d-flex justify-content-between align-items-center">
    //                 <h4>No Emails Found</h4>
    //             </div>
    //         </div>`
    //     );
    // }
    $('#allEmailButton').on('click', async () => {
        try {
            communication_list = await getDocList('Communication', [
                ['Communication', 'reference_name', '=', frm.doc.name],
                ['Communication', 'in_reply_to', '=', '']
            ], ['*']);
            renderEmails(communication_list, frm)
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
            renderEmails(communication_list, frm)
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
            renderEmails(communication_list, frm)
            $('#allEmailButton').removeClass('active_tab');
            $('#unreadEmailButton').removeClass('active_tab');
            $('#readEmailButton').addClass('active_tab');
        } catch (error) {
            console.error(error)
        }
    });
    $('.emailListCard').on('click', async (e) => {
        let docName = e.currentTarget.getAttribute('emailId');
        let replies = await getDocList('Communication', [
            ['Communication', 'in_reply_to', '=', docName]
        ], ['subject', 'content', 'communication_date']);
        await set_value("Communication", e.currentTarget.getAttribute('cardID'))
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
const cominucation = async (frm) => {
    communication_list = await getDocList('Communication', [
        ['Communication', 'reference_name', '=', frm.doc.name],
        ['Communication', 'in_reply_to', '=', '']
    ], ['*']);
    renderEmails(communication_list, frm)
}