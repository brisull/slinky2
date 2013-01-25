WinJS.Namespace.define("Slinky.Core.Persistence.Models", {
    Link: WinJS.Class.define(
        // Constructor
        function(Id, Url, SourceName, SourceReferenceId, DateAdded, Lists, Details){
            this.Id = Id;
            this.Url = Url;
            this.SourceName = SourceName;
            this.SourceReferenceId = SourceReferenceId;
            this.DateAdded = DateAdded;
            this.Lists = Lists;

            var detailsClass = [];
            for (var i = 0; i < Details.length; i++) {
                detailsClass.push(new Slinky.Core.Persistence.Models.LinkDetail(Details[i].Type, Details[i].Key, Details[i].Value));
            }
            this.Details = detailsClass;
        },
        {
            Id: null,
            Url: null,
            SourceName: null,
            SourceReferenceId: null,
            DateAdded: new Date(),
            Lists: [],
            Details: [],
            getValue: function () {
                var detailsValue = [];

                for (var i = 0; i < this.Details.length; i++) {
                    detailsValue.push(this.Details[i].getValue());
                }
                return {
                    Id: this.Id,
                    Url: this.Url,
                    SourceName: this.SourceName,
                    SourceReferenceId: this.SourceReferenceId,
                    DateAdded: this.DateAdded,
                    Lists: this.Lists,
                    Details: detailsValue
                }
            },

            Title: function () {
                
            }
        }
    )
});