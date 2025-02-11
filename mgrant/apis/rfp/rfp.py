import frappe
import urllib.parse

@frappe.whitelist(allow_guest=True)
def get_rfp_list():
    rfp = frappe.form_dict.get('rfp')
    donor = frappe.form_dict.get('donor')
    ngo = frappe.form_dict.get('ngo')
    baseurl = frappe.get_conf().get('hostname')
    if not rfp and not donor and not ngo:
        return {'error': 'Missing RFP and donor parameter'}
    
    if frappe.session.user == "Guest":
        redirect_url = f"/api/method/mgrant.apis.rfp.rfp.get_rfp_list?rfp={rfp}&donor={donor}&ngo={ngo}"
        login_url = f"{baseurl}/login?redirect-to={urllib.parse.quote(redirect_url, safe='')}"
        
        frappe.local.response["type"] = "redirect"
        frappe.local.response["location"] = login_url
        return
    
    if frappe.db.exists('Proposal', {'rfp': rfp, 'donor': donor, 'ngo': ngo}):
        application = frappe.get_all('Proposal', filters={'rfp': rfp, 'donor': donor, 'ngo': ngo}, fields=['name'])[0]
        url = f"{baseurl}/app/proposal/{application.name}"
        frappe.local.response.update({
            "type": "redirect",
            "location": url
        })
        return
    
    application = frappe.new_doc('Proposal')
    application.rfp = rfp
    application.donor = donor
    application.ngo = ngo
    application.owner = frappe.session.user
    application.insert()
    frappe.db.commit()

    url = f"{baseurl}/app/proposal/{application.name}"
    frappe.local.response.update({
            "type": "redirect",
            "location": url
        })
    return
