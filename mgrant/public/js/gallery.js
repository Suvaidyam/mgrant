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
    let files = await frappe.db.get_list('File', {
        fields: ['file_name', 'file_url', 'is_folder'],
        filters: {
            'is_folder': ['=', 0],
            'attached_to_name': ['=', frm.doc.name],
        },
        limit: 1000,
    });

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
                    <!-- Vertical Line Separator -->
                    <div style="height: 20px; width: 1px; background-color: #6E7073; margin: 0 8px;"></div>
                    <!-- Close Icon -->
                    <span aria-hidden="true" style="font-size: 16px; line-height: 16px; display: inline-block; width: 16px; height: 16px; color: #6E7073;">&times;</span>
                </button>
                <button class="btn" id="customUploadButton" style="background-color: #A01236; color: white; width: 90px; height: 28px; border-radius: 8px; font-size: 14px;">+ Upload</button>
            </div>
        </div>
    `;

    const renderCardView = () => `
        <div class="row mt-3">
            ${files.map(file => `
                <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                    <div class="card gallery" style="border: none; overflow: hidden;">
                        <img src="${file.file_url}" class="card-img-top" alt="${file.file_name}" style="border-radius: inherit; width: 100%; height: 200px; object-fit: cover;">
                    </div>
                    <h5 class="card-title" style="font-weight: 500; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #0E1116; margin: 10px 0 5px 0;"> 
                        Field Visit #239
                    </h5>
                    <span class="card-text" style="font-weight: 400; font-size: 10px; line-height: 11px; letter-spacing: 1.5%; color: #6E7073; margin: 0;">
                        10/11/2024
                    </span>
                </div>
            `).join('')}
        </div>
    `;

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
                       <td style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #0E1116;">${file.file_name}</td>
                     <td style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #0E1116;">10/11/2024</td>
                        <td><img src="${file.file_url}" class="card-img-top" alt="${file.file_name}" style="border-radius: 4px; width: 32px; height: 27px; object-fit: cover; "></td>
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

        $('#cardViewBtn').on('click', () => {
            view = 'Card';
            updateGallery();
        });
        $('#listViewBtn').on('click', () => {
            view = 'List';
            updateGallery();
        });
        $('#customUploadButton').on('click', async () => {
            console.log('Upload button clicked');
            let qed = await frappe.ui.form.make_quick_entry("Gallery", { documnet_type: frm.doctype, document_name: frm.doc.name });
            console.log(qed, 'qed');
        });
    };

    if (!files.length) {
        $('[data-fieldname="gallery"]').html(`
            <div class="d-flex justify-content-center text-muted align-items-center" style="width: 100%;">
                <h4>No images found</h4>
            </div>
        `);
    } else {
        updateGallery();
    }
};
