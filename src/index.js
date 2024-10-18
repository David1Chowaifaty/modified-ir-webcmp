function getToken() {
    return "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3MzA0NjAzNDgsIkNMQUlNLTAxIjoicktLMi9DY1dQQnM9IiwiQ0xBSU0tMDIiOiI5UStMQm93VTl6az0iLCJDTEFJTS0wMyI6Ilp3Tys5azJoTzUwPSIsIkNMQUlNLTA0IjoiQUVxVnRCMm1kWTg9IiwiQ0xBSU0tMDUiOiIvZzFwTzBhWU1wS2h1RTlOVDYzc0JFS1lXS21nS0oySFI3anFRbjFNNzlyTnhDOE55N0FpeDNWcTJ5NFpOKzRUMXR4ZHFpZ0lXTHI2MXBJRTFGcjYweTVtcVMySmVlQjQ2Wm9JbVVvTkhRejFSeFNINis5NjM2RkxCMHRSTitSOXhZMGJnbVI5dnpUTlBoUDFLK3ZmQmFISUNnRlRMZjVNIiwiQ0xBSU0tMDYiOiJBRXFWdEIybWRZOD0ifQ.3rTaQ-m82JpPt39vRNkh1Cg02Tv2PCmHU2p59phYtw4"
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
