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
    `;
    document.head.appendChild(style);

    let gallery = document.querySelector('#gallery');
    gallery.classList.add('row');

    let files = await frappe.db.get_list('File', {
        fields: ['file_name', 'file_url', 'is_folder'],
        filters: {
            'is_folder': ['=', 0],
            'attached_to_name': ['=', frm.doc.name],
        },
        limit: 1000,
    });

    gallery.innerHTML = '';
    files.forEach(file => {
        gallery.innerHTML += `
            <div class="col-12 col-sm-6 col-md-3">
                <div class="card gallery">
                    <img src="${file.file_url}" class="card-img-top" alt="${file.file_name}">
                </div>
            </div>
        `;
    });
};
