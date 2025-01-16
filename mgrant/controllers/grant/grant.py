import frappe
import calendar
from datetime import datetime

def grant_on_validate(self):
    year_type = frappe.db.get_single_value("mGrant Settings", "year_type") or "Financial Year"
    if frappe.db.exists("mGrant Settings Grant Wise",self.name):
        msgw = frappe.get_doc("mGrant Settings Grant Wise",self.name)
        if msgw.year_type:
            year_type = msgw.year_type
    if self.proposal:
        if frappe.db.exists("Proposal", self.proposal):
            if not self.lfas_copied:
                if self.start_date and self.end_date:
                    budget_plans = frappe.get_all("Proposal Budget Plan", filters={"proposal": self.proposal}, fields=['*'])
                    if len(budget_plans) > 0:
                        total_planned_budget = float(0)
                        for budget_plan in budget_plans:
                            budget_plan_doc = frappe.new_doc("Budget Plan and Utilisation")
                            budget_plan_doc.update(budget_plan)
                            budget_plan_doc.grant = self.name
                            budget_plan_doc.start_date = self.start_date
                            budget_plan_doc.end_date = self.end_date
                            if budget_plan_doc.get('frequency') in ['Quarterly','Monthly']:
                                data = handle_frequency(budget_plan_doc.get('frequency'),[], self.start_date, self.end_date,year_type)
                                if len(data) > 0:
                                    each_quarter = 0
                                    remainder = 0
                                    total_budget = budget_plan_doc.total_planned_budget or 0
                                    if total_budget > 0:
                                        each_quarter = total_budget // len(data)  # Integer division
                                        remainder = total_budget % len(data)  # Calculate the remaining amount
                                    for item in data:
                                        planned_amount = float(each_quarter + remainder)
                                        item['planned_amount'] = planned_amount
                                        budget_plan_doc.append("planning_table", item)
                                        remainder = 0
                                    total_planned_budget += float(total_budget) or float(0)
                            budget_plan_doc.flags.ignore_mandatory = True
                            budget_plan_doc.flags.from_grant_file = True
                            budget_plan_doc.save(ignore_permissions=True)
                        self.total_planned_budget = total_planned_budget
                        self.total_funds_utilised = float(0)
                        self.total_unspent_funds = total_planned_budget
                            
                    # inputs = frappe.get_all("Proposal Input", filters={"proposal": self.name}, fields=['*'])
                    # if len(inputs) > 0:
                    #     for input in inputs:
                    #         input_doc = frappe.new_doc("Input")
                    #         input_doc.update(input)
                    #         input_doc.grant = grant.name
                    #         input_doc.flags.ignore_mandatory = True
                    #         input_doc.save(ignore_permissions=True)
                    # outputs = frappe.get_all("Proposal Output", filters={"proposal": self.name}, fields=['*'])
                    # if len(outputs) > 0:
                    #     for output in outputs:
                    #         output_doc = frappe.new_doc("Output")
                    #         output_doc.update(output)
                    #         output_doc.grant = grant.name
                    #         output_doc.flags.ignore_mandatory = True
                    #         output_doc.save(ignore_permissions=True)
                    # impacts = frappe.get_all("Proposal Impact", filters={"proposal": self.name}, fields=['*'])
                    # if len(impacts) > 0:
                    #     for impact in impacts:
                    #         impact_doc = frappe.new_doc("Impact")
                    #         impact_doc.update(impact)
                    #         impact_doc.grant = self.name
                    #         impact_doc.flags.ignore_mandatory = True
                    #         impact_doc.save(ignore_permissions=True)
                    # outcomes = frappe.get_all("Proposal Outcome", filters={"proposal": self.name}, fields=['*'])
                    # if len(outcomes) > 0:
                    #     for outcome in outcomes:
                    #         outcome_doc = frappe.new_doc("Outcome")
                    #         outcome_doc.update(outcome)
                    #         outcome_doc.grant = self.name
                    #         outcome_doc.flags.ignore_mandatory = True
                    #         outcome_doc.save(ignore_permissions=True)
                    # self.lfas_copied = 1
                    return
    if not self.is_new() and self.lfas_copied:
        old_end_date = frappe.db.get_value("Grant", self.name, "end_date")
        if isinstance(self.end_date, str):
            self.end_date = datetime.strptime(self.end_date, "%Y-%m-%d").date()
            if old_end_date != self.end_date:
                if old_end_date > self.end_date:
                    if get_records_count(self):
                        frappe.throw("You cannot reduce the end date of this grant as it has plannings.")
                else:
                    extend_planning_and_end_date(self,year_type)
                    
def grant_after_insert(self):
    mgrant_settings = frappe.get_doc("mGrant Settings")
    mgsgw = frappe.new_doc("mGrant Settings Grant Wise")
    if mgrant_settings:
        mgsgw.update(mgrant_settings.as_dict())
        mgsgw.grant_name = self.name
    else:
        mgsgw.grant_name = self.name
    mgsgw.insert(ignore_permissions=True)
    
    if self.proposal:
        if frappe.db.exists("Proposal", self.proposal):
            frappe.db.set_value("Proposal", self.proposal, "grant", self.name)
            
    # Setup Parent For Sub Granting
    if self.implementation_type == "Sub Grant":
        parent_grant = frappe.get_doc("Grant", self.parent_grant)
        parent_grant.subgranting_status = "Sub-granting Active"
        parent_grant.flags.ignore_mandatory = True
        parent_grant.save(ignore_permissions=True)


# helping functions
def get_records_count(self):
    doctypes = ['Impact', 'Outcome', 'Output', 'Input', 'Budget Plan and Utilisation']
    recordFound = False
    for doctype in doctypes:
        query = f"""
            SELECT
                COUNT(name) AS count
            FROM
                `tab{doctype}` AS bpu
            WHERE
                bpu.grant = '{self.name}'
        """
        result = frappe.db.sql(query, as_dict=True)
        if result[0].count > 0:
            recordFound = True
            break
    return recordFound
    
