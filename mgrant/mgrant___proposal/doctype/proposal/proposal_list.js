frappe.call('frappe.client.get_list',
    { doctype: 'Kanban Board', reference_doctype: 'Proposal', private: '0', fields: ['*'] },
    callback = (r) => {
        let response = r.message;
        if (response.length > 0) {
            let kanban = response[0];
            if (kanban?.kanban_board_name) {
                frappe.set_route('proposal', 'view', 'kanban', kanban.kanban_board_name);
            }
            if (cur_dialog) {
                cur_dialog.hide();
            }
        }
    }
);