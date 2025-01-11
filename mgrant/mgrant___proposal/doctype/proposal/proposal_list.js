// let index = 0;
// const intervalId = setInterval(() => {
//     if (cur_list) {
//         frappe.db.get_list('Kanban Board', {
//             filters: { reference_doctype: 'Proposal', private: '0' },
//             fields: ['*']
//         }).then((data) => {
//             if (data.length > 0) {
//                 let kanban = data[0];
//                 if (kanban?.kanban_board_name) {
//                     frappe.set_route('proposal', 'view', 'kanban', kanban.kanban_board_name);
//                 }
//                 if (cur_dialog) {
//                     cur_dialog.hide();
//                 }
//             }
//         });
//     }
//     index++;
//     // Stop the interval when condition is met
//     if (index > 10 || cur_list) {
//         clearInterval(intervalId);
//     }
// }, 500);