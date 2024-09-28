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
                <div class="d-flex justify-content-end align-items-center mb-3">
                    <button class="btn btn-dark btn-sm" id="createCominucation">
                        <i class="bi bi-plus
                        "></i> New Cominucation
                    </button>
                </div>
                <div class=" d-flex justify-content-center align-items-center">
                    <h4 class="">No cominucation found</h4>
                </div>
            </div>`
        );
    }
    else {
        $('#email').html(
            `<div class="container" style="max-width:700px">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h6></h6>
            <button class="btn btn-dark btn-sm" id="createCominucation">
                <i class="bi bi-plus
                "></i> New Email
            </button>
        </div>
        <div class="container my-4">
            <div class="timeline">
                <div class="timeline-dot"></div>
                <!--  -->
                ${cominucation.map((item) => {
                return `
                    <div class="timeline-icon my-2">
                    <i class="fa fa-envelope"></i>
                </div>
                <div class="ml-4 p-3 card">
                    <div class="">
                        <span class="sender">Administrator <span
                                class="email-address">&lt;admin@example.com&gt;</span></span>
                        <span class="time">just now</span>
                    </div>
                    <div class="email-body">
                        <div class="">
                            <strong>To:</strong> rkrahul00011@gmail.com
                            <br>
                            <strong>Subject:</strong> Test
                        </div>
                        <div class="border-top">
                            Test
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
        let cominucation_form = new frappe.ui.Dialog({
            title: 'New Cominucation',
            fields: [
                {
                    label: 'Subject',
                    fieldname: 'subject',
                    fieldtype: 'Data',
                    reqd: 1
                },
                {
                    label: 'Communication Type',
                    fieldname: 'communication_type',
                    fieldtype: 'Select',
                    options: ['Communication', 'Comment'],
                    reqd: 1
                },
                {
                    label: 'Communication Date',
                    fieldname: 'communication_date',
                    fieldtype: 'Date',
                    reqd: 1
                },
                {
                    label: 'Communication Medium',
                    fieldname: 'communication_medium',
                    fieldtype: 'Select',
                    options: ['Email', 'Phone', 'SMS'],
                    reqd: 1
                },
                {
                    label: 'Sender',
                    fieldname: 'sender',
                    fieldtype: 'Data',
                    reqd: 1
                },
                {
                    label: 'Recipient',
                    fieldname: 'recipient',
                    fieldtype: 'Data',
                    reqd: 1
                },
                {
                    label: 'Communication Status',
                    fieldname: 'communication_status',
                    fieldtype: 'Select',
                    options: ['Open', 'Closed'],
                    reqd: 1
                },
                {
                    label: 'Content',
                    fieldname: 'content',
                    fieldtype: 'Text',
                    reqd: 1
                }
            ],
            primary_action_label: 'Create',
            primary_action(values) {
                frappe.call({
                    method: 'mgrant.mgrant.doctype.communication.communication.create_cominucation',
                    args: {
                        doctype: frm.doctype,
                        docname: frm.doc.name,
                        values
                    },
                    callback: function (r) {
                        if (r.message) {
                            frappe.show_alert({ message: __(`Cominucation created successfully`), indicator: 'green' })
                            cominucation_form.hide();
                            cominucation(frm);
                        }
                    }
                });
            }
        });
        cominucation_form.show();
    });
}