const gallery_image = async (frm) => {
    const style = document.createElement('style');
    style.innerHTML = `
        .card-img-top {
            border-radius: inherit;
            width: 100%;
            height: 200px;
        }
        .gallery {
            margin-bottom: 20px;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
        }
    `;
    document.head.appendChild(style);

    let view = 'Card'; // Default view
    let files = await frappe.db.get_list('Gallery', {
        fields: ['name', 'image', 'title', 'creation'],
        filters: {
            'document_name': ['=', frm.doc.name],
            'document_type': ['=', frm.doc.doctype],
        },
        limit: 1000,
    });

    const selectedFiles = new Set(); // To track selected files

    const renderHeader = () => `
        <div class="row" style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
            <div style="gap: 16px; display: flex;">
                <span class="text-dark" style="font-weight: 400; font-size: 14px; line-height: 15px; color: #6E7073;">
                    Total:
                </span>
                <span style="font-weight: 400; font-size: 14px; line-height: 15px; color: #0E1116;">
                    ${files.length}
                </span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                ${selectedFiles.size > 0
            ? `
                 
                       <button class="btn btn-light" id="deleteSelectedButton">
                         <i class="fa fa-trash" style="color: #A01236;"></i>
                        </button>

                    `
            : ''
        }
                <div class="dropdown">
                    <button class="btn btn-light" type="button" id="viewDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="fa ${view === 'Card' ? 'fa-th-large' : 'fa-list'}" style="color: #6E7073;"></i> ${view} View    
                        <i class="fa fa-sort" style="color: #6E7073;"></i>
                    </button>
                    <div class="dropdown-menu" aria-labelledby="viewDropdown">
                        <span class="dropdown-item" id="cardViewBtn">
                            <i class="fa fa-th-large"></i> Card View
                        </span>
                        <span class="dropdown-item" id="listViewBtn">
                            <i class="fa fa-list"></i> List View
                        </span>
                    </div>
                </div>
                <button class="btn btn-light d-flex align-items-center filter-btn">
                    <!-- Filter Icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#6E7073" class="bi bi-filter" viewBox="0 0 16 16">
                        <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5"/>
                    </svg>
                    <!-- Label -->
                    <span class="mx-2" style="color: #6E7073;">Filters</span>
                </button>
                <button class="btn" id="customUploadButton" style="background-color: #A01236; color: white; width: 90px; height: 28px; border-radius: 8px; font-size: 14px;">+ Upload</button>
            </div>
        </div>
    `;

    const renderCardView = () => `
        <div class="row mt-3">
            ${files.map(file => `
                <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                    <div class="card gallery position-relative" style="border: none; overflow: hidden;">
                        <input type="checkbox"  data-id="${file.name}"  class="toggleCheckbox position-absolute"
                style="top: 10px; left: 10px; width: 20px; height: 20px; z-index: 1000; opacity: 0; transition: opacity 0.3s ease;" />

                        <img src="${file.image}" class="card-img-top" alt="${file.title}" style="border-radius: inherit; width: 100%; height: 200px; object-fit: cover;">
                            <div class="overlay position-absolute"
                style="top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.4); opacity: 0; transition: opacity 0.3s ease;">
            </div>
                <div class="position-absolute"
                style="top: 10px; right: 10px; z-index: 1000; opacity: 0; transition: opacity 0.3s ease;">
                <div class="dropdown">
                    <button class="btn btn-light" type="button" id="dropdownMenuButton-" data-toggle="dropdown"
                        aria-haspopup="true" aria-expanded="false">
                        <i class="fa fa-ellipsis-h"
                            style="font-size: 18px; color: rgba(255, 255, 255, 0.7); transition: color 0.3s ease;"></i>
                    </button>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton-">
                        <a class="dropdown-item edit-btn" data-task="">Edit</a>
                        <a class="dropdown-item delete-btn" data-task="">Delete</a>
                    </div>
                </div>
            </div>
                        <h5 class="card-title">${file.title}</h5>
                        <span class="card-text">${file.creation}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    // Add hover styles
    const hoverStyle = document.createElement('style');
    hoverStyle.innerHTML = `
.gallery:hover .toggleCheckbox,
.gallery:hover .dropdown-menu {
opacity: 1 !important;
}
.gallery:hover .overlay {
opacity: 1 !important;
}
.gallery:hover .dropdown-menu {
display: block !important;
}
.gallery .dropdown button:hover i {
color: #ffffff !important; /* Highlight color on hover */
}
.gallery {
position: relative;
}
`;
    document.head.appendChild(hoverStyle);
    const renderListView = () => `
        <div class="table-responsive">
        <table class="table table-bordered mt-3">
            <thead class="thead-light">
                <tr>
                    <th ><input type="checkbox" id="selectAllCheckBox" style="width: 20px !important; height: 20px !important; "></th>
                   <th style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">Item</th>
                    <th style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">Upload Date</th>
                    <th style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">Image</th>
                    <th style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">Action</th>
                </tr>
            </thead>
            <tbody style="height: 20px; !important">
                ${files.map(file => `
                    <tr >
                        <td><input type="checkbox" class="toggleCheckbox" data-id="" style="width: 20px !important; height: 20px !important; text-align: center !important;" ></td>
                       <td style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #0E1116;">${file.title}</td>
                     <td style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #0E1116;">${file.creation}</td>
                        <td><img src="${file.image}" class="card-img-top" alt="${file.file_name}" style="border-radius: 4px; width: 32px; height: 27px; object-fit: cover; "></td>
                         <td>
                            <div class="dropdown">
                                    <p title="action" class="pointer " id="dropdownMenuButton-" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="fa fa-ellipsis-h " style="transform: rotate(90deg); font-size: 16px; width: 20px; height: 20px;"></i>

                                    </p>
                                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton-">
                                        <a class="dropdown-item edit-btn" data-task="">Edit</a>
                                        <a class="dropdown-item delete-btn" data-task="">Delete</a>
                                    </div>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        </div>
    `;
    const updateGallery = () => {
        const galleryContainer = $('[data-fieldname="gallery"]');
        galleryContainer.html(renderHeader() + (view === 'Card' ? renderCardView() : renderListView()));

        // Event Listeners
        $('#cardViewBtn').on('click', () => {
            view = 'Card';
            updateGallery();
        });
        $('#listViewBtn').on('click', () => {
            view = 'List';
            updateGallery();
        });
        $('.toggleCheckbox').on('change', function () {

            const fileId = $(this).data('id');
            console.log(fileId, 'fileId');

            if (this.checked) {
                selectedFiles.add(fileId);
            } else {
                selectedFiles.delete(fileId);
            }
            if (selectedFiles.length < 1) {
                $('#moveToFolderDropdown').hide();
                $('#deleteSelectedButton').hide();
                updateGallery();
            } else {
                $('#moveToFolderDropdown').show();
                $('#deleteSelectedButton').show();
                updateGallery();
            }

        });
        $('#deleteSelectedButton').on('click', async () => {
            for (const fileId of selectedFiles) {
                await frappe.db.delete_doc('Gallery', fileId);
            }
            selectedFiles.clear();
            files = files.filter(file => !selectedFiles.has(file.name));
            updateGallery();
        });
    };

    if (!files.length) {
        const galleryContainer = $('[data-fieldname="gallery"]');
        galleryContainer.html(renderHeader() +
            `<div class="d-flex justify-content-center text-muted align-items-center" style="width: 100%;">
                <h4>No images found</h4>
            </div>`);
    } else {
        updateGallery();
    }

    $('#customUploadButton').off('click').on('click', async () => {
        console.log('Upload button clicked');

        // Fetch the DocType details
        const docInfo = await frappe.db.get_doc("DocType", "Gallery");

        // Update the fields dynamically
        const fields = docInfo.fields.map(f => {
            if (f.fieldname === "document_type") {
                f.default = frm.doc.doctype; // Set default document type
            } else if (f.fieldname === "document_name") {
                f.default = frm.doc.name; // Set default document name
            }
            return f;
        });

        // Create and show the upload dialog
        const galDialog = new frappe.ui.Dialog({
            title: __("Upload Files"),
            fields: fields,
            primary_action: async function (values) {
                // Insert the uploaded file into the database
                const fileObj = { doctype: "Gallery", ...values };
                await frappe.db.insert(fileObj);

                // Hide the dialog and update the gallery
                galDialog.hide();
                files = await frappe.db.get_list('Gallery', {
                    fields: ['name', 'image', 'title', 'creation'],
                    filters: {
                        'document_name': ['=', frm.doc.name],
                        'document_type': ['=', frm.doc.doctype],
                    },
                    limit: 1000,
                });
                updateGallery();
            },
            primary_action_label: 'Upload',
        });
        galDialog.show();
    });

};
