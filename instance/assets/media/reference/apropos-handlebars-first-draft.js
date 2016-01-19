
/*
unschematize: function (template) {
    var $that = $(this),
        $template = $(template),
        template_key = "template:{0}:{1}".format(
            $template.elementname(),
            $that.hash()),
        template_func = Handlebars.compile($template);
    
    $that.inquire(
        function (data) {
            /// retrieve the stashed template
            //template_func = $that.data(template_key);
            $that.html(template_func(data)); return data;
        },
        function (opts, $root) {
            /// stash the template
            /// ... for now, use only incorporate() arg
            //if (typeof template_func === "function") {}
            //if (typeof template_func === "undefined") {}
            //$that.data(template_key, template_func);
        })
},
*/