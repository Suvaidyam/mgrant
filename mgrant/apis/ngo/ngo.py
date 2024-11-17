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
def sync_ngos_from_central_repo():
    conf = frappe.get_doc("mGrant API Integrations")
    if not conf.base_url:
        return frappe.throw("Base URL is required")
    url = f"{conf.base_url}/api/method/mgrant_central_repo.apis.api.get_ngos"
    headers = {
        'Authorization': f"token {conf.api_key}:{conf.api_secret}",
    }
    response = requests.get(url, headers=headers)
    return response.json().get("message", [])

@frappe.whitelist()
def add_ngo_to_central_repo(ngo_id):
    if frappe.db.exists("NGO", ngo_id):
        ngo = frappe.get_doc("NGO", ngo_id)
        conf = frappe.get_doc("mGrant API Integrations")
        if not conf.base_url:
            return frappe.throw("Base URL is required")
        url = f"{conf.base_url}/api/method/mgrant_central_repo.apis.api.add_ngo"
        headers = {
            'Authorization': f"token {conf.api_key}:{conf.api_secret}",
        }
        response = requests.post(url, headers=headers, data=json.dumps(convert_datetime_to_string(ngo.as_dict())))
        return response.json()
    else:
        return frappe.throw("NGO not found")
    
@frappe.whitelist()
def sync_selected_ngos_from_central_repo(ngos):
    ngos = json.loads(ngos)
    existing_ngos = []
    for ngo in ngos:
        if frappe.db.exists("NGO",{"source_document": ngo.get("name")}):
            existing_ngos.append(ngo.get("ngo_name"))
            continue
        new_ngo = frappe.new_doc("NGO")
        new_ngo.source_document = ngo.get("name")
        new_ngo.ngo_name = ngo.get("ngo_name")
        new_ngo.registration_of_the_organisaiton = ngo.get("registration_of_the_organisaiton")
        new_ngo.year_of_establishment = ngo.get("year_of_establishment")
        new_ngo.website = ngo.get("website")
        new_ngo.insert(ignore_permissions=True,ignore_mandatory=True)
    if len(existing_ngos) > 0:
        return f"Following NGOs already exist in the system: {','.join(existing_ngos)}"
    else:
        return "NGOs imported successfully"