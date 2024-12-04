var selectedFiles = [];
const append_gallery_styles = () => {
    // Append CSS Styles for the Gallery
    const style = document.createElement('style');
    style.innerHTML = `
    .card-img-top {
        // width: 100%;
        // height: 200px;
    }
    .gallery {
        margin-bottom: 20px;
    }
    .table {
        width: 100%;
        border-collapse: collapse;
    }
    /* Add styles for selected checkbox */
    .checkbox-container {
        display: flex;
        align-items: center;
    }
    .checkbox-container input[type="checkbox"] {
        margin-right: 10px;
    }
    /* Add checkbox on top of the image */
    .checkbox-container {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 10; /* Ensure checkbox is above the image */
    }
    .checkbox-container input[type="checkbox"] {
        width: 20px !important;
        height: 20px !important;
        background-color: rgba(0, 0, 0, 0.2); /* Semi-transparent background */
        border: 2px solid #fff; /* White border for visibility */
    }
    .card-img-top {
        width: 100%;
        height: 200px;
        position: relative; /* To position checkbox on top of image */
        object-fit: cover; /* Ensure the image covers the space nicely */
    }
    /* Style the checkbox when it is checked */
    .checkbox-container input[type="checkbox"]:checked {
        background-color: #A01236; /* Highlight color when checked */
        border-color: #fff;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5); /* Add shadow effect for checked state */
    }
    /* Ensure the image takes up full space */
    .card-img-top {
        width: 100%;
        height: 200px;
        position: relative; /* Ensure the checkbox is positioned relative to the image */
        object-fit: cover; /* Ensure the image covers the space without distortion */
    }
    /* Initially hide the checkbox container */
    .checkbox-container {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 10; /* Ensure the checkbox is above the image */
        display: none; /* Hide checkbox initially */
    }
    /* Show the checkbox when the image is hovered */
    .card:hover .checkbox-container {
        display: block; /* Display the checkbox only when the card is hovered */
    }
    /* Checkbox styling */
    .checkbox-container input[type="checkbox"] {
        width: 20px;
        height: 20px;
        background-color: rgba(0, 0, 0, 0.2); /* Semi-transparent background */
        border: 2px solid #fff; /* White border for visibility */
    }
    /* Highlight checkbox when checked */
    .checkbox-container input[type="checkbox"]:checked {
        background-color: #A01236; /* Highlight color when checked */
        border-color: #fff;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5); /* Shadow effect */
    }
    
    .dropeditBBTn {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 10;
        display: none;
    }
    .card:hover .dropeditBBTn {
        display: block;
    }
    .dropdown-menu {
        min-width: 120px;
        padding: 0;
        margin: 0;
        border: none;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .dropdown-menu a {
        padding: 5px 10px;
        font-size: 14px;
    }
    .dropdown-menu a:hover {
        background-color: #f1f1f1;
    }
    .dropdown-menu a i {
        margin-right: 5px;
    }
    .pointer {
        cursor: pointer;
    }
`;
    document.head.appendChild(style);
};
const renderCardView = (files) => {
    return `
            <div class="row mt-3" style="font-size:16px !important;">
            ${files.map(file => `
                <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
            <div class="card gallery">
            <div class="checkbox-container" >
            <input type="checkbox" data-id="${file.name}" class="toggleCheckbox"/>
            </div>
            <div class="dropdown dropeditBBTn">
                    <p title="action" class="pointer " id="dropdownMenuButton-" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="fa fa-ellipsis-h " style="transform: rotate(90deg); font-size: 16px; width: 20px; height: 20px; color: white;"></i>
                    </p>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton-${file.name}">
                        <a class="dropdown-item edit-btn"  data-id="${file.name}">Edit</a>
                        <a class="dropdown-item delete-btn"  data-id="${file.name}">Delete</a>
                    </div>
                </div>
            <img src="${file.image}" class="card-img-top" alt="${file.title}">
            <h5 class="card-title px-1">${file.title}</h5>
            <p class="card-text px-1">${getFormattedDate(file.creation)}</p>
            </div>
            </div>
            `).join('')}
            </div>
            `;
}
const renderHeader = (files, view) => {
    return `
            <div class="row" id="galleryHeader" style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
            <div style="gap: 16px; display: flex;">
            <span class="text-dark" style="font-weight: 400; font-size: 14px;">Total: ${files.length}</span>
            </div>
            <div style="display: flex; gap: 12px;">
            <button class="btn btn-light" style="display:none;" id="deleteSelectedButton">
            <i class="fa fa-trash" style="color: #A01236;"></i>
            </button>
            <div class="dropdown">
            <button class="btn btn-light" type="button" id="viewDropdown" data-toggle="dropdown">
            <i class="fa ${view === 'Card' ? 'fa-th-large' : 'fa-list'}"></i> ${view} View    
            <i class="fa fa-sort"></i>
            </button>
            <div class="dropdown-menu">
            <span class="dropdown-item" id="cardViewBtn"><i class="fa fa-th-large"></i> Card View</span>
            <span class="dropdown-item" id="listViewBtn"><i class="fa fa-list"></i> List View</span>
            </div>
            </div>
            <button class="btn btn-light filter-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#6E7073" class="bi bi-filter" viewBox="0 0 16 16">
            <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5"/>
            </svg>
            <span class="mx-2">Filters</span>
            </button>
            <button class="btn " id="customUploadButton" style="background-color: #A01236; color: white; width: 90px; height: 28px; border-radius: 8px; font-size: 14px;">+ Upload</button>
            </div>
            </div>
            `;
}
const renderListView = (files) => {
    return `
            <div class="table-responsive">
            <table class="table table-bordered mt-3">
            <thead>
            <tr>
            <th><input type="checkbox" id="selectAllCheckBox" style="width: 20px !important; height: 20px !important;"></th>
            <th style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">Item</th>
            <th style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">Upload Date</th>
            <th style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">Image</th>
            <th style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">Action</th>
            </tr>
            </thead>
            <tbody>
            ${files.map(file => `
                <tr>
                <td><input type="checkbox" class="toggleCheckbox" data-id="${file.name}" style="width: 20px !important; height: 20px !important;"></td>
                <td>${file.title}</td>
                <td>${getFormattedDate(file.creation)}</td>
                <td><img src="${file.image}" style="width: 32px; height: 27px; border-radius: 4px;"></td>
                <td>
                 <div class="dropdown">
                    <p title="action" class="pointer " id="dropdownMenuButton-" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="fa fa-ellipsis-h " style="transform: rotate(90deg); font-size: 16px; width: 20px; height: 20px;"></i>
                    </p>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton-${file.name}">
                        <a class="dropdown-item edit-btn"  data-id="${file.name}">Edit</a>
                        <a class="dropdown-item delete-btn"  data-id="${file.name}">Delete</a>
                    </div>
                </div>
                </td>
                </tr>
                `).join('')}
                </tbody>
                </table>
                </div>
                `;
}

