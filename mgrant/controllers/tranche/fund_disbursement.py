import frappe

def fund_disbursement_on_validate(self):
    if self.as_on_date:
        dt = frappe.utils.getdate(self.as_on_date)
        mgrant_settings = frappe.get_doc("mGrant Settings")
        if frappe.db.exists("mGrant Settings Grant Wise", self.grant):
            mgrant_settings = frappe.get_doc("mGrant Settings Grant Wise", self.grant)
        if mgrant_settings.get('year_type') == "Financial Year":
            if dt.month < 4:
                self.financial_year = f"FY-{dt.year-1}"
            else:
                self.financial_year = f"FY-{dt.year}"
        else:
            self.financial_year = f"FY-{dt.year}"