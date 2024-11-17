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
            `<div class="container">
                <div class="row d-flex justify-content-end align-items-center mb-3">
                    <button class="btn btn-primary btn-sm" id="createCominucation">
                        <svg class="es-icon es-line  icon-xs" style="" aria-hidden="true">
                            <use class="" href="#es-line-add"></use>
                        </svg> New Email
                    </button>
                </div>
             <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/>
        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"/>
    </svg>
    <h4 style="font-weight: 500; font-size: 33px; line-height: 36.3px; letter-spacing: 0.25%;">Enable Email Viewing on Portal</h4>
    <p style="font-weight: 400; color: #6E7073; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; text-align: center;">
        Please adjust your email app settings to allow external access, so you can view your emails
    </p>
    <span style="font-weight: 400; color: #6E7073; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; text-align: center;">
        directly within the portal.
    </span>
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