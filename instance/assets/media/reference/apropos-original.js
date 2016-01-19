
(function($) {
    
    $.extend({
        
        new: function (elem) {
            /// create a new jQuery-wrapped DOM element,
            /// unbound to the current page
            return $(document.createElement(elem));
        },
        
        querystring: function () {
            /// turn a keyed data object into a query string
            /// alphabetically sorted by key and appended to a URL
            /// e.g. { yo: 'dogg', iheard: 'you like queries' }
            /// becomes http://yodogg.com/x?iheard=you%20like%20queries&yo=dogg
            
            var querydict = arguments[0] || {},
                url = arguments[1] || "",
                omit = arguments[2] || [];
            return _.chain(querydict)
                .omit(omit)
                .pairs()
                .sortBy(function (pair) { return pair[0]; })
                .reduce(
                    function(memo, val) {
                        var value = (val[1] == null || typeof val[1] === "undefined") ? '' : ("" + val[1]);
                        return memo + "&" + encodeURIComponent(val[0]) + "=" + encodeURIComponent(value);
                    }, url + "?")
                .value();
        },
        
        hash: function (hashable) {
            /// get a unique hash for anything you pass in
            /// default to MD5
            var hasher = arguments[1] || $.md5;
            if (typeof hashable === "undefined") {
                return hasher('');
            }
            
            if (typeof hashable.html !== "undefined") {
                return hasher(hashable.html());
            }
            if ((_.isObject(hashable) || _.isArray(hashable)) && !_.isFunction(hashable)) {
                try {
                    return hasher(JSON.stringify(hashable));
                } catch (e) {
                    return hasher(hashable.toString());
                }
            }

            return hasher(hashable);
        },
        
        cssURL: function (url) {
            return "url('" + url + "')";
        },
        
    });
    
    $.fn.extend({
        
        hash: function () {
            var $this = $(this);
            if (typeof $this.data('apropos-hash') !== "undefined") {
                return $this.data('apropos-hash');
            }
            $this.data('apropos-hasher', arguments[0] || $.md5);
            var hash_ = $.hash($this,
            $this.data('apropos-hasher'));
            $this.data('apropos-hash', hash_);
            return hash_;
        },
        
        new: function (elem_type) {
            return $.new(elem_type).appendTo(this);
        },
        
        additional: function (elem_type) {
            return $.new(elem_type).insertAfter(this);
        },
        
        apropos: function (url_) {
            /// bind the JSON data retrieved from the specified URL
            /// to an 'QED' event on $(this), e.g.
            /// $('.myshit').apropos('http://yodogg.com/x');
            
            var $that = $(this),
                results_examiner_func = arguments[1] || function (results_) {
                    if (results_) {
                        if (typeof results_ !== 'undefined') {
                            return results_['status'] == 'ok';
                        }
                    }
                    return false;
                };
            
            this.each(function () {
                var $this = $(this);
                $this.on('apropos', function(e, options) {
                    var url = $.querystring(
                            $that.queryopts(options), url_),
                        url_key = $.hash(url),
                        data = $that.data(url_key),
                        results_are_valid = false,
                        force = (
                            typeof options.force !== "undefined" && options.force),
                        preload = (
                            typeof options.preload !== "undefined" && options.preload);
                    
                    //console.log(">> APROPOS cache query URL: ", url);
                    //console.log(">> APROPOS cache query URL hash: ", url_key);
                    //console.log(">> APROPOS cache query result data: ", data);
                    //console.log(">> APROPOS cache query result options: ", options);
                    
                    if (force || typeof data === "undefined") {
                        /// GET NEW DATA, BECAUSE NONE ALREADY EXISTS
                        $.when($.getJSON(url))
                            .done(function (apropos_results) {
                                try {
                                    results_are_valid = results_examiner_func.call($this, apropos_results);
                                } catch (exc) {
                                    results_are_valid = false;
                                }
                                if (results_are_valid) {
                                    //console.log(">> APROPOS: XHR results OK");
                                    //console.log(">> APROPOS: triggering inquiry for data: ", apropos_results['data']);
                                    $that.data(url_key, apropos_results['data']);
                                    $this.triggerHandler('inquiry', [url_key, true, options]);
                                } else {
                                    //console.log(">> APROPOS: XHR results are NOT OK");
                                    //console.log(">> APROPOS: status = ", apropos_results['status']);
                                    //console.log(">> APROPOS: message = ", apropos_results['message']);
                                    $this.triggerHandler('failure', [url_key, options]);
                                }})
                            .fail(function (xhr, status_, apropos_results) {
                                //console.log(">> APROPOS: XHR request FAILED");
                                //console.log(">> APROPOS: status = ", status_);
                                //console.log(">> APROPOS: message = ", apropos_results);
                                $this.triggerHandler('failure', [url_key, options]);
                            }
                        );
                    } else {
                        /// USE THE ALREADY EXISTING DATA
                        //console.log(">> APROPOS cache hit with url ", url);
                        //console.log(">> APROPOS cache hit with force = ", force);
                        //console.log(">> APROPOS: triggering inquiry for data: ", data);
                        $this.triggerHandler('inquiry', [url_key, false, options]);
                    }
                });
            });
            
            return $that;
        },
        
        WRT: function (url) {
            /// bind the JSON data retrieved from the specified URL
            /// to an 'QED' event on $(this), e.g.
            /// $('.myshit').apropos('http://yodogg.com/x');
            
            var $that = $(this),
                results_examiner_func = arguments[1] || function (results_) {
                    if (results_) {
                        if (typeof results_ !== 'undefined') {
                            return results_['status'] == 'ok';
                        }
                    }
                    return false;
                };
            
            this.each(function () {
                var $this = $(this);
                $this.on('apropos', function(e, options) {
                    /// W/R/T posts: data is always anew
                    $.when($.post(url, $this.queryopts(options), 'json'))
                        .done(function (apropos_results) {
                            //console.log(">> W/R/T: results = ", apropos_results);
                            try {
                                results_are_valid = results_examiner_func.call($this, apropos_results);
                            } catch (exc) {
                                results_are_valid = false;
                            }
                            if (results_are_valid) {
                                //console.log(">> W/R/T: XHR results OK");
                                //console.log(">> W/R/T: triggering inquiry...");
                                var url_key = $.hash(url);
                                $that.data(url_key, apropos_results['data']);
                                $this.triggerHandler('inquiry', [url_key, true, options]);
                            } else {
                                //console.log(">> W/R/T: XHR results are NOT OK");
                                //console.log(">> W/R/T: results = ", apropos_results);
                                ////console.log(">> W/R/T: status = ", apropos_results['status']);
                                ////console.log(">> W/R/T: message = ", apropos_results['message']);
                                $this.triggerHandler('failure', [null, options]);
                            }})
                        .fail(function (xhr, status_, apropos_results) {
                            //console.log(">> W/R/T: XHR request FAILED");
                            //console.log(">> W/R/T: results = ", apropos_results);
                            //console.log(">> W/R/T: status = ", status_);
                            //console.log(">> W/R/T: message = ", apropos_results);
                            $this.triggerHandler('failure', [null, options]);
                        }
                    );
                });
            });
            
            return $that;
        },
        
        inthecaseof: function (datum) {
            /// bind the passed piece of arbitrary data
            /// to an 'QED' event on $(this), e.g.
            /// $('.myshit').inthecaseof({ yo: 'dogg' });
            
            var $that = $(this);
            
            this.each(function () {
                var $this = $(this);
                
                $this.on('apropos', function (e, options) {
                    var datum_key = $.hash(options),
                        preload = (
                            typeof options.preload !== "undefined" && options.preload);
                    
                    $that.data(datum_key, datum);
                    $this.triggerHandler('inquiry', [datum_key, false, options]);
                });
            });
            
            return $that;
        },
        
        failure: function (failure_func) {
            /// called when an apropos() or WRT() fetch
            /// returns an error, e.g.:
            /// $('.myshit')
            ///     .apropos('http://yodogg.com/x')
            ///     .inquire(function (data) {
            ///         //console.log('Yo Dogg: ',data);
            ///     })
            ///     .failure(function (url_key, opts) {
            ///         alert("NO DOGG");
            ///     }
            /// );
            
            var $that = $(this);
            
            this.each(function () {
                var $this = $(this);
                
                $this.on('failure', function (e, url_key, options) {
                    failure_func(url_key, options);
                });
            });
            
            return $that;
        },
        
        inanycase: function (final_func) {
            /// called when an apropos() or WRT() fetch
            /// returns anything at all, e.g.:
            /// $('.myshit')
            ///     .apropos('http://yodogg.com/x')
            ///     .inquire(function (data) {
            ///         //console.log('Yo Dogg: ',data);
            ///     })
            ///     .inanycase(function (url_key, opts) {
            ///         alert("Shit May Or May Not Be Fucked");
            ///     }
            /// );
            
            var $that = $(this);
            
            this.each(function () {
                var $this = $(this),
                    isitoveryet = function (e, url_key, options) {
                        return final_func(url_key, options);
                    };
                
                $this.on({ failure: isitoveryet, findings: isitoveryet });
            });
            
            return $that;
        },
        
        defaults: function () {
            var $that = $(this),
                defaults_ = arguments[0] || null,
                default_value = arguments[1] || null,
                existent = $that.data('defaults');
            
            existent = typeof existent === "object" ? existent : {};
            
            if (defaults_) {
                if (typeof defaults_ === "object") {
                    /// it's an object hashtable, merge it in
                    $that.data('defaults', _(existent).extend(defaults_));
                } else if (typeof defaults_ === "string") {
                    /// it's a string key
                    if (default_value) {
                        existent[defaults_] = default_value;
                        $that.data('defaults', existent);
                    } else {
                        if (defaults_ in existent) {
                            return existent[defaults_];
                        }
                        return undefined;
                    }
                }
            } else {
                /// nothing was passed in, return the defaults hashtable
                return existent;
            }
            
            return $that;
        },
        
        omit: function () {
            var $that = $(this),
                omits = arguments[0] || null,
                existent = $that.data('omit');
            
            existent = typeof existent === "object" ? existent : [];
            
            if (omits) {
                if (typeof omits === "object") {
                    /// it's a list, merge it in
                    $that.data('omit', existent.concat(_.toArray(omits)));
                } else if (typeof omits === "string") {
                    /// it's a single string key, add it
                    $that.data('omit', _(existent)
                        .chain()
                        .push(omits)
                        .uniq()
                        .value());
                }
            } else {
                /// nothing was passed in, return the omits list
                return _.toArray(existent);
            }
            
            return $that;
        },
        
        queryopts: function () {
            var $that = $(this),
                defaults = _.clone($that.defaults()),
                omit = [].concat($that.omit()),
                options = arguments[0] || {},
                union = _.defaults(options, defaults),
                intersection = _(union).omit(omit);
            
            return intersection;
        },
        
        elementname: function () {
            var $this = $(this),
                id = $this.attr('id');
                classes = $this.attr('class');
                idname = (typeof id !== 'undefined' ? '#' + id : undefined),
                classnames = (typeof classes !== 'undefined' ? classes
                    .split(' ')
                    .map(function (cls) { return "." + cls; })
                    .join('') : undefined);
            
            return typeof idname !== 'undefined' ? idname : (classnames !== 'undefined' ? classnames : "<unknown>");
        },
        
        inquire: function (inquiry_func) {
            /// bind a function to receive the data output from either
            /// an apropos() URL or an inthecaseof() datum
            /// to an 'QED' event on $(this), e.g.
            /// $('.myshit')
            ///     .apropos('http://yodogg.com/x')
            ///     .inquire(function (data) {
            ///         //console.log('Yo Dogg: ',data);
            ///     }
            /// );
            /// ... an optional second function can be passed to
            /// pre-process the options sent by the 'QED' event:
            /// $('.myshit')
            ///     .apropos('http://yodogg.com/x')
            ///     .inquire(function (data) {
            ///         //console.log('Yo Dogg: ',data);
            ///     }, function (options) {
            ///         return $.extend(options, {
            ///             recursive: true,
            ///             action: 'PUT'
            ///         });
            ///     }
            /// );
            
            var pre_inquiry_opts = arguments[1] || {},
                $that = $(this),
                pre_inquiry_func;
            
            if (!_.isFunction(pre_inquiry_opts)) {
                pre_inquiry_func = function (opts, $root) {
                    return _(pre_inquiry_opts).extend(opts);
                }
            } else {
                pre_inquiry_func = pre_inquiry_opts;
            }

            this.each(function() {
                var $this = $(this);
                                
                $this.on('QED', function (e, options) {
                    options = pre_inquiry_func.apply($this,
                        [_.extend(
                            _.clone($that.defaults()), options), $that]) || options;
                    //$this.on('inquiry', function (e, _key, fresh_fetch, options) {
                    $this.on('inquiry',function (e, _key, fresh_fetch, options) {
                        
                        var post_inquiry,
                        force = (
                            typeof options.force !== "undefined" && options.force),
                        preload = (
                            typeof options.preload !== "undefined" && options.preload);
                        
                        findings = inquiry_func.apply($this, [
                            $that.data(_key), _key, fresh_fetch, options]
                        );
                        
                        $this.off('inquiry');
                        $this.triggerHandler('findings', [options, findings]);
                    });
                    
                    //console.log('>> QED ' + '(' + $this.elementname() + ')' + ':', options);
                    
                    $this.triggerHandler('apropos', [options]);
                });
            });
            return $that;
        },
        
        QED: function() {
            /// trigger a bound inquiry function to execute on
            /// any of the sources (apropos() URLs or inthecaseof()
            /// data elements) attached to the jQuery collection,
            /// taking into consideration any options passed, e.g.
            /// $('.myshit')
            ///     .apropos('http://yodogg.com/x')
            ///     .inquire(function (data) {
            ///         //console.log('Yo Dogg: ',data);
            ///     }).QED({
            ///         'iheard': what_do_you_like(data['heard'])
            ///     });
            var options = arguments[0] || {},
            findings_callback = arguments[1] || null;
            $that = $(this);
            
            this.each(function () {
                var $this = $(this);
                
                /// unbind any previous 'findings' handlers
                $this.off('findings');
                
                /// if a callback was passed, bind it
                if (findings_callback != null) {
                    $this.on('findings', function (e, options_, findings) {
                        findings_callback.apply($this, [options_, findings]);
                        $this.off('findings');
                    });
                }
                
                $this.triggerHandler('QED', options);
            });
            
            return $that;
        }
        
    });
    
    ///// ALIASES /////
    $.fn.options = $.fn.defaults;

})(jQuery);
