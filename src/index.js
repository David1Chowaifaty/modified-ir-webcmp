function getToken() {
    //return "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3MTAxNDE5NzIsIkNMQUlNLTAxIjoiS0RyWG53NkZnSTg9IiwiQ0xBSU0tMDIiOiI5UStMQm93VTl6az0iLCJDTEFJTS0wMyI6Ilp3Tys5azJoTzUwPSIsIkNMQUlNLTA0IjoiWUpPWXNPeHJVRDVvNG1ZKzQ2RG5jdz09In0.X2EZlqgLpIFEXLXE3p_oD9mjPNqZrFsjmoEnupk6QzU"
    return "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3MTE3MTQ4OTYsIkNMQUlNLTAxIjoicktLMi9DY1dQQnM9IiwiQ0xBSU0tMDIiOiI5UStMQm93VTl6az0iLCJDTEFJTS0wMyI6Ilp3Tys5azJoTzUwPSIsIkNMQUlNLTA0IjoiRThLMEFsdS9NdkhEMEhwMnJFS0I1Zz09In0.cyFzTxZ4-IadtJCfQMJ1uE2gSlnxVHL_JF_QC8nUYfM"
}
function getId() {
    //return "162"
    return "42"
}

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
