const setup_single_dependent = (frm, parent_field, connector, child_field) => {
    frm.set_query(child_field, function () {
        return {
            filters: {
                [connector]: frm.doc[parent_field] ? frm.doc[parent_field] : `Please select a ${parent_field}`
            }
        };
    });
}

const setup_multiselect_dependency = (frm, table, parent_field, parent_connector, child_field, child_connector) => {
    frm.set_query(child_field, function () {
        return {
            filters: [
                [table, child_connector, 'IN', frm.doc[parent_field].length ? frm.doc[parent_field].map((item) => item[parent_connector]) : `Please select a ${parent_field}`]
            ]
        };
    });
}