// handle edit and delete button click event
$(document).on('click', '.edit-btn', async function () {
    const fileId = $(this).data('id');

    try {
        // Fetch the document from the Gallery
        const docInfo = await frappe.db.get_doc('Gallery', fileId);

        // Fetch the field meta data for the Gallery doctype
        const fields = await frappe.call("frappe_theme.api.get_meta_fields", { doctype: 'Gallery' });

        // Prepare fields with default values
        const dialogFields = fields?.message?.map(f => {
            if (f.fieldname === "document_type") {
                f.default = docInfo.document_type; // Set default document type
            } else if (f.fieldname === "document_name") {
                f.default = docInfo.document_name; // Set default document name
            } else if (f.fieldname === "title") {
                f.default = docInfo.title; // Set default title
            } else if (f.fieldname === "image") {
                f.default = docInfo.image; // Set default image
            }
            return f; // Return the field object after modifying
        });

        // Create the dialog with the updated fields
        const galDialog = new frappe.ui.Dialog({
            title: __("Edit File"),
            fields: dialogFields,
            primary_action_label: __("Submit"),
            primary_action: async () => {
                const formData = galDialog.get_values(); // Get values from the dialog

                if (formData) {
                    try {
                        // Update the document with new values
                        const updatedDoc = await frappe.db.set_value('Gallery', fileId, formData);

                        if (updatedDoc) {
                            frappe.show_alert({ message: __('Gallery updated successfully'), indicator: 'green' });
                            galDialog.hide();

                            // Optionally update the gallery list or refresh the data
                            // You can update the gallery list if required
                            let updatedGalleryList = galleryList.map(item =>
                                item.name === updatedDoc.name ? updatedDoc : item
                            );
                            galleryList(updatedGalleryList); // Refresh the list
                        }
                    } catch (error) {
                        console.error(error);
                        frappe.show_alert({ message: __('There was an error updating the file'), indicator: 'red' });
                    }
                }
            }
        });

        // Pre-fill the form with existing data
        galDialog.set_values(docInfo);

        // Show the dialog
        galDialog.show();
    } catch (error) {
        frappe.msgprint(__('Error loading document data.'));
        console.error(error);
    }
});



