/*jslint ass: true, browser: true, devel: true, laxbreak: true, nomen: true, sloppy: true, sub: true, white: true */

(function ($, _, prism, undefined) {
    $(document).ready(function () {

        var $body = $('body'),
            lochsh = window.location.hash;

        $('a.cleansed').click(function (e) {
            var $self = $(this);
            e.preventDefault();
            history.pushState(null, null,
                $self.attr('href'));
            $self.tab('show');
        });

        $('a.extracted').click(function (e) {
            var $self = $(this);
            e.preventDefault();
            history.pushState(null, null,
                $self.attr('href'));
        });

        ////////////////// METADATA MODALS ////////////////////////////////////////////////////////
        $('.modal-metadata').each(function () {
            var $that = $(this),
                $placeholder = $that
                    .find('.modal-body')
                    .find('div.placeholder'),
                endpoint = $placeholder.data('endpoint');

            $that.on('shown', function (e) {
                var $placeholder = $that
                        .find('.modal-body')
                        .find('div.placeholder'),
                    placeholder = $placeholder.length > 0,
                    demonstratum = placeholder ? $placeholder.loaderer() && window.setTimeout(function () {
                        $that.QED({}, function (opts, findings) {
                            $placeholder.erloader();
                        });
                    }, 2000) : $that.find('table').slideDown();
            }).on('hide', function (e) {
                var $placeholder = $that
                        .find('.modal-body')
                        .find('div.placeholder'),
                    placeholder = $placeholder.length > 0,
                    demonstratum = placeholder ? undefined : $that.find('table').slideUp();
            });

            if (endpoint) {
                $that.apropos(endpoint).inquire(
                    function (data) {
                        var metadata = data['metadata'] || {},
                            $table = $.new('table')
                                .addClass("table")
                                .addClass("table-hover")
                                .addClass("table-bordered"),
                            $tbody = $.new('tbody');

                        _(metadata).each(function (metadatum, idx) {
                            var $tr = $.new('tr');
                            $tr.append(
                                $.new('td').text(idx));
                            $tr.append(
                                $.new('td').append(
                                    $.new('b').text(
                                        metadatum)));
                            $tbody.append($tr);
                        });

                        $table.append($tbody);
                        $placeholder.replaceWith($table);
                    }
                );
            }
        });

        ////////////////// CLEANSED HTML VIEWER MODALS ////////////////////////////////////////////
        $('.modal-cleansed-html').each(function () {
            var $that = $(this),
                $modalbody = $that.find('.modal-body'),
                $placeholder = $modalbody.find('div.placeholder'),
                endpoint = $placeholder.data('endpoint');

            $that.on('shown', function (e) {
                var $placeholder = $that
                        .find('.modal-body')
                        .find('div.placeholder'),
                    placeholder = $placeholder.length > 0,
                    demonstratum = placeholder ? $placeholder.loaderer() && window.setTimeout(function () {
                        $modalbody.QED({}, function (opts, findings) {
                            $placeholder.erloader();
                            prism.highlightElement(
                                $modalbody
                                    .find('.language-markup')
                                    .get(0),
                                true, /// async
                                function () {
                                    //console.log(
                                    //    'Finished highlighting: ',
                                    //    $that.elementname());
                                });
                        });
                    }, 2000) : $that.find('.tabbable').slideDown();
            }).on('hide', function (e) {
                var $placeholder = $that
                        .find('.modal-body')
                        .find('div.placeholder'),
                    placeholder = $placeholder.length > 0,
                    demonstratum = placeholder ? undefined : $that.find('.tabbable').slideUp();
            });

            if (endpoint) {
                $modalbody.apropos(endpoint).incorporate("#modal-cleansed-html");
            }
        });


        ////////////////// EXTRACTED TEXT MODALS ////////////////////////////////////////////
        $('.modal-extracted-text').each(function () {
            var $that = $(this),
                $modalbody = $that.find('.modal-body'),
                $placeholder = $modalbody.find('div.placeholder'),
                endpoint = $placeholder.data('endpoint');

            $that.on('shown', function (e) {
                var $placeholder = $that
                        .find('.modal-body')
                        .find('div.placeholder'),
                    placeholder = $placeholder.length > 0,
                    demonstratum = placeholder ? $placeholder.loaderer() && window.setTimeout(function () {
                        $modalbody.QED({}, function (opts, findings) {
                            $placeholder.erloader();
                        });
                    }, 2000) : $that.find('.extracted-text-morsel').slideDown();
            }).on('hide', function (e) {
                var $placeholder = $that
                        .find('.modal-body')
                        .find('div.placeholder'),
                    placeholder = $placeholder.length > 0,
                    demonstratum = placeholder ? undefined : $that.find('.extracted-text-morsel').slideUp();
            });

            if (endpoint) {
                $modalbody.apropos(endpoint).incorporate("#modal-extracted-text");
            }
        });

        if (window.location.hash) {
            var tab_selector = 'a[href="{0}"]'.format(lochsh
                    .chomp('-modal')
                    .suffixwith('-raw')),
                modal_selector = lochsh.prefixwith('#'),
                $showmodal = $(modal_selector);
            $body.on('shown', modal_selector, function () {
                /*window.setTimeout(function () {
                    $(tab_selector).trigger('click');
                }, 2000);*/
                $body.off('shown', modal_selector);
            });
            $showmodal.modal('show');
        }

    });

})(window['jQuery'], window['_'], window['Prism']);