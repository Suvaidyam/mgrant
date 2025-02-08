$(document).on('app_ready', function () {
    console.log('app_ready');

    const originalGetActions = frappe.views.ListView.prototype.get_actions_menu_items;
    const originalGetMenuItems = frappe.views.ListView.prototype.get_menu_items;

    frappe.views.ListView.prototype.get_actions_menu_items = function () {
        const actions = originalGetActions.call(this);

        const required_actions = [
            'Edit',
            'Delete',
            'Export',
            'Add Tags',
            'Assign To'
        ];
        return actions.filter(action => {
            return required_actions.includes(action.label);
        });
    };

    frappe.views.ListView.prototype.get_menu_items = function () {
        const items = originalGetMenuItems.call(this);

        const required_menu_items = [
            'Customize',
            'List Settings',
            'Edit DocType',
        ];
        return items.filter(item => {
            return required_menu_items.includes(item.label);
        });
    };
});