$(document).on('click', '.delete-btn', async function () {
    const fileId = $(this).data('id');

    try {
        // Fetch the document from the Gallery
        const docInfo = await frappe.db.get_doc('Gallery', fileId);

        // Fetch the field meta data for the Gallery doctype
        const fields = await frappe.call("frappe_theme.api.get_meta_fields", { doctype: 'Gallery' });

        // Prepare fields with default values
        const dialogFields = fields?.message?.map(f => {
            if (f.fieldname === "document_type") {
                f.default = docInfo.document_type; // Set default document type
            } else if (f.fieldname === "document_name") {
                f.default = docInfo.document_name; // Set default document name
            } else if (f.fieldname === "title") {
                f.default = docInfo.title; // Set default title
            } else if (f.fieldname === "image") {
                f.default = docInfo.image; // Set default image
            }
            return f; // Return the field object after modifying
        });

        // Create the dialog with the updated fields
        const galDialog = new frappe.ui.Dialog({
            title: __("Edit or Delete File"),
            fields: dialogFields,
            primary_action_label: __("Submit"),
            primary_action: async () => {
                const formData = galDialog.get_values(); // Get values from the dialog
                if (formData) {
                    try {
                        // Make an API call to update the Gallery document
                        await frappe.call({
                            method: "frappe_theme.api.update_gallery",
                            args: {
                                fileId: fileId,
                                data: formData
                            },
                            callback: function (response) {
                                frappe.msgprint(__('File updated successfully.'));
                                galDialog.hide();
                            }
                        });
                    } catch (error) {
                        frappe.msgprint(__('Error updating file.'));
                    }
                }
            },
            secondary_action_label: __("Delete"),
            secondary_action: async () => {
                // Confirm the deletion
                const confirmDelete = await frappe.confirm(__('Are you sure you want to delete this file?'), async () => {
                    try {
                        // Call the delete method for Gallery
                        await frappe.call({
                            method: "frappe_theme.api.delete_gallery",
                            args: { fileId: fileId },
                            callback: function (response) {
                                if (response && response.message === 'success') {
                                    frappe.msgprint(__('File deleted successfully.'));
                                    galDialog.hide();

                                    // Optionally update the gallery list or refresh the data
                                    galleryList = galleryList.filter(item => item.name !== fileId); // Remove the deleted file from the list
                                    // Refresh the gallery list UI
                                    updateGalleryListUI(galleryList); // Assuming you have a method to refresh the list in the UI
                                } else {
                                    frappe.msgprint(__('Error deleting file.'));
                                }
                            }
                        });
                    } catch (error) {
                        frappe.msgprint(__('Error deleting file.'));
                    }
                });
            }
        });

        // Show the dialog
        galDialog.show();
    } catch (error) {
        frappe.msgprint(__('Error loading document data.'));
        console.error(error);
    }
});


