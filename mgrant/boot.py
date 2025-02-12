import frappe
def boot_session(bootinfo):
    bootinfo.mgrant_settings = frappe.get_single("mGrant Settings")
    if frappe.db.exists("SVA User", {"email":frappe.session.user}):
        user_role_profile = frappe.db.get_value("SVA User", {"email":frappe.session.user},"role_profile")
        if not None:
            bootinfo.user_role_profile = user_role_profile
            user_team = frappe.db.get_value("Role Profile", {"name":user_role_profile},"custom_belongs_to")
            bootinfo.user_team = user_team