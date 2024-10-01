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
        .cus_style {
           min-height: 700px;
           max-height: 700px;
           overflow-y: auto;
        }    
    `;
    document.head.appendChild(style);

    $('#gallery').addClass('row cus_style')

    let files = await frappe.db.get_list('File', {
        fields: ['file_name', 'file_url', 'is_folder'],
        filters: {
            'is_folder': ['=', 0],
            'attached_to_name': ['=', frm.doc.name],
        },
        limit: 1000,
    });

    if (!files.length) {
        $('#gallery').html(`
            <div class=" d-flex justify-content-center text-muted align-items-center" style="width: 100%;">
                <h4>No images found</h4>
            </div>

        `);
    } else {
        $('#gallery').html(
            files.map(file => `
                <div class="col-12 col-sm-6 col-md-3">
                    <div class="card gallery">
                        <img src="${file.file_url}" class="card-img-top" alt="${file.file_name}">
                    </div>
                </div>
            `).join('')
        );
    }

};