const updateGallery = (wrapper, files, view) => {
    if (view === 'Card') {
        wrapper.querySelector('#gallery-body').innerHTML = renderCardView(files);
    } else {
        wrapper.querySelector('#gallery-body').innerHTML = renderListView(files);
    }
    $('.toggleCheckbox').on('change', function () {
        const fileId = $(this).data('id');
        if (this.checked) {
            selectedFiles.push(fileId);
        } else {
            selectedFiles = selectedFiles.filter((fid) => fid != fileId);
        }
        // Show delete button if any file is selected
        let deleteSelectedButton = document.getElementById('deleteSelectedButton');
        if (selectedFiles.length > 0) {
            deleteSelectedButton.style.display = 'block';
        } else {
            deleteSelectedButton.style.display = 'none';
        }
    });
}
const gallery_image = async (frm) => {
    var view = 'Card';
    append_gallery_styles();
    // Fetch files related to the document
    let files = await frappe.db.get_list('Gallery', {
        fields: ['name', 'image', 'title', 'creation'],
        filters: {
            'document_name': ['=', frm.doc.name],
            'document_type': ['=', frm.doc.doctype],
        },
        limit: 1000,
    });
    let wrapper = document.querySelector('[data-fieldname="gallery"]');
    let header_wrapper = document.createElement('div');
    header_wrapper.id = 'gallery-header';
    if (!wrapper.querySelector('#gallery-header')) {
        wrapper.appendChild(header_wrapper);
    }
    let body_wrapper = document.createElement('div');
    body_wrapper.id = 'gallery-body';
    if (!wrapper.querySelector('#gallery-body')) {
        wrapper.appendChild(body_wrapper);
    }
    wrapper.querySelector('#gallery-header').innerHTML = renderHeader(files, 'Card');
    updateGallery(wrapper, files, view);
    // Handle Upload
    $('#customUploadButton').on('click', async () => {
        const docInfo = await frappe.call("frappe_theme.api.get_meta_fields", { doctype: 'Gallery' });
        // Update the fields dynamically
        const fields = docInfo?.message?.map(f => {
            if (f.fieldname === "document_type") {
                f.default = frm.doc.doctype; // Set default document type
            } else if (f.fieldname === "document_name") {
                f.default = frm.doc.name; // Set default document name
            }
            return f;
        });
        const galDialog = new frappe.ui.Dialog({
            title: __("Upload Files"),
            fields: fields,
            primary_action: async function (values) {
                await frappe.db.insert({ doctype: 'Gallery', ...values });
                galDialog.hide();
                // Fetch the updated files list after the new image upload
                files = await frappe.db.get_list('Gallery', { fields: ['name', 'image', 'title', 'creation'] });
                // Update the gallery after the image is uploaded
                updateGallery(wrapper, files, view);
            },
        });
        galDialog.show();
    });
    $('#deleteSelectedButton').on('click', async () => {
        frappe.confirm('Are you sure you want to delete the selected files?', async () => {
            for (const fileId of selectedFiles) {
                await frappe.db.delete_doc('Gallery', fileId);
            }
            // Remove deleted files from the files list
            files = files.filter(file => !selectedFiles.includes(file.name));
            selectedFiles = [];
            let deleteSelectedButton = document.getElementById('deleteSelectedButton');
            deleteSelectedButton.style.display = 'none';
            updateGallery(wrapper, files, view);
        });
    });

    $('#cardViewBtn').on('click', () => {
        view = 'Card';
        selectedFiles = [];
        let deleteSelectedButton = document.getElementById('deleteSelectedButton');
        deleteSelectedButton.style.display = 'none';
        updateGallery(wrapper, files, view);
    });
    $('#listViewBtn').on('click', () => {
        view = 'List';
        selectedFiles = [];
        let deleteSelectedButton = document.getElementById('deleteSelectedButton');
        deleteSelectedButton.style.display = 'none';
        updateGallery(wrapper, files, view);
    });
};
