WinJS.Namespace.define('Slinky.Core.Persistence.Value', {
    LinksFilter: WinJS.Class.define(
        // Constructor
        function (Sources, DateStart, DateEnd, Origin, Lists, Domains, Offset, Limit, Keyword) {
            this.Sources =  null; 
            this.DateStart = null; 
            this.DateEnd = null;
            this.Origin = null;
            this.Lists = null; 
            this.Offset = null;
            this.Limit = null;
            this.Keyword = null;
        },
        {
            Sources: null, 
            DateStart: null, 
            DateEnd: null,
            Origin: null,
            Lists: null, 
            Offset: null,
            Limit: null,
            Keyword: null
        })
});