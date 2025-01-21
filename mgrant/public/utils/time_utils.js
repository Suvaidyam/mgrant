let dateFormat = 'yyyy-mm-dd';
let timeFormat = 'HH:mm:ss';
frappe.db.get_single_value('System Settings', 'date_format').then(value => {
    dateFormat = value;
});
frappe.db.get_single_value('System Settings', 'time_format').then(value => {
    timeFormat = value;

});


const getFormattedTime = async (time) => {
    let t = new Date(time);
    let formatted_time = '';

    const padZero = (num) => (num < 10 ? '0' : '') + num;

    const hours = padZero(t.getHours());
    const minutes = padZero(t.getMinutes());
    const seconds = padZero(t.getSeconds());

    if (timeFormat === 'HH:mm:ss') {
        formatted_time = `${hours}:${minutes}:${seconds}`;
    } else if (timeFormat === 'HH:mm') {
        formatted_time = `${hours}:${minutes}`;
    } else {
        throw new Error(`Unsupported time format: ${timeFormat}`);
    }
    return formatted_time;
};



// Common function to format date and time
const formatDateTime = (dateTime, isDate = false, isTime = false) => {
    // Default formats
   
    if (!isDate && !isTime) {
        throw new Error("At least one of 'isDate' or 'isTime' must be true.");
    }
    // Remove microseconds if present
    if (dateTime.includes('.')) {
        dateTime = dateTime.split('.')[0];
    }

    let dt = new Date(dateTime);
    if (isNaN(dt.getTime())) {
        throw new Error(`Invalid date/time format: ${dateTime}`);
    }

    // Utility function to pad zeroes
    const padZero = (num) => (num < 10 ? '0' : '') + num;

    let formattedDate = '';
    let formattedTime = '';

    if (isDate) {
        const day = padZero(dt.getDate());
        const month = padZero(dt.getMonth() + 1); // Months are zero-based
        const year = dt.getFullYear();

        switch (dateFormat) {
            case 'dd-mm-yyyy':
                formattedDate = `${day}-${month}-${year}`;
                break;
            case 'mm-dd-yyyy':
                formattedDate = `${month}-${day}-${year}`;
                break;
            case 'yyyy-mm-dd':
                formattedDate = `${year}-${month}-${day}`;
                break;
            case 'yyyy-dd-mm':
                formattedDate = `${year}-${day}-${month}`;
                break;
            case 'dd/mm/yyyy':
                formattedDate = `${day}/${month}/${year}`;
                break;
            case 'dd.mm.yyyy':
                formattedDate = `${day}.${month}.${year}`;
                break;
            case 'mm/dd/yyyy':
                formattedDate = `${month}/${day}/${year}`;
                break;
            default:
                formattedDate = `${year}/${month}/${day}`;
                break;
        }
    }

    if (isTime) {
        let hours = dt.getHours();
        const minutes = padZero(dt.getMinutes());
        const seconds = padZero(dt.getSeconds());
        let amPm = '';

        if (timeFormat === 'hh:mm:ss a' || timeFormat === 'hh:mm a') {
            amPm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12; // Convert to 12-hour format
        }

        hours = padZero(hours);

        switch (timeFormat) {
            case 'HH:mm:ss':
                formattedTime = `${hours}:${minutes}:${seconds}`;
                break;
            case 'HH:mm':
                formattedTime = `${hours}:${minutes}`;
                break;
            case 'hh:mm:ss a':
                formattedTime = `${hours}:${minutes}:${seconds} ${amPm}`;
                break;
            case 'hh:mm a':
                formattedTime = `${hours}:${minutes} ${amPm}`;
                break;
            default:
                throw new Error(`Unsupported time format: ${timeFormat}`);
        }
    }

    // Combine date and time if both are requested
    return `${formattedDate}${isDate && isTime ? ' ' : ''}${formattedTime}`;
};




