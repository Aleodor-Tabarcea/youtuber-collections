var ExtensionSanitizer = ExtensionSanitizer || {};

ExtensionSanitizer = function(){

    /**
     *
     * Function for sanitizing integers
     * @param value - value to be sanitized
     * @return number $retValue - sanitized entry
     *
     */

    var sanitizeInteger = function(value){
        var retValue = parseInt(value);

        return retValue;
    };

    return {
        sanitizeInteger: sanitizeInteger
    };
}();
