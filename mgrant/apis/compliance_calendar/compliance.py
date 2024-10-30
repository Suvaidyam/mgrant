import frappe
from frappe.utils import getdate, nowdate
from datetime import timedelta
# ========================================= Compliance Annual Plan APIs =========================================

@frappe.whitelist()
def cp_five_early_validation(year):
    # Extract the first part of the year (e.g., "2024" from "2024-25")
    try:
        target_year = int(year.split('-')[0])  # Convert the first part to an integer
    except ValueError:
        frappe.throw("Invalid year format. Expected format: 'YYYY-YY' (e.g., '2024-25')")

    # Define the range of years (5 years before and after the given year)
    start_range = target_year - 5
    end_range = target_year + 5

    # Fetch all main documents
    main_docs = frappe.get_all('Compliance Annual Plan', filters=None, fields=['name'])
    
    compliance_records = []  # Initialize a list to store the final compliance records

    for doc in main_docs:
        # Fetch compliance records with frequency filter
        child_table_1 = frappe.get_all('Miscellaneous Compliance Child', 
            filters={'parent': doc['name'], 'frequency': ['in', ['5 Years', 'One time']]}, 
            fields=['compliance', 'compliance_', 'due_date', 'parent_name', 'frequency', 'parent'])
        
        for item in child_table_1:
            try:
                # Extract the year part from the parent field (assumes parent year format is 'YYYY-YY')
                parent_year = int(item['parent'].split('-')[0])
            except ValueError:
                continue  # Skip if the year format is incorrect

            # Check for 'One Time' frequency and add to the compliance records
            if item['frequency'] == 'One time':
                compliance_records.append(item)

            # Check for '5 Years' frequency and validate if parent year is within the range
            elif item['frequency'] == '5 Years' and start_range <= parent_year <= end_range:
                compliance_records.append(item)

    return compliance_records  # Return all matching compliance records


@frappe.whitelist()
def anm_tracking(year, table_name):
    tracking_table = getattr(frappe.get_doc('Compliance Tracking', year), table_name)
    planning_table = getattr(frappe.get_doc('Compliance Annual Plan', year), table_name)
    
    return [plan.name for row in tracking_table if row.status == "Done" 
            for plan in planning_table if plan.compliance == row.compliance]

@frappe.whitelist()
def monthly_quarterly_tracking(year, table_name):
    planning = frappe.get_doc('Compliance Annual Plan', year)
    tracking = frappe.get_doc('Compliance Tracking', year)
    freeze_rows = {}
    
    # Use getattr to access the dynamic table_name
    tracking_table = getattr(tracking, table_name)
    planning_table = getattr(planning, table_name)

    # Iterate over the table in tracking
    for row in tracking_table:
        if row.status == "Done":
            result = next((plan for plan in planning_table if plan.compliance == row.compliance), None)
            if result:  # Check if result is not None
                if result.name not in freeze_rows:
                    freeze_rows[result.name] = [row.type.lower()]
                else:
                    freeze_rows[result.name].append(row.type.lower())
                    
    return freeze_rows


