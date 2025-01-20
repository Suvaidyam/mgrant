import frappe

def get_context(context):
	conf = frappe.get_conf()
	context['baseurl'] = conf.get('hostname')
	
