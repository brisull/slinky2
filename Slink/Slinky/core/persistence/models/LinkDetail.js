WinJS.Namespace.define("Slinky.Core.Persistence.Models", {
    LinkDetail: WinJS.Class.define(
        // Constructor
        function(Type, Key, Value){
            this.Key = Key;
            this.Value = Value;
            this.Type = Type;
        },
        {
            Key: null,
            Value: null,
            Type: null,
            getValue: function () {
                return {
                    Key: this.Key,
                    Value: this.Value,
                    Type: this.Type
                }
            }
        })
});