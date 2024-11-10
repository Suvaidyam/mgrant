

frappe.listview_settings['Monthly Salary Tracker'] = {
    // refresh: function (listview) { },
    before_render: async function (listview) {
        if (cur_list && cur_list.page) {
            cur_list.page.add_inner_button(__('Upload Excel'), function () {
                window.location.href = '/app/salary-tracker-upload/new-salary-tracker-upload-xpsytbxzga';
            });
        }
    },
};