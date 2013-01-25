WinJS.Namespace.define("Slinky.Core.Helpers", {
    ArraysIntersect: function intersect_safe(a, b) {
        var ai = 0, bi = 0;
        var result = new Array();

        while (ai < a.length && bi < b.length) {
            if (a[ai] < b[bi]) { ai++; }
            else if (a[ai] > b[bi]) { bi++; }
            else /* they're equal */
            {
                return true;
            }
        }

        return false;
    }
});