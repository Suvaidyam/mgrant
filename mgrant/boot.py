import frappe
def boot_session(bootinfo):
    bootinfo.mgrant_settings = frappe.get_single("mGrant Settings")