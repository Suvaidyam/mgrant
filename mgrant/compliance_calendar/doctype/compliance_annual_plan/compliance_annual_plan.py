import frappe
from frappe.model.document import Document

class ComplianceAnnualPlan(Document):
    def after_insert(self):
        self.create_compliance_tracking()

    def before_save(self):
        self.create_compliance_tracking()  # Call to create compliance tracking first

    def on_trash(self):
        # Fetch the Compliance Tracking records linked to this Compliance Annual Plan
        tracking_docs = frappe.get_all('Compliance Tracking', filters={'year_': self.name})

        for tracking_doc in tracking_docs:
            # Delete the Compliance Tracking document
            frappe.delete_doc('Compliance Tracking', tracking_doc['name'])

    def create_compliance_tracking(self):
        # Fetch the existing Compliance Tracking document based on year
        existing_doc = frappe.get_all(
            'Compliance Tracking', 
            filters={'name': self.name},
            limit=1
        )

        # Create a new Compliance Tracking document if it doesn't exist
        if not existing_doc:
            ct__new_doc = frappe.new_doc('Compliance Tracking')
            ct__new_doc.year_ = self.name  # Set the year for new doc
        else:
            ct__new_doc = frappe.get_doc('Compliance Tracking', existing_doc[0]['name'])

        # Fetch the main document data from 'Compliance Annual Plan'
        if frappe.db.exists('Compliance Annual Plan', self.name):
            main_doc = frappe.get_doc('Compliance Annual Plan', self.name)

            ### 1. Annual Compliance Child Table
            child_table_1 = frappe.get_all('Annual Compliance Child', filters={'parent': main_doc.name}, fields=['compliance', 'compliance_name', 'due_date'])
            for child in (self.annual_table if existing_doc else child_table_1):
                existing_row = next((row for row in ct__new_doc.annual_table if row.compliance == child.compliance), None)
                if existing_row:
                    # Update existing row
                    existing_row.due_date = child.due_date
                else:
                    # Append new row if not found
                    ct__new_doc.append('annual_table', {
                        'compliance': child.compliance,
                        'compliance_name': child.compliance_name,
                        'due_date': child.due_date,
                        'type': 'Annual',
                    })

            ### 2. Monthly Compliance Child Table
            child_table_2 = frappe.get_all('Monthly Compliance Child', filters={'parent': main_doc.name}, fields=['compliance', 'compliance_name', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'])

            # Define the order of months
            month_order = ['april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'january', 'february', 'march']

            for month in month_order:
                for child in (self.monthly_table if existing_doc else child_table_2):
                    due_date = getattr(child, month)  # Use getattr to access month due date
                    if due_date:
                        existing_row = next((row for row in ct__new_doc.monthly_table if row.compliance == child.compliance and row.type == month.capitalize()), None)
                        # existing_row = next((row for row in ct__new_doc.monthly_table if row.compliance == child.compliance and row.type == month.capitalize() and row.parent_name == child.parent_name),None)

                        if existing_row:
                            # Update existing row
                            existing_row.due_date = due_date
                        else:
                            # Append new row if not found
                            ct__new_doc.append('monthly_table', {
                                'compliance': child.compliance,
                                'compliance_name': child.compliance_name,
                                'due_date': due_date,
                                'type': month.capitalize(),
                            })

            ### 3. Quarterly Compliance Child Table
            child_table_3 = frappe.get_all('Quarterly Compliance Child', filters={'parent': main_doc.name}, fields=['compliance', 'compliance_name', 'april_june', 'july_september', 'october_december', 'january_march'])

            # Define the order of quarters
            quarter_order = [("April-June", "april_june"), ("July-September", "july_september"), ("October-December", "october_december"), ("January-March", "january_march")]

            for quarter_name, key in quarter_order:
                for child in (self.quarterly_table if existing_doc else child_table_3):
                    due_date = getattr(child, key)  # Use getattr to access due date based on key
                    if due_date:
                        existing_row = next((row for row in ct__new_doc.quarterly_table if row.compliance == child.compliance and row.type == quarter_name), None)
                        if existing_row:
                            # Update existing row
                            existing_row.due_date = due_date
                        else:
                            # Append new row if not found
                            ct__new_doc.append('quarterly_table', {
                                'compliance': child.compliance,
                                'compliance_name': child.compliance_name,
                                'due_date': due_date,
                                'type': quarter_name,
                            })

            ### 4. Miscellaneous Compliance Child Table
            child_table_4 = frappe.get_all('Miscellaneous Compliance Child', filters={'parent': main_doc.name}, fields=['compliance', 'compliance_name', 'frequency', 'due_date'])

            for child in (self.miscellaneous_table if existing_doc else child_table_4):
                existing_row = next((row for row in ct__new_doc.miscellaneous_table if row.compliance == child.compliance and row.type == child.frequency), None)
                if existing_row:
                    # Update existing row
                    existing_row.due_date = child.due_date
                else:
                    # Append new row if not found
                    ct__new_doc.append('miscellaneous_table', {
                        'compliance': child.compliance,
                        'compliance_name': child.compliance_name,
                        'due_date': child.due_date,
                        'type': child.frequency,
                    })

        # Save or update the Compliance Tracking document
        ct__new_doc.save(ignore_permissions=True)  # Save with ignore_permissions in case of any permission issues