def extend_planning_and_end_date(self,year_type="Financial Year"):
    doctypes = ['Impact', 'Outcome', 'Output', 'Input', 'Budget Plan and Utilisation']
    for doctype in doctypes:
        records = frappe.db.get_list(doctype, filters={'grant': self.name}, pluck='name',limit_page_length=1000)
        for recordID in records:
            doc = frappe.get_doc(doctype, recordID)
            doc.end_date = self.end_date
            existing_plan_keys = []
            if len(doc.get('planning_table', [])) > 0:
                for plan in doc.get('planning_table', []):
                    if doc.frequency == "Monthly":
                        existing_plan_keys.append(f"{plan.month}-{plan.year}")
                    else:
                        existing_plan_keys.append(f"{plan.quarter}-{plan.year}")
            data = handle_frequency(doc.frequency,existing_plan_keys, self.start_date, self.end_date,year_type)
            if len(data) > 0:
                for item in data:
                    doc.append("planning_table", item)
            doc.save(ignore_permissions=True)
            
def handle_frequency(frequency,existing_plan_keys, start_date, end_date, year_type="Financial Year"):
    if not frequency or not start_date or not end_date:
        return []
    if isinstance(start_date, str):
        start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    if isinstance(end_date, str):
        end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
        
    planning_data = []
    if frequency == "Monthly":
        current_date = start_date
        while current_date <= end_date:
            month = current_date.month - 1  # Subtract 1 to start months from 0
            month_name = calendar.month_name[current_date.month]
            key = f"{month}-{current_date.year}"
            if key not in existing_plan_keys:
                planning_data.append({
                    "timespan": f"{month_name} ({current_date.year})",
                    "month": month,
                    "year": current_date.year
                })
            next_month = month + 1
            if next_month > 11:
                current_date = datetime(current_date.year + 1, 1, 1).date()
            else:
                current_date = datetime(current_date.year, next_month + 1, 1).date()
    elif frequency == "Quarterly":
        current_date = align_to_quarter_start(start_date, year_type)  # Align to quarter start
        while current_date <= end_date:
            quarter, year = get_quarter_and_year(current_date, year_type)
            timespan = f"{get_quarter_label(quarter, year_type)} ({year})"
            key = f"{quarter}-{year}"
            if key not in existing_plan_keys:
                planning_data.append({
                    "timespan": timespan,
                    "quarter": quarter,
                    "year": year
                })
            current_date = advance_to_next_quarter(current_date, year_type)
    return planning_data


def advance_to_next_quarter(date, year_type):
    if year_type == "Financial Year":
        if 4 <= date.month <= 6:  # Q1 -> Q2
            return datetime(date.year, 7, 1).date()
        elif 7 <= date.month <= 9:  # Q2 -> Q3
            return datetime(date.year, 10, 1).date()
        elif 10 <= date.month <= 12:  # Q3 -> Q4
            return datetime(date.year, 1, 1).date()
        else:  # Q4 -> Q1 of next fiscal year
            return datetime(date.year + 1, 4, 1).date()
    else:  # Calendar Year
        if 1 <= date.month <= 3:  # Q1 -> Q2
            return datetime(date.year, 4, 1).date()
        elif 4 <= date.month <= 6:  # Q2 -> Q3
            return datetime(date.year, 7, 1).date()
        elif 7 <= date.month <= 9:  # Q3 -> Q4
            return datetime(date.year, 10, 1).date()
        else:  # Q4 -> Q1 of next calendar year
            return datetime(date.year + 1, 1, 1).date()

def align_to_quarter_start(date, year_type):
    """Align a given date to the start of its quarter based on year type."""
    if year_type == "Financial Year":
        if 4 <= date.month <= 6:  # Q1
            return datetime(date.year, 4, 1).date()
        elif 7 <= date.month <= 9:  # Q2
            return datetime(date.year, 7, 1).date()
        elif 10 <= date.month <= 12:  # Q3
            return datetime(date.year, 10, 1).date()
        else:  # Q4
            return datetime(date.year - 1, 1, 1).date()
    else:  # Calendar Year
        if 1 <= date.month <= 3:  # Q1
            return datetime(date.year, 1, 1).date()
        elif 4 <= date.month <= 6:  # Q2
            return datetime(date.year, 4, 1).date()
        elif 7 <= date.month <= 9:  # Q3
            return datetime(date.year, 7, 1).date()
        else:  # Q4
            return datetime(date.year, 10, 1).date()   
        
def get_quarter_and_year(date, year_type):
    if year_type == "Financial Year":
        if 4 <= date.month <= 6:  # Apr-Jun
            return 1, date.year
        elif 7 <= date.month <= 9:  # Jul-Sep
            return 2, date.year
        elif 10 <= date.month <= 12:  # Oct-Dec
            return 3, date.year
        else:  # Jan-Mar
            return 4, date.year - 1
    else:  # Calendar Year
        return (date.month - 1) // 3 + 1, date.year
    
def get_quarter_label(quarter, year_type):
    if year_type == "Financial Year":
        return {
            1: "Q1 (Apr-Jun)",
            2: "Q2 (Jul-Sep)",
            3: "Q3 (Oct-Dec)",
            4: "Q4 (Jan-Mar)"
        }.get(quarter, "")
    else:  # Calendar Year
        return {
            1: "Q1 (Jan-Mar)",
            2: "Q2 (Apr-Jun)",
            3: "Q3 (Jul-Sep)",
            4: "Q4 (Oct-Dec)"
        }.get(quarter, "")