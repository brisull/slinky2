WinJS.Namespace.define('Slinky.Core.Persistence.Value', {
    LinksSort: WinJS.Class.define(
        // Constructor
        function (Title, Date, DateDirection) {
            this.Title = null;
            this.Date = null;
            this.DateDirection = null;
        },
        {
            Title: null,
            Date: null,
            DateDirection: null
        })
});