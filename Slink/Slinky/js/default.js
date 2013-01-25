// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    WinJS.Namespace.define("Slinky", {
        SelectedItem: null
    });

    WinJS.Namespace.define("Slinky.UI", {
        updateListsViews: function () {
            Slinky.Core.Persistence.Adapter.getLists().done(function (data) {
                var gridDataSource = [];
                var selected = [];
                for (var i = 0; i < data.length; i++) {
                    gridDataSource.push({
                        name: data[i].Name
                    });
                }


                gridDataSource = new WinJS.Binding.List(gridDataSource);
                var appBarList = document.getElementById("appBarList").winControl;
                var appBarListInvoke = function (args) {
                    args.detail.itemPromise.done(function (itm) {

                        var afterNav = function () {
                            Slinky.UI.gridFilter.Keyword = null;
                            if (itm.data.name == 'All') {
                                document.getElementById('list_subheading').innerText = '';
                                Slinky.UI.gridFilter.Lists = null;
                            }
                            else {
                                document.getElementById('list_subheading').innerText = itm.data.name;
                                Slinky.UI.gridFilter.Lists = [itm.data.name];
                            }
                            Slinky.UI.updateGrid();
                            document.getElementById('topAppBar').winControl.hide();
                        }

                        if (WinJS.Navigation.location !== '/pages/list/list.html') {
                            WinJS.Navigation.navigate("/pages/list/list.html").done(afterNav);
                        }
                        else {
                            afterNav();
                        }
                        
                    });
                }
                appBarList.oniteminvoked = appBarListInvoke.bind(this);
                appBarList.itemDataSource = gridDataSource.dataSource;
                
            });
        },
        ensureLists: function () {
            return new WinJS.Promise(function (complete, error) {
                Slinky.Core.Persistence.Adapter.getLists().done(function (data) {
                    var hasAll = false;
                    var hasFavorites = false;

                    for (var i = 0; i < data.length; i++) {
                        if (data[i].Name == 'All') {
                            hasAll = true;
                        }
                        else if (data[i].Name == 'Favorites') {
                            hasFavorites = true;
                        }
                    }

                    if (!hasAll) {
                        var allLinks = new Slinky.Core.Persistence.Models.List(null, "All", "All of my links");
                        Slinky.Core.Persistence.Adapter.addList(allLinks);
                    }
                    if (!hasFavorites) {
                        var favoritesList = new Slinky.Core.Persistence.Models.List(null, "Favorites", "My Favorites");
                        Slinky.Core.Persistence.Adapter.addList(favoritesList);
                        
                    }

                    complete();
                });
            });
        }
    });

    

    var $ = function (selector) {
        return WinJS.Utilities.query(selector);
    };

    

    function hideAppBars() {
        document.getElementById('topAppBar').winControl.hide();
        appbar.winControl.hide();
    }

    var page = WinJS.UI.Pages.define("default.html", {
        ready: function (element, options) {
            document.getElementById('topAppBar').winControl.sticky = false;
            document.getElementById('OpenPage').addEventListener('click', function () {
                Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(Slinky.SelectedItem.Url)).done(

                );
            });

            var ac = new Slinky.Core.Sources.Facebook.AuthClient({ appID: "490046841035318", secret: "12e8491356c1c33a74f87413b6df23e2" });
            ac.getSavedToken().then(function (ret) {
                displayTokenInfo();
                WinJS.Utilities.addClass(document.getElementById('fblogin'), "hide");
                if (!ret) {
                    ac.login().then(function (args) {
                        WinJS.Utilities.removeClass(document.getElementById('fblogout'), "hide");
                    });
                }
            });
            
            function displayTokenInfo() {
                console.log("token: " + ac.getToken());
            }

            function showModalAlert(header, sub, duration) {
                if (!duration) {
                    var duration = 2500;
                }
                var boxDuration = duration - 500;
                document.getElementById('message_pane_header').innerHTML = header;
                document.getElementById('message_pane_sub').innerHTML = sub;
                WinJS.Utilities.removeClass(document.getElementById('shadow-overlay'), "hide");
                setTimeout(function () { WinJS.Utilities.addClass(document.getElementById('shadow-overlay'), "hide"); }, duration);
                
                WinJS.Utilities.removeClass(document.getElementById('message-pane'), "hide");
                setTimeout(function () { WinJS.Utilities.addClass(document.getElementById('message-pane'), "hide"); }, boxDuration);
            }
            
            document.getElementById('fblogin').addEventListener('click', function () {
                hideAppBars();
                ac.login().then(function (args) {
                    displayTokenInfo(ac);
                    WinJS.Utilities.addClass(document.getElementById('fblogin'), "hide");
                    WinJS.Utilities.removeClass(document.getElementById('fblogout'), "hide");
                    showModalAlert("Logging in to Facebook", "<progress class='win-ring' />", 3000);
                });
            });


            document.getElementById('GetFBLinks').addEventListener('click', function () {
                hideAppBars();
                showModalAlert("Getting your links", "This may take a moment...", 4000);
                ac.getFBLinks().then(function (result) {
                    var output = '';
                    
                    if (result.data.length > 0) {
                        var linkSource = "Facebook";
                        for (var f = 0; f < result.data.length; f++) {
                            var details = [];
                            details.push(new Slinky.Core.Persistence.Models.LinkDetail('text', 'title', result.data[f].title));
                            details.push(new Slinky.Core.Persistence.Models.LinkDetail('text', 'description', result.data[f].summary || ""));
                            details.push(new Slinky.Core.Persistence.Models.LinkDetail('time', 'created_time', new Date(result.data[f].created_time * 1000))); details.push(new Slinky.Core.Persistence.Models.LinkDetail('picture', 'picture', result.data[f].picture));
                            for (var pho in result.data[f].image_urls) {
                                details.push(new Slinky.Core.Persistence.Models.LinkDetail('picture', result.data[f].image_urls[pho], result.data[f].image_urls[pho]));
                            }
                            var link = new Slinky.Core.Persistence.Models.Link(null, result.data[f].url, linkSource, result.data[f].link_id, new Date(), ['All'], details);
                            Slinky.Core.Persistence.Adapter.addLink(link);
                        }
                            
                        Slinky.UI.updateGrid();
                    }

                });
            });

            document.getElementById('fblogout').addEventListener('click', function () {
                hideAppBars();
                showModalAlert("Logging out of Facebook", "<progress class='win-ring' />", 3000);
                ac.logout();
                WinJS.Utilities.removeClass(document.getElementById('fblogin'), "hide");
                WinJS.Utilities.addClass(document.getElementById('fblogout'), "hide");
            });

            document.getElementById('Nuke').addEventListener('click', function () {
                hideAppBars();
                showModalAlert("Removing your links", "<progress class='win-ring' />", 3000);
                Slinky.Core.Persistence.Adapter.nukeLinks().done(function () {
                    Slinky.UI.gridFilter.Lists = null;
                    Slinky.UI.gridFilter.Keyword = null;
                    Slinky.UI.updateGrid();
                });
                Slinky.Core.Persistence.Adapter.nukeLists().done(function () {
                    Slinky.UI.ensureLists().done(function () { Slinky.UI.updateListsViews(); });
                });
                
            });

            document.getElementById('btnCreateList').addEventListener('click', function () {
                var name = document.getElementById('newListName').value;
                var newList = new Slinky.Core.Persistence.Models.List(null, name, name);
                Slinky.Core.Persistence.Adapter.addList(newList).done(function () {
                    Slinky.UI.updateListsViews();
                    if (WinJS.Navigation.location === '/pages/detail/detail.html') {
                        Slinky.UI.updateSaveToListView();
                    }
                    document.getElementById('flyCreateList').winControl.hide();
                });;
            });

            Slinky.UI.ensureLists().done(function () { Slinky.UI.updateListsViews(); });


            /*********************
             * SEARCH
             *********************/
            Windows.ApplicationModel.Search.SearchPane.getForCurrentView().addEventListener("querysubmitted", function (data) {
                
                var afterNav = function () {
                    Slinky.UI.gridFilter.Keyword = data.queryText;
                    document.getElementById('list_subheading').innerText = "Search Results for '" + data.queryText + "'";
                    Slinky.UI.updateGrid();
                }

                if (WinJS.Navigation.location !== '/pages/list/list.html') {
                    WinJS.Navigation.navigate("/pages/list/list.html").done(afterNav);
                }
                else {
                    afterNav();
                }
            });

            
        }
    });

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll());
            
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
        app.sessionState.history = nav.history;
    };

    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }));
        }
    });


    app.start();
})();
