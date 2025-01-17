frappe.ui.Sidebar = class CustomSidebar extends frappe.ui.Sidebar {
    make_dom() {
        this.set_default_app();
        let sidebar_html = frappe.render_template("sidebar", {
            app_logo_url: frappe.boot.mgrant_settings.mgrant_logo ?? frappe.boot.app_data[0].app_logo_url,
            app_title: frappe.boot.mgrant_settings.app_title ?? __(frappe.boot.app_data[0].app_title),
        });
        this.wrapper = $(
            sidebar_html
        ).prependTo("body");
        this.$sidebar = this.wrapper.find(".sidebar-items");
        if (this.has_access) {
            this.wrapper
                .find(".body-sidebar .edit-sidebar-link")
                .removeClass("hidden")
                .on("click", () => {
                    frappe.quick_edit("Workspace Settings");
                });
        }
        this.setup_app_switcher();
    }
    set_current_app(app) {
        if (!app) {
            console.warn("set_current_app: app not defined");
            return;
        }
        let app_data = frappe.boot.app_data_map["mgrant"];
        this.wrapper.find(".app-switcher-dropdown .sidebar-item-label").html(frappe.boot.mgrant_settings.app_title ?? app_data.app_title);
        if (frappe.current_app === app) return;
        frappe.current_app = app;
        this.make_sidebar();
    }
    setup_app_switcher() {
        if (frappe.user_roles.includes('Administrator')) {
            super.setup_app_switcher();
        } else {
            let app_switcher_menu = $(".app-switcher-menu");
            $('[href="#es-line-down"]').hide();
            app_switcher_menu.addClass("hidden");

            this.wrapper.find(".body-sidebar").on("mouseleave", () => {
                app_switcher_menu.addClass("hidden");
                this.wrapper.find(".drop-icon[data-state='opened'").click();
            });

            frappe.boot.app_data_map = {};
            this.add_private_app(app_switcher_menu);
            for (var app of frappe.boot.app_data) {
                frappe.boot.app_data_map[app.app_name] = app;
                if (app.workspaces?.length) {
                    this.add_app_item(app, app_switcher_menu);
                }
            }
            this.add_website_select(app_switcher_menu);
            this.setup_select_app(app_switcher_menu);
        }
    }
    set_default_app() {
        frappe.boot.app_data.sort((a, b) => (a.workspaces.length < b.workspaces.length ? 1 : -1));
        let mgrant = frappe.boot.app_data.find((app) => app.app_name === "mgrant");
        frappe.current_app = mgrant?.app_name ?? frappe.boot.app_data[0].app_name;
    }
    make_sidebar() {
        if (this.wrapper.find(".standard-sidebar-section")[0]) {
            this.wrapper.find(".standard-sidebar-section").remove();
        }

        let app_workspaces = frappe.boot.app_data_map[frappe.current_app || "mgrant"].workspaces;

        let parent_pages = this.all_pages.filter((p) => !p.parent_page).uniqBy((p) => p.name);
        if (frappe.current_app === "private") {
            parent_pages = parent_pages.filter((p) => !p.public);
        } else {
            parent_pages = parent_pages.filter((p) => p.public && app_workspaces.includes(p.name));
        }

        this.build_sidebar_section("All", parent_pages);
        this.wrapper.find(".selected").length &&
            !frappe.dom.is_element_in_viewport(this.wrapper.find(".selected")) &&
            this.wrapper.find(".selected")[0].scrollIntoView();

        this.setup_sorting();
    }
}