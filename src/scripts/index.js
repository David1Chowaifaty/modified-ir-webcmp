function getToken() {
    return "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3NDM2NjU5OTUsIkNMQUlNLTAxIjoicktLMi9DY1dQQnM9IiwiQ0xBSU0tMDIiOiI5UStMQm93VTl6az0iLCJDTEFJTS0wMyI6InJ5Y0ZmdnF6NjQ0PSIsIkNMQUlNLTA0IjoiQUVxVnRCMm1kWTg9IiwiQ0xBSU0tMDUiOiJFQTEzejA3ejBUcWRkM2gwNElyYThFOHYzRGt2MUlROCIsIkNMQUlNLTA2IjoiQUVxVnRCMm1kWTg9In0.E9kwmxT7yL6gAzRADJDGVl0Eq7V7eWV_xXWNFmg7mrY"
}
function getId() {
    return "42"
}
const authenticate = async (username = "A35", password = "12345") => {
    try {
        const res = await fetch('https://gateway.igloorooms.com/IR/Authenticate', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: "POST",
            credentials: 'include', // This ensures that cookies are sent and received
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await res.json();
        return data.My_Result;
    } catch (error) {
        console.error(error);
        return null;
    }
};
/* Helper function to calculate a date range based on a starting date (can be a Date object or a string) and a maximum span of months.
* 
* This function accepts a `fromDate` (either a Date object or a string in YYYY-MM-DD format) and a maximum number of months to generate a date range.
* The function returns an object containing the calculated `_FROM_DATE` (the start date) and `_TO_DATE` 
* (the end date, calculated by adding the specified number of months).
* 
* @param {Date|string} fromDate - The starting date as a Date object or a string in YYYY-MM-DD format (e.g., "2024-10-01").
* @param {number} maxMonths - The maximum number of months to calculate the `toDate` (e.g., 3 for 3 months).
* 
* @returns {Object} An object containing:
*   - `_FROM_DATE`: The provided `fromDate` in YYYY-MM-DD format.
*   - `_TO_DATE`: The calculated date after adding the specified months, in YYYY-MM-DD format.
* 
* Example usage:
*   const { _FROM_DATE, _TO_DATE } = calculateDateRange("2024-10-01", 3);
*   console.log(_FROM_DATE);  // "2024-10-01"
*   console.log(_TO_DATE);    // "2025-01-01" (approximately 3 months later)
*/
function calculateDateRange(fromDate, maxMonths) {
    // If fromDate is a string, convert it to a Date object
    const startDate = typeof fromDate === 'string' ? new Date(fromDate) : fromDate;

    // Ensure the fromDate is a valid Date object
    if (isNaN(startDate)) {
        throw new Error("Invalid start date. Please provide a valid Date object or a string in YYYY-MM-DD format.");
    }

    // Set the _FROM_DATE to the provided fromDate
    const _FROM_DATE = startDate.toISOString().substring(0, 10);

    // Calculate the _TO_DATE by adding the specified number of months
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + maxMonths);
    const _TO_DATE = endDate.toISOString().substring(0, 10);

    return {
        _FROM_DATE,
        _TO_DATE
    };
}
const logout = async () => {
    try {
        console.log("logout")
        const res = await fetch('https://gateway.igloorooms.com/IR/Logout', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: "POST",
            credentials: 'include', // This ensures that cookies are sent and received
            body: JSON.stringify({

            })
        });

        const data = await res.json();
        return data.My_Result;
    } catch (error) {
        console.error(error);
        return null;
    }
};

function getBrowserInfo() {
    var ua = navigator.userAgent, tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return { name: 'IE', version: (tem[1] || '') };
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) return { name: tem[1].replace('OPR', 'Opera'), version: tem[2] };
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return {
        name: M[0],
        version: M[1]
    };
}

function checkBrowserValidity() {
    var { name, version } = getBrowserInfo();

    function suggestUpgrade(browserName) {
        return window.confirm(`Upgrade to the latest version of ${browserName} in order to get the full features of x.igloorooms.com`);
    }
    const browsers = [{
        name: "Chrome",
        minVersion: 79,
        redirectUrl: "https://www.google.com/chrome/"
    }, {
        name: "Safari",
        minVersion: 14,
        redirectUrl: "https://www.apple.com/safari/"
    }, {
        name: "Firefox",
        minVersion: 70,
        redirectUrl: "https://www.mozilla.org/firefox/"
    }]

    const currentBrowser = browsers.find(b => b.name === name)
    if (!currentBrowser) {
        return;
    }
    if (version < currentBrowser.minVersion && suggestUpgrade(currentBrowser.name)) {
        window.location.href = currentBrowser.redirectUrl;
    }
}
