(function () {
    "use strict";
    WinJS.Namespace.define("Slinky.UI", {
        updateSaveToListView: function (link) {
            var link = Slinky.SelectedItem;
            Slinky.Core.Persistence.Adapter.getLists().done(function (data) {
                var gridDataSource = [];
                var selected = [];
                for (var i = 0; i < data.length; i++) {
                    if (link.Lists.indexOf(data[i].Name) > -1) {
                        selected.push({
                            firstIndex: i,
                            firstKey: i.toString(),
                            lastIndex: i,
                            lastKey: i.toString()
                        });
                    }
                    gridDataSource.push({
                        name: data[i].Name
                    });
                }


                gridDataSource = new WinJS.Binding.List(gridDataSource);
                var saveToLists = document.getElementById("SaveToLists").winControl;
                var saveToListInvoke = function (args) {
                    saveToLists.selection.getItems().done(function (items) {
                        var selectedLists = [];
                        for (var i = 0; i < items.length; i++) {
                            selectedLists.push(items[i].data.name);
                        }
                        link.Lists = selectedLists;
                        Slinky.Core.Persistence.Adapter.updateLink(link);
                    });
                }
                saveToLists.itemTemplate = document.getElementById("flyoutSaveToListTemplate");
                saveToLists.oniteminvoked = saveToListInvoke.bind(this);
                saveToLists.itemDataSource = gridDataSource.dataSource;
                saveToLists.selection.set(selected);
                saveToLists.layout = new WinJS.UI.GridLayout();
                saveToLists.forceLayout();

                document.getElementById("flySaveToList").addEventListener("beforeshow", function (event) {
                    var saveToLists = document.getElementById("SaveToLists").winControl;
                    saveToLists.forceLayout();
                });
            });
        }
    });
    WinJS.UI.Pages.define("/pages/detail/detail.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var link = options.item;
            
            var title = document.getElementById('title');
            var subtitle = document.getElementById('subtitle');
            var description = document.getElementById('description');
            var image = document.getElementById('image');

            subtitle.innerHTML = link.Url;

            for (var j = 0; j < link.Details.length; j++) {
                if (link.Details[j].Type == "text" && link.Details[j].Key == "title") {
                    title.innerHTML = link.Details[j].Value;
                } else if (link.Details[j].Type == "text" && link.Details[j].Key == "description") {
                    description.innerHTML = link.Details[j].Value;
                } else if (link.Details[j].Type == "picture" && link.Details[j].Key == "picture") {
                    image.src = link.Details[j].Value;
                    console.dir(link.Details);
                }
                
            }

            /* HIDE ALL NON RELEVANT APPBAR COMMANDS */
            document.getElementById('appbar').winControl.showOnlyCommands(document.querySelectorAll('.itemdetail'));
            document.getElementById('appbar').winControl.showCommands(document.querySelectorAll('#createlistcommand'));

            /* Update save to list listview */
            Slinky.UI.updateSaveToListView();

            /*********************
             * SHARE
             *********************/
            var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
            dataTransferManager.ondatarequested = function (e) {
                var request = e.request;

                var link = Slinky.SelectedItem;
                for (var j = 0; j < link.Details.length; j++) {
                    if (link.Details[j].Type == "text" && link.Details[j].Key == "title") {
                        request.data.properties.title = link.Details[j].Value;
                    } else if (link.Details[j].Type == "text" && link.Details[j].Key == "description") {
                        request.data.properties.description = link.Details[j].Value;
                    }
                }

                request.data.setUri(new Windows.Foundation.Uri(link.Url));
            };
        }
    });
})();
