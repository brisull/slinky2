// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    WinJS.Namespace.define("Slinky.UI", {
        gridFilter: new Slinky.Core.Persistence.Value.LinksFilter(),
        gridSort: new Slinky.Core.Persistence.Value.LinksSort(),
        updateGrid: function () {
            
            Slinky.Core.Persistence.Adapter.getLinks(Slinky.UI.gridFilter, Slinky.UI.gridSort).done(function (data) {

                var links = [];
                var gridDataSource = [];
                for (var i = 0; i < data.length; i++) {
                    links.push(data[i]);
                    var link = data[i];

                    var title = "";
                    var subtitle = "";
                    var backgroundImage = "";
                    var date = "";

                    date = new Date();

                    for (var j = 0; j < link.Details.length; j++) {
                        if (link.Details[j].Type == "text" && link.Details[j].Key == "title") {
                            title = link.Details[j].Value;
                        } else if (link.Details[j].Type == "text" && link.Details[j].Key == "description") {
                            subtitle = link.Details[j].Value;
                        } else if (link.Details[j].Type == "time" && link.Details[j].Key == "created_time") {
                            date = link.Details[j].Value;
                        } else if (link.Details[j].Type == "picture" && link.Details[j].Key == "picture") {
                            backgroundImage = link.Details[j].Value;
                        }

                    }

                    if (!date.getMonth) {
                        date = new Date(date);
                    }

                    date = (date.getMonth()+1).toString() + "/" + date.getDate();

                    gridDataSource.push({
                        title: title,
                        subtitle: subtitle,
                        backgroundImage: backgroundImage,
                        DateAdded: date
                    });
                }

                
                if (gridDataSource.length == 0) {
                    document.getElementById("linkGrid").style.display='none'
                    document.getElementById("noLinksError").style.display = 'block';
                }
                else {
                    document.getElementById("linkGrid").style.display = 'block'
                    document.getElementById("noLinksError").style.display = 'none';
                }
                

                gridDataSource = new WinJS.Binding.List(gridDataSource);

                var listView = document.getElementById("linkGrid").winControl;

                var selectLinkHandler = function (args) {
                    var item = links[args.detail.itemIndex];
                    Slinky.SelectedItem = item;
                    WinJS.Navigation.navigate("/pages/detail/detail.html", { item: item });
                }
                listView.oniteminvoked = selectLinkHandler.bind(this);
                listView.itemDataSource = gridDataSource.dataSource;

                document.getElementById('appbar').winControl.showCommands(document.querySelectorAll('#appbar button'));
                document.getElementById('appbar').winControl.hideCommands(document.querySelectorAll('.itemdetail'));
            });
        }
    });

    WinJS.UI.Pages.define("/pages/list/list.html", {
        ready: function (element, options) {
            Slinky.UI.updateGrid();
        }
    });
})();
