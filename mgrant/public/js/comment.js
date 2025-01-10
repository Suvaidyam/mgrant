async function get_comment_list(frm, selector) {
    const response = await frappe.call({
        method: 'frappe.client.get_list',
        args: {
            doctype: 'mGrant Comment',
            fields: ['*'],
            filters: { 'reference_doctype': frm.doc.doctype, 'related_to': frm.doc.name },
            limit_page_length: 10000,
        },
    });
    let comment_list = response.message;
    console.log(comment_list)
    document.querySelector(`[data-fieldname="${selector}"]`).innerHTML = `
    <style>
        * {
            margin: 0px;
            padding: 0px;
        }
        .comment-sidebar {
            width: 100%;
            // min-width: 380px;
            height: 80vh;
            padding: 5px;
            // border-right: 1px solid #ddd;
        }
        // .comment_content{
        //     width:75%;
        // }
        .comment_title_links {
            width: 100%;
            display:block !important;
            gap:10px;
            height: calc(100% - 20px);
            overflow-y: auto;
            padding-right: 5px;
        }
        .comment-title-body{
            width:100%;
            // height: 45px;
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            background-color: #F5F5F4;
            background: #f4f4f4;
            border-radius: 10px;
            box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
            margin-top: 10px;
        }
        .comment-table-list {
            width:99%;
            // height: 45px;
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            gap: 5px;
            padding: 8px 8px 2px 10px;
            border-radius: 5px;
        }
        #comment_action_icon{
            width: 1%;
            // margin-left:5px;
            height: 100%;
            display: flex;
            padding-right:25px;
            justify-content: center;
            align-items: center;
            display: none;
        }
        // .comment-table-list:hover {
        //     cursor: pointer;
        //     background-color: #f8f9fa;
        // }
        .comment_table_item{
            display: flex !important;
            gap: 10px;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        .comment-button {
            background-color: black;
            color: white; 
            border: none; 
            border-radius: 8px; 
            padding: 4px 8px;
            font-size: 14px;
            cursor: pointer;
            margin-bottom:-6px;
            transition: background-color 0.3s, transform 0.2s;
        }
        #comment-default-message{
            height:100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }  
        .comment-title-body:hover #comment_action_icon{
            display: block !important;
        }
        #comment_action_icon .dropdown-toggle::after {
            display: none !important;
        }
        #comment_action_icon .fa {
            background: none !important;
            border: none !important;
            outline: none !important;
        }
        .comment_message{
            display: flex;
            height:100%;   
            justify-content: center;
            align-items: center;
        }
    </style>
    <div class="d-flex">
        <!-- Sidebar -->
        <div class="comment-sidebar">
            <div class="d-flex mb-2 justify-content-between align-items-center" style="height:50px; line-hight:50px; border-bottom:1px solid black">
                <h4 class="pt-4">Comments</h4>
                <button class="comment-button">Add Comment</button>
            </div>
            <div class="comment_title_links">
            ${comment_list?.length == 0 ? `
                    <div class="comment_message"><img style="width: 75px; hight: 75px;" src="/assets/mgrant/images/no-data-found.png"></div>
                    ` : `
                    ${comment_list?.map((comment) => `
                        <div class="comment-title-body">
                            <div class="comment-table-list" comment-data-table=${comment?.name}>
                                <div class='comment_table_item'>
                                    <div style="width:35px; min-width:35px;">
                                        <div class="avatar" style="width: 32px;  position: absolute; top:0; height: 32px; border-radius: 50%; background-color: #3f51b5; color: #fff; display: flex; justify-content: center; align-items: center;">
                                        ${comment?.owner[0]?.toUpperCase()}
                                        </div>
                                    </div>
                                    <div class="">
                                        <div class="" style=""; font-weight: bold;">
                                                <b>${comment?.owner}</b>
                                        </div>
                                        <div class="" style="";">
                                                <p>${comment?.comment}</p>
                                        </div>
                                    </div>
                                </div>
                                </div>
                                <div id="comment_action_icon" class="dropdown mt-2" comment_id=${comment.name}>
                                        <i class="fa fa-ellipsis-v btn btn-secondary dropdown-toggle" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="font-size:20px"></i>
                                            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                                <a class="dropdown-item" id="edit_comment" href="#">Edit</a>
                                                <a class="dropdown-item" id="delete_comment" href="#">Delete</a>
                                            </div>
                                </div>
                        </div>
                    `).join('')
        }
                    `}
            </div>
        </div>
    </div>
`;
    // document.querySelectorAll('.comment-table-list').forEach(link => {
    //     link.addEventListener('click', function (event) {
    //         event.preventDefault();
    //         const tableId = this.getAttribute('comment-data-table');
    //         showContent(tableId);
    //     });
    // });
    // window.showContent = function (tableId) {
    //     const dynamicContent = document.getElementById('comment-dynamic-content');
    //     const defaultMessage = document.getElementById('comment-default-message');
    //     dynamicContent.style.display = 'block';
    //     defaultMessage.style.display = 'none';

    //     dynamicContent.innerHTML = `
    //     ${comment_list?.filter(comment => comment.name === tableId).map(comment => `
    //             <div class="comment">
    //                 <p class="comment-title fw-bold mt-1" style="font-weight: bold;">${comment?.comment}</p>
    //             </div>
    //         `).join('')}`;
    // };

    // ============= Create comment
    document.querySelectorAll('.comment-button').forEach(link => {
        link.addEventListener('click', async () => {
            let { message: meta } = await frappe.call({
                method: 'mgrant.apis.api.get_doctype_meta',
                args: { doctype: 'mGrant Comment' }
            });

            if (meta) {
                let fields = meta.fields.map((f) => {
                    if (f?.fieldname === 'reference_doctype') {
                        f.default = frm.doc.doctype
                        f.read_only = 1
                        f.hidden = 1;
                    }
                    if (f?.fieldname === 'related_to') {
                        f.default = frm.doc.name
                        f.read_only = 1
                        f.hidden = 1;
                    }
                    return f;
                })
                let dialog = new frappe.ui.Dialog({
                    title: `Create New Comment`,
                    fields: fields,
                    primary_action_label: 'Create',
                    primary_action: () => {
                        let values = dialog.get_values();
                        if (values) {
                            frappe.call({
                                method: 'frappe.client.insert',
                                args: { doc: { doctype: 'mGrant Comment', ...values } },
                                callback: async () => {
                                    await renderComment(frm, selector)
                                    dialog.hide();
                                    frappe.show_alert({ message: 'Comment Added Successfully', indicator: 'green' });
                                }
                            });
                        }
                    },
                    secondary_action_label: 'Cancel',
                    secondary_action: () => {
                        dialog.hide();
                    }
                });
                dialog.show();
            }
        });
    });

    // ======================================== Update comment ========================================
    document.querySelectorAll('#edit_comment').forEach(link => {
        link.addEventListener('click', async function (event) {
            event.preventDefault();
            event.stopPropagation();
            const commentName = this.closest('#comment_action_icon').getAttribute('comment_id');
            if (!commentName) {
                frappe.show_alert({ message: 'Comment name not found', indicator: 'red' });
                return;
            }
            try {
                const { message: latestComment } = await frappe.call({
                    method: 'frappe.client.get',
                    args: { doctype: 'mGrant Comment', name: commentName },
                });
                if (!latestComment) {
                    frappe.show_alert({ message: 'Failed to fetch comment details', indicator: 'red' });
                    return;
                }
                const { message: meta } = await frappe.call({
                    method: 'mgrant.apis.api.get_doctype_meta',
                    args: { doctype: 'mGrant Comment' },
                });
                if (!meta || !meta.fields) {
                    frappe.show_alert({ message: 'Failed to fetch doctype metadata', indicator: 'red' });
                    return;
                }
                const fields = meta.fields.map(f => {
                    if (f?.fieldname === 'reference_doctype') {
                        f.default = latestComment?.reference_doctype;
                        f.read_only = 1;
                        f.hidden = 1;
                    } else if (f?.fieldname === 'related_to') {
                        f.default = latestComment?.related_to;
                        f.read_only = 1;
                        f.hidden = 1;
                    } else if (latestComment[f.fieldname]) {
                        f.default = latestComment[f.fieldname];
                    }
                    return f;
                });
                const dialog = new frappe.ui.Dialog({
                    title: 'Edit Comment',
                    fields: fields,
                    primary_action_label: 'Update',
                    primary_action: async (values) => {
                        try {
                            await frappe.db.set_value('mGrant Comment', commentName, values);
                            dialog.hide();
                            frappe.show_alert({ message: 'Comment updated successfully', indicator: 'green' });
                            await renderComment(frm, selector);
                        } catch (err) {
                            frappe.msgprint({ message: `Error updating comment: ${err.message}`, indicator: 'red' });
                        }
                    },
                    secondary_action_label: 'Cancel',
                    secondary_action: () => dialog.hide(),
                });
                dialog.show();
            } catch (err) {
                frappe.msgprint({ message: `Error: ${err.message}`, indicator: 'red' });
            }
        });
    });

    // ======================================== Delete Comment ========================================
    document.querySelectorAll('#delete_comment').forEach(link => {
        link.addEventListener('click', async function (event) {
            event.preventDefault();
            event.stopPropagation();
            const doc_name = this.closest('#comment_action_icon').getAttribute('comment_id');

            frappe.confirm(
                'Are you sure you want to delete this Comment?',
                () => {
                    frappe.db.delete_doc('mGrant Comment', doc_name)
                        .then(async response => {
                            frappe.show_alert({ message: 'Comment Delete successfully', indicator: 'green' });
                            await renderComment(frm, selector);
                        })
                        .catch(error => {
                            console.error("Error deleting document", error);
                        });
                },
                () => {
                    console.log('Document deletion canceled');
                }
            );
        });
    });
}


const renderComment = async (frm, selector) => {
    get_comment_list(frm, selector)
}