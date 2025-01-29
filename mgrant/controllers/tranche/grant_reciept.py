import frappe
def grant_reciept_on_update(self):
    if self.grant:
        grant_doc = frappe.get_doc('Grant', self.grant)
        tranches = frappe.db.get_list('Grant Receipts', filters={'grant': self.grant}, fields=['name', 'funds_requested','total_funds_received'],limit_page_length=1000,ignore_permissions=True)
        total_funds_received = float(0)
        total_funds_requested = float(0)
        if len(tranches) > 0:
            for tranche in tranches:
                total_funds_received += float(tranche.total_funds_received or 0)
                total_funds_requested += float(tranche.funds_requested or 0)
        grant_doc.total_amount_requested_from_donor = total_funds_requested
        grant_doc.total_funds_received = total_funds_received
        grant_doc.flags.ignore_mandatory = True
        grant_doc.save(ignore_permissions=True)

    if self.total_funds_planned < self.funds_requested:
        frappe.throw("Total Funds Planned can't be greater than Funds Requested")
        
def grant_reciept_on_trash(self):
    if self.grant:
        grant_doc = frappe.get_doc('Grant', self.grant)
        tranches = frappe.db.get_list('Grant Receipts', filters={'grant': self.grant, 'name': ['!=', self.name]}, fields=['name', 'funds_requested','total_funds_received'],limit_page_length=1000,ignore_permissions=True)
        total_funds_received = float(0)
        total_funds_requested = float(0)
        if len(tranches) > 0:
            for tranche in tranches:
                total_funds_received += float(tranche.total_funds_received or 0)
                total_funds_requested += float(tranche.funds_requested or 0)
        grant_doc.total_amount_requested_from_donor = total_funds_requested
        grant_doc.total_funds_received = total_funds_received
        grant_doc.flags.ignore_mandatory = True
        grant_doc.save(ignore_permissions=True)   