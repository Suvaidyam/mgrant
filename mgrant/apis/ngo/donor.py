import frappe
import requests
import json

from datetime import datetime

# Function to convert datetime objects to strings
def convert_datetime_to_string(data):
    for key, value in data.items():
        if isinstance(value, datetime):
            data[key] = value.strftime("%Y-%m-%d %H:%M:%S")  # You can adjust the format as needed
    return data

@frappe.whitelist()
def sync_donors_from_central_repo():
    conf = frappe.get_doc("mGrant API Integrations")
    if not conf.base_url:
        return frappe.throw("Base URL is required")
    url = f"{conf.base_url}/api/method/mgrant_central_repo.apis.api.get_donors"
    headers = {
        'Authorization': f"token {conf.api_key}:{conf.api_secret}",
    }
    response = requests.get(url, headers=headers)
    return response.json().get("message", [])

@frappe.whitelist()
def add_donor_to_central_repo(donor_id):
    if frappe.db.exists("Donor", donor_id):
        donor = frappe.get_doc("Donor", donor_id)
        conf = frappe.get_doc("mGrant API Integrations")
        if not conf.base_url:
            return frappe.throw("Base URL is required")
        url = f"{conf.base_url}/api/method/mgrant_central_repo.apis.api.add_donor"
        headers = {
            'Authorization': f"token {conf.api_key}:{conf.api_secret}",
        }
        response = requests.post(url, headers=headers, data=json.dumps(convert_datetime_to_string(donor.as_dict())))
        return response.json()
    else:
        return frappe.throw("Donor not found")
    
@frappe.whitelist()
def sync_selected_donors_from_central_repo(donors):
    donors = json.loads(donors)
    existing_donors = []
    for donor in donors:
        if frappe.db.exists("Donor",{ "source_document": donor.get("name")}):
            existing_donors.append(donor.get("donor_name"))
            continue
        new_donor = frappe.new_doc("Donor")
        new_donor.source_document = donor.get("name")
        new_donor.donor_name = donor.get("donor_name")
        new_donor.email = donor.get("email")
        new_donor.mobile_number = donor.get("mobile_number")
        new_donor.insert(ignore_permissions=True,ignore_mandatory=True)
    if len(existing_donors) > 0:
        return f"Following donors already exist in the system: {','.join(existing_donors)}"
    else:
        return "Donors imported successfully"