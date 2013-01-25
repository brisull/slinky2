WinJS.Namespace.define("Slinky.Core.Persistence.Models", {
    List: WinJS.Class.define(
        // Constructor
        function (Id, Name, Description) {
            this.Id = Id;
            this.Name = Name;
            this.Description = Description;
        },
        {
            Id: null,
            Name: null,
            Description: null,
            getValue: function () {
                return {
                    Id: this.Id,
                    Name: this.Name,
                    Description: this.Description
                };
            }
        })
});