ko.bindingHandlers.debug ={
    init: function (element, valueAccessor) {
        debugger;
        console.log('Knockoutbinding:');
        console.log(element);
        console.log(valueAccessor());
        console.log(ko.toJS(valueAccessor()));
    }
};

ko.bindingHandlers.timestampformat = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
       
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var dateValue = allBindings.get('text');
        var dateFormat = valueAccessor();
        var date = new Date(dateValue() * 1000);
        var convertedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        var formatDate = kendo.toString(convertedDate, dateFormat);

        dateValue(formatDate);
    }
};

ko.bindingHandlers.nullvalue =
{
    update: function (element, valueAccessor, allBindingsAccessor) {

        if (!element.textContent) {
            ko.bindingHandlers.text.update(element, function () { return valueAccessor(); });
        }
    }
};
$.fn.kocontrolshow = function (opt) {

    return $(this);
}
$.fn.kobinder = function (opt) {

    for (var bi = 0; bi < this.length; bi++) {
        var t = $(this[bi]);
        ko.ext.api(t, opt);
    }
    return $(this);
}
jQuery.each(["put", "delete"], function (i, method) {
    jQuery[method] = function (url, data, callback, type) {
        if (jQuery.isFunction(data)) {
            type = type || callback;
            callback = data;
            data = undefined;
        }

        return jQuery.ajax({
            url: url,
            type: method,
            dataType: type,
            data: data,
            success: callback
        });
    };
});
ko.ext = {

    api: function (t, opt) {
        var self = this;
        var stn = $.extend({}, this.defaults);
        stn.tid = this.setId(t);
        var attributes = this.attr(t);
        if (typeof opt == "object") {
            stn = $.extend(stn, opt);
        } else if (typeof opt == "string" && opt == "refresh") {
            stn.refresh = true;
        }
        var dataAttributes = this.getDataAttributesForSettings(t, attributes);
        if (typeof dataAttributes == "object") {
            stn = $.extend(stn, dataAttributes);
        }

        if (stn.api) {

            var apiPieces = stn.api.split(":");
            var requestSettings = apiPieces[0].split(" ");
            stn.method = requestSettings[0];
            if (stn.method != "get" && stn.method != "post" && stn.method != "put") {
                debugger;
                console.error("data-api only allowed get,post and put methods");
            }
            stn.jsonPath = requestSettings[1];
            if (!stn.jsonPath) {
                debugger;
                console.error("must define json url in data-api");
            }

            var dataSettings = apiPieces[1].split(" as ");
            if (dataSettings.length > 1) {
                stn.jsonFieldName = dataSettings[0];
                if (!stn.jsonFieldName) {
                    debugger;
                    console.error("must define json Field Name in data-api");
                }
            }
            if (dataSettings.length > 1) {
                stn.viewModelName = dataSettings[1];
                if (!stn.viewModelName) {
                    debugger;
                    console.error("must define view Model Name in data-api");
                }
            } else {
                stn.viewModelName = dataSettings[0];
                if (!stn.viewModelName) {
                    debugger;
                    console.error("must define view Model Name in data-api");
                }
            }
            if (!ko.ext.templates[stn.viewModelName]) {
                ko.ext.templates[stn.viewModelName] = t.html();
                t.html("");
            }
            
        }
        if (!stn.init) {
            
            var koParamModel = {};

            if (stn.apiparameters) {
                var parameters = stn.apiparameters.split(",");
                for (var ob in parameters) {
                    if (parameters.hasOwnProperty(ob)) {
                        var paramPieces = parameters[ob].split(" as ");
                        var name = "";
                        var value = null;
                        var isJsVariable = false;

                        value = this.stringToFn(paramPieces[0]);
                        if (value) {
                            isJsVariable = true;
                        }

                        if (paramPieces[1]) {
                            name = paramPieces[1];
                        }
                        if (!isJsVariable) {
                            var item = $(paramPieces[0]);

                            if (!name && $(paramPieces[0]).attr("name")) {
                                name = $(paramPieces[0]).attr("name");
                            }

                            value = item.val();
                        }
                        if (name) {
                            koParamModel[name] = ko.observable(value);
                        }
                    }
                }


            }

            if (window[stn.viewModelName]["Parameters"]) {
                koParamModel = window[stn.viewModelName]["Parameters"](koParamModel);
                if (!koParamModel) {
                    debugger;
                    console.error(stn.viewModelName + ".Parameters has not return values");
                }
            }

            ////if (!ko.ext.viewModels[stn.viewModelName]) {
            ////    ko.ext.viewModels[stn.viewModelName] = {};
            ////}
            ////ko.ext.viewModels[stn.viewModelName] = ko.observable(null);
            ////ko.applyBindings(ko.ext.viewModels[stn.viewModelName], t[0]);

            /////ko.ext.viewModels[stn.viewModelName]["params"] = koParamModel;
            $[stn.method](stn.jsonPath,
                koParamModel,
                function (data) {
                    ////var jsonFieldPieces = stn.jsonFieldName.replace(/]/ig, "").replace(/\[/ig, ".").split(".");
                    var jsonData = self.findObj(stn.jsonFieldName, data, 0);

                    var newModel = {};
                    var viewModelRelations = {};
                    ////if (jsonData && jsonData[0]) {
                    ////    jsonData = jsonData[0];
                    ////}

                    if (jsonData) {
                        ////if (typeof jsonData == "object" && !Array.isArray(jsonData)) {
                        ////    var bindItems = t.find("[data-bindfrom]");
                        ////    for (var ob in bindItems) {
                        ////        if (bindItems.hasOwnProperty(ob)) {
                        ////            var item = $(bindItems[ob]);
                        ////            if (item.attr("data-bindfrom")) {
                        ////                var itemDetails = item.attr("data-bindfrom").split(" as ");
                        ////                viewModelRelations[itemDetails[0]] = itemDetails[1];
                        ////            }
                        ////        }
                        ////    }


                        ////    for (var ob in jsonData) {
                        ////        if (jsonData.hasOwnProperty(ob)) {
                        ////            var obv = jsonData[ob];
                        ////            newModel[ob] = ko.observable(obv);
                        ////            if (viewModelRelations[ob]) {
                        ////                newModel[viewModelRelations[ob]] = ko.observable(null);
                        ////                newModel[viewModelRelations[ob]](obv);
                        ////            }
                        ////        }
                        ////    }
                        ////    if (window["Update" + stn.viewModelName]) {
                        ////        newModel = window["Update" + stn.viewModelName](newModel);
                        ////    }
                        ////    ko.ext.viewModels[stn.viewModelName] = newModel;
                        ////} else if (Array.isArray(jsonData)) {
                        ////    for (var obi = 0; obi < jsonData.length; obi++) {
                        ////        var objv = jsonData[obi];
                        ////        if (window["UpdateEach" + stn.viewModelName]) {
                        ////            newModel = {};
                        ////            for (var ob2 in objv) {
                        ////                if (objv.hasOwnProperty(ob2)) {
                        ////                    var ob2v = objv[ob2];
                        ////                    newModel[ob2] = ko.observable(ob2v);
                        ////                }
                        ////            }
                        ////            jsonData[obi] = window["UpdateEach" + stn.viewModelName](newModel);
                        ////            if (!jsonData[obi]) {
                        ////                debugger;
                        ////                console.error("UpdateEach" + stn.viewModelName + " function has not return values");
                        ////            }
                        ////        }
                        ////    }

                        ////    if (window["Update" + stn.viewModelName]) {
                        ////        jsonData = window["Update" + stn.viewModelName](jsonData);
                        ////    }
                        ////    ko.ext.viewModels[stn.viewModelName] = ko.observableArray(jsonData);
                        ////}





                        ////ko.ext.viewModels[stn.viewModelName] = 
                        t.html(ko.ext.templates[stn.viewModelName]);
                        if (!window[stn.viewModelName]) {
                            window[stn.viewModelName] = {};
                        }

                        window[stn.viewModelName][stn.viewModelName] =
                            function () {
                                return ko.mapping.fromJS(jsonData);
                            };
                            if (window[stn.viewModelName]["Update"]) {
                                window[stn.viewModelName] = window[stn.viewModelName]["Update"](window[stn.viewModelName]);
                                if (!window[stn.viewModelName]) {
                                    debugger;
                                    console.error(stn.viewModelName + ".Update function has not return values");
                                }
                            }

                        ko.cleanNode(t[0]);
                        
                        ko.applyBindings(window[stn.viewModelName], t[0]);

                    }

                }
            ).fail(function () {
                console.error("requested failed");
            });
        }
    },
    stringToFn: function (str, x, y) {
        try {
            var output = new Function("x", "y", 'return ' + str);
            var value = output(x, y);
            return value;
        } catch (ex) {
            ////console.log(ex);
            return null;
        }
    },
    findObj: function (jsonFieldName, data) {
        if (jsonFieldName) {
            return  this.stringToFn("x." + jsonFieldName, data);
        }
        return data;
    },
    setId: function (el) {
        if (!el.attr("id")) {
            el.attr("id",
                "Id" + new Date().getTime().toString() + "" + Math.random().toString().replace(".", ""));
        }
        return el.attr("id");
    },
    attr: function (t) {
        var obj = {};
        if (t) {
            $.each(t[0].attributes,
                function () {
                    if (this.specified) {
                        obj[this.name] = this.value;
                    }
                });
        }
        return obj;
    },
    getDataAttributesForSettings: function (t, attributes) {
        var obj = {};
        for (var attribute in attributes) {
            if (attributes.hasOwnProperty(attribute)) {
                if (attribute.startsWith("data-")) {
                    obj[attribute.replace("data-", "").replace(/-/ig, "_")] = attributes[attribute];
                }
            }
        }
        return obj;
    },
    timeAgoTemplates: {
        prefix: "",
        suffix: " ago",
        seconds: "less than a minute",
        minute: "about a minute",
        minutes: "%d minutes",
        hour: "about an hour",
        hours: "about %d hours",
        day: "a day",
        days: "%d days",
        month: "about a month",
        months: "%d months",
        year: "about a year",
        years: "%d years"
    },
    timeAgoTemplate: function (t, n) {
        return this.timeAgoTemplates[t] && this.timeAgoTemplates[t].replace(/%d/i, Math.abs(Math.round(n)));
    },

    timeAgo: function (date, now) {
        var timeAgo = "";
        var seconds = ((now.getTime() - date) * .001) >> 0;
        var minutes = seconds / 60;
        var hours = minutes / 60;
        var days = hours / 24;
        var years = days / 365;
        if (date) {
            timeAgo = this.timeAgoTemplates.prefix + (
                seconds < 60 && this.timeAgoTemplate('seconds', seconds) ||
                    seconds < 90 && this.timeAgoTemplate('minute', 1) ||
                    minutes < 60 && this.timeAgoTemplate('minutes', minutes) ||
                    minutes < 90 && this.timeAgoTemplate('hour', 1) ||
                    hours < 24 && this.timeAgoTemplate('hours', hours) ||
                    hours < 42 && this.timeAgoTemplate('day', 1) ||
                    days < 30 && this.timeAgoTemplate('days', days) ||
                    days < 45 && this.timeAgoTemplate('month', 1) ||
                    days < 365 && this.timeAgoTemplate('months', days / 30) ||
                    years < 1.5 && this.timeAgoTemplate('year', 1) ||
                    this.timeAgoTemplate('years', years)
            ) + this.timeAgoTemplates.suffix;
        }
        return timeAgo;
    },
}
ko.ext.defaults = {
    init: true
};
ko.ext.viewModels = {};
ko.ext.templates = {};
$("[data-api]:visible,[data-api]:hidden").not("[data-parent],[data-template]").kobinder({ init: true });
$(document).ready(function () {

    $("[data-api]:visible,[data-api]:hidden").not("[data-parent],[data-template]").kobinder({ init: false });
    
    $("body").on("click",
        "[data-show]",
        function () {
            $($(this).attr("data-show")).removeClass("hide");
        });
    $("body").on("click",
        "[data-hide]",
        function () {
            $($(this).attr("data-hide")).addClass("hide");
        });
    $("body").on("click",
        "[data-toggle]",
        function () {

            $($(this).attr("data-toggle")).toggleClass("hide");
        });


})