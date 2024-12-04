import frappe
from datetime import datetime

def input_ach_on_update(self):
    # Fetch all achievements
    all_achievements = frappe.db.get_list(
        "Input Achievement",
        filters={"input": self.input},
        fields=["achievement", "as_on_date", "input"],
        ignore_permissions=True
    )
    month_achievements = {
        "January": 0, "February": 0, "March": 0, "April": 0,
        "May": 0, "June": 0, "July": 0, "August": 0,
        "September": 0, "October": 0, "November": 0, "December": 0
    }
    # Accumulate achievements by month
    for achievement in all_achievements:
        date_object = datetime.strptime(str(achievement.as_on_date), "%Y-%m-%d")
        month_name = date_object.strftime("%B")
        if month_name in month_achievements:
            month_achievements[month_name] += achievement.achievement

    input_doc = frappe.get_doc("Input", self.input)
    for month, value in month_achievements.items():
        setattr(input_doc, f"{month[:3].lower()}_achievement", value)  # e.g., jan_achievement, feb_achievement
    input_doc.save(ignore_permissions=True)
    
def input_ach_on_trash(self):
    all_achievements = frappe.db.get_list(
        "Input Achievement",
        filters={"input": self.input, 'name': ['!=', self.name]},
        fields=["achievement", "as_on_date", "input"],
        ignore_permissions=True
    )
    month_achievements = {
        "January": 0, "February": 0, "March": 0, "April": 0,
        "May": 0, "June": 0, "July": 0, "August": 0,
        "September": 0, "October": 0, "November": 0, "December": 0
    }
    # Accumulate achievements by month
    for achievement in all_achievements:
        date_object = datetime.strptime(str(achievement.as_on_date), "%Y-%m-%d")
        month_name = date_object.strftime("%B")
        if month_name in month_achievements:
            month_achievements[month_name] += achievement.achievement

    input_doc = frappe.get_doc("Input", self.input)
    for month, value in month_achievements.items():
        setattr(input_doc, f"{month[:3].lower()}_achievement", value)  # e.g., jan_achievement, feb_achievement
    input_doc.save(ignore_permissions=True)