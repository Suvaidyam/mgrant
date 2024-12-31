from datetime import datetime
def get_fiscal_quarter(date):
    date = datetime.strptime(str(date), '%Y-%m-%d')
    month = date.month  # month is 1-12 in Python
    if 3 < month <= 6:
        return 1
    elif 7 < month <= 9:
        return 2
    elif 10 < month <= 12:
        return 3
    else:
        return 4  # January to March

def get_fiscal_year(date):
    date = datetime.strptime(str(date), '%Y-%m-%d')
    month = date.month
    year = date.year
    return year if month > 3 else year - 1

def get_month_quarter_year_based_on_date_and_yt(date,year_type):
    month = date.month
    year = date.year
    quarter = (month) // 3
    if year_type == "Financial Year":
        year = get_fiscal_year(date)
        quarter = get_fiscal_quarter(date)
    return month,quarter,year