@frappe.whitelist()
def send_email(filter=None):
    current_date = getdate(nowdate())

    # Get all main docs
    main_docs = frappe.get_all('Compliance Annual Plan', filters=filter, fields=['name'])

    # Get all child tables in one go with the parent field included
    child_tables = [
        (frappe.get_all('Annual Compliance Child', {'parent': ['in', [doc['name'] for doc in main_docs]]}, 
                                    ['compliance', 'compliance_', 'due_date', 'parent']), 'Annual'),
        (frappe.get_all('Monthly Compliance Child', {'parent': ['in', [doc['name'] for doc in main_docs]]}, 
                                    ['compliance', 'compliance_', 'january', 'february', 'march', 'april', 'may', 'june', 
                                    'july', 'august', 'september', 'october', 'november', 'december', 'parent']), 'Monthly'),
        (frappe.get_all('Quarterly Compliance Child', {'parent': ['in', [doc['name'] for doc in main_docs]]}, 
                                    ['compliance', 'compliance_', 'april_june', 'july_september', 'october_december', 'january_march', 'parent']), 'Quarterly'),
        (frappe.get_all('Miscellaneous Compliance Child', {'parent': ['in', [doc['name'] for doc in main_docs]]}, 
                                    ['compliance', 'compliance_', 'due_date', 'parent']), 'Miscellaneous')
    ]

    # Helper to fetch due dates
    def get_due_dates(child, frequency):
        if 'due_date' in child and child['due_date']:
            return [getdate(child['due_date'])]
        return [getdate(child[month]) for month in
                (['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'] 
                if frequency == 'Monthly' else 
                ['april_june', 'july_september', 'october_december', 'january_march']) if month in child and child[month]]

    compliance_rows, serial_number = [], 1
    for table, frequency in child_tables:
        for child in table:
            compliance_doc = frappe.get_doc('Compliance', child['compliance'])
            child['frequency'] = compliance_doc.frequency or frequency
            child['reminder_days'] = compliance_doc.due_date_reminder_days - 1

            due_dates = get_due_dates(child, child['frequency'])
            for due_date in due_dates:
                if (current_date >= (due_date - timedelta(days=child['reminder_days'])) and current_date <= due_date) or current_date > due_date:
                    due_date_style = "color: red;" if due_date < current_date else ""
                    parent_name = child.get('parent')  # Now parent should have a value

                    # This is where your condition is applied
                    compliance_row = frappe.get_all('Compliance Tracking', filters={
                        'compliance': child['compliance'],
                        'status': ['!=', 'Done'],
                        'due_date': due_date
                    })

                    if compliance_row:
                        compliance_rows.append(f"""
                            <tr>
                                <td style="min-width: 30px; text-align: center;">{serial_number}</td>
                                <td>{child['compliance_']}</td>
                                <td style="min-width: 100px; text-align: center;">{parent_name}</td>
                                <td style="min-width: 100px; text-align: center;">{child['frequency']}</td>
                                <td style="min-width: 100px; text-align: center; {due_date_style}">{due_date}</td>
                            </tr>
                        """)
                        serial_number += 1

    if compliance_rows:
        html_content = f"""
        <table border="1" cellpadding="5" cellspacing="0" style="width: 100%;">
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Compliance</th>
                    <th>Year</th>
                    <th>Frequency</th>
                    <th>Due Date</th>
                </tr>
            </thead>
            <tbody>
                {''.join(compliance_rows)}
            </tbody>
        </table>
        """
        frappe.sendmail(
            recipients=['abhi.suvaidyam@gmail.com'],  # Replace 
            # recipients=['kunal.rathod@dhwaniris.com'],  # Replace
            subject='Upcoming Compliance Due Dates',
            message=html_content
        )


# ========================================= Compliance Tracking APIs =========================================

@frappe.whitelist(allow_guest=True)
def compliance_annual_plan(doctype_name, filter=None, fields='*'):
    # Fetch main document
    main_docs = frappe.get_all(doctype_name, filters=filter, fields=fields)
    
    # If child tables exist, get data from all child tables
    child_data = []
    for doc in main_docs:
        # Fetch data for first child table
        child_table_1 = frappe.get_all('Annual Compliance Child', filters={'parent': doc['name']}, fields=['compliance'])
        
        # Fetch data for second child table
        child_table_2 = frappe.get_all('Monthly Compliance Child', filters={'parent': doc['name']}, fields=['compliance'])
        
        # Fetch data for third child table
        child_table_3 = frappe.get_all('Quarterly Compliance Child', filters={'parent': doc['name']}, fields=['compliance'])

        # Fetch data for fourth child table
        child_table_4 = frappe.get_all('Miscellaneous Compliance Child', filters={'parent': doc['name']}, fields=['compliance'])
        
        # Add all child table data to the main document
        doc['child_table_1'] = child_table_1
        doc['child_table_2'] = child_table_2
        doc['child_table_3'] = child_table_3
        doc['child_table_4'] = child_table_4
        
        child_data.append(doc)
    
    return child_data