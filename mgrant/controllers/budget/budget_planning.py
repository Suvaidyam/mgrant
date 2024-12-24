import frappe

def budget_validate(self):
    self.total_planned_budget = float(self.get('q1_planned_budget') or 0) + float(self.get('q2_planned_budget') or 0) + float(self.get('q3_planned_budget') or 0) + float(self.get('q4_planned_budget') or 0)
    self.total_utilisation = float(self.get('q1_utilisation') or 0) + float(self.get('q2_utilisation') or 0) + float(self.get('q3_utilisation') or 0) + float(self.get('q4_utilisation') or 0)
    mgrant_settings = None
    if not mgrant_settings:
        if frappe.db.exists("mGrant Settings Grant Wise", self.grant):
            mgrant_settings = frappe.get_doc("mGrant Settings Grant Wise", self.grant)
        else:
            mgrant_settings = frappe.get_doc("mGrant Settings", "mGrant Settings")
    if not mgrant_settings or not mgrant_settings.allow_overutilization:
        if self.total_utilisation > self.total_planned_budget:
            return frappe.throw("Total Utilisation can't be greater than Total Planned Buget.")
        
def budget_on_update(self):
    if self.grant:
        grant_doc = frappe.get_doc('Grant', self.grant)
        budgets = frappe.db.get_list('Budget Plan and Utilisation', filters={'grant': self.grant}, fields=['name', 'total_planned_budget','total_utilisation'],limit_page_length=1000,ignore_permissions=True)
        total_planned_budget = float(0)
        total_utilisation = float(0)
        if len(budgets) > 0:
            for budget in budgets:
                total_planned_budget += float(budget.total_planned_budget) or float(0)
                total_utilisation += float(budget.total_utilisation) or float(0)
        grant_doc.total_planned_budget = total_planned_budget
        grant_doc.total_funds_utilised = total_utilisation
        grant_doc.total_unspent_funds = total_planned_budget - total_utilisation
        
        # SubGrantee Calculation
        if grant_doc.implementation_type == 'Sub Grant':
            sub_grants = frappe.db.get_list('Grant', filters={'implementation_type':"Sub Grant",'parent_grant': grant_doc.parent_grant}, pluck='name',limit_page_length=1000,ignore_permissions=True)
            print('Sub Grant',sub_grants)
            sub_granted_budgets = frappe.db.get_list('Budget Plan and Utilisation', filters={'grant': ['in', sub_grants]}, fields=['name', 'total_planned_budget','total_utilisation'],limit_page_length=10000,ignore_permissions=True)
            print('Sub Granted Budgets',sub_granted_budgets)
            paren_grant_doc = frappe.get_doc('Grant', grant_doc.parent_grant)
            total_fund_subgranted = float(0)
            total_subgranted_utilisation = float(0)
            if len(sub_granted_budgets) > 0:
                for sub_granted_budget in sub_granted_budgets:
                    total_fund_subgranted += float(sub_granted_budget.total_planned_budget) or float(0)
                    total_subgranted_utilisation += float(sub_granted_budget.total_utilisation) or float(0)
            if paren_grant_doc.total_planned_budget < total_fund_subgranted:
               return frappe.throw("Total Subgranted Budget can't be greater than Total Planned Budget.")
            paren_grant_doc.total_funds_subgranted = total_fund_subgranted
            paren_grant_doc.total_subgrant_utilisation = total_subgranted_utilisation
            grant_doc.flags.ignore_mandatory = True
            grant_doc.save(ignore_permissions=True)
            paren_grant_doc.flags.ignore_mandatory = True
            paren_grant_doc.save(ignore_permissions=True)
        else:
            grant_doc.flags.ignore_mandatory = True
            grant_doc.save(ignore_permissions=True)
        
def budget_on_trash(self):
    if self.grant:
        grant_doc = frappe.get_doc('Grant', self.grant)
        budgets = frappe.db.get_list('Budget Plan and Utilisation', filters={'grant': self.grant,'name': ['!=', self.name]}, fields=['name', 'total_planned_budget','total_utilisation'],limit_page_length=1000,ignore_permissions=True)
        total_planned_budget = float(0)
        total_utilisation = float(0)
        if len(budgets) > 0:
            for budget in budgets:
                total_planned_budget += float(budget.total_planned_budget) or float(0)
                total_utilisation += float(budget.total_utilisation) or float(0)
        grant_doc.total_planned_budget = total_planned_budget
        grant_doc.total_funds_utilised = total_utilisation
        grant_doc.total_unspent_funds = total_planned_budget - total_utilisation
        
        # SubGrantee Calculation
        if grant_doc.implementation_type == 'Sub Grant':
            sub_grants = frappe.db.get_list('Grant', filters={'implementation_type':"Sub Grant",'parent_grant': grant_doc.parent_grant}, pluck='name',limit_page_length=1000,ignore_permissions=True)
            sub_granted_budgets = frappe.db.get_list('Budget Plan and Utilisation', filters={'grant': ['in', sub_grants],'name': ['!=', self.name]}, fields=['name', 'total_planned_budget','total_utilisation'],limit_page_length=10000,ignore_permissions=True)
            paren_grant_doc = frappe.get_doc('Grant', grant_doc.parent_grant)
            total_fund_subgranted = float(0)
            total_subgranted_utilisation = float(0)
            if len(sub_granted_budgets) > 0:
                for sub_granted_budget in sub_granted_budgets:
                    total_fund_subgranted += float(sub_granted_budget.total_planned_budget) or float(0)
                    total_subgranted_utilisation += float(sub_granted_budget.total_utilisation) or float(0)
            if paren_grant_doc.total_planned_budget < total_fund_subgranted:
                return frappe.throw("Total Subgranted Budget can't be greater than Total Planned Budget.")                    
            paren_grant_doc.total_funds_subgranted = total_fund_subgranted
            paren_grant_doc.total_subgrant_utilisation = total_subgranted_utilisation
            grant_doc.flags.ignore_mandatory = True
            grant_doc.save(ignore_permissions=True)
            paren_grant_doc.flags.ignore_mandatory = True
            paren_grant_doc.save(ignore_permissions=True)
        else:
            grant_doc.flags.ignore_mandatory = True
            grant_doc.save(ignore_permissions=True)