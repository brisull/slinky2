WinJS.Namespace.define("Slinky.Core.Persistence.Models", {
    Source: WinJS.Class.define(
        // Constructor
        function (Id, Name, Type, UserId, EndPoint, AccessToken, DateAdded, DateLastSynced, TokenExpirationDate) {
            this.Id = Id;
            this.Name = Name;
            this.Type = Type;
            this.UserId = UserId;
            this.EndPoint = EndPoint;
            this.AccessToken = AccessToken;
            this.DateAdded = DateAdded;
            this.DateLastSynced = DateLastSynced;
            this.TokenExpirationDate = TokenExpirationDate;
        },
        {
            Id: null,
            Name: null,
            Type: null,
            UserId: null,
            EndPoint: null,
            AccessToken: null,
            DateAdded: null,
            DateLastSynced: null,
            TokenExpirationDate: null,
            getValue: function () {
                return {
                    Id: this.Id,
                    Name: this.Name,
                    Type: this.Type,
                    UserId: this.UserId,
                    EndPoint: this.EndPoint,
                    AccessToken: this.AccessToken,
                    DateAdded: this.DateAdded,
                    DateLastSynced: this.DateLastSynced,
                    TokenExpirationDate: this.TokenExpirationDate
                };
            }
        })
});