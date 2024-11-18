const style = document.createElement('style');
style.innerHTML = `
 .timeline {
        position: relative;
        padding-left: 12px;
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
const cominucation = async (frm) => {
    let cominucation = await getDocList('Communication', [
        ['Communication', 'reference_name', '=', frm.doc.name]
    ], ['*']);
    if (cominucation.length == 0) {
        $('#email').html(
            `

             <div class="container" style="display: flex; height: 100%">
        <div
            style="width: 335px; background-color: rgb(255, 255, 255); display: flex; justify-content: flex-start; flex-direction: column; align-items: start; border: solid 1px #D9D9D9; gap: 16px;">
            <!-- tab section -->
            <div
                style="display: flex; width: 334px; height: 40px; border: 1px solid #D9D9D9; gap: 12px; padding-left: 20px;">
                <div
                    style="display: flex; align-items: center; width: 55px; height: 33px; border-bottom: 1px solid #E55219; gap: 0px; padding: 6px 0 1px 0;">
                    <span style="margin-right: 4px;">📧</span> <!-- Email icon -->
                    <span
                        style="font-weight: 400; font-size: 12px; line-height: 13.2px; letter-spacing: 0.4%; color: #0E1116;">All</span>

                </div>

                <div
                    style="display: flex; align-items: center; width: 83px; height: 33px; gap: 2px; padding: 6px 0 1px 0;">
                    <span style="margin-right: 4px;">📧</span> <!-- Email icon -->
                    <span
                        style="font-weight: 400; font-size: 12px; line-height: 13.2px; letter-spacing: 0.4%; color: #6E7073;">Unread</span>

                </div>
                <div
                    style="display: flex; align-items: center; width: 55px; height: 33px; gap: 2px; padding: 6px 0 1px 0;">
                    <span style="margin-right: 4px;">📧</span> <!-- Email icon -->
                    <span
                        style="font-weight: 400; font-size: 12px; line-height: 13.2px; letter-spacing: 0.4%; color: #6E7073;">Read</span>

                </div>
            </div>
            <!--tab section close-->

            <!-- Today Section Open -->
            <div style="width: 335px; margin: 0 auto; background: #ffffff;  border-radius: 8px;">
                <h3
                    style="margin: 0 0 8px; padding-left: 20px; color: #6E7073; font-size: 10px; font-weight: 500; line-height: 11px; letter-spacing: 1.5%;">
                    TODAY</h3>

                <!-- Notification 1 -->
                <div style="height: 110px; display: flex;  border-bottom: 1px solid #e5e5e5; position: relative; padding-left: 20px; margin-top: 22px;"
                    onmouseover="this.querySelector('.avatar').style.display='none'; this.querySelector('.checkbox').style.display='flex';"
                    onmouseout="this.querySelector('.avatar').style.display='flex'; this.querySelector('.checkbox').style.display='none';">
                    <!-- Avatar -->
                    <div class="avatar"
                        style=" width: 24px; height: 24px; border-radius:  50%; background-color: #3f51b5; color: #fff; display: flex; justify-content: center; align-items: center; font-size: 12px; font-weight: 400 ; line-height: 12.2px; ; text-align: center;">
                        A
                    </div>
                    <!-- Checkbox -->
                    <input type="checkbox" class="checkbox"
                        style="display: none; width: 20px !important;  height: 20px !important; cursor: pointer;">
                    <div style="margin-left: 10px; flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center; ">
                            <h4
                                style="margin: 0; font-size: 12px; color: #6E7073; font-weight: 400; line-height: 12px; letter-spacing: 0.4%;">
                                Aakash Sharma</h4>
                            <span
                                style="font-size: 10px; color: #0E1116; font-weight: 400; line-height: 11px; padding-right: 19px;">1
                                hr
                                ago</span>
                        </div>
                        <p
                            style="margin: 8px 0 0; font-size: 14px; color: #0E1116; font-weight: 400; line-height: 15px; letter-spacing: 0.25%;">
                            Lorem ipsum dolor sit amet, consec...
                        </p>
                        <p
                            style="font-size: 10px; font-weight: 400; line-height: 11px; color: #6E7073; margin: 0; padding-top: 4px;">
                            Duis aute irure dolor in reprehenderit in voluptate velit
                            esse cillum dolore eu fugiat nulla pariatur...
                        </p>

                        <p style="margin: 8px 0; font-size: 12px; color: #888;">
                            <span style="font-size: 12px; color: #6E7073; height: 12px; width: 12px;">📎</span> <span
                                style="font-size: 10px; font-weight: 400; line-height: 11px; color: #0E1116;"> 1
                                Attachment</span>
                        </p>
                    </div>
                </div>


                <!-- Notification 2 -->
                <div style="height: 79px; display: flex;  border-bottom: 1px solid #e5e5e5; padding: 0 20px; position: relative; padding-top: 14px;"
                    onmouseover="this.querySelector('.avatar').style.display='none'; this.querySelector('.checkbox').style.display='flex';"
                    onmouseout="this.querySelector('.avatar').style.display='flex'; this.querySelector('.checkbox').style.display='none';">
                    <!-- Avatar -->
                    <div class="avatar"
                        style="margin-bottom: 30px; width: 24px; height: 24px; border-radius: 50%; background-color: #9c27b0; color: #fff; display: flex; justify-content: center; align-items: center; font-size: 12px; font-weight: 400; text-align: center;">
                        A
                    </div>
                    <!-- Checkbox -->
                    <input type="checkbox" class="checkbox"
                        style="display: none; width: 20px; height: 20px; cursor: pointer; margin-bottom: 30px;">
                    <div style="margin-left: 10px; flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 style="margin: 0; font-size: 12px; color: #333; font-weight: 400;">Aayush Kumar</h4>
                            <span style="font-size: 10px; color: #0E1116; font-weight: 400;">1 hr ago</span>
                        </div>
                        <p style="margin: 8px 0 0; font-size: 14px; color: #0E1116; font-weight: 400;">Lorem ipsum dolor
                            sit amet,
                            consec...</p>
                        <p style="margin: 4px 0 0; font-size: 10px; color: #6E7073; font-weight: 400;">Duis aute irure
                            dolor in
                            reprehenderit in voluptate vel...</p>
                    </div>
                </div>



                <!-- Notification 3 -->
                <div style="height: 110px; display: flex; border-bottom: 1px solid #e5e5e5; position: relative; padding-left: 20px; padding-top: 14px;"
                    onmouseover="this.querySelector('.avatar').style.display='none'; this.querySelector('.checkbox').style.display='flex';"
                    onmouseout="this.querySelector('.avatar').style.display='flex'; this.querySelector('.checkbox').style.display='none';">
                    <!-- Avatar -->
                    <div class="avatar"
                        style="width: 24px; height: 24px; border-radius: 50%; background-color: #ffc107; color: #fff; display: flex; justify-content: center; align-items: center; font-size: 12px; font-weight: 400 ; line-height: 12.2px; ; text-align: center;">
                        B
                    </div>
                    <!-- Checkbox -->
                    <input type="checkbox" class="checkbox"
                        style="display: none; width: 20px; height: 20px; cursor: pointer;">
                    <div style="margin-left: 10px; flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4
                                style="margin: 0; font-size: 12px; color: #6E7073; font-weight: 400; line-height: 12px; letter-spacing: 0.4%; color: #333;">
                                Binod Yadav</h4>
                            <span
                                style="font-size: 10px; color: #0E1116; font-weight: 400; line-height: 11px; padding-right: 19px;">2
                                hr ago</span>
                        </div>
                        <p
                            style="margin: 8px 0 0; font-size: 14px; color: #0E1116; font-weight: 400; line-height: 15px; letter-spacing: 0.25%;">
                            Lorem ipsum dolor sit amet, consec...
                        </p>
                        <p
                            style="font-size: 10px; font-weight: 400; line-height: 11px; color: #6E7073; margin: 0; padding-top: 4px;">
                            Duis aute irure dolor in reprehenderit in voluptate velit
                            esse cillum dolore eu fugiat nulla pariatur...
                        </p>

                        <p style="margin: 8px 0; font-size: 12px; color: #888;">
                            <span style="font-size: 12px; color: #6E7073; height: 12px; width: 12px;">📎</span> <span
                                style="font-size: 10px; font-weight: 400; line-height: 11px; color: #0E1116;"> 1
                                Attachment</span>
                        </p>
                    </div>
                </div>

            </div>
            <!-- Today Sectioin Close -->
            <!-- This Week Open -->
            <div style="width: 335px; margin: 0 auto; background: #ffffff;  border-radius: 8px;">
                <h3
                    style=" margin: 0 0 15px; padding-left: 20px; color: #6E7073; font-size: 10px; font-weight: 500; line-height: 11px; letter-spacing: 1.5%;">
                    THIS WEEK</h3>

                <!-- Notification 1 -->
                <div
                    style="height: 110px; display: flex;  border-bottom: 1px solid #e5e5e5; padding-left: 20px; margin-top: 22px;">
                    <div
                        style="width: 24px; height: 24px; border-radius: 50%; background-color: #3f51b5; color: #fff; display: flex; justify-content: center; align-items: center; font-size: 12px; font-weight: 400 ; line-height: 12.2px; ; text-align: center;">
                        A
                    </div>
                    <div style="margin-left: 10px; flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4
                                style="margin: 0; font-size: 12px; color: #6E7073; font-weight: 400; line-height: 12px; letter-spacing: 0.4%; color: #333;">
                                Aakash Sharma</h4>
                            <span
                                style="font-size: 10px; color: #0E1116; font-weight: 400; line-height: 11px; padding-right: 19px;">07/11/2024</span>
                        </div>
                        <p
                            style="margin: 8px 0 0; font-size: 14px; color: #0E1116; font-weight: 400; line-height: 15px; letter-spacing: 0.25%;">
                            Lorem ipsum dolor sit amet, consec...
                        </p>
                        <p
                            style="font-size: 10px; font-weight: 400; line-height: 11px; color: #6E7073; margin: 0; padding-top: 4px;">
                            Duis aute irure dolor in reprehenderit in voluptate velit
                            esse cillum dolore eu fugiat nulla pariatur...
                        </p>
                        <p style="margin: 4px 0; font-size: 12px; color: #888;">
                            <span style="font-size: 12px; color: #6E7073; height: 12px; width: 12px;">📎</span> <span
                                style="font-size: 10px; font-weight: 400; line-height: 11px; color: #0E1116;"> 1
                                Attachment</span>
                        </p>
                    </div>
                </div>

                <!-- Notification 2 -->
                <div
                    style="height: 79px; display: flex;  border-bottom: 1px solid #e5e5e5; padding-left: 20px; padding-top: 14px;">
                    <div
                        style="width: 24px; height: 24px; border-radius: 50%; background-color: #9A19E5; color: #fff; display: flex; justify-content: center; align-items: center; font-size: 12px; font-weight: 400 ; line-height: 12.2px; ; text-align: center;">
                        A
                    </div>
                    <div style="margin-left: 10px; flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4
                                style="margin: 0; font-size: 12px; color: #6E7073; font-weight: 400; line-height: 12px; letter-spacing: 0.4%; color: #333;">
                                Aayush Kumar</h4>
                            <span
                                style="font-size: 10px; color: #0E1116; font-weight: 400; line-height: 11px; padding-right: 19px;">09/11/2024</span>
                        </div>
                        <p
                            style="margin: 8px 0 0; font-size: 14px; color: #0E1116; font-weight: 400; line-height: 15px; letter-spacing: 0.25%;">
                            Lorem ipsum dolor sit amet, consec...
                        </p>
                        <p
                            style="font-size: 10px; font-weight: 400; line-height: 11px; color: #6E7073; margin: 0; padding-top: 4px;">
                            Duis aute irure dolor in reprehenderit in voluptate vel...
                        </p>

                    </div>
                </div>

                <!-- Notification 3 -->
                <div
                    style="height: 110px; display: flex;  border-bottom: 1px solid #D9D9D9 ; padding-left: 20px; padding-top: 14px;">
                    <div
                        style="width: 24px; height: 24px; border-radius: 50%; background-color: #E5C619; color: #fff; display: flex; justify-content: center; align-items: center; font-size: 12px; font-weight: 400 ; line-height: 12.2px; ; text-align: center;">
                        B
                    </div>
                    <div style="margin-left: 10px; flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4
                                style="margin: 0; font-size: 12px; color: #6E7073; font-weight: 400; line-height: 12px; letter-spacing: 0.4%; color: #333;">
                                Binod Yadav</h4>
                            <span
                                style="font-size: 10px; color: #0E1116; font-weight: 400; line-height: 11px; padding-right: 19px;">10/11/2024</span>
                        </div>
                        <p
                            style="margin: 8px 0 0; font-size: 14px; color: #0E1116; font-weight: 400; line-height: 15px; letter-spacing: 0.25%;">
                            Lorem ipsum dolor sit amet, consec...
                        </p>
                        <p
                            style="font-size: 10px; font-weight: 400; line-height: 11px; color: #6E7073; margin: 0; padding-top: 4px;">
                            Duis aute irure dolor in reprehenderit in voluptate velit
                            esse cillum dolore eu fugiat nulla pariatur...
                        </p>

                        <p style="margin: 8px 0; font-size: 12px; color: #888;">
                            <span style="font-size: 12px; color: #6E7073; height: 12px; width: 12px;">📎</span> <span
                                style="font-size: 10px; font-weight: 400; line-height: 11px; color: #0E1116;"> 1
                                Attachment</span>
                        </p>
                    </div>
                </div>
            </div>
            <!-- this week close  -->
        </div>

        <div
            style="flex-grow: 1; background-color: white; display: flex; justify-content: center; align-items: center; flex-direction: column; gap: 0px;">
            <img src="/Group 18805.png" alt="">
            <h3
                style="margin: 0px; margin-top: 12px; font-size: 19px; font-weight: 500; line-height: 20.9px; letter-spacing: 0.15%; color: #0E1116; text-align: center;">
                Select an item to read
            </h3>

            <p
                style="margin: 0px; margin-top: 6px; color: #808080; font-size: 12px; line-height: 13.2px; letter-spacing: 0.4%; text-align: center;">
                Nothing is selected
            </p>

        </div>
    </div>

            
            `
        );
    }
    else {
        $('#email').html(
            `<div class="container" style="max-width:700px">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h6></h6>
            <button class="btn btn-primary btn-sm" id="createCominucation">
                <i class="bi bi-plus
                "></i> New Email
            </button>
        </div>
        <div class="container my-4">
            <div class="timeline">
                <div class="timeline-dot"></div>
                ${cominucation.map((item) => {
                return `
                    <div class="timeline-icon my-2">
                    <i class="fa fa-envelope"></i>
                </div>
                <div class="ml-4 p-3 card">
                    <div class="">
                        <span class="sender">Administrator<span
                                class="email-address">&lt;${item?.sender}&gt;</span></span>
                        <span class="time">${item?.communication_date ?? '--'}</span>
                    </div>
                    <div class="email-body">
                        <div class="">
                            <strong>To:</strong>${item?.recipients ?? '--'}
                            <br>
                            ${item?.subject ?? '--'}
                        </div>
                        <div class="border-top">
                            <span class="dropdown-toggle"  data-toggle="collapse" data-target="#collapseExample-${item?.name}" aria-expanded="false" aria-controls="collapseExample-${item?.name}"></span>
                            <div class="collapse" id="collapseExample-${item?.name}">
                                ${item?.content ?? '--'}
                            </div>
                        </div>
                    </div>
                </div>
                    `
            }).join('')
            }
                <!--  -->
            </div>
        </div>
    </div>`
        );
    }
    $('#createCominucation').on('click', () => {
        console.log('first')
        // let cominucation_form = new frappe.ui.Dialog({
        //     title: 'New Cominucation',
        //     fields: [
        //         {
        //             label: 'Subject',
        //             fieldname: 'subject',
        //             fieldtype: 'Data',
        //             reqd: 1
        //         },
        //         {
        //             label: 'Communication Type',
        //             fieldname: 'communication_type',
        //             fieldtype: 'Select',
        //             options: ['Communication', 'Comment'],
        //             reqd: 1
        //         },
        //         {
        //             label: 'Communication Date',
        //             fieldname: 'communication_date',
        //             fieldtype: 'Date',
        //             reqd: 1
        //         },
        //         {
        //             label: 'Communication Medium',
        //             fieldname: 'communication_medium',
        //             fieldtype: 'Select',
        //             options: ['Email', 'Phone', 'SMS'],
        //             reqd: 1
        //         },
        //         {
        //             label: 'Sender',
        //             fieldname: 'sender',
        //             fieldtype: 'Data',
        //             reqd: 1
        //         },
        //         {
        //             label: 'Recipient',
        //             fieldname: 'recipient',
        //             fieldtype: 'Data',
        //             reqd: 1
        //         },
        //         {
        //             label: 'Communication Status',
        //             fieldname: 'communication_status',
        //             fieldtype: 'Select',
        //             options: ['Open', 'Closed'],
        //             reqd: 1
        //         },
        //         {
        //             label: 'Content',
        //             fieldname: 'content',
        //             fieldtype: 'Text',
        //             reqd: 1
        //         }
        //     ],
        //     primary_action_label: 'Create',
        //     primary_action(values) {
        //         frappe.call({
        //             method: 'mgrant.mgrant.doctype.communication.communication.create_cominucation',
        //             args: {
        //                 doctype: frm.doctype,
        //                 docname: frm.doc.name,
        //                 values
        //             },
        //             callback: function (r) {
        //                 if (r.message) {
        //                     frappe.show_alert({ message: __(`Cominucation created successfully`), indicator: 'green' })
        //                     cominucation_form.hide();
        //                     cominucation(frm);
        //                 }
        //             }
        //         });
        //     }
        // });
        // cominucation_form.show();
    });
}