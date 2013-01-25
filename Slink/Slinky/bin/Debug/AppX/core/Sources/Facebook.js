(function () {
    "use strict";

    var Facebook = WinJS.Namespace.define("Slinky.Core.Sources.Facebook",
    {
        AuthClient: WinJS.Class.define(
            function (options) {
                var opts = ["appID", "secret", "storage", "extendTokenUrl"]
                for (var i = 0; i < opts.length; i++) {
                    var name = opts[i];
                    if (options[name])
                        this[name] = options[name];
                }
            },

            {
                authzInProgress: false,
                secret: undefined,
                appID: undefined,
                userName: undefined,
                user: undefined,
                token: undefined,
                extendTokenUrl: "https://graph.facebook.com/oauth/access_token?client_id=",
                storage: WinJS.Application.local,

                getSavedToken: function () {
                    var session = this.storage;
                    var that = this;

                    return session.readText("fbauthtoken.txt", "").then(
                        function success(data) {
                            if (data.length > 0) {
                                if (that.isValidToken(data)) {
                                    that.token = data;
                                    return data;
                                }
                                else {
                                    return false;
                                }
                            }
                        });
                },

                checksavedtoken: function () {
                    var session = this.storage;
                    var that = this;

                    return session.readText("fbauthtoken.txt", "").then(
                        function success(data) {
                            if (data.length > 0) {
                                return that.savetoken(data);
                            }
                                // else return WinJS.Promise.wrapError("No saved token");
                            else return WinJS.Promise.wrapError("No saved token");
                        });
                },

                isValidToken: function (token) {
                    var meUrl = "https://graph.facebook.com/me?access_token=" + token;
                    var that = this;

                    // verify the token before we save it
                    return WinJS.xhr({
                        url: meUrl
                    }).then(
                    function success(result) {
                        try {
                            var user = JSON.parse(result.response);
                            if (user.name) {
                                return true;
                            }
                            else {
                                return false;
                            }

                        }
                        catch (e) {
                            return false;
                        }
                    });
                },

                savetoken: function (token) {
                    var meUrl = "https://graph.facebook.com/me?access_token=" + token;
                    var that = this;

                    // verify the token before we save it
                    return WinJS.xhr({
                        url: meUrl
                    }).then(
                    function success(result) {
                        try {
                            that.user = JSON.parse(result.response);
                            that.userName = that.user.name;
                            that.token = token;

                            var session = that.storage;
                            return session.writeText("fbauthtoken.txt", token);

                        }
                        catch (e) {
                            that.user = undefined;
                            that.userName = undefined;
                            that.token = undefined;

                            return WinJS.Promise.wrapError(e);
                        }
                    });
                },

                logout: function () {
                    var session = this.storage;
                    session.remove("fbauthtoken.txt");

                    this.token = undefined;
                    this.user = undefined;
                    this.userName = undefined;
                    this.authzInProgress = false;
                },

                getToken: function () {
                    var that = this;
                    return that.token;
                },

                performLogout: function() {

                },

                login: function () {


                    if (this.authzInProgress) {
                        // auth already in progress
                        return WinJS.Promise.wrapError("Auth already in progress");
                    }

                    var facebookURL = "https://www.facebook.com/dialog/oauth?client_id=";
                    var callbackURL = "https://www.facebook.com/connect/login_success.html";

                    facebookURL += this.appID + "&redirect_uri=" + encodeURIComponent(callbackURL) + "&scope=read_stream&display=popup&response_type=token";

                    var startURI = new Windows.Foundation.Uri(facebookURL);
                    var endURI = new Windows.Foundation.Uri(callbackURL);
                    this.authzInProgress = true;

                    var that = this;

                    return Windows.Security.Authentication.Web.WebAuthenticationBroker.authenticateAsync(
                        Windows.Security.Authentication.Web.WebAuthenticationOptions.none, startURI, endURI)
                        .then(function success(result) {
                            try {
                                var responseURI = new Windows.Foundation.Uri(result.responseData) ;
                                var query = responseURI.queryParsed;
                                if (query.length > 0 && query.getFirstValueByName("error") != undefined) {
                                    that.authzInProgress = false;
                                    return WinJS.Promise.wrapError({
                                        message: "Login failed",
                                        query: query
                                    });
                                }
                                var fragment = responseURI.fragment;
                                if (fragment.indexOf("#") == 0) {
                                    // strip the leading #, so it can be treated like a query
                                    fragment = fragment.substring(1, fragment.length - 1);
                                }
                                if (fragment.length < 4) {
                                    that.authzInProgress = false;
                                    return WinJS.Promise.wrapError("Login failed");
                                }

                                var decoder = new Windows.Foundation.WwwFormUrlDecoder(fragment);
                                var token = decoder.getFirstValueByName("access_token");
                                var expires = parseInt(decoder.getFirstValueByName("expires_in"));

                                if (token == undefined || expires == undefined) return WinJS.Promise.wrapError("Token or expires was undefined");

                                var expiresDate = new Date();
                                expiresDate.setTime(expiresDate.getTime() + 1000 * expires);
                                that.expires = expiresDate;
                                that.token = token;
                                WinJS.Utilities.addClass(document.getElementById('fblogin'), "hide");
                                if (expires < 170000 && that.secret != undefined)
                                    // want at least 2 days
                                    return that.getExtendedToken(token);
                                else {
                                    that.authzInProgress = false;
                                    return that.savetoken(token);
                                }
                            }
                            catch (e) {
                                // error
                            }
                        });

                },

                getExtendedToken: function (token) {
                    var facebookURL = this.extendTokenUrl;

                    facebookURL += this.appID;
                    facebookURL += "&client_secret=" + this.secret + "&grant_type=fb_exchange_token&fb_exchange_token=" + token;

                    var that = this;

                    return WinJS.xhr({
                        type: "POST",
                        url: facebookURL
                    }).then(
                    function success(result) {
                        var fragment = result.responseText;
                        if (fragment.indexOf("#") == 0) {
                            // strip the leading #, so it can be treated like a query
                            fragment = fragment.substring(1, fragment.length - 1);
                        }
                        var decoder = new Windows.Foundation.WwwFormUrlDecoder(fragment);
                        var token = decoder.getFirstValueByName("access_token");
                        var expires = parseInt(decoder.getFirstValueByName("expires")); // not named expires_in anymore
                        var expiresDate = new Date();
                        expiresDate.setTime(expiresDate.getTime() + 1000 * expires);
                        that.expires = expiresDate;
                        that.authzInProgress = false;
                        return that.savetoken(token);

                    },
                    function error(e) {
                        // get extended failed, revert to the short token
                        that.authzInProgress = false;
                        return that.savetoken(token);
                    });
                },

                getFBLinks: function () {
                    var that = this;
                    if (that.token == undefined) {
                        var dlg = new Windows.UI.Popups.MessageDialog("You must login first").showAsync();
                        return;
                    }
                    WinJS.Utilities.removeClass(document.getElementById("progress-bar"), "hide");
                    // get most recent date from db
                    var ms = new Date().getTime() - (86400000 * 30)
                    var d = new Date(ms);
                    var fromDate = Math.round(d.getTime() / 1000);
                    
                    var query = "SELECT link_id,url,title,created_time,caption,image_urls,like_info,picture,summary"
                    +" FROM link WHERE owner IN (SELECT uid2 FROM friend WHERE uid1=me() LIMIT 0,20)"
                    + " AND created_time > " + fromDate + " LIMIT 100";
                    var treatedQuery = query.replace(/ /g, "+");
                    var linksURL = 'https://graph.facebook.com/'
                        + 'fql?q='+ treatedQuery +'&access_token=' + that.token;
                    console.log(linksURL);
                    return new WinJS.Promise(function (complete, error) {
                        WinJS.xhr(
                        {
                            url: linksURL


                        }).then(
                            function success(xhr) {

                                var result = JSON.parse(xhr.responseText);
                                // document.getElementById("bridebug").innerHTML = xhr.responseText;
                                WinJS.Utilities.addClass(document.getElementById("progress-bar"), "hide");
                                complete(result);

                            },
                            function failure(err) {
                                console.assert(false);
                            }
                        );
                    });
                }

            })

    });

})();