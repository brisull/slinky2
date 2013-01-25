WinJS.Namespace.define("Slinky.Core.Persistence", {
    Adapter: {

        _error: function (msg) {
            console.log('uh oh: ' + msg);
        },
        _ensureDbOpen: function () {
            var that = this;

            // Try to get cached Db
            if (that._cachedDb) {
                return WinJS.Promise.wrap(that._cachedDb);
            }

            // Otherwise, open the database
            return new WinJS.Promise(function (complete, error, progress) {
                var createOptions = that._createOptions;
                var reqOpen = window.indexedDB.open("Slinky", 1);
                reqOpen.onerror = that._error;
                reqOpen.onsuccess = function () {
                    that._cachedDb = reqOpen.result;
                    complete(that._cachedDb);
                };

                // Create the database if new
                reqOpen.onupgradeneeded = function (evt) {
                    var newDB = evt.target.result;
                    newDB.createObjectStore("Sources", { keyPath: "Id", autoIncrement: true });
                    newDB.createObjectStore("Links", { keyPath: "Id", autoIncrement: true });
                    newDB.createObjectStore("Lists", { keyPath: "Id", autoIncrement: true });
                }
            });
        },
        _getObjectStore: function (type, name) {
            var that = this;
            type = type || "readonly";
            return new WinJS.Promise(function (complete, error) {
                that._ensureDbOpen().then(function (db) {
                    var transaction = db.transaction(name, type);
                    var store = transaction.objectStore(name);
                    complete(store);
                });
            });
        },

        // Retrieval
        getLink: function (id) {
            var that = this;
            return new WinJS.Promise(function (complete, error) {
                that._getObjectStore("readonly", "Links").then(function (store) {
                    var startIndex = 0;
                    var currentIndex = 0;
                    var item = null;
                    req = store.openCursor();

                    req.onerror = that._error;
                    req.onsuccess = function (evt) {
                        var cursor = evt.target.result;

                        if (currentIndex < startIndex) {
                            currentIndex = startIndex;
                            cursor.advance(startIndex);
                            return;
                        }

                        if (cursor) {
                            currentIndex++;

                            if (cursor.value[store.keyPath] == id) {
                                complete(new Slinky.Core.Persistence.Models.Link(cursor.value[store.keyPath],
                                                            cursor.value["Url"],
                                                            cursor.value["SourceName"],
                                                            cursor.value["SourceReferenceId"],
                                                            cursor.value["DateAdded"],
                                                            cursor.value["Lists"],
                                                            cursor.value["Details"]));
                            }
                            else {
                                cursor.continue();
                            }
                        }
                    };
                });
            });
        }, // WORKS
        getLinks: function (filter, sort) {
            var that = this;
            return new WinJS.Promise(function (complete, error) {
                that._getObjectStore("readonly", "Links").then(function (store) {
                    var startIndex = 0;
                    var currentIndex = 0;
                    var items = [];
                    req = store.openCursor();

                    req.onerror = that._error;
                    req.onsuccess = function (evt) {
                        var cursor = evt.target.result;

                        if (currentIndex < startIndex) {
                            currentIndex = startIndex;
                            cursor.advance(startIndex);
                            return;
                        }

                        if (cursor) {
                            currentIndex++;

                            if (filter.Sources == null || filter.Sources.length == 0 || filter.Sources.indexOf(cursor.value["SourceName"].toString()) > -1) {
                                if (filter.DateStart == null || filter.DateStart < cursor.value["DateAdded"]) {
                                    if (filter.DateEnd == null || filter.DateEnd > cursor.value["DateAdded"]) {
                                        if (filter.SourceReferenceId == null || filter.SourceReferenceId == cursor.value["SourceReferenceId"]) {
                                            if (filter.Lists == null || filter.Lists.length == 0 || Slinky.Core.Helpers.ArraysIntersect(filter.Lists, cursor.value["Lists"])) {

                                                var add = false;
                                                if (filter.Keyword != null) {
                                                    date = new Date();
                                                    var Details = cursor.value["Details"];
                                                    for (var j = 0; j < Details.length; j++) {
                                                        if (Details[j].Type == "text" && Details[j].Key == "title") {
                                                            add = Details[j].Value.search(new RegExp(filter.Keyword, "i")) > -1;
                                                            break;
                                                        }
                                                    }
                                                }
                                                else {
                                                    add = true;
                                                }

                                                if (add) {
                                                    items.push(new Slinky.Core.Persistence.Models.Link(cursor.value[store.keyPath],
                                                                                    cursor.value["Url"],
                                                                                    cursor.value["SourceName"],
                                                                                    cursor.value["SourceReferenceId"],
                                                                                    cursor.value["DateAdded"],
                                                                                    cursor.value["Lists"],
                                                                                    cursor.value["Details"])
                                                    );
                                                }
                                            }

                                        }
                                    }
                                }
                            }


                            cursor.continue();
                        }
                        else {

                            complete(items);
                        }
                    };
                });
            });

        },
        getLists: function () {
            var that = this;
            return new WinJS.Promise(function (complete, error) {
                that._getObjectStore("readonly", "Lists").then(function (store) {
                    var startIndex = 0;
                    var currentIndex = 0;
                    var items = [];
                    req = store.openCursor();

                    req.onerror = that._error;
                    req.onsuccess = function (evt) {
                        var cursor = evt.target.result;

                        if (currentIndex < startIndex) {
                            currentIndex = startIndex;
                            cursor.advance(startIndex);
                            return;
                        }

                        if (cursor) {
                            currentIndex++;

                            items.push(new Slinky.Core.Persistence.Models.List(cursor.value[store.keyPath],
                                cursor.value["Name"],
                                cursor.value["Description"]));

                            cursor.continue();
                            return;
                        }

                        complete(items);
                    };
                });
            });
        },
        getSources: function () {
            var that = this;
            return new WinJS.Promise(function (complete, error) {
                that._getObjectStore("readonly", "Sources").then(function (store) {
                    var startIndex = 0;
                    var currentIndex = 0;
                    var items = [];
                    req = store.openCursor();

                    req.onerror = that._error;
                    req.onsuccess = function (evt) {
                        var cursor = evt.target.result;

                        if (currentIndex < startIndex) {
                            currentIndex = startIndex;
                            cursor.advance(startIndex);
                            return;
                        }

                        if (cursor) {
                            currentIndex++;

                            items.push(new Slinky.Core.Persistence.Models.Source(cursor.value[store.keyPath],
                                cursor.value["Name"],
                                cursor.value["Type"],
                                cursor.value["UserId"],
                                cursor.value["EndPoint"],
                                cursor.value["AccessToken"],
                                cursor.value["DateAdded"],
                                cursor.value["DateLastSynced"],
                                cursor.value["TokenExpirationDate"]));
  
                            cursor.continue();
                            return;
                        }

                        results = {
                            items: items
                        };
                        complete(results);
                    };
                });
            });
        }, //WORKS

        // CRUD
        addSource: function (Source) {
            var that = this;
            return new WinJS.Promise(function (complete, error) {
                that._getObjectStore("readwrite", "Sources").done(function (store) {
                    var valueSource = Source.getValue();
                    delete valueSource.Id;
                    var reqAdd = store.add(valueSource);
                    reqAdd.onerror = that._error;
                    reqAdd.onsuccess = function (evt) {
                        var reqGet = store.get(evt.target.result);
                        reqGet.onerror = that._error;
                        reqGet.onsuccess = function (evt) {
                            complete(evt.target.result);
                        };
                    };
                });
            });
        }, // WORKS
        addList: function (List) {
            var that = this;
            return new WinJS.Promise(function (complete, error) {
                that._getObjectStore("readwrite", "Lists").done(function (store) {
                    var valueList = List.getValue();
                    delete valueList.Id;
                    var reqAdd = store.add(valueList);
                    reqAdd.onerror = that._error;
                    reqAdd.onsuccess = function (evt) {
                        var reqGet = store.get(evt.target.result);
                        reqGet.onerror = that._error;
                        reqGet.onsuccess = function (evt) {
                            complete(evt.target.result);
                        };
                    };
                });
            });
        }, // WORKS
        addLink: function (Link) {
            var that = this;
            return new WinJS.Promise(function (complete, error) {
                that._getObjectStore("readwrite", "Links").done(function (store) {
                    var valueLink = Link.getValue();
                    delete valueLink.Id;
                    var reqAdd = store.add(valueLink);
                    reqAdd.onerror = that._error;
                    reqAdd.onsuccess = function (evt) {
                        var reqGet = store.get(evt.target.result);
                        reqGet.onerror = that._error;
                        reqGet.onsuccess = function (evt) {
                            complete(evt.target.result);
                        };
                    };
                });
            });
        }, // WORKS
        addLinkDetail: function (LinkId, LinkDetail) {
            var that = this;
            return new WinJS.Promise(function (complete, error) {
                that._getObjectStore("readwrite", "Links").then(function (store) {
                    var startIndex = 0;
                    var currentIndex = 0;
                    var item = null;
                    req = store.openCursor();

                    req.onerror = that._error;
                    req.onsuccess = function (evt) {
                        var cursor = evt.target.result;

                        if (currentIndex < startIndex) {
                            currentIndex = startIndex;
                            cursor.advance(startIndex);
                            return;
                        }

                        if (cursor) {
                            currentIndex++;

                            if (cursor.value[store.keyPath] == LinkId) {

                                var link = new Slinky.Core.Persistence.Models.Link(cursor.value[store.keyPath],
                                                            cursor.value["Url"],
                                                            cursor.value["SourceName"],
                                                            cursor.value["SourceReferenceId"],
                                                            cursor.value["DateAdded"],
                                                            cursor.value["Lists"],
                                                            cursor.value["Details"]);

                                var index = -1;
                                for (var i = 0; i < link.Details.length; i++) {
                                    if (link.Details[i].Key == LinkDetail.Key) {
                                        index = i;
                                        break;
                                    }
                                }

                                if (index == -1) {
                                    link.Details.push(LinkDetail);
                                    store.put(link.getValue());
                                }

                                complete();
                            }
                            else {
                                cursor.continue();
                            }
                        }
                    };
                });
            });
        },  // WORKS
        addLinkToList: function (LinkId, ListName) {
            var that = this;
            return new WinJS.Promise(function (complete, error) {
                that._getObjectStore("readwrite", "Links").then(function (store) {
                    var startIndex = 0;
                    var currentIndex = 0;
                    var item = null;
                    req = store.openCursor();

                    req.onerror = that._error;
                    req.onsuccess = function (evt) {
                        var cursor = evt.target.result;

                        if (currentIndex < startIndex) {
                            currentIndex = startIndex;
                            cursor.advance(startIndex);
                            return;
                        }

                        if (cursor) {
                            currentIndex++;

                            if (cursor.value[store.keyPath] == LinkId) {

                                var link = new Slinky.Core.Persistence.Models.Link(cursor.value[store.keyPath],
                                                            cursor.value["Url"],
                                                            cursor.value["SourceName"],
                                                            cursor.value["SourceReferenceId"],
                                                            cursor.value["DateAdded"],
                                                            cursor.value["Lists"],
                                                            cursor.value["Details"]);

                                if (link.Lists.indexOf(ListName) < 0) {
                                    link.Lists.push(ListName);
                                    store.put(link.getValue());
                                }

                                complete();
                            }
                            else {
                                cursor.continue();
                            }
                        }
                    };
                });
            });
        }, // WORKS
        
        updateLink: function(Link){
            var that = this;
            return new WinJS.Promise(function (complete, error) {
                that._getObjectStore("readwrite", "Links").then(function (store) {
                    var startIndex = 0;
                    var currentIndex = 0;
                    var item = null;
                    req = store.openCursor();

                    req.onerror = that._error;
                    req.onsuccess = function (evt) {
                        var cursor = evt.target.result;

                        if (currentIndex < startIndex) {
                            currentIndex = startIndex;
                            cursor.advance(startIndex);
                            return;
                        }

                        if (cursor) {
                            currentIndex++;

                            if (cursor.value[store.keyPath] == Link.Id) {

                                store.put(Link.getValue());
                                complete();
                                return;
                            }
                            else {
                                cursor.continue();
                            }
                        }
                        complete();
                    };
                });
            });
        },
        updateLinkDetail: function (LinkId, Type, Key, Value) {
            var that = this;
            return new WinJS.Promise(function (complete, error) {
                that._getObjectStore("readwrite", "Links").then(function (store) {
                    var startIndex = 0;
                    var currentIndex = 0;
                    var item = null;
                    req = store.openCursor();

                    req.onerror = that._error;
                    req.onsuccess = function (evt) {
                        var cursor = evt.target.result;

                        if (currentIndex < startIndex) {
                            currentIndex = startIndex;
                            cursor.advance(startIndex);
                            return;
                        }

                        if (cursor) {
                            currentIndex++;

                            if (cursor.value[store.keyPath] == LinkId) {

                                var link = new Slinky.Core.Persistence.Models.Link(cursor.value[store.keyPath],
                                                            cursor.value["Url"],
                                                            cursor.value["SourceName"],
                                                            cursor.value["SourceReferenceId"],
                                                            cursor.value["DateAdded"],
                                                            cursor.value["Lists"],
                                                            cursor.value["Details"]);

                                var index = -1;
                                for (var i = 0; i < link.Details.length; i++) {
                                    if (link.Details[i].Key == Key) {
                                        index = i;
                                        break;
                                    }
                                }

                                if (index > -1) {
                                    link.Details[index].Type = Type;
                                    link.Details[index].Value = Value;
                                    store.put(link.getValue());
                                }

                                complete();
                            }
                            else {
                                cursor.continue();
                            }
                        }
                    };
                });
            });
        }, // WORKS
        updateSource: function(Source) {
            var that = this;
            return new WinJS.Promise(function (complete, error) {
                that._getObjectStore("readwrite", "Sources").then(function (store) {
                    var startIndex = 0;
                    var currentIndex = 0;
                    var item = null;
                    req = store.openCursor();

                    req.onerror = that._error;
                    req.onsuccess = function (evt) {
                        var cursor = evt.target.result;

                        if (currentIndex < startIndex) {
                            currentIndex = startIndex;
                            cursor.advance(startIndex);
                            return;
                        }

                        if (cursor) {
                            currentIndex++;

                            if (cursor.value[store.keyPath] == Source.Id) {

                                store.put(Source.getValue());
                                complete();
                                return;
                            }
                            else {
                                cursor.continue();
                            }
                        }
                        complete();
                    };
                });
            });
        }, //WORKS

        removeLinkFromList: function (LinkId, ListName) {
            var that = this;
            return new WinJS.Promise(function (complete, error) {
                that._getObjectStore("readwrite", "Links").then(function (store) {
                    var startIndex = 0;
                    var currentIndex = 0;
                    var item = null;
                    req = store.openCursor();

                    req.onerror = that._error;
                    req.onsuccess = function (evt) {
                        var cursor = evt.target.result;

                        if (currentIndex < startIndex) {
                            currentIndex = startIndex;
                            cursor.advance(startIndex);
                            return;
                        }

                        if (cursor) {
                            currentIndex++;

                            if (cursor.value[store.keyPath] == LinkId) {

                                var link = new Slinky.Core.Persistence.Models.Link(cursor.value[store.keyPath],
                                                            cursor.value["Url"],
                                                            cursor.value["SourceName"],
                                                            cursor.value["SourceReferenceId"],
                                                            cursor.value["DateAdded"],
                                                            cursor.value["Lists"],
                                                            cursor.value["Details"]);

                                if (link.Lists.indexOf(ListName) > -1) {
                                    link.Lists.splice(link.Lists.indexOf(ListName), 1);
                                    store.put(link.getValue());
                                }

                                complete();
                            }
                            else {
                                cursor.continue();
                            }
                        }
                    };
                });
            });
        }, // WORKS
        removeLinkDetail: function (LinkId, Key) {
            var that = this;
            return new WinJS.Promise(function (complete, error) {
                that._getObjectStore("readwrite", "Links").then(function (store) {
                    var startIndex = 0;
                    var currentIndex = 0;
                    var item = null;
                    req = store.openCursor();

                    req.onerror = that._error;
                    req.onsuccess = function (evt) {
                        var cursor = evt.target.result;

                        if (currentIndex < startIndex) {
                            currentIndex = startIndex;
                            cursor.advance(startIndex);
                            return;
                        }

                        if (cursor) {
                            currentIndex++;

                            if (cursor.value[store.keyPath] == LinkId) {
                                
                                var link = new Slinky.Core.Persistence.Models.Link(cursor.value[store.keyPath],
                                                            cursor.value["Url"],
                                                            cursor.value["SourceName"],
                                                            cursor.value["SourceReferenceId"],
                                                            cursor.value["DateAdded"],
                                                            cursor.value["Lists"],
                                                            cursor.value["Details"]);

                                var index = -1;
                                for (var i = 0; i < link.Details.length; i++)
                                {
                                    if (link.Details[i].Key == Key) {
                                        index = i;
                                        break;
                                    }
                                }

                                if (index > -1) {
                                    link.Details.splice(index, 1);
                                    store.put(link.getValue());
                                }

                                complete();
                            }
                            else {
                                cursor.continue();
                            }
                        }
                    };
                });
            });
        }, // WORKS
        removeSource: function (Id) {
            var that = this;
            return new WinJS.Promise(function (complete, error) {
                that._getObjectStore("readwrite", "Sources").done(function (store) {
                    Id = parseInt(Id);
                    var reqDelete = store.delete(Id);
                    reqDelete.onerror = that._error;
                    reqDelete.onsuccess = function (evt) {
                        complete();
                    };
                });
            });
        }, // WORKS


        nukeLinks: function () {
            var that = this;
            return new WinJS.Promise(function (complete, error) {
                that._getObjectStore("readwrite", "Links").done(function (store) {
                    var reqClear = store.clear();
                    reqClear.onerror = that._error;
                    reqClear.onsuccess = function (evt) {
                        complete();
                    };
                });
            });
        },
        nukeLists: function () {
            var that = this;
            return new WinJS.Promise(function (complete, error) {
                that._getObjectStore("readwrite", "Lists").done(function (store) {
                    var reqClear = store.clear();
                    reqClear.onerror = that._error;
                    reqClear.onsuccess = function (evt) {
                        complete();
                    };
                });
            });
        }
    }
});