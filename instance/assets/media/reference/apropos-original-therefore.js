
/*function linkedInit() {
    IN.Event.on(IN, "auth", function () {
        IN.API.Profile("me")
            .fields([
                "id",
                "emailAddress",
                "firstName",
                "lastName",
                "headline",
                "pictureUrl",
                "location",
                "industry",
                "numConnections",
                "positions"])
            .result(function (profiles) {
                _(profiles.values).each(function (val, idx) {
                    if (_(val).has("emailAddress")) {
                        var update_data = {};
                        if (_(val).has("id")) {
                            update_data['linkedin_user_id'] = val['id'];
                        }
                        if (_(val).has("firstName")) {
                            update_data['first_name'] = val['firstName'];
                        }
                        if (_(val).has("lastName")) {
                            update_data['last_name'] = val['lastName'];
                        }
                        if (_(val).has("numConnections")) {
                            update_data['linkedin_contacts'] = val['numConnections'];
                        }
                        $.Splash.update_contact(val['emailAddress'], update_data);
                    }
                });
            }
        );
    });
}*/

window.BASE_URL = window.location.protocol + '//' + window.location.href.match(/([\w\-]+\.)?splashthat\.com(\:4480)?/, 'gi')[0];
window.BASE_ENDPT = '/address_book/';
window.API_URL = function (endpoint_name) {
    return window.BASE_URL + window.BASE_ENDPT + endpoint_name;
}

var CDN_PREFIX = "http://0767f9b6dcc5181c7043-73bbc09a38032a21ed1a9e3da3da76a6.r14.cf2.rackcdn.com/",
    BLANK_CONTACT = "/addressbook-images/thug-life-square-500px.jpg",
splash_imageurl = function (pth) {
    return pth ? pth : BLANK_CONTACT;
    //return pth ? CDN_PREFIX + pth.replace('profile_images/', '') : BLANK_CONTACT;
};

$(document).ready(function () {

    
    //console.time("beginning");
    $.extend({
        
        rooty: $('#rooty'),
        canvas: $('#future-canvas'),
        
        stats: {
            box: $('#stats-box'),
            bignumber: $('#stats-big-number'),
            addressdonut: $('#stats-address-donut'),
            topinfluencers: $('#stats-top-influencers'),
            toplocations: $('#stats-top-locations'),
            toptags: $('#stats-top-tags'),
            timeseries: $('#stats-time-series')
        },
        
        stats_tags: $('#stats-tags'),
        
        locations: $('#locations'),
        organizations: $('#organizations'),
        tags: $('#tags'),
        events: $('#events'),
        simpleModalWrap: $("#simple-modal-wrap"),
        vessel: $('#contact-card-vessel'),
        title: $('#contact-card-title'),
        mosteverything: $('#most-everything'),
        secondaryfilter: $('#secondary-filter'),
        spinner: $('#contact-spinner'),
        viewnav: $("#view-nav"),
        contactview: $('#contact-view'),
        multicontactview: $('#multi-contact-view'),
        howmanyandwhy: $('#how-many-selected'),
        howmanytoexport: $('#how-many-to-export'),
        exportfilename: $('#export-filename'),
        selectedtip: $('#selected-tip'),
        
        textsearch: $('#search-addressbook'),
        selectall: $('#select-all'),
        taggs: $('#taggs'),
        cities: $("#city-wrap"),
        listlist: $('#list-list'),
        lister: $('#lister'),
        listerli: $('#lister-li'),
        addNewList: $("#add-new-list"),
        
        statusbar: $('#contacts-header-statusbar'),
        filtersorterhidden: $('#filter-sorter-hidden'),
        
        csvfilefield: $('#id-upload_csv_file'),
        phasetwo: $('#import-p2'),
        
        contactIds: [],
        contacthashes: [],
        firstletters: [],
        taggindex: {},
        taggsbycontact: {},
        flip: true,
        forcereload: false,
        model: 'AddressBookContact',
        tagg_model: 'AddressBookTag',
        group_model: 'AddressBookGroup',
        avatar_model: 'AddressBookAvatar',
        blank_questions: $("#blank-custom-questions"),
        edit_contact: $("#edit-contact"),
        
        Splash: {
            
            /// constants
            CDN_PREFIX: "http://0767f9b6dcc5181c7043-73bbc09a38032a21ed1a9e3da3da76a6.r14.cf2.rackcdn.com/",
            API_IMPORT_UPLOAD: window.API_URL('api_import_upload'),
            API_SEARCH: window.API_URL('api_search'),
            BLANK_CONTACT: "",
            BLANK_CONTACTS: {
                'male': ['1', '4', '6', '8', '9', '10', '12', '14'],
                'female': ['3', '5', '7', '11', '13'],
                'unknown': ['2']
            },
            
            ALPHABET: [
                'a', 'b', 'c', 'd', 'e',
                'f', 'g', 'h', 'i', 'j',
                'k', 'l', 'm', 'n', 'o',
                'p', 'q', 'r', 's', 't',
                'u', 'v', 'w', 'x', 'y',
                'z',
                'Ø'
            ],
            
            BRANDING_PRIMARIES: [
                '#eaea0f',
                '#06deef',
                '#00e28b',
                '#ff2c5e',
                '#815bff',
                '#ff5215'
            ],
            
            BRANDING_SECONDARIES: [
                '#86cb01',
                '#039cd8',
                '#1eb260',
                '#da145f',
                '#3030d1',
                '#ff0030'
            ],
            
            recount: function () {
                $.canvas.QED({ recount: true, clear: false });
            },
            
            scroll_check: function () {
                /// SCROLL OF INFINITY (+2 CHARISMA)
                $.Splash.scroll_ignore();
                window._scroll_check = window.setTimeout(function () {
                    if($("#loadingMore").attr('no-more-results')=='1'){ 
                        return false; 
                    }
                    var section = $.Splash.whereAmI();
                    if(section.count < $.rooty.defaults('limit') ){
                        //no need to check if there's less results than the paging limit.
                        return false;
                    }

                    //if ($.rooty.defaults('method') != 'tags') {
                        var scroll_ = $.rooty.scrollTop() + ($.mosteverything.height()  * 4);
                        // console.log("scroll height "+scroll_);
                        // console.log("rooty height "+$.rooty.prop("scrollHeight"));//"scroll height "+scroll_);
                        if (scroll_ > ($.rooty.prop('scrollHeight')) && $.rooty.attr('loading')!==true){ //} && scroll_ != window._scroll_last) {
                            //console.log("I AM INNN");
                            $.rooty.attr("loading",true);
                            window._scroll_last = scroll_;
                            $("#loadingMore").show();
                            $.rooty.QED({
                                page: (window.page ? window.page : 1),
                                clear: false,
                                visible:false
                            },function(){
                                $.rooty.attr("loading",false);
                                $("#loadingMore").hide();
                            });
                        }
                    //}
                    //$.Splash.scroll_check();
                }, 200);
            },
            
            scroll_ignore: function () {
                if (window._scroll_check) {
                    window.clearTimeout(
                        window._scroll_check);
                }
            },
            
            primary_color_at: function (pos) {
                var color = $.xcolor.gradientarray(
                    $.Splash.BRANDING_PRIMARIES,
                    pos,
                    $.Splash.ALPHABET.length),
                    lighten = arguments[1] || 0;
                if (color && lighten < 0) {
                    color = $.xcolor.darken(color, Math.abs(lighten));
                } else if (color && lighten > 0) {
                    color = $.xcolor.lighten(color, lighten);
                }
                return color ? color.getHex() : "#ff9191";
            },
            
            secondary_color_at: function (pos) {
                var color = $.xcolor.gradientarray(
                    $.Splash.BRANDING_SECONDARIES,
                    pos,
                    $.Splash.ALPHABET.length),
                    lighten = arguments[1] || 0;
                if (color && lighten < 0) {
                    color = $.xcolor.darken(color, Math.abs(lighten));
                } else if (color && lighten > 0) {
                    color = $.xcolor.lighten(color, lighten);
                }
                return color ? color.getHex() : "#ff1919";
            },
            
            at_fix: function (string_) {
                if (string_ == null) { return string_; }
                return string_.replace(
                    /(@)/i,
                    function (match, at) {
                        return '<span class="at-symbol">' + at + '</span>';
                    }
                );
            },
            
            //////////////////////// THE CONTACT DATA UPDATER /////////////////////
            update_contact: function (primary_identifier, abc_data) {
                callback = arguments[2] || function () {};
                abc_data['primary_identifier'] = primary_identifier;
                $.vessel.QED(abc_data, callback);
            },
            
            //////////////////////// THE CONTACT DATA EXPORTER /////////////////////
            export_url: function () {
                var type = $("#export-list-type").val();
                var filter_type = '';
                if(type == 'email'){
                   filter_type='email';     
                }
                else if(type == 'twitter'){
                   filter_type='twitter';     
                }
                else if(type == 'instagram'){
                   filter_type='instagram';     
                }
                var opts = _({
                    output: 'csv',
                    outfile: arguments[0] || '',
                    massSelect: (massSelect)?1:0,
                }).extend($.rooty.defaults());
       
                opts['filters'] = filter_type;
                var selectedContacts = $.Splash.selectedContacts();
                if(selectedContacts.length > 0){
                    opts['abc_ids'] = selectedContacts;
                }
                opts['export_fields']=[];
                if($("#all-export-fields").val()!='1'){
                    $("#all-export-field-list").find("label.checked").each(function(){
                        opts['export_fields'].push($(this).find("input").attr("field"));
                    })
                }
                return $.querystring(opts, $.Splash.API_SEARCH);
            },
            
            /////////////////// THE CONTACT DATA CSV-FILE IMPORTER /////////////////
            import_upload_bind: function () {
                
                $.csvfilefield.show();
                var csvfilefieldRAW = $.csvfilefield[0];
                
                csvfilefieldRAW.onchange = function() {
                    
                    var file = this.files[0];
                    $.csvfilefield.hide();
                    
                    var fd = new FormData();
                    fd.append("csvfile", file);
                    
                    var xhr = new XMLHttpRequest();
                    xhr.open("POST", $.Splash.API_IMPORT_UPLOAD);
                    $("#import-csv-error").hide();
                    $("#import-p1").addClass('loading');
                    $("#id-upload_csv_file").show();
                    xhr.onload = function() {

                        try {
                            var res = JSON.parse(xhr.responseText);
                        } catch(e) {
                            console.log('ERROR: ', e);
                            console.log('RESPONSETEXT: ', xhr.responseText);
                            $("#import-csv-error").text('There was an error with your file.  Please make sure you are uploading a valid CSV file.').show();
                            $("#csv-row-count").hide();
                            return false;

                        }

                        
                        if (res['status'].toLowerCase() == "ok") {
                            $.Splash.import_upload_field_map(res['data']);
                            $('.import-p1').hide();
                            $.phasetwo.show();
                            $("#csv-row-count").text(res['data']['row_count']+' row(s) found.').show();
                        } else {
                            $("#import-csv-error").text('There was an error with your file.  Please try again.').show();
                            $("#csv-row-count").hide();
                            
                            //console.log('API ERROR', res);
                        }
                        $("#import-p1").removeClass('loading');

                    };
                    
                    xhr.onerror = function (wat) {
                       // console.log('XHR ERROR', wat);
                        $("#import-p1").removeClass('loading');

                    };
                    
                    xhr.send(fd);
                }
                
                //window.setTimeout(function() { $.csvfilefield.click(); }, 0);
            },
            
            import_upload_field_map: function (xhr_data) {
                $(".import-field-name").remove();
                $(".import-field-select").remove();
                
                _(xhr_data['fields']).each(function (val, idx) {
                    $("#import-field-names").append(
                        $.new('div')
                            .addClass('grp import-field-name')
                            .data('field',  _(val).pairs()[0][0])
                            .text(_(val).pairs()[0][1]));
                    $("#import-fields").append(
                        $.Splash.import_upload_generate_select(val, xhr_data['header']));
                });
            },
            
            import_upload_generate_select: function (field_pair, field_headers) {
                var field = _(field_pair).pairs()[0],
                    $selector = $.new('select')
                        .addClass("import-field-select-element w100")
                        .prop('required', true)
                        .prop('name', field[0]);
                
                $selector.append(
                    $.new('option')
                        .prop('value', "__none__")
                        .html("&lt; NONE &gt;"));
                
                _(field_headers).each(function (val, idx) {
                    $selector.append(
                        $.new('option')
                            .prop('value', ""+val)
                            .text(""+val));
                });
                
                return $.new('div')
                    .addClass("grp import-field-select")
                    .append($selector);
            },
            
            import_upload_phasetwo: function () {
                var $names = $(".import-field-name");
                    $selects = $(".import-field-select-element"),
                    opts = {};
                
                for (var idx = 0; idx < $names.length; idx++) {
                    var name = $names.eq(idx).data('field'),
                        val = $selects.eq(idx).find('option:selected').val();
                    opts[name] = val;
                }
                
                if($("#add-import").hasClass('loading')){
                    return false; //dont let them double upload!.
                }
                //console.log("OPTS BEFORE PHASETWO: ", opts);
                $.phasetwo.QED(opts);
            },
            
            //////////////////////// THE USERLAND LIST MAKER //////////////////////
            list: function (name, list_id, count ) {
                var $list = $.new('li')
                    .addClass('list')
                        .append($.new('a')
                            .addClass('sort-by grp p0')
                            .attr('id', 'list-'+list_id)
                            .attr('list-id',list_id)
                            .html('<input type="text" class="list-name grp" readonly="true" value="'+name+'" />')
                            .append(
                                $.new('span')
                                    .addClass('badge regular abs tr5')
                                    .text(''+count))
                            .append('<span class="edit-tools"><a href="#" class="edit icons3-pencil"></a><a href="#" class="icon-delete delete"></a></span>')
                            .on('click', function (e) {
                                if($(this).find("input.list-name").hasClass('active')){ return false; }
                                /// CLASS BASED TRANSITION HOOK
                                $.canvas.removeClass("home secondary view").addClass('primary');

                                $("#pane3-title").find("a:first").html('<span>'+name+'</span>').end()
                                    .find(".filtered-total").text($(this).find(".badge").text());
                                
                                $("#email-list-btn,#export-list-btn").css('display','inline-block');
                                $list.addClass('active').siblings().removeClass('active');
                                $("#top-level-filters").find("li.active").removeClass('active');
                                
                                $.textsearch.val('');
                                $.rooty.defaults({
                                    page: window.page = 1,
                                    method: 'list',
                                    event_ids: null,
                                    tag_ids: null,
                                    text_filter: null,
                                    event_ids: null,
                                    list_ids: list_id+"",
                                    locations: null,
                                    organizations: null,
                                    clear:true,
                                    force:true
                                }).QED();

                                
                                }).on('click','.edit-tools a',function(){
                                    var $this = $(this);
                                    if($this.hasClass('edit')){
                                       // $this.parents(".edit-tools").hide();
                                        var $input = $this.parents("li").find("input.list-name");
                                        $this.parents("li").addClass('editing')
                                        $input.data('current-val',$input.val()).addClass('active').prop("readonly",false).focus();
                                    } else{ //deleting
                                        var count = $(this).parents("li").find(".badge").text()*1;
                                        if(count>0){
                                           if(confirm('Are you sure you want to delete this list?')){

                                                $.lister.QED({ list_id: $this.parents(".sort-by").attr("list-id"), deleted: 1 })
                                                $this.parents("li").fadeOut(300,function(){
                                                    $(this).remove();
                                                });
                                           } 
                                        } else{
                                           $.lister.QED({ list_id: $this.parents(".sort-by").attr("list-id"), deleted: 1 })
                                            
                                            $this.parents("li").fadeOut(300,function(){
                                                $(this).remove();
                                            });
                                        }
                                    }
                                    return false;
                                
                                }).on('focusout','input.list-name',function(){
                                    var $this = $(this);
                                    var val = $.trim($this.val());
                                    if($this.hasClass('active') && val!=''){
                                        $this.removeClass('active').prop("readonly",true);
                                        //.parents("a.sort-by").find(".edit-tools").show();
                                        if(val!=$this.data('current-val')){
                                            $.lister.QED({ list_id: $this.parents(".sort-by:first").attr('list-id'), name: $this.val() });
                                            $("#pane3-title").find("a:first").html('<span>'+$this.val()+'</span>')
                                            $this.data('current-val',val);
                                            $this.effect('highlight',{color:'#ff2c5e'},300);
                                        }
                                    }
                                    
                                }).on('keyup','input.list-name',function(e){
                                    if(e.keyCode==13){
                                        $(this).focusout();
                                    }
                                })
                            )
                return $list;
            },
            
            //////////////////////// THE EVENT-LISTING MAKER //////////////////////
            eventMarkup: function (event_data){
                event_name = event_data['title'].trim();
                domain = (event_data['domain']===null)?'':event_data['domain'];
                
                return '<li class="as-written rel" event-id="'+event_data['id']+'">'+
                    '<a href="#" title="'+domain+'">'+
                    '<span class="label ellipsis">'+event_name+'</span>'+
                    '<span class="regular right badge">'+event_data['count']+'</span>'+
                    '</a></li>';
            },
            
            //////////////////////// THE LOCATIONS MAKER ////////////////////////
            location: function (location_name, location_data,group_data) {
                var group_id = group_data['id'];
                location_name = location_name.trim();
                var location_count = (!isNaN(location_data))?location_data:'';
                var orig = group_data['orig_name'];
                city='';
                state ='city_tag';
                return '<li class="as-written rel"><a href="#" group_id="'+group_id+'" orig="'+orig+'" city="'+city+'" state="'+state+'" class="location-option">'+
                    '<span class="label ellipsis">'+location_name+'</span>'+
                    '<span class="regular right badge">'+addCommas(location_count)+'</span></a></li>';

            },

            cityTag: function(city,newCity){
                if(newCity!=null){//a new entry. no ids, and therefore, city is a string, not an object.
                    return '<span class="tag" group-id="0"><span class="icon-pin"></span><span class="name tag-text">'+city+'</span><a href="#" class="delete-tag">✖</a></span>';
                } else{ 
                    return '<span class="tag" group-id="'+city['id']+'"><span class="icon-pin"></span><span class="name tag-text">'+city['name']+'</span><a href="#" class="delete-tag">✖</a></span>';
                }
            },
            
            //////////////////////// THE ORGANIZATION MAKER ////////////////////////
            organization: function (org_data) {
                return '<li class="as-written rel"><a href="#" class="organization-option">'+
                    '<span class="label ellipsis">'+org_data['AddressBookContact']['organization']+'</span>'+
                    '<span class="regular right badge">'+org_data[0]['C']+'</span></a></li>';

            },
            
            //////////////////////// THE TAGG MAKER ////////////////////////
            tagg: function (tag_id, tag_name, tag_contact_count) {
                var normalized_name = tag_name.toString().normalize();
                var tag_li = '<li class"regular uppercase rel">'+
                '<a href="#/contacts/tags='+normalized_name+'" tag-id="'+tag_id+'" tag_name="'+normalized_name.toLowerCase()+'">'+
                '<span class="label ellipsis">'+normalized_name+'</span>'+
                '<span class="regular right badge">'+tag_contact_count+'</span>'+
                '</a></li>';
                $.taggindex[tag_id] = normalized_name;
                return tag_li;
            },

            eventCard: function(eventData){
                if (typeof eventData === "undefined") {
                    return false;
                }
                // if($.inArray(contact.id,$.contactIds) > -1 ){
                //  //console.log("ALREADY HAVE THEM "+contact.id);
                //  return false;
                // } 
                //else{
                    //$.contactIds.push(contact.id);
                //}

                var title = eventData['Event']['title'],
                    event_id = eventData['Event']['id'],
                    extra_classes = { card: '', chkbox: '' },
                    venue_name='',
                    venue_city='';

                if(eventData['Event']['venue_name']!='' && eventData['Event']['venue_name']!=null){
                    venue_name = eventData['Event']['venue_name'];
                }
                else if(eventData['Event']['address']!='' && eventData['Event']['address']!=null){
                    venue_name = eventData['Event']['address'];
                }

                if(eventData['Event']['city']!='' && eventData['Event']['city']!=null){
                    venue_city = eventData['Event']['city'];
                    if(eventData['Event']['state']!='' && eventData['Event']['state']!=null){
                        venue_city+=', '+eventData['Event']['state'];
                    }
                }
                if(typeof eventData['date_tbd']!=='undefined'){
                    eventData['start_day'] = 'Date';
                    eventData['start_month'] = 'TBD';
                }

                if(eventData['EventSetting']['venue_tbd']==1){
                    venue_name = 'Venue TBD';
                    venue_city='';
                }
                // if (title === "" || title === null || typeof title === 'undefined') {
                //     //console.log("SKIPPED GUY ! "+contact.id);
                //     return false;
                // }

                if(massSelect){
                    extra_classes.card = 'selected',
                    extra_classes.chkbox = 'checked';
                }
                if(typeof eventData['EventContact']!=='undefined' && eventData['EventContact']['confirmed']=='0'){
                    extra_classes.card = 'joinEvent';
                }
                var imgUrl = eventData['image'];
                var $eventCard = $('<div class="event-card contact-card '+extra_classes.card+' clear">'+
                    '<div class="event-card-bg" event-id="'+event_id+'"><div class="the-image" style="background:url(\''+imgUrl+'\');"></div></div>'+
                    '<label class="hide nu-checkbox selector '+extra_classes.chkbox+' ">'+
                    '<input id="event-checkbox-'+event_id+'" type="hidden" value="1" />'+
                    '</label>'+
                    '<a id="event-'+event_id+'" class="view-contact-nu" href="#/events/all/'+event_id+'">'+
                        '<ul class="details">'+
                            '<li class="name regular">'+title+'</li>'+
                            '<li class="venue grp p0 wA">'+
                                // If no venue name, use address
                                '<span class="venueName block">'+venue_name+'</span>'+
                                '<span class="venueCityState block">'+venue_city+'</span>'+
                            '</li>'+
                        '</ul>'+
                        '<div class="start-date grp p0 wA abs bl txtC">'+
                            '<small class="dow uppercase block">'+eventData['start_day']+'</small>'+
                            // Only show year if not current year
                            '<span class="monthDay uppercase block semiBold">'+eventData['start_month']+'</span>'+
                        '</div>'+
                        '<div class="responsesCount hide">'+
                            '<span class="number">2,583</span>'+
                            '<small>RESPONSES</small>'+
                        '</div>'+
                        '<div class="invited">INVITED TO COLLABORATE</div>'+
                    '</a>'+
                    '</div>');
                $eventCard.attr("event-id",event_id);//data({'event_id':event_id });

                return $eventCard;    

            },
            
            //////////////////////// THE CONTACT MAKER ////////////////////////
            contact: function (contact) {
                if (typeof contact === "undefined") {
                    return false;
                }
                if($.inArray(contact.id,$.contactIds) > -1 ){
                    //console.log("ALREADY HAVE THEM "+contact.id);
                    return false;
                } else{
                    $.contactIds.push(contact.id);
                }
               // console.log("CONTACT ",contact);
                //console.log(arguments);  
                var name = '';
                if( contact.last_name != '' && contact.last_name !== null && contact.last_name !=='NULL'){
                    name = contact.last_name;
                } else if( contact.last_name != '' && contact.first_name !== null && contact.first_name!=='NULL') {
                    name = contact.first_name;
                } else if( contact.primary_email != '' && contact.primary_email !== null){
                    name = contact.primary_email;
                    contact.first_name = '';
                    contact.last_name = contact.primary_email;
                }
                var full_name = getContactName(contact);


               // console.log("ARGS ",arguments);
                //var //tagg_data = arguments[1] || null,
                var contact_key = arguments[1] || null,
                    group_data = arguments[2] || null,
                    tagg_data = [],
                    city_tag_array = [],
                    event_tag_data = [],
                    avatar_data = arguments[3] || null,
                    badge = arguments[4] || null,
                    extra_classes = { card: '', chkbox: '' }


                // console.log("GROUP DATA",group_data);
                if(group_data!=null){
                    for(var z in group_data){
                        if(group_data[z]['type']=='Tag'){
                            tagg_data.push(group_data[z]['name']);
                        } else if(group_data[z]['type']=='Location'){
                            city_tag_array.push({ 
                                id: group_data[z]['id'],
                                name: group_data[z]['name']
                            });
                        } else if(group_data[z]['type']=='Event'){
                            event_tag_data.push(group_data[z]['name']);
                        }
                    }
                }    

                if (name === "" || name === null || typeof name === 'undefined') {
                    //console.log("SKIPPED GUY ! "+contact.id);
                    return false;
                }
                if(massSelect){
                    extra_classes.card = 'selected',
                    extra_classes.chkbox = 'checked';
                }    

                contact.name = name.capitalize();
                contact.taggs = tagg_data;
                contact.key = contact_key;
                contact.city_tags = city_tag_array;
                contact.groups = group_data;
                contact.avatars = avatar_data || [];
                contact.initial = getInitial(contact.name);

                ///////////// CONTACT CARD STRUCTURE /////////////
                var letter = contact.initial;
                var $contact = $.new('div')
                    .addClass('contact-card letter-' + letter +' '+extra_classes.card + ' clear')
                    .attr('data-contact-id', contact['id'])
                        .append(
                            $.new('label')
                                .addClass('nu-checkbox selector '+ extra_classes.chkbox )
                                .append(
                                    $.new('input')
                                        .addClass('contact-checkbox')
                                        .prop({ 'name': '', 'id':  'contact-checkbox-'+contact['id'],
                                            'type':'hidden','value':1})
                                        .on('change', function (e) {
                                            var $chk = $(this);
                                            
                                            /// whaat is the deeal with this contact?
                                            if ($chk.val() == '1') { 
                                                $contact.addClass('selected');
                                            } else {
                                                $contact.removeClass('selected active');
                                                $.selectall.val(0).parent().removeClass('checked');
                                            }
                                            
                                            /// whaat is the deeal with contacts?
                                            selectedContactCallback();
                                        }
                                    )
                               )
                       ); 
                
                var $avatar = $.new('div')
                    .addClass('left relative slider')
                    .on('click',function(event){
                        event.preventDefault();
                        $(this).parents("div.contact-card:first").find("label.nu-checkbox:first").click();
                        return false;
                    })

                ///////////// PROFILE IMAGE /////////////////////////
                if (contact['profile_image'] !== null &&  contact['profile_image'] !== "" && typeof contact['profile_image'] !== "undefined") {
                    $avatar.addClass('alpha-avatar letter-'+contact.initial)
                        .append('<img itl="'+contact.initial+'" onerror="imgError(this);" src="'+contact['profile_image']+'" width="60" height="60">');
                } else {
                    var letter = (contact.initial!='none')?contact.initial:'';
                    $avatar.addClass('alpha-avatar letter-'+contact.initial)
                        .append('<div class="letter">'+letter+'</div>');
                }
                
                ///////////// NAME + EMAIL //////////////////////////
                var $name = $.new('li')
                    .addClass('name semiBold')
                    .text(full_name),
                    $email = $.new('li')
                        .addClass('email regular as-written ellipsis')
                        .css('max-width', '45%')
                        .html($.Splash.at_fix(contact['primary_email'])),
                    $badge;
                
                ///////////// BADGE (OPTIONAL) //////////////////////
                if(badge && badge != "") {
                    $badge = '<li class="grp badge regular right label">'+badge+'</li>';
                }

                if(contact['vip']=='1'){
                    var $vip = '<span class="abs vip-star bigger em02" style="top:18px;right:10px;" data-icon="*"></span>';
                } else{
                    var $vip = '<span class="abs vip-star bigger em02 hide" style="top:18px;right:10px;" data-icon="*"></span>';
                }            
                ///////////// CONTACT CARD MAIN DISPLAY /////////////
                var $ul =  
                    $.new('ul')
                        .addClass('details')
                        .append($name)
                        .append($email)
                        .append($badge)
               
                ///////////// CONTACT VIEW BINDINGS ////////////////
                var $anchor = $.new('a')
                    .addClass('view-contact-nu')
                    .attr({
                        href: '#/contacts/all/'+contact['id'],
                        id: $.model.toLowerCase() + '-' + contact['id']
                    })
                    .on('click', function (e) {
                          $(this).parents(".contact-card").addClass('active').siblings('.active').removeClass('active');
                          $.canvas.addClass('view');
                           /// inquire of the contact data
                          $contact.QED({
                              json: contact,
                              elem: $contact
                          },function(){
                              resizeContactHeight();
                          });  
                          //console.timeEnd("contact click");
                    })
                    .append($avatar)
                    .append($ul)
                    .append($vip)
                
                $contact
                    .append($anchor)
                    .data({ 
                        'name': full_name, 
                        'contact_id': contact.id, 
                        'initial': contact.initial,
                    });
                
                ///////////// INQUIRY FOR CONTACT DATA (LIKE AS IN JQUERY-DATA) /////////////
                
                $contact
                    .inthecaseof(contact)
                    .inquire(
                        function (data) {
                            //console.log(data);
                            var local_tag_data = $.contactview.data('tags'+data['id']),
                            local_city_tags = $.contactview.data('city_tags'+data['id']);
                            //profile_data = $.contactview.data('profile'+data['id']);
                            vip_data = $.contactview.data('vip'+data['id']); 
                            //local_group_data = $.contactview.data('groups' + data['id']),
                            //local_avatar_data = $.contactview.data('avatars' + data['id']);

                            if(typeof local_tag_data === "undefined") {
                                local_tag_data = data.taggs.join(',');
                            }

                            if(typeof local_city_tags === "undefined"){
                                local_city_tags = contact.city_tags;
                            }
                            var city_tags = '';
                            for(var x in local_city_tags){
                                city_tags+=$.Splash.cityTag(local_city_tags[x]);
                            }
                            $("#city-wrap > .content:first").html(city_tags);
                            $("#google-search").val(''); 
                            if(typeof vip_data!=='undefined'){
                               contact.vip = vip_data;
                            }
  
                            var local_avatar_data = $.trim(contact.profile_image);

                            /// clear existing tags from the widget
                            /// 'import' a comma-separated string of tags
                            /// N.B. really? is this really this thing's API??
                            $.taggs.val('').importTags(local_tag_data);

                            /// avatar image
                            var new_image;
                            
                            if($contact.find(".alpha-avatar").find(".letter").length>0){
                                $("#avatar-image-frame").find(".img").html('<div class="alpha-avatar txtC align"><span class="middle">'+letter+'</span></div>'); 
                            } else{
                                new_image = $.Splash.cloudimage(
                                    contact.profile_image,
                                    '100%', 'auto',
                                    'avatar-image',
                                    function () {
                                        /// scale and show contact's avatar image
                                        // var $grp_img = $.contactview.find('.grp.img'),
                                        //     $grp_img_img = $grp_img.find('img'),
                                        //     css_img = $.cssURL($grp_img_img.attr('src'));
                                     
                                        return true;
                                    }); 
                                $("#avatar-image-frame").find(".img").html(new_image);
                            } 

                            
                            /// hide multi-contact-view
                            $.multicontactview.hide();
                            
                            var bg_color = $contact.css('background-color')
                            var raw_bg_color = $contact.css('background-color').rawRGB();
                           
                           toggleFilters(true);
                           // setTimeout(function(){
                           //     resizeContactHeight();
                           // },500);
                            /// position and show contact viewer
                            $.viewnav.show();
                            $.contactview
                                .show()
                                .css('background-color', bg_color)
                                .data('contact_id',data['id']) //set the contact id we're viewing so we know who to edit!
                                .find('ul.social-stat-wrap .network').css('background', bg_color).end()
                                .find('.alpha-avatar').css('background-color',raw_bg_color).end()
                                .find('.timeline-item a').css('background',raw_bg_color).end()
                                .find('.timeline-item .action-icon').css('border-color', bg_color).end()
                                .find('.timeline-item .stem').css('background', bg_color).end()
                                .find('.timeline-item #address-book-created').css('background', bg_color).end()
                                .find('.timeline-item .more-info').css('border-left-color', bg_color).end()
                                .find('span.tag').css('background-color', bg_color).end()
                                .find('#view-nav').css('background-color', raw_bg_color).end()
                            var $history = $("#contact-history-profile");
                            
                            $.contactview.scrollTop(0);
                            $("#history-container").empty();
                            $("#address-book-created").hide();
                            $history.addClass('loading');

                            if(typeof contactHistoryCache[data['id']]!=='undefined'){
                                populateContactHistory(data['id'],contactHistoryCache[data['id']],contact);
                                $history.removeClass('loading');

                            } else{ 

                                $.ajax({
                                    url: "/address_book/api_sideload/"+data['id'],
                                    type: "POST",
                                    dataType: 'json',
                                    success: function(result){
                                        if($.contactview.data('contact_id')==data['id']){
                                           // console.log("contactss that ish!");
                                            //only populate if they're still on the page!
                                            populateContactHistory(data['id'],result['data']['history'],contact);
                                                
                                        } else{
                                            //don't populate the history div, theyre no longer visible.
                                            //console.log("no longer visible");

                                        }

                                        //in either case, save cached data for this contact's history so we don't have to do another lookup.
                                        contactHistoryCache[data['id']] = result['data']['history'];
                                        $history.removeClass('loading');
                                    },
                                    error: function(response){
                                        
                                        $history.removeClass('loading');
                                    }
                                })    
                            }
                            if (contact.vip=='1'){
                                $.contactview.find(".vip-star").addClass('vip-set').css({
                                    'color' : raw_bg_color,
                                    'text-shadow' : '0 0 0 1px #fff'
                                });
                            } else{
                                $.contactview.find(".vip-star").removeClass('vip-set').css({
                                    'color' : '#fff',
                                    'text-shadow' : '0 0 1px #000'
                                });
                            }

                            var $avatar = $("#avatar-image-frame").find(".alpha-avatar");
                            $avatar.height($avatar.width()-10);
                            console.log('set height');
                        }, function (opts) {
                            populateContactProfile(contact);
                            //console.timeEnd("before.");
                        }
                    );
                
                return $contact;
            },
            
            imageurl: function (pth) {
                //return pth ? $.Splash.CDN_PREFIX + pth.replace('profile_images/', '') : $.Splash.BLANK_CONTACT;
                return pth ? pth : $.Splash.BLANK_CONTACT;
            },
            
            cloudimage: function (pth) {
                try {
                    return $.new('img')
                        .addClass(arguments[3] || 'cloud-image')
                        .on('load', arguments[4] || function () { return true; })
                        .attr({
                            src: $.Splash.imageurl(pth),
                            width: arguments[1] || 60,
                            height: arguments[2] || 60
                        });
                } catch (e) {
                    return $.new('img')
                        .addClass(arguments[3] || 'cloud-image')
                        .on('load', arguments[4] || function () { return true; })
                        attr({
                            width: arguments[1] || 60,
                            height: arguments[2] || 60
                        });
                }
            },
            
            lazycloudimage: function (pth) {

                try {
                    return $.new('img')
                        .addClass(arguments[3] || 'cloud-image not-yet-unveiled')
                        .attr('data-src', $.Splash.imageurl(pth))
                        .attr({
                            src: "/addressbook-images/blank.png",
                            width: arguments[1] || 60,
                            height: arguments[2] || 60
                        });
                } catch (e) {
                    return $.new('img');
                }
            },
            
            selectedContacts: function() {
                var ids = [];
                            
                if($.contactview.is(":visible")){ //just a single contact.
                    ids.push($.contactview.data('contact_id'));
                } else{ //bulk contacts.
                    var $selected = $.rooty.find(".contact-card.selected");
                    $selected.each(function(){
                        ids.push($(this).attr("data-contact-id"));
                    });
                } 
                return ids;
            },

            setListDivHeight: function(){
                var h1 = $(window).height()*1;
                var h2 = $("div.global-header").outerHeight(true) * 1;
                var h3 = $("#top-level-filters").outerHeight(true) * 1;
                var h4 = $("#footer").outerHeight(true)*1;
                $.listlist.height(h1-h2-h3-h4-15);//another 15 just because. 
                var h5 = $("#community-nav").find(".bb1e:first").outerHeight(true)*1;
                var h6 = $("#contacts-search-contain").outerHeight(true)*1;
                //var $w = $(window).height();
                //var $o = $('#events').position().top;
                var $r = h1-h2-h5-2;//minus 2 for finetuning.
                var $t = $('.innerScroll');
                $t.each(function(){
                    var $p = $t.parents(".custodial:first");
                    if($p.length > 0){
                        var newHeight = h1 - $p.find(".bb1e:first").outerHeight(true) - $p.find(".sf-wrap:first").outerHeight(true)+2;
                        $t.css('height',newHeight);      
                    } else {
                        //console.log('THE ANSWER IS '+$r+'px');
                        $t.css('height', $r);
                    }
                });                
            },

            customQuestion: function(args){
                if(typeof args.column_name!=='undefined'){
                    // console.log("CUSTOM QUESTIONS");
                    // console.log(args);
                    
                    if(args.type=='text' || args.type=='textarea'){ //text response. simple enough.
                        var $obj = $.blank_questions.find(".text-question").clone();
                        $obj.attr({ "field":args.column_name, "type":args.type });
                        $obj.find(".question-title").text(args.name)
                    } 
                    else if($.inArray(args.type,['radio','select'])>-1 ){
                        // var $obj = $.blank_questions.find(".dropdown-question").clone();
                        // $obj.attr({ "field":args.column_name, "type":args.type });
                        // $obj.find(".question-title").text(args.name)
                        // var $select = $obj.find(".options");
                        // var options = '<div class="option" value="">Select</div>';
                        // _(args.values)
                        //     .each(function (val, idx) {
                        //         options+='<div class="option" value="'+idx+'">'+val+'</div>';                                 
                        //     });
                        
                        // $select.html(options);
                        var $obj = $.blank_questions.find(".checkbox-multi-question").clone();
                        $obj.attr({ "field":args.column_name, "type":args.type });
                        $obj.find(".question-title").text(args.name)
                        var $filter = $obj.find(".question-filter");
                        var options = '';
                        _(args.values)
                            .each(function (val, idx) {
                                console.log("val ",val);
                                console.log("idsx ",idx);

                                options+='<label class="nu-checkbox"><input type="hidden" class="rsvp-response-filter" field-val="'+val+'" value="'+val+'" />'+val+'</label>';                                 
                            });
                            $filter.append(options);

                    }
                    else if(args.type =='checkbox'){
                        var $obj = $.blank_questions.find(".checkbox-question").clone();
                        $obj.attr({ "field":args.column_name, "type":args.type });
                        $obj.find(".question-title").text(args.name)
                    } else if(args.type == 'check_multi'){
                        var $obj = $.blank_questions.find(".checkbox-multi-question").clone();
                        $obj.attr({ "field":args.column_name, "type":args.type });
                        $obj.find(".question-title").text(args.name)
                        var $filter = $obj.find(".question-filter");
                        var options = '';
                        _(args.values)
                            .each(function (val, idx) {
                                options+='<label class="nu-checkbox"><input type="hidden" class="rsvp-response-filter" field-val="'+val+'" value="'+val+'" />'+val+'</label>';                                 
                            });
                            $filter.append(options);
                    } 
                    
                    return $obj;   
                } else {
                    return '';
                }
            },

            scrollToObject: function($obj1,$obj2){
                $obj1.scrollTop(
                    $obj2.offset().top - $obj1.offset().top + $obj1.scrollTop()
                );
            },

            whereAmI: function(){
                var params = {};
                var $a = $("#community-nav").find("li.active:first").find("a:first");
                if($a.length>0){
                    if($.canvas.hasClass('secondary') && $.canvas.hasClass('filtered')){
                        //check to see if we're going in to level 2.
                        var $filter = $("#secondary-filter").find(".custodial:visible:first");
                        if($filter.length > 0){
                            params.id = $filter.prop("id");
                            var $li = $filter.find("li.active:first");
                            if($li.length > 0){
                                params.count = $li.find(".badge").text().replace(',','')*1;
                            }
                            params.obj = $li;

                        }
                    } else { //otherwise we're top level.  ala contact index.
                        params.count = $a.find(".badge").text().replace(',','')*1;
                        params.id = $a.prop("id");
                        params.obj = $a;
                    }       
                } else {
                    //check to see if we're in a list.
                    var $a = $.listlist.find("li.active:first").find("a:first");
                    if($a.length > 0){
                        params.count = $a.find(".badge").text().replace(',','')*1;
                        params.id = $a.prop("id");
                        params.obj = $a;
                    }
                }

                return params;

            },

            addTopTags: function(tags){
                var $d = $.stats.toptags.find(".content:first");
                $d.empty();
                _(tags).each(function (val, idx) {
                        //console.log("TAG ",val);
                        $d.append(
                            $.new('div')
                                .addClass('top-tags')
                                .attr("tag-id",val['AddressBookGroup']['id'])
                                .text(val['AddressBookGroup']['name'])
                                .on('click',function(){
                                    var $a = $("#tags").find("a[tag-id="+val['AddressBookGroup']['id']+"]");
                                   if($a.length > 0){
                                        $a.QED();
                                        $("#sort-by-tag").firstView();
                                        $a.parent().addClass('active').siblings().removeClass('active').scrollTop(0);
                                        $.Splash.scrollToObject($("#tags"),$a);
                                        setTimeout(function () {
                                            $.canvas.addClass('secondary filtered');
                                            $("#pane3-title").find("a:first").html('<span>'+$a.attr("tag_name")+'</span>').end()
                                                .find(".filtered-total").text($a.find(".badge").text());
                                        }, 250);
                                        
                                    } else {
                                        jumpToTag = val['AddressBookGroup']['id'];
                                        $("#sort-by-tag").click();

                                    }
                                })
                                .append(
                                    $.new('span')
                                        .addClass('relative badge').text(val[0]['C'])
                               ) 
                        );
                    });        

            }, 

            getQueryDefaults: function(){
                return {//for event only here.
                    page: window.page = 1,
                    limit: 25,
                    sort_by: 'event_start',
                    text_filter: '',
                    tag_ids: null,
                    list_ids: null,
                    locations: null,
                    start_date: null,
                    end_date: null,
                    event_ids:null,
                    event_type_ids:null,
                    filters: null,
                    vip: null,
                    visible: true,
                    force: false,
                    preload: false,
                    method: 'all',
                    clear: true,
                    export_fields:[],
                    abc_id:[],
                    contact_id:[],
                    group_id:[]
                };
            }

        }
    
    });
    
    $("html").click(function(e){
        if($.simpleModalWrap.is(":visible")){
            var $target = $(e.target);
            if(($target.parents(".simple-modal").length<1 && !$target.hasClass('simple-modal')) && !$("#simple-modal-wrap").hasClass('persistent')){
                closeSimpleModal();
            }
        }
    });

    var __data__,
        
        maroon = '#7D1E1D',
        brick = '#BA3027',
        red = '#E93F33',
        red_list = [red, brick, maroon];
    
    ////////////////////// APROPOS: UPDATES /////////////////////////////
    $.vessel
        .WRT(window.API_URL('api_update_contact'))
        .inquire(function (data) {
            
            if(jumpToNewContact!==false){
                jumpToProfile = data.id*1;
                flipDropDown($("#filter-sorter-hidden").parents(".nu-dropdown:first"),'created');   
                $.selectall.val(0).parent().removeClass('checked');
                massSelect=false;
                setTimeout(function(){
                    $.rooty.defaults({
                        page: window.page = 1,
                        clear: true,
                        sort_by: 'created'
                    }).QED({ force: true });
                },10);
               jumpToNewContact = false;
            }                
        });
    
    $("#confirmRemove")
        .WRT(window.API_URL('api_update_bulk_contacts'))
        .inquire(function (data) {
            var count = data['id'].length;
            var noun = (count!=1)?'contacts':'contact';
            if(count > 0){
                setFlash(count+' '+noun+' deleted');
            } else{
                setFlash('Error: No contacts were removed.','error');
            }
            $("#sort-by-contact").firstView();
            setTimeout(function(){
                $.rooty.defaults({
                    page: window.page = 1,
                    method: 'all',
                }).QED({ force: true });
            },10);
        }, function() {}
    );  



    //EVENT INDEX FIRST VIEW/COUNTS
    if(typeof constants.eventIndex!=='undefined'){
        //CONTACTS FIRST COUNTS.
        ////////////////////// APROPOS: COUNTS /////////////////////////////
        $.canvas.apropos(window.API_URL('event_first_counts'))
                .inquire(
                    function (data) {
                        if('event_types' in data){
                            var event_type_count = addCommas(data['event_types'].length);
                            $("#sort-by-event-type-count").html(event_type_count).removeClass('loading');
                            $("#event-types-custodian").find(".filtered-total").html(event_type_count);
                            var lis = '';
                            for(var x = 0; x<data['event_types'].length; x++){
                                lis+=eventTypeMarkup({ id: data['event_types'][x]['EventType']['id'], name: data['event_types'][x]['EventType']['name'], count: data['event_types'][x][0]['C'] });
                            }

                            $("#firstViewEventTypes").find(".count").html(event_type_count);
                            if(event_type_count=='1'){
                                $("#firstViewEventTypes").find(".block:first").text('Event Type');
                            }

                            $("#event-types").html(lis);
                        }

                        if('event_contacts' in data){
                            var event_contact_count = addCommas(data['event_contacts'].length);

                            $("#sort-by-collaborator-count").html(event_contact_count).removeClass('loading');
                            $("#collaborators-custodian").find(".filtered-total").html(event_contact_count);
                            var lis = '';
                            for(var x in data['event_contacts']){
                                 lis+=eventContactMarkup(data['event_contacts'][x]);
                            }
                            $("#firstViewCollaborators").find(".count").html(event_contact_count);
                            if(event_contact_count=='1'){
                                $("#firstViewCollaborators").find(".block:first").text('Collaborator');
                            }
                            $("#collaborators").html(lis);

                        }
                        
                        if ('events' in data) {
                            var eventcount = addCommas(data['events']);
                            $('#sort-by-event-count').html(eventcount).removeClass('loading');
                            $("#firstViewEvents").find(".count").html(eventcount);
                            $("#events-custodian").find(".filtered-total").html(eventcount);
                            // if (data['events'] == 0) {
                            //     $("#sort-by-event").parent().addClass('inactive');
                            // } 
                            if (data['events'] == 1) {
                                $("#firstViewEvents").find(".block:first").html('Event');
                            }
                        }
                        
                        if ('locations' in data) {
                            populateEventLocations(data['locations']);
                        }
                      
                        $("#event-index-sort").click();//fire event index tab.

                }).failure(function(){
                    alert('#4491: There was an error loading your data.  Please try refreshing the page.');
                    $.canvas.removeClass('loading');
                });
                
    } else{
        //CONTACTS FIRST COUNTS.
        ////////////////////// APROPOS: COUNTS /////////////////////////////
        $.canvas.apropos(window.API_URL('api_stats_firstcounts'))
                .inquire(
                    function (data) {
                        if ('contacts' in data) {
                            var contactcount = addCommas(data['contacts']);
                            $('#all-contacts-count,#total-community').html(contactcount).removeClass('loading');
                        }
                        
                        if ('events' in data) {
                            var eventcount = addCommas(data['events']);
                            $('#sort-by-event-count').html(eventcount).removeClass('loading');
                            $("#firstViewEvents").find(".count").html(eventcount);
                            $("#events-custodian").find(".filtered-total").html(eventcount);
                            // if (data['events'] == 0) {
                            //     $("#sort-by-event").parent().addClass('inactive');
                            // } 
                            if (data['events'] == 1) {
                                $("#firstViewEvents").find(".block").html('Event');
                            }
                        }
                        
                        if ('locations' in data) {

     
                            // if (data['locations'].length == 0) {
                            //     $("#sort-by-locations").parent().addClass('inactive');
                            // } 


                            var lis = '',x=0;
                            _(data.locations).each(function (val, idx) {
                               //console.log(val);
                               lis+=$.Splash.location(val['AddressBookGroup']['name'],val[0]['C'],val['AddressBookGroup']);
                               x++
                            

                            });
                            var locationcount = addCommas(x);
                            if (locationcount == 1) {
                                $("#firstViewLocations").find(".block").html('Location');
                            }
                            $('#sort-by-location-count').html(locationcount).removeClass('loading');
                            $("#firstViewLocations").find(".count").html(locationcount);
                            $("#locations-custodian").find(".filtered-total").html(locationcount);    
                            $.locations.html(lis);
                            $.stats.toplocations.empty().america(data.locations);

                            //$.locations.QED({ mode: 'all', clear: false, no_load: true, parse: true }, function (opts, findings) {
                              //  $.stats.toplocations.america(findings);
                            //});


                        }
                        
                        if ('organizations' in data) {
                            var orgcount = addCommas(data['organizations']);
                            $('#sort-by-organization-count').html(orgcount).removeClass('loading');
                            $("#firstViewOrganizations").find(".count").html(orgcount);
                            $("#organizations-custodian").find(".filtered-total").html(orgcount);
                            // if (data['organizations'] == 0) {
                            //     $("#sort-by-organizations").parent().addClass('inactive');
                            // } 
                            if (data['organizations'] == 1) {
                                $("#firstViewOrganizations").find(".block").html('Organization');
                            }
                        }
                        
                        if ('tags' in data) {
                            var tagcount = addCommas(data['tags']);
                            $('#sort-by-tag-count').html(tagcount).removeClass('loading');
                            $("#firstViewTags").find(".count").html(tagcount);
                            $("#tags-custodian").find(".filtered-total").html(tagcount);
                            // if (data['tags'] == 0) {
                            //     $("#sort-by-tag").parent().addClass('inactive');
                            // } 
                            if (data['tags'] == 1) {
                                $("#firstViewTags").find(".block").html('Tag');
                            }
                        }
                        
                        if('lists' in data){
                            $.listlist.find("#lister-li").siblings().remove();
                            if(typeof data['lists']!=='undefined'&&data['lists']!==false){
                                _(data['lists']).each(function(val,idx){
                                    $.listlist.append(
                                       $.Splash.list(val['AddressBookGroup']['name'], val['AddressBookGroup']['id'], val[0]['C']));
                                    //$.listlist.data(val['AddressBookGroup']['name'].normalize(), val['AddressBookGroup']);
                                });
                            }
                        }

                        if('top_tags' in data){
                            $.Splash.addTopTags(data['top_tags']);
                        }

                        if('social_counts' in data){
                            /// Donut graph
                            $.stats.addressdonut.empty().donutgraph({
                                instagram: data.social_counts.instagram,
                                twitter: data.social_counts.twitter,
                                email: data.social_counts.email
                            });                        
                        }
                        
                        //TOP INFLUENCERS                    
                        if('top_influencers' in data){
                            var influencers = '';
                            if(data.top_influencers!==false){
                                _(data.top_influencers)
                                    .each(function (val, idx) {
                                        //console.log(val);
                                        //if (_(val).has('twitter_display_name')) {
                                        if(val['AddressBookContact']['twitter_display_name']!==null){
                                            var name='';
                                            if(val['AddressBookContact']['first_name']!==null){
                                                name=val['AddressBookContact']['first_name'];
                                                if(val['AddressBookContact']['last_name']!==null){
                                                    name+=' '+val['AddressBookContact']['last_name'];
                                                }
                                            } else if(val['AddressBookContact']['last_name']!==null){
                                                name=val['AddressBookContact']['last_name'];
                                            } else{
                                                name = val['AddressBookContact']['twitter_display_name'];
                                            }

                                            var initial = getInitial(name);

                                            if(val['AddressBookContact']['profile_image']){
                                                var img = '<img class="avatar-img w100 hA left" itl="'+initial+'" onerror="imgError(this,1);" src="'+val['AddressBookContact']['profile_image']+'" />';
                                            } else{
                                                var attr = 'style="background-color:'+getRandomColor()+'";';
                                                var img = '<div class="alpha-avatar letter-'+initial+'" '+attr+'><div class="letter">'+initial+'</div></div>';
                                            }
                                            influencers+='<div class="avatar-box grp rel" contact-id="'+val['AddressBookContact']['id']+'">'+
                                                '<div class="grp p0 wA image-box w100 inline">'+img+'</div>'+
                                                '<div class="grp pt0 wA user-info">'+
                                                    '<div class="name-and-user">'+
                                                        '<div class="regular name">'+name+'</div>'+
                                                        '<div class="light ellipsis twitHandle"><span class="at-symbol">@</span>'+(''+val['AddressBookContact']['twitter_display_name']).replace('@','')+'</div>'+
                                                    '</div>'+
                                                  '<div class="light em01 infCount">'+addCommas(val['AddressBookContact']['twitter_followers'])+'</div>'+
                                                '</div></div>';
                                        }
                                    });
                                $.stats.topinfluencers.find(".content").empty().append(influencers);
                                $.stats.topinfluencers.on('click','.avatar-box',function(){
                                    $("#view-all-influencers").click();
                                    var abc_id = $(this).attr("contact-id");
                                    jumpToProfile = abc_id;
                                });
                            }
                        }        

                        /* if('top_locations' in data){
                            var location_html = '';
                            _(data.top_locations)
                                .each(function (val, idx) {

                                    location_html+='<div class="grp avatar-box w1-3 cityBox" group_id="'+val['id']+'">'+//' city="'+val['AddressBookContact']['city']+'" state="'+val['AddressBookContact']['state']+'">'+
                                        '<span class="left w100 cityName">'+val['name']+'</span>'+
                                        '<span class="left w100 cityCount bigger em05 gibsonSemiBold">'+addCommas(val['count'])+'</span>'+
                                     '</div>';
                                });                         
                                $("#stats-top-cities > .city-container").html(location_html);

                        } */

                        if('charts' in data){
                            genChartData(data['charts']);
                        }


                   //     $('.thisLoader').removeClass('loading');

                        var thisDelay = 100;

                        setTimeout(function() {
                            $('.lineChart .thisLoader').removeClass('loading');
                           setTimeout(function() {
                               $('.community-totals .thisLoader').removeClass('loading');
                                setTimeout(function() {
                                    $('#stats-top-influencers .thisLoader').removeClass('loading');
                                    setTimeout(function() {
                                         $('#stats-top-cities .thisLoader').removeClass('loading');
                                         setTimeout(function() {
                                             $('#stats-top-tags .thisLoader').removeClass('loading');
                                         }, thisDelay);
                                    }, thisDelay);
                                }, thisDelay);
                           }, thisDelay);
                        }, thisDelay);

                        // $('.lineChart .thisLoader').removeClass('loading');
                        // $('.community-totals .thisLoader').removeClass('loading');
                        // $('#stats-top-influencers .thisLoader').removeClass('loading');
                        // $('#stats-top-cities .thisLoader').removeClass('loading');
                        // $('#stats-top-tags .thisLoader').removeClass('loading');



                }).failure(function(){
                    alert('#4491: There was an error loading your data.  Please try refreshing the page.');
                    $.canvas.removeClass('loading');
                });

        }  //END CONTACTS FIRST VIEW      
        
    //clicking through on top cities.
    $("#stats-top-cities").on('click','.avatar-box',function(){
        var $this = $(this);
        // var city = $this.attr("city"),
        //     state = $this.attr("state");
        var group_id = $this.attr("group_id");
        var $match_found = $.locations.find("a[group_id='"+group_id+"']:first");
        // var $match_found = false;
        // $matches.each(function(){
        //     if(!$match_found && $.trim($(this).attr("state"))==state){
        //         //match found.
        //         $match_found = $(this);
        //         //return;
        //     }
        // });
        if($match_found.length > 0 ){
            $("#sort-by-location").firstView();
            $.Splash.scrollToObject($.locations,$match_found);
            setTimeout(function(){
                $match_found.click();
            },200);
        } else{
            $("#sort-by-location").firstView();
        }

    });
    ////////////////////// APROPOS: LISTS /////////////////////////
    $.listlist.apropos(window.API_URL('api_lists'))
        .inquire(function (data) {
            /// install new LISTS
            _(data).each(function (val, idx) {
                $.listlist.append(
                   $.Splash.list(val['AddressBookGroup']['name'], val['AddressBookGroup']['id'], val[0]['C']));
                //$.listlist.data(val['AddressBookGroup']['name'].normalize(), val['AddressBookGroup']);
            });
        }, function (opts) {
            /// clear out the existant EVENTSSSS
            $.listlist.find('.list').remove();
        });
    
    ////ADDING NEW LIST
    $.lister
        .on('focusout', function (e) {
            //console.log("adding new list.  here");
            var val = $.trim($.lister.val());
            if (val != '') {
                var $new_list = $.Splash.list(val,0,0,[]).addClass('saving');
                $.listerli.after($new_list);
                $.addNewList.QED({
                    name: val,
                    abc_ids: []
                });
            }
            $.lister.val('');
            $.listerli.hide();
            
        })
        .on('keypress', function (e) {
            if (e.which == 13) {
                $.lister.focusout();
            }
        });
    
    $.lister
        .WRT(window.API_URL('api_edit_list'))
        .inquire(function (data) {

        },function (opts) {
            //console.log('wtf.');
        });
    
    $.addNewList
        .WRT(window.API_URL('api_create_list'))
        .inquire(function (data) {
            //console.log("DATA RECEIVED: ", data);
            //$.listlist.QED({});
            if(typeof data['count']!=='undefined'){
                var $li = $("#list-"+data['id']);
                if($li.length>0){
                    $li.find(".badge").text(data['count']).end()
                       .find("input.list-name").effect('highlight',{color:'#ff2c5e'},300);
                } else {//updating the count on a just-added row via the modal.
                    //sneaky trick.  just replace the placeholder with the new, legit list.
                    var $new_list = $.Splash.list(data['name'],data['id'],data['count'],[]);
                    var $placeholder = $.listlist.find("li.saving:last");
                    $placeholder.replaceWith($new_list);
                    $new_list.effect('highlight',{color:'#ff2c5e'},300);
                }
            } else {
                //sneaky trick.  just replace the placeholder with the new, legit list.
                var $new_list = $.Splash.list(data['name'],data['id'],0,[]);
                var $placeholder = $.listlist.find("li.saving:last");
                $placeholder.replaceWith($new_list);
           } 
        
        }, function (opts) {
            opts.abc_ids = opts.abc_ids.join(',');
            if($.forcereload){
                opts.force = true;
            }
            return opts;
        }).on('click', function() {
            ///////////// ADD A NEW LISSSSST /////////////
            //$.listerli.slideDown('fast').focus();
            $.listerli.show().find("input:first").focus();
        });
  
  $.addNewList.click(function(){
        $("#lister-li").show().find("input:first").focus();
    });
    
    ////////////////////// APROPOS: EVENTS /////////////////////////
    $.events
        .apropos(window.API_URL('api_events'))
        .inquire(
            function (data) {
                /// install new EVENTS
                var event_list = '';
                _(data.results).each(function (val, idx) {
                    event_list+=$.Splash.eventMarkup(val);
                });

                $.events.html(event_list);
                $.secondaryfilter.removeClass('loading');
                if(jumpToEventID != false){
                    var $li = $("#events").find('li[event-id="'+jumpToEventID+'"]');
                    if($li.length > 0){
                        $li.find('a:first').click();
                        jumpToEventID = false;
                    } 
                }
            }, function (opts) {
                $.secondaryfilter.addClass('loading');
                /// clear out the existant EVENTSSSS
                $.events.empty();//find('li').remove();
            }
        ).failure(function () {
            //$("#sort-by-event").parent().addClass('inactive');
            $.secondaryfilter.removeClass('loading');
        });
    
    $('#sort-by-event').on('click', function (e) {
        $('#sort-by-event').firstView();
        $.events.QED({}, function () {
            // window.setTimeout(function () {
            //     $.rooty.defaults({
            //         page: window.page = 1,
            //         method: 'events',
            //     }).QED();
            // }, 5);
        });
    });
    $.events.on('click','li a',function(){
        var $this = $(this);
        var event_name = $.trim($this.find(".label").text()),
            event_id = $.trim($this.parent().attr("event-id").replace(' ',''));

        /// CLASS BASED TRANSITION HOOK
        $this.firstView(true);
        $("#contacts-columns").addClass('loading');
        $("#pane3-title").find("a:first").html('<span>'+event_name+'</span><small><a target="_blank" href="/events/view/'+event_id+'">view</a></small>').end()
            .find(".filtered-total").text($this.find(".badge").text());
        $.rooty.defaults({
            page: window.page = 1,
            method: 'events',
            event_ids: event_id+"",
            text_filter: null,
            tag_ids: null,
            list_ids: null,
            locations: null,
            organizations: null,
        }).QED();
    })
    
    ////////////////////// APROPOS: LOCATIONS /////////////////////////
    $.locations
        //.defaults({ mode: 'state' })
        .apropos(window.API_URL('api_locations'))
        .inquire(function (data) {

            /// install new locations
            var lis = '';
            var x = 0;
            _(data).each(function (val, idx) {
               // console.log(val);
                var name=idx,city,state,group_id=0,count=0,orig;
                if(typeof val.count!=='undefined'){
                    city = val.city;
                    state = val.state;
                    count = val.count;
                    orig = val.orig_name;
                    if(typeof val.group_ids!=='undefined'){
                        //if passing a string of ids, then it's sorting by state and grouping cities together.
                        group_id = val.group_ids.join(',');
                    }


                } else if(typeof val[0]!=='undefined'){

                    if( typeof val[0].location_string!=='undefined'){
                        name = val[0]['location_string'];
                        count = val[0]['C'];
                        if(typeof val['AddressBookContact']!=='undefined'){
                            if(typeof val['AddressBookContact']['city']!=='undefined'){
                                city = val['AddressBookContact']['city'];
                            }
                            if(typeof val['AddressBookContact']['state']!=='undefined'){
                                state = val['AddressBookContact']['state'];
                            }
                        }
                    } else { //city tags
                        city='';
                        state ='city_tag';
                        orig = val['AddressBookGroup']['orig_name']||'';
                        name = val['AddressBookGroup']['name'];
                        group_id = val['AddressBookGroup']['id'];
                        count = val[0]['C'];
                    }
                }
                lis+='<li class="as-written rel"><a group_id="'+group_id+'" orig="'+orig+'" city="'+city+'" state="'+state+'" href="#" class="location-option">'+
                    '<span class="label ellipsis">'+name+'</span>'+
                    '<span class="regular right badge">'+count+'</span></a></li>';
                x++;
            });
            $.locations.empty().html(lis);
            $.secondaryfilter.removeClass('loading');
            $("#locations-custodian").find(".filtered-total").text(x);
            //$("#sort-by-location-count").text(x);
            
            /// return our data to pass to the QED callback
            return data;
        }, function (opts) {
            /// clear out the existant location buttons
            //$.locations.empty();//find('li').remove();
            if(typeof opts.no_load==='undefined' || (typeof opts.no_load!=='undefined' && !opts.no_load)){
                $.secondaryfilter.addClass('loading');
            }
            /// figure out the mode from the dropdown
            // if (!('mode' in opts)) {
            //     var mode = $("#location-filter-hidden").val() || "state";
            //     opts.mode = mode.trim().toLowerCase();
            // }
            return opts;
        }).failure(function(){
            //$("#sort-by-location").parent().addClass('inactive');
            //$("#firstViewLocations").find(".count").html(0);
            $('#sort-by-location-count').removeClass('loading');//.html(0);
            $.secondaryfilter.removeClass('loading');
        });
    

    
    $("#event-locations")
        .apropos(window.API_URL('api_event_locations'))
        .inquire(function (data) {
           populateEventLocations(data['locations']);
        });

    $('#sort-by-location,#view-all-locations').click(function(e){
        /// CLASS BASED TRANSITION HOOK
        $('#sort-by-location').firstView();
        //$.locations.QED({ clear: true }, function () {});
        if(jumpToStateID){
            // if($("#location-filter-hidden").val()!='state'){
            $("#location-filter-hidden").val('state').trigger('change');
            // }
        }
    });

    $.locations.on('click','li a',function(){
        var $this = $(this);
        var location_name = $.trim($this.find(".label").text()),
            list_ids = null,
            //normalized_name = location_name.toString().normalize(),
            method = $("#location-filter-hidden").val();
        if(method=='locations' || method=='state' || method=='city_tag'){
            //special case for city tags
            //location_name = null;
            list_ids = $this.attr("group_id");
        } 

        $("#contacts-columns").addClass('loading');
        $this.firstView(true);
        /// CLASS BASED TRANSITION HOOK
        $("#pane3-title").find("a:first").html('<span>'+location_name+'</span>').end()
            .find(".filtered-total").text($this.find(".badge").text());
    
        $.rooty.defaults({
            page: window.page = 1,
            method: method,
            tag_ids: null,
            event_ids: null,
            text_filter: null,
            list_ids: list_ids,
            organizations: null,
            locations: null//location_name+","+normalized_name
        }).QED();
    });

    $("#sort-by-event-type,#sort-by-collaborator").click(function(){
        $(this).firstView();
    })
    $("#event-types").on('click','li a',function(){

        var $t = $(this);
        var event_type_id = $t.attr("event_type_id");
        $("#contacts-columns").addClass('loading');
        $t.firstView(true);
        var queryDefaults = $.Splash.getQueryDefaults();
        queryDefaults.event_type_ids = event_type_id;

        $("#pane3-title").find("a:first").html('<span>'+$t.find(".label").text()+'</span>')
           .end().find(".filtered-total").text($t.find(".badge").text());

        $.rooty.defaults(queryDefaults).QED({},function(){

        });

    });
    $("#collaborators,#event-locations").on('click','li a',function(){

        var $t = $(this);
        var field = $t.attr("field-name");//either contact_id, abc_id, or group_id.
        $("#contacts-columns").addClass('loading');
        $t.firstView(true);
        $t.parent().addClass('active').siblings().removeClass('active');
        var queryDefaults = $.Splash.getQueryDefaults();
        queryDefaults.field_type = field;
        queryDefaults[field] = $t.attr(field);

        $("#pane3-title").find("a:first").html('<span>'+$t.find(".label").text()+'</span>')
           .end().find(".filtered-total").text($t.find(".badge").text());

        $.rooty.defaults(queryDefaults).QED({},function(){

        });

    });
    
    $.secondaryfilter.find("input.search").keyup(function(){
        var $this = $(this);
        var txt = $this.val();
        var $parent = $this.parents(".custodial:first");
        var $ul = $parent.find("ul.nav-rack:first");
        $parent.find(".empty-results:first").hide();
        clearTimeout(typingTimer);
        typingTimer = setTimeout(
            function(){
                $ul.searchSection(txt,$this);
            }, 
            doneTypingInterval
        );
    });

    $.secondaryfilter.find(".clear-results").click(function(){
        $(this).parent().find("input.search").val('').trigger('keyup');
        $(this).hide();
    });

    $(".empty-results a").click(function(){
        $(this).parent().hide().parents(".custodial")
            .find("input.search").val('').end()
            .find("ul.tier2").find("li").show();
        // $.locations.find("li").show();
    });
    
    $("#pane3-title").on('click',function(){
        var $section = $.Splash.whereAmI();
        if($section.id=='locations-custodian'){
            if(!$("#future-canvas").hasClass('view')){//if we're not currently in view mode,}
                var $li = $("#locations-custodian").find("li.active:first");
                var name = $li.find(".label").text();
                var orig = $li.find("a").attr("orig")||name;
                var group_id = $li.find(".location-option").attr("group_id");
                //if(!isNaN(group_id)){//dont fire if its not a legit group id.
                    var parts = orig.trim().split(",");
  
                    //STATE ONLY
                    if($("#location-filter-hidden").val()=='state'){
                        $("#newGroupCity").val('');
                        $("#newGroupState").val(name);
                        $("#groupMerge").addClass('state-only');
                    } else{ //CITY + STATE
                        $("#groupMerge").removeClass('state-only');
                        $("#newGroupCity").val(parts[0]);
                        if(typeof parts[1]!=='undefined'&&parts[1].trim()!=''){
                            delete(parts[0]);                            
                            $("#newGroupState").val(parts.join('').trim());
                        } else{
                            $("#newGroupState").val('');
                        }
                    }
                    $("#groupMergeIds").val(group_id);
                    //$("#groupMerge").fireSimpleModal();
                    //$("#newGroupCity").val(name).attr("group_id",group_id);
                    //return false;
               // }
            }
        }
        closeMultiView();
    });

    $("#groupMerge").on('click','a.save',function(){
        var $this = $(this);
        var $city = $("#newGroupCity");
        var $state = $("#newGroupState");
        if( $.trim($city.val())=='' && $.trim($state.val())=='' ){
            alert('Please fill out a valid name.');
            if($city.is(":visible")){
                $city.focus();
            } else{
                $state.focus();
            }

            return false;
        }

        if($this.hasClass('in-progress')){
            return false;
        }

        //if( confirm('Are you sure you want to proceed?') ){
            $this.text('Saving..').addClass('in-progress');
            $.ajax({
                url:"/address_book/renameLocation",
                data: { city: $city.val(), state: $state.val(), id: $("#groupMergeIds").val() },
                type: "POST",
                dataType: 'json',
                success:function(response){

                    $this.text('Saved.').removeClass('in-progress');
                    setTimeout(function(){
                        closeSimpleModal();
                        $.rooty.defaults()['force']=true;
                        $this.text('Save');
                        $("#back-to-location").click();
                    },1000);
                },
                error:function(){
                    alert('There was an error saving your changes.  Please try again.');
                    $this.text('Save').removeClass('in-progress');
                }           
            });
        //}
    });
    
    $.organizations.on('click','li a',function(){
        var $this = $(this);
        var organization_name = $.trim($this.find(".label").text());

        /// CLASS BASED TRANSITION HOOK
        $("#pane3-title").find("a:first").html('<span>'+organization_name+'</span>')
           .end().find(".filtered-total").text($this.find(".badge").text());
        $(this).firstView(true);

        $("#contacts-columns").addClass('loading');
        $.rooty.defaults({
            page: window.page = 1,
            method: 'organizations',
            tag_ids: null,
            event_ids: null,
            text_filter: null,
            list_ids: null,
            locations: null,
            organizations: organization_name
        }).QED();
 
        $this.addClass('active').siblings().removeClass('active');   
                     
   });

    ////////////////////// APROPOS: ORGANIZATIONS /////////////////////////
    $.organizations
        .apropos(window.API_URL('api_organizations'))
        .inquire(function (data) {
            /// install new locations
            var midx = 0;
            var orgs = '';
            _(data).each(function (val, idx) {
                orgs+=$.Splash.organization(val);
                midx++;
            });
            $.organizations.append(orgs);
            //.html(event_list);
            // _(data).each(function (val, idx) {
            //     $.organizations.append(
            //         $.Splash.organization(midx, val, val));
            //     midx++;
            // });
            $("#firstViewOrganizations").find(".count").html(""+midx);
            $('#sort-by-organization-count').html(""+midx).removeClass('loading');
            // if(midx==0){
            //     $("#sort-by-organization").parent().addClass('inactive');
            // } else 
            if(midx==1){
                $("#firstViewOrganizations").find(".block").html('Location');
            }
            $.secondaryfilter.removeClass('loading');                 
            
            return data;
        }, function (opts) {
            /// clear out the existant location buttons
            $.organizations.empty();
            $.secondaryfilter.addClass('loading');                 
            
        }).failure(function(){
            $('#sort-by-organization-count').removeClass('loading');
            //$("#sort-by-organization").parent().addClass('inactive');
        });
    
    $('#sort-by-organization').click(function(e){
        $('#sort-by-organization').firstView();
        $.organizations.QED({}, function () {});
    });
    
    ////////////////////// APROPOS: TAGGS /////////////////////////////
    $.tags
        .defaults({
            clear: true,
            visible: true,
            force: false,
            preload: false })
        .omit(['clear', 'visible', 'force', 'preload'])
        .apropos(window.API_URL('api_tags'))
        .inquire(function (data) {
            /// install new tags
            var midx = 0;
            var tag_list = '';
            _(data).each(function (val, idx) {
                tag_list+=$.Splash.tagg(val['AddressBookGroup']['id'], val['AddressBookGroup']['name'], val[0]['C']);
                midx++;
            });

            $.tags.html(tag_list);
            
            $('#sort-by-tag-count').html(""+midx).removeClass('loading');
            $("#firstViewTags").find(".count").html(""+midx);
            $("#tags-custodian").find(".filtered-total").html(""+midx);
            
            // if (midx == 0) {
            //     $("#sort-by-tag").parent().addClass('inactive');
            // } else {
                if (midx == 1) {
                    $("#firstViewTags").find(".block").html('Tag');
                }
                //$("#sort-by-tag").parent().removeClass('inactive');
           // }
            $.secondaryfilter.removeClass('loading');
            
        }, function (opts) {
            if(opts.visible!==false){
                $.secondaryfilter.addClass('loading');
            }        

            /// clear out the existant tag buttons
            $.tags.find('li').remove();

        }).failure(function(){
            //$('#sort-by-tag-count').html(0).removeClass('loading');
            $('#sort-by-tag-count').removeClass('loading');
            
            //$("#sort-by-tag").parent().addClass('inactive');
        });
    
    $('#sort-by-tag,#view-all-tags').click(function (e) {
        /// CLASS BASED TRANSITION HOOK
        $('#sort-by-tag').firstView();
        setTimeout(function(){
            $.tags.QED({},function(){
                if(jumpToTag!==false){
                    var $tag = $.tags.find("a[tag-id='"+jumpToTag+"']:first");
                    if($tag.length){
                        $.Splash.scrollToObject($.tags,$tag);
                        $tag.click();
                    }
                    jumpToTag = false;
                }  
            });
        },10);
    });

    $.tags.on('click','li a',function(e){
        var $this = $(this);
        var tag_name = $this.find(".label").text(),
            tag_id = $this.attr("tag-id");

        $this.firstView(true);
        $("#pane3-title").find("a:first").html('<span>'+tag_name+'</span>').end()
            .find(".filtered-total").text($this.find(".badge").text())
        
        $("#contacts-columns").addClass('loading');
        $.rooty.defaults({
            page: window.page = 1,
            method: 'tags',
            //tag_ids: tag_id+"",
            text_filter: null,
            event_ids: null,
            list_ids: tag_id+"",
            locations: null,
            organizations: null,
        }).QED();
    });

    $('#sort-by-industry').on('click', function (e) {
        /// CLASS BASED TRANSITION HOOK
        $(this).firstView();
        setTimeout(function(){
            $.industry.QED();
        },10);
    });
    
    ////////////////////// APROPOS: ROOTY (THE CONTACTS) ///////////////
    $('#sort-by-contact').click(function (e) {
        /// CLASS BASED TRANSITION HOOK
        $(this).firstView();
        $.vessel.addClass('loading');
        clearAllFilters();
        setTimeout(function(){
            $.rooty.defaults({
                page: window.page = 1,
                limit: 50,
                sort_by: 'alphabet',
                text_filter: '',
                tag_ids: null,
                event_ids: null,
                list_ids: null,
                locations: null,
                organizations: null,
                start_date: null,
                end_date: null,
                filters: null,
                vip: null,
                visible: true,
                force: false,
                preload: false,
                method: 'all',
                clear: true,
                export_fields:[],
                abc_ids:[]
            }).QED({},function(){
                if(jumpToSearch){
                    $("#search-addressbook").focus();
                    jumpToSearch = false;
                }
            });
        },10);
    });

    $("#events-link").click(function(){//default to event index sort if on events link.
        $("#event-index-sort").click();
    });
    $('#event-index-sort').click(function (e) {
        /// CLASS BASED TRANSITION HOOK
        $(this).firstView();
        $.vessel.addClass('loading');
        clearAllFilters();
        setTimeout(function(){
            var queryDefaults = $.Splash.getQueryDefaults();
            $.rooty.defaults(queryDefaults).QED({},function(){
                if(jumpToSearch){
                    $("#search-addressbook").focus();
                    jumpToSearch = false;
                }
            });
        },10);
    });


    //quick jump from home page to filter by influencers.
    $("#view-all-influencers").click(function(e){
        $('#sort-by-contact').firstView();
        $.vessel.addClass('loading');
        //flip the filter to influence (instead of a-z).
        //$("#filter-sorter-hidden").val('influence').trigger('change');
        flipDropDown($("#filter-sorter-hidden").parents(".nu-dropdown:first"),'influence');   
        $.selectall.val(0).parent().removeClass('checked');
        massSelect=false;

        setTimeout(function(){
            $.rooty.defaults({
                page: window.page = 1,
                method: 'all',
                clear: true,
                sort_by: 'influence'
            }).QED();
        },10);
    });

    $.rooty.scroll(function(){
        $.Splash.scroll_check();
    });

    $.contactview.on('click',".vip-trigger",function(){
        var update_data = {};
        var $this = $(this).find('.vip-star');
        var raw_bg_color = $.contactview.css('background-color').rawRGB();

        var $contact = getCurrentContact();
        if($contact.length > 0){

            update_data['id'] = $contact.data('contact_id');//id;
            if( $this.hasClass('vip-set') ) {
                $this.removeClass('vip-set');
                $.contactview.find(".vip-star").css('color','#999999');
                update_data['vip'] = 0;
                $contact.find(".vip-star").hide();
            } else {
                $this.addClass('vip-set');
                $.contactview.find(".vip-star").css('color',raw_bg_color);
                update_data['vip'] = 1;
                $contact.find(".vip-star").show();
            }

            //$.contactview.data('profile'+contact_id, update_data);
            if(typeof $contact.data('hashKey')!=='undefined'){
                var key = $contact.data('hashKey');
                var $contact_object = $contact.data()[key];
                $contact_object['vip'] = update_data['vip'];
            }

            $.contactview.data('vip'+update_data['id'],update_data['vip']);

            //console.log(update_data);
            $.Splash.update_contact(update_data['id'], update_data, function(){});
        }
    });
    
    $("#community-link").click(function (e) {
        if($(this).hasClass('reload')){
            clearChart(true);
            $.Splash.recount();
            $(this).removeClass('reload');
        }
        clearAllFilters();
        $.contactview.fadeOut();
        $.viewnav.hide();
        $.multicontactview.fadeOut();
        $("#top-level-filters").find("li.active").removeClass('active');
        $.listlist.find("li.active").removeClass('active');
        $.canvas.removeClass("primary secondary view").addClass('home');
        $("#stats-box").scrollTop(0);
    });

    if(typeof constants.eventIndex!=='undefined'){
        //EVENT INDEX ROOTY CALL.
        $.rooty
            .defaults($.Splash.getQueryDefaults())
            .apropos(window.API_URL('event_api_search'))
            .inquire(function (data) {
              
                /// install new locations
                var lis = '';
                var x = 0;
                if(typeof data['results']=='undefined' || data['results'].length < 1){
                    $("#loadingMore").attr("no-more-results",'1');
                } else{
                    $("#loadingMore").attr("no-more-results",false);
                }

                /// ignore scroll events. important to put after no-more-results check.
                $.Splash.scroll_ignore();

                /// update pagination
                window.page = parseInt(""+data.page) + 1;
                    // console.log("PAGE "+data.page);
                    // console.log("RESULT COUNT "+data[$.model].length);
                    // console.log("dataum ",data);   
                /// append new contact rows
                for(var i = 0;i<data['results'].length;i++){
                
                    //console.log("DATA ",data[i]);
                    $eventCard = $.Splash.eventCard(data['results'][i]);
                    //console.log("contat?",$contact);
                    if ($eventCard) {
                        var hsh = $eventCard.hash();
                        if (!_($.contacthashes).contains(hsh)) {
                            $.contacthashes.push(hsh);
                            $.rooty.append($eventCard);
                        }
                    } 
                    // else {
                    //     console.log('Skipped empty (false) contact: idx = ', idx);
                    // }
                }//end for loop.
                
                /// unveil (lazy-load) the new avatars
                $.rooty.find('img.not-yet-unveiled')
                    .removeClass('not-yet-unveiled')
                    .unveil(128);
                
                /// un-trigger spinner
                $.vessel.removeClass('loading');
                $("#contacts-columns").removeClass('loading');

               // $.locations.empty().html(lis);
                $.secondaryfilter.removeClass('loading');
                //$("#locations-custodian").find(".filtered-total").text(x);
                //$("#sort-by-location-count").text(x);
                
                /// return our data to pass to the QED callback
                return data;
            }, function (opts) {
                if (opts.clear === true) {
                    $.canvas.removeClass('view');
                    $.rooty.empty();
                    $.contacthashes = [];
                    $.firstletters = [];
                }

                return opts;
            }).failure(function(){
                //$("#sort-by-location").parent().addClass('inactive');
                //$("#firstViewLocations").find(".count").html(0);
                $('#sort-by-location-count').removeClass('loading');//.html(0);
                $.secondaryfilter.removeClass('loading');
            });        
    } else {
        //ADDRESS BOOK ROOTY CALL.
        $.rooty
            .defaults({
                method: 'all',
                limit: 50,
                page: 1,
                sort_by: 'alphabet',
                text_filter: '',
                tag_ids: null,
                event_ids: null,
                event_filters: null,
                list_ids: null,
                locations: null,
                organizations: null,
                start_date: null,
                end_date: null,
                filters: null,
                clear: true,
                vip: null,
                visible: true,
                force: false,
                preload: false })
            .omit(['clear', 'visible', 'force', 'preload'])
            .apropos($.Splash.API_SEARCH)
            .inquire(function (data, _key, fresh_fetch) {
                var initial_contact_hash_count = $.contacthashes.length;
                //var result_hash = $.hash($.rooty.defaults());

                //this check will make it so that we stop paginating after no more results are returned.
                if(typeof data[$.model]=='undefined' || data[$.model].length < 1){
                    $("#loadingMore").attr("no-more-results",'1');
                } else{
                    $("#loadingMore").attr("no-more-results",false);
                }

                /// ignore scroll events. important to put after no-more-results check.
                $.Splash.scroll_ignore();

                /// update pagination
                window.page = parseInt(""+data.page) + 1;
                    // console.log("PAGE "+data.page);
                    // console.log("RESULT COUNT "+data[$.model].length);
                    // console.log("dataum ",data);   
                /// append new contact rows
                $.each(data[$.model], function (idx, val) {
                    var keys = _(val).keys(),
                        badge='', $contact;
                    
                    if ($.rooty.defaults('sort_by') == 'influence') {
                        var tw = parseInt(val[$.model].twitter_followers,10),
                            inst = parseInt(val[$.model].instagram_followers,10);
                        if(tw > 0 && typeof tw!=='undefined'){
                            badge = '<span class="tw"><i class="ico-twitter-dk"></i>'+addCommas(tw)+'</span>';
                        }
                        if(inst > 0){
                            badge += '<span class="inst"><i class="ico-instagram-dk"></i>'+addCommas(inst)+'</span>';
                        }
                    } else if ($.rooty.defaults('method') == 'twitter') {
                        var tw = parseInt(val[$.model].twitter_followers,10),
                        badge = '<span class="tw">'+addCommas(tw)+'</span>';
                    } else if ($.rooty.defaults('method') == 'instagram') {
                        var tw = parseInt(val[$.model].instagram_followers,10),
                        badge = '<span class="inst">'+addCommas(inst)+'</span>';
                    } else if ($.rooty.defaults('sort_by')=='created'){
                        var dateObj = parseDatetime(val[$.model]['createdate']);
                        if(dateObj!==false){
                            var date_string = $.datepicker.formatDate('mm/dd/y',dateObj), // date display
                                time_string = formatTime(dateObj);
                            //var time_start = dateObj.getTime();
                            badge = '<span class="date">'+date_string+' '+time_string+'</span>';
                        }
                    }

                    $contact = $.Splash.contact(
                        val[$.model],
                        _key,
                        keys.indexOf($.group_model) ? val[$.group_model] : null,
                        keys.indexOf($.avatar_model) ? val[$.avatar_model] : null,
                        badge);
                    
                    if ($contact) {
                        var hsh = $contact.hash();
                        if (!_($.contacthashes).contains(hsh)) {
                            $.contacthashes.push(hsh);
                            $.rooty.append($contact);
                        }
                    } 
                    // else {
                    //     console.log('Skipped empty (false) contact: idx = ', idx);
                    // }
                });
                
                /// unveil (lazy-load) the new avatars
                $.rooty.find('img.not-yet-unveiled')
                    .removeClass('not-yet-unveiled')
                    .unveil(128);
                
                /// un-trigger spinner
                $.vessel.removeClass('loading');
                $("#contacts-columns").removeClass('loading');
                if ($.rooty.defaults('event_ids') != '' && $.rooty.defaults('event_filters')==null && typeof data['questions']!=='undefined'){
                    var event_ids = $.rooty.defaults('event_ids') ? $.rooty.defaults('event_ids').split(',') : [];
                    var questions = [];
                    var $q = $("#advanced-questions").find(".question-list");
                    $q.empty();
                    _(event_ids).each(function (val, idx) {
                        if(typeof data['questions'][event_ids[idx]] !== 'undefined' && data['questions'][event_ids[idx]] != '') {
                            _(data['questions'][event_ids[idx]]).each(function(val, idx) {
                                $q.append($.Splash.customQuestion(val));
                            });
                        }
                    });
                    if($q.find(".question").length > 0){
                        $("#advanced-questions").show();
                    } else{
                        $("#advanced-questions").hide();
                    }

                    setTimeout(function(){
                        $.rooty.defaults({ event_filters: null });
                    },10);

                }
                
                if($.rooty.find(".contact-card").length < 1){
                    //if the count in here is 0.
                    var text_search = false;
                    if(data.text_filter!='' && typeof data.text_filter!=='undefined'){
                        var term = 'No results found for <span class="hl mr10">&nbsp;'+data.text_filter+'.&nbsp;</span><br/><br/>';
                        text_search = true;                    
                    } else{
                        var term = 'No results found.&nbsp;';
                    }
                    $.rooty.html(
                        $.new('div').addClass('grp p1 no-results txtC rel z1 bigger em05').html(term)
                            .append(
                                $.new('a')
                                    .prop("href","#")
                                    .addClass('clear-results nu-btn clean m')
                                    .html('Clear search')
                                    .on('click',function(){
                                        if(text_search){
                                            $.textsearch.val('');
                                            $.rooty.defaults({ text_filter: '', clear: true }).QED();
                                        } else{
                                            $("#clear-advanced-filters").click();    
                                        }
                                    })
                            )
                    )
                }


     
                if($.rooty.defaults('text_filter')!=''){
                    $("#contacts-columns").removeClass('loading');
                    var term = $.rooty.defaults('text_filter');
                    $.rooty.find(".contact-card").each(function(){
                        var $this=$(this);
                        var $n = $this.find("li.name");
                        highlightMatches($n,term,true);                                 
                    }); 
                }

                if(jumpToProfile!==false && jumpToProfile>0){
                   var $contact = getCurrentContact(jumpToProfile);
                   $contact.find("a:first").click();
                   jumpToProfile = false;
                }

                
            },
            
            function (opts) {
                //Doesn't work :( 
                //set the global hash as an identifier to the current call.  
                //This is to prevent concurrent calls populating data in the wrong place.
                // global_hash = $.hash(opts);

                /// trigger spinner
               
                // console.log("DEFAULTS ",$.rooty.defaults());
                if(opts.page <= 1){
                    if( ($.rooty.defaults('text_filter')!='' && $.rooty.defaults('text_filter')!==null)
                        || ($.rooty.defaults('sort_by')!='' && $.rooty.defaults('sort_by')!==null))
                    {
                        $("#contacts-columns").addClass('loading');
                    } else if (opts.visible !== false) {
                        $.vessel.addClass('loading');
                    }
                }
                //clear the contact ids prior to the load.
                $.contactIds = [];
                
                /// clear if we want it clear
                if (opts.clear === true) {
                    $.canvas.removeClass('view');
                    $.rooty.empty();
                    $.contacthashes = [];
                    $.firstletters = [];
                }
                
            }).failure(function(url_key,options){
                //alert('#3059: There was an error processing your request.');
                $.vessel.removeClass('loading');
                $("#contacts-columns").removeClass('loading');
                
                $('#all-contacts-count').removeClass('loading');
                $("#loadingMore").attr("no-more-results",false).hide();
                $.rooty.attr("loading",false);

            });
    }//END ADDRESS BOOK ROOTY DEFAULTS        
    
    ////////////////////// APROPOS: TAGGGGGGS /////////////////////////
    $.taggs
        .WRT(window.API_URL('api_create_tag'))
        .inquire(function (data) {}, function (opts) {});

    /// SET UP TAGG INPUT
    $.taggs.tagsInput({ 
        width: 'auto',
        onAddTag: function (tag) {
            var bg_color = $.contactview.css('background-color')
            var contact_id = $.contactview.data('contact_id');
            $.contactview.data('tags'+contact_id,$(this).val());
            $("#taggs_tagsinput").find("span.tag").css('background-color',bg_color);
            $.taggs.QED({ tag_names: tag, abc_ids: contact_id }, function() {
                $.tags.defaults({ visible: false, clear: false, force: true }).QED();
            });    
        },
        onRemoveTag: function (tag) {
            var bg_color = $.contactview.css('background-color')
            var contact_id = $.contactview.data('contact_id');
            $.contactview.data('tags'+contact_id,$(this).val());
            $("#taggs_tagsinput").find("span.tag").css('background-color',bg_color);
            $.taggs.QED({ deleted: true, tag_names: tag, abc_ids: contact_id }, function() {
                //var opts = $.tags.defaults({ clear: true, force: $.forcereload });
                $.tags.defaults({ visible: false, clear: false, force: true }).QED();
           }); 
        }
    });

    ////////////////////// APROPOS: TAGGGGGGS /////////////////////////
    $.cities
        .WRT(window.API_URL('api_create_tag'))
        .inquire(function (data) {}, function (opts) {});

    //deleting a city.
    $("#city-wrap").on('click','a.delete-tag',function(e){
        e.preventDefault();
        var $tag = $(this).parents(".tag");
        var group_id = $tag.attr("group-id");
        var contact_id = $.contactview.data('contact_id');
        var params = { deleted: true, abc_ids: contact_id };
        if(group_id>0){
            params.group_id = group_id;
        } else{
            params.city = $tag.find(".name").text();
        }

        $tag.remove();
        var city_tags = [];
        $.cities.find(".tag").each(function(){
            city_tags.push({ id: $(this).attr("group-id"), name: $(this).find(".name").text() });
        })
        $.contactview.data('city_tags'+contact_id,city_tags);
        $.cities.QED(params, function() {
            $.locations.QED({ mode: $("#location-filter-hidden").val(), visible: true, force: true });
        });

        $("#community-link").addClass('reload');

        //var $location = $.locations.find("a[group_id="+group_id+"]");
        return false;
    });
    $("#city-wrap").on('click','.tag',function(){
        var group_id = $(this).attr("group-id");
        var $location = $.locations.find("a[group_id='"+group_id+"']:first");
        if($location.length > 0){//fire the event if clicking into locaiton.
            $location.click();
        }
    });

    $("#bulkTagInput").tagsInput({});
    
    /// SELECT-ALLER
    $.selectall.on('change', function () {
        if($(this).parent().hasClass('checked')){
            $.rooty.find('input.contact-checkbox').each(function(){
               $(this).val('1').parent().addClass('checked').parents('.contact-card:first').addClass('selected');
            });
        } else {
           $.rooty.find('input.contact-checkbox').each(function(){
                $(this).val(0).parent().removeClass('checked').parents('.contact-card:first').removeClass('active selected');
           });
        }
        selectedContactCallback();
    });

    //UNSELECT-ALL..er?
    $("#unselectContacts").click(function(){
        massSelect = false;
        $.rooty.find(".contact-card.selected").each(function(){
            $(this).removeClass('active selected').find(".checked").removeClass('checked').find(".contact-checkbox").val(0);
        });
        $.selectall.val(0).parent().removeClass('checked');
        selectedContactCallback();
    });
    
    /// nu filter-sorter
    $.filtersorterhidden.on('change', function () {
        $.rooty.defaults({ sort_by: this.value, clear: true }).QED();
        $.selectall.val(0).parent().removeClass('checked');
        massSelect=false;
    });

    $.canvas.removeClass("primary secondary view").addClass('canvas home');
    
    //////////// ADDING TO LIST FUNCTIONALITY //////////////////
    $("#add-to-list-btn,#single-add-to-list").click(function(){
        $("#bulk-actions").hide();

        //repopulate the dropdown of User lists on the fly so we have the most up to date info. 
        var list_html = '<div class="option" value="0">New List</div>';
        var $current_lists = $.listlist.find("li.list");
        $current_lists.each(function(){
            var $this = $(this);
            var opts = { list_id:$.trim($this.find("a").attr("list-id")), val: $this.find("input.list-name").val(), count: $this.find("span.badge:first").text() };
            list_html += '<div class="option" value="'+opts.list_id+'">'+opts.val+'<span class="count right">('+opts.count+')</span></div>';
        });
        var $dd = $("#list-of-lists").find(".nu-dropdown");
        $dd.find(".current").text('Select List').end()
            .find(".options").html(list_html);
        bindSplashDropdown($dd,false,true);
        if($current_lists.length < 1){
            $dd.find(".current").text('New List');
            $("#inner-list-id").val('0').change();
        }

        //pull through the count of selected contacts.  It's the right thing to do.
        if(massSelect){
            var section = $.Splash.whereAmI();
            var selected = section.count;
        } else{
            var selected = $.Splash.selectedContacts().length;
        }
        $("#bulkAddToList").find(".bulkAddListCount").text('('+selected+')');
        $("#bulkAddToList").fireSimpleModal();
        return false;
    });
    ////////////END ADDING TO LIST FUNCTIONALITY//////////////////
    
    ///////deleting contacts functionality///////
    $("#single-remove-contact,#bulk-remove-contacts").click(function(){
        $("#confirmRemove").fireSimpleModal();
        if(massSelect){
            var section = $.Splash.whereAmI();
            var count = section.count;
        } else{
            var ids = $.Splash.selectedContacts();
            var count = ids.length;
        }
  
        if(count!=1){
            $("#removeCount").text(count+' contacts.');
        } else{
            $("#removeCount").text(count+' contact.');
        }
        return false;
    });
    $("#confirmRemove").on('click','a.save',function(){
        var ids = $.Splash.selectedContacts();
        var opts = { abc_ids: ids.join(','), deleted: true };
        if(massSelect){
            opts.massSelect = true;
            opts.defaults = $.rooty.defaults();
        }
        $("#confirmRemove").QED(opts);
        closeSimpleModal();
    });

    $("#inner-list-id").change(function(){
        if($(this).val()=='0'){  //check for adding a NEW LIST.
           $("#newListName").fadeIn(300,function(){
               $(this).val('').focus(); 
           });
        } else{
           $("#newListName").hide(); 
        }
    });

    $("#newListName").on('keyup',function(e){
        if(e.keyCode==13){
            $(this).parents(".simple-modal").find(".save").click();
        }
    });
  
    $("#bulkAddToList").on('click','a.save',function(){
        var list_id = $("#inner-list-id").val();
        var ids = $.Splash.selectedContacts();
        $.forcereload = true;
        var params = { name: '', list_id: list_id, abc_ids: ids, visible: true, force: $.forcereload }

        if(massSelect){
            params.massSelect = true;
            var section = $.Splash.whereAmI();
            params.defaults = $.rooty.defaults();//get the current search params so we know what to get.
        }
        if(list_id==''){
            alert('Please select a valid list');
            return false;
        } else if(list_id == 0){
            params.name = $.trim($("#newListName").val());
            if(params.name==''){
                alert('Please enter a valid list name.');
                $("#newListName").focus();
                return false;
            }
            //reset things to their natural state.
            $("#newListName").val('').hide();
            $("#inner-list-id").val('');
            $("#list-of-lists").find(".current").text('Select List').end().find(".active").removeClass('active');

            var $new_list = $.Splash.list(params.name,0,0,[]).addClass('saving');
            $.listerli.after($new_list);
            $new_list.effect('highlight',{color:'#ff2c5e'},300);
            $.addNewList.QED(params,function(){
                $.forcereload = false;
            });
        } else {
            $.addNewList.QED(params,function(){
                $.forcereload = false;
            });
        }
        
        $("#inner-list-id").val(0);
         closeMultiView();
        closeSimpleModal();
    });
    
    $("#import-rows").on('click', function () {
        $.Splash.import_upload_phasetwo();
    });
    
    $.phasetwo
        .WRT(window.API_URL('api_import_upload_phasetwo'))
        .inquire(
            function (data) {
                //alert("IMPORT COMPLETE");
                //console.log(data);
                $("#add-import").removeClass('loading');
                $("#import-csv-results").hide();
                $("#import-csv-success").show();
                $("#csv-abc-created").text(data.created);    
                $("#csv-abc-updated").text(data.updated);    
                $("#csv-abc-skipped").text(data.skipped);    
                updateContactCount();
            }, function (opts) {
                $("#add-import").addClass('loading');
                return opts;
            })
        .failure(
            function () {
                alert("#4081: There was an error importing your contacts.  Please try again");
                $("#add-import").removeClass('loading');
            });
    
    $("a.close-modal, a.cancel").click(function () {
        $("#import-csv-success").hide();
        $("#import-csv-results").show();
        $("#import-p1").show();
        $("#import-p2").hide();

        if ($.phasetwo.is(':visible') && $("#import-csv-results").is(":visible")) {
            var confirm = confirm(
                "YOU HAVEN'T FINISHED YOUR IMPORT! We've received the file you uploaded, \
                    but we need your help for one quick last step. You're that much closer \
                    to full-address-book bliss; show us what goes where and you'll be good to go. \
                    Hit 'cancel' below if your wish to stop is a sincere one.".replace(/[\n\s]+/g, " ")
            );
            if(confirm){
                closeSimpleModal();
            }
        } else{
            closeSimpleModal();
        }
    });

    ////////////ADDING TAGS FUNCTIONALITY//////////////////
    $("#add-tags-btn").click(function(){
        var selected = $.Splash.selectedContacts().length;
        if(massSelect){
            var section = $.Splash.whereAmI();
            var selected = section.count;
        }
        $("#bulkAddTags").fireSimpleModal();
        $("#bulkAddTags").find(".bulkAddListCount").text('('+selected+')');
        return false;
    });
    
    $("#bulkAddTags").on('click','a.save',function(){
        var ids = $.Splash.selectedContacts();
        var opts = { tag_names: $("#bulkTagInput").val(), abc_ids: ids.join(',') };
        if(massSelect){
            opts.massSelect = true;
            opts.defaults = $.rooty.defaults();//get the current search params so we know what to get.
        }

        $.taggs.QED(opts, function(){
            $.forcereload = true;
            $.tags.QED({ force: $.forcereload }, function () { $.forcereload = false });
        });

        closeSimpleModal();
        $("#bulkTagInput").importTags('');
        closeMultiView();
    });
    ////////////END ADDING TAGS FUNCTIONALITY///////////

    //inline export
    $("#export-btn").on('click', function () {
        var d = new Date(),
            $selected = $.rooty.find(".contact-card.selected");
        if(massSelect){
            var section = $.Splash.whereAmI();
            var count = section.count;
        } else{
            var count = $selected.length;
        }
        var noun = (count!=1)?'Contacts':'Contact';
        $.howmanytoexport.text(count+' '+noun).show();
        $("#export-dropdown").hide();
        $.exportfilename.val("contacts-" + d.getUTCFullYear() + d.getCalendarMonth() + d.getUTCDate() + ".csv");
        $("#bulkExport").fireSimpleModal();
        return false;
    });
    

    //sending from the main index on address book. 
    $("#top-level-export").click(function(){
        var d = new Date();
        massSelect = true;
        var count = $("#all-contacts-count").text();    
        $.howmanytoexport.text(""+count).hide();
        $("#export-dropdown").show();
        $.exportfilename.val("contacts-" + d.getUTCFullYear() + d.getCalendarMonth() + d.getUTCDate() + ".csv");
        $("#bulkExport").fireSimpleModal(); 
        return false;
    });

    //adding merge button
    $("#merge-btn").on('click', function () {
        var $selected = $.Splash.selectedContacts();
        $("#how-many-to-merge,#how-many-to-merge-2").text($selected.length);
        $("#bulkMerge").fireSimpleModal();
        return false;
    });
    
    $("#do-merge").click(function(){
        var $this = $(this);
        if($this.hasClass('in-progress')){
            return false;//prevent dblclick.
        }
        $this.addClass('in-progress').text('Saving..');
        $.ajax({
            url:"/address_book/mergeContacts",
            data: { ids: $.Splash.selectedContacts() },
            type: "POST",
            dataType: 'json',
            success:function(response){
                console.log("Response ",response);

                $this.removeClass('in-progress').text('Save');
                closeSimpleModal();
                jumpToProfile = response.primary_id*1;
                if(typeof contactHistoryCache[jumpToProfile]!=='undefined'){
                    delete(contactHistoryCache[jumpToProfile]);//remove this peron's cached history.  
                }
                $.rooty.QED({ force: true });
                setFlash(response.msg,'success');
                if(typeof response.contact_count!=='undefined'){
                    var contactcount = addCommas(response.contact_count);
                    $('#all-contacts-count,#total-community').html(contactcount);
                    $("#pane3-title").find(".filtered-total").text(contactcount);
                }
            },
            error:function(response){
                $this.removeClass('in-progress').text('Save');
                closeSimpleModal();
                setFlash('There was an error merging your contacts.','error');
            }
        })

    });

    $("#contacts-search-jump").click(function(){
        jumpToSearch=true;
        $("#sort-by-contact").click();
    });

    $.exportfilename.keyup(function(e){ //submit on enter.
        if(e.keyCode==13){
            $("#do-export").click();
        }
    });
    
    $("#toggle-filters").click(function(){
        toggleFilters();
    });

    $("#advanced-search .close").click(function(){
        toggleFilters(true);
    });


    $("#do-export").on('click', function () {
        var type = $("#export-list-type").val();
        if($.trim($.exportfilename.val())==''){
            $.exportfilename.val(type+"-contacts-" + d.getUTCFullYear() + d.getCalendarMonth() + d.getUTCDate() + ".csv");
        }

        window.location.href = $.Splash.export_url($.exportfilename.val());
        window.setTimeout(function () {
            closeSimpleModal();
            closeMultiView();
        }, 10);

    });
    
    $("#cancel-export").on('click', function () {
        closeSimpleModal();
    });
    
    $("#add-import .import-opt").click(function(){
        if(!($(this).hasClass('active'))){//only toggle if it's not already active.
            $(this).addClass('active').siblings().removeClass('active').end()
                .parents(".import-p1").find(".import-div:visible").hide().siblings().show();
        }
    });

    $("#add-new-btn,#add-new-community").on('click', function () {
        $('.import-p0').show();
        $('.import-p1').hide();
        $.phasetwo.hide();
        $(".quick-add").hide();
        $('#add-import').fireSimpleModal();
        return false;
    });

    $("#edit-btn").click(function () {
        $.edit_contact.fireSimpleModal();
        $.edit_contact.find("input.nu-input").val('');

        var profile = { 
            name: ''+$.trim($("#vc-name").text()),
            email: ''+$.trim($("#vc-primary_email .content").text()),
            street: ''+$.trim($("#vc-street .content").text()),
            state: ''+$.trim($("#vc-state .content").text()),
            city: ''+$.trim($("#vc-city .content").text()),
            zip: ''+$.trim($("#vc-zip .content").text()),
            phone: ''+$.trim($("#vc-phone .content").text()),
            birthday: ''+$.trim($("#vc-birthday .content").text()),
            organization: ''+$.trim($("#vc-organization .content").text()),
            title: ''+$.trim($("#vc-title .content").text()),
            website: ''+$.trim($("#vc-website .content").text())
        }

        $("#vc-name-edit").val(profile.name);
        $("#vc-primary_email-edit").val(profile.email);
        $("#vc-street-edit").val(profile.street);
        $("#vc-state-edit").val(profile.state);
        $("#vc-city-edit").val(profile.city);
        $("#vc-zip-edit").val(profile.zip);
        $("#vc-phone-edit").val(profile.phone);
        $("#vc-organization-edit").val(profile.organization);
        $("#vc-website-edit").val(profile.website);
        $("#vc-title-edit").val(profile.title);
        $("#vc-birthday-edit").val(profile.birthday);
        
        return false;
        //$("#vc-location-edit").val($.trim($("#vc-location .content").text()));

    });

    $("#edit-contact").on('keydown','input.nu-input',function(e){
        //on enter, tab through the quick add form.
        if(e.keyCode==13){
            //all inputs in this form.
            var inputs = $("#edit-contact").eq(0).find(":input");
            //get the index of the current input.
            var idx = inputs.index(this);

            //if it's the last input, submit.
            if (idx == inputs.length - 1) {
                $("#edit-contact").find("a.save").click();
            } else {
               //otherwise find the next visible input (if applicable) and focus. otherwise, submit.
                var $next = $(inputs[idx+1]);
                if($next.length > 0 && $next.is(":visible")){
                    inputs[idx + 1].focus(); //  handles submit buttons
                } else{
                    $("#edit-contact").find("a.save").click();
                }

            }
        }
    });

    $("#edit-contact").on('click','a.save',function(){
        var $this = $(this);
        $this.text('Saving...');
        var update_data = {};
        var name = $("#vc-name-edit").val().split(' ');

        var contact_id = $.contactview.data('contact_id');
        var $contact = getCurrentContact();
        update_data['first_name'] = name[0];
        if(typeof name[1]!=='undefined'){
            delete name[0];
            update_data['last_name'] = $.trim(name.join(' '));
        } else{
            update_data['last_name'] = '';
        }
        //console.log(update_data['last_name']);
        update_data['primary_email'] = $.trim($("#vc-primary_email-edit").val());
        // if(update_data['primary_email']=='' || update_data['']){
        //     $("#vc-primary_email-edit").focus()
        //     $this.text('Save');
        //     alert('Email address is required.');
        //     return false;
        // }
        //now just loop through the rest of the fields to get and set.
        $.edit_contact.find(".nu-input").each(function(){
            if(typeof $(this).attr("field")!=='undefined'){
                update_data[$(this).attr("field")] = $(this).val();
            }
            $(this).val('');
        });

        //$.contactview.data('profile'+contact_id, update_data);
        if(typeof $contact.data('hashKey')!=='undefined'){
            var key = $contact.data('hashKey');
            var $contact_object = $contact.data(key);
            for(var x in update_data){
                if($contact.data(key)[x]!=='undefined'){
                    $contact.data(key)[x] = update_data[x];
                }
            }
            populateContactProfile($contact.data(key),$contact);

        }

        $this.text('Save');

        closeSimpleModal();
        var abc_id = getCurrentContact().data('contact_id');

        //$contact.find("a").click();
        //console.log(update_data);
        $.Splash.update_contact(abc_id, update_data, function(){
            setFlash('Changes saved.','success');
            $this.text('Save');

        
            //closeMultiView();
            //$.contactview.QED({ id: $.contactview.data('contact_id'), force: true });
        });
    });
    
    $("#quick-add").click(function () {
        $("#add-import").addClass('l2');
        $('.import-p0').hide();
        $(".quick-add").show();
        $('#quick-add-name').focus();
    });
    $("#quick-add-cancel").click(function () {
        $(".quick-add").hide();
    });
    $("#robust-details").click(function(){
        $(this).hide().parent().find(".robusto").fadeIn('fast',function(){
            $(this).find("input:first").focus();
        });
    });

    $("#add-import").on('click','.addAnotherList',function(){
        console.log("adoiajsd ");
        $("#backToAdder").click();
    });

    $("#quick-add-fields").on('keydown',".quick-add input.nu-input",function(e){
        //on enter, tab through the quick add form.
        if(e.keyCode==13){
            //all inputs in this form.
            var inputs = $("#quick-add-fields").eq(0).find(":input");
            //get the index of the current input.
            var idx = inputs.index(this);

            //if it's the last input, submit.
            if (idx == inputs.length - 1) {
                $("#quick-add-save").click();
            } else {
               //otherwise find the next visible input (if applicable) and focus. otherwise, submit.
                var $next = $(inputs[idx+1]);
                if($next.length > 0 && $next.is(":visible")){
                    inputs[idx + 1].focus(); //  handles submit buttons
                } else{
                    $("#quick-add-save").click();//submit.
                }

            }
        } else if(e.keyCode==9){ 
            //if pressing tab and robust contact details are not visible, show them.
            if($(this).prop("id")=='quick-add-email'){
                if($("#robust-details").is(":visible")){
                    $("#robust-details").click();
                    return false;
                }
            }
        }
    });

    $("#quick-add-save").click(function(){
        var $this = $(this);
        var update_data = {};
        var full_name = $.trim($("#quick-add-name").val());
        var name = full_name.split(' ');
        var invalid_email = false;

        update_data['first_name'] = name[0];
        if (typeof name[1]!=='undefined') {
            delete name[0];
            update_data['last_name'] = $.trim(name.join(' '));
        } else{
            update_data['last_name']='';
        }

        //now just loop through the rest of the fields to get and set.
        $("#quick-add-fields").find(".nu-input").each(function(){
            if(typeof $(this).attr("field")!=='undefined'){
                update_data[$(this).attr("field")] = $(this).val();
            }
        });
        
        update_data['primary_email'] = $.trim($("#quick-add-email").val());

        if(!isValidEmail(update_data['primary_email'])){
            var invalid_email = true;
        }
        // update_data['phone'] = $("#quick-add-phone").val();
        // update_data['organization'] = $("#quick-add-organization").val();
        if($.trim($("#quick-add-name").val())=='' && invalid_email){
            alert('Please fill out a valid name or email address email.');
            $("#quick-add-email").focus();
            return false;
        } else{
            if(!invalid_email){
                var primary_identifier = update_data['primary_email'];
            } else{
                var primary_identifier = full_name;
            }
        }
        
        $this.text('Saving..');
        jumpToNewContact = true;//setting this variable will make us jump to that person.
         $.Splash.update_contact(primary_identifier, update_data, function(abc_id){
            updateContactCount(true);  
            if ($("#quickAddAnother").val()=='0'){
                $("#quick-add-fields").find(".nu-input").val('');
                closeSimpleModal();
            } else {
                $("#quick-add-fields").find(".nu-input").val('').end().find(".nu-input:first").focus();
            }
            $this.text('Save');
        });
    });
    
    $("#easy-import").click(function () {
        $('.import-p0').hide();
        $('.import-p1').show();
        $('#add-import').addClass('l2');
    });
    
    $("#import-change-file").on('click', function () {
        $.phasetwo.hide();
        // $('.import-p1').hide();
        // $('.import-p0').show();
        $("#import-p1").show();
        $("#import-p2").hide();
        $('#add-import').removeClass('l3').addClass('l2');
    });
    
    $.Splash.import_upload_bind();

    $("#close-view").click(function(){
        var $selected = $.rooty.find(".contact-card.selected");
        if($selected.length <= 1){
           $("#future-canvas").removeClass('view');
        } else {
            selectedContactCallback();
        }
        $.rooty.find(".contact-card.active").removeClass('active');
    });

    $("#gmail-import-btn").click(function(){
        var is_ssl = ("https:" == document.location.protocol);
        var protocol = is_ssl ? "https://splashthat.com" : "http://splashthat.com";
        /////window.open('http://'+constants.ocbDomain+'/events/remoteAuth/'+constants.slug+'/twitter/?_callback=twitterAuthed&d='+encodeURIComponent('http://'+constants.domain+'/auth/'),'TwitterAuth','width=500,height=400');
        var url = protocol+'/events/remoteAuth/0/google/?_callback=googleAuthed&d='+encodeURIComponent(protocol+'/address_book/gAuth');
        //+constants.domain+'/auth/');
        window.open(url,'GoogleAuth','width=500,height=400');
    });

    $("#backToAdder").click(function(){
        $("#add-import")
            .removeClass('l3, l2')
            .find(".quick-add,.import-p1,.import-p2").hide().end()
            .find(".import-p0").show();
        $("#import-csv-success").hide();
        $("#import-csv-results").show();
        $("#gmail-import-p2").hide();
    });
    
    //control active <li> in secondary filter list.
    $.secondaryfilter.on("click", "li", function(){
        $.secondaryfilter.find(".active").removeClass('active');
        $(this).addClass('active');
    });
    $("#top-level-filters").on('click','li',function(){
        $.secondaryfilter.find(".active").removeClass('active');
    });  
    $("#back-to-location").click(function(){
        if($("#firstViewLocations").is(":visible")){
            $.locations.QED({ mode: $("#location-filter-hidden").val(), visible: true, force: true });
        }

        $("#sort-by-location").firstView();
        $("#locations").find("li.active").removeClass('active');
        $("#future-canvas").removeClass('view');
    });

    $("#back-to-event-location").click(function(){
        if($("#firstViewLocations").is(":visible")){
            $("#event-locations").QED({ mode: $("#event-location-filter-hidden").val(), visible: true, force: true });
        }
        $("#sort-by-location").firstView();
        $("#event-locations").find("li.active").removeClass('active');
        $("#future-canvas").removeClass('view');
    });
    

    $("#back-to-organization").click(function(){
        if($("#firstViewOrganizations").is(":visible")){ //if we're already at the base, treat this as a hard refresh.
            $.organizations.QED({ visible: true, force: true });   
        }
        $("#sort-by-organization").firstView();
        $("#organizations").find("li.active").removeClass('active');
        $("#future-canvas").removeClass('view');
    });
    
    $("#back-to-events").click(function(){
        if($("#firstViewEvents").is(":visible")){ //if we're already at the base, treat this as a hard refresh.
            $.events.QED({ visible: true, force: true });   
        }
        $("#sort-by-event").firstView();
        $("#events").find("li.active").removeClass('active');
        $("#future-canvas").removeClass('view');

    });
    
    $("#back-to-event-types").click(function(){
        $("#sort-by-event-type").firstView();
        $("#event-types").find("li.active").removeClass('active');
        $("#future-canvas").removeClass('view');
    })

    $("#back-to-collaborators").click(function(){
        $("#sort-by-collaborator").firstView();
        $("#collaborators").find("li.active").removeClass('active');
        $("#future-canvas").removeClass('view');
    })

    $("#back-to-tags").click(function(){
        if($("#firstViewTags").is(":visible")){ //if we're already at the base, treat this as a hard refresh.
            $.tags.QED({ visible: true, force: true });   
        }
        $("#sort-by-tag").firstView();
        $("#tags").find("li.active").removeClass('active');
        $("#future-canvas").removeClass('view');
        if($("#firstViewTags").is(":visible")){
            
        }
    });
    
    // $("#back-to-industries").click(function(){
    //     $("#sort-by-industry").firstView();
    //     $("#industries").find("li.active").removeClass('active');
    //     $("#future-canvas").removeClass('view');
    // });
    
    $("#back-to-lists").click(function(){
        $("#future-canvas").removeClass('view');
    });

    $("#taggs-input").on('click','.tag span', function (e) {
        e.preventDefault();
        var txt = $.trim($(this).text().toLowerCase());
        var $match = $("#tags").find("a[tag_name='"+txt+"']:first");
        if ($match.length > 0) {
            $("#sort-by-tag").click();
            $match.click();
        }
        return false;
    });

    $("#email-selected-btn,#single-email-btn").click(function(){});
    
    $("#email-list-btn").click(function(){
        var list_id = $.listlist.find("li.active").find("a:first").attr("list-id");
        $("#bulkEmailList").attr('list-id',list_id);
        $("#bulkEmailList").fireSimpleModal();
        return false;
    });
    
    $("#export-list-btn").click(function(){
        var $current_list = $.listlist.find("li.active").find("a:first");
        var list_id = $current_list.attr("list-id");
        var list_name = $current_list.find("input.list-name").val();
        var list_count = $current_list.find(".badge").text();
        var d = new Date();

        var noun = (list_count!=1)?'Contacts':'Contact';
        $.howmanytoexport.text(list_count+' '+noun).show();
        $("#export-dropdown").hide();
        $.exportfilename.text(list_name+"-" + d.getUTCFullYear() + d.getCalendarMonth() + d.getUTCDate() + ".csv");
        $("#bulkExport").attr('list-id',list_id);
        $("#bulkExport").fireSimpleModal();
        return false;
    });

    $("#bulkEmailList").on('click','a.save',function(){
        var message_id = $("#event-message-id").val();
        if(message_id==''){
            alert('Please fill out an email to send.');
            return false;
        }
        var list_id = $("#bulkEmailList").attr("list-id");
        $(this).text('Loading..');
        window.location = '/promo/index/'+message_id+'/'+list_id;
    });

    //function to search and filter results in realtime on secondary filters (ie events, tags, locations, etc.)
    $.fn.searchSection = function(txt,$input){
        var $this = $(this);
        if(txt.length < 2 && $.trim(txt)!=''){
           $this.find("li").show();  
           $input.parent().find(".clear-results").hide();
        } else{
            var matches = 0;
            $this.addClass('loading').find(".label").each(function(){
                if($(this).text().match(RegExp(txt,'gi'))!==null){
                    $(this).parents("li:first").show();
                    matches++;
                } else{
                    $(this).parents("li:first").hide();
                }
           });     
           if(matches==0){
                $this.parents(".custodial:first").find(".empty-results:first").show().find("span").html('No results for <b>'+txt+'</b>.');
                $input.parent().find(".clear-results").hide();
           } else if(txt.length > 1){
                $input.parent().find(".clear-results").show();
           }
           $this.removeClass('loading');
       }
   }

    $.fn.firstView = function(args){
       
        if(args!=null){
            $.canvas.removeClass("home primary view").addClass('secondary filtered');
        } else{

            var contacts = false,
                events = false, 
                id = $(this).prop("id");

            if(id=='sort-by-location'){
                $("#firstViewLocations").fadeIn().siblings().hide();
                var $custodian = $("#locations-custodian");
            } else if(id=='sort-by-organization'){
                $("#firstViewOrganizations").fadeIn().siblings().hide();
                var $custodian = $("#organizations-custodian");
            } else if(id=='sort-by-event'){
                $("#firstViewEvents").fadeIn().siblings().hide();   
                var $custodian = $("#events-custodian");
            } else if(id == 'sort-by-tag'){
                $("#firstViewTags").fadeIn().siblings().hide();
                var $custodian = $("#tags-custodian");
            } else if(id == 'sort-by-industry'){
                $("#firstViewIndustries").fadeIn().siblings().hide();
                var $custodian = $("#industries-custodian");
            } else if(id == 'sort-by-event-type'){
                $("#firstViewEventTypes").fadeIn().siblings().hide();
                var $custodian = $("#event-types-custodian");
            } else if(id == 'sort-by-collaborator'){
                $("#firstViewCollaborators").fadeIn().siblings().hide();
                var $custodian = $("#collaborators-custodian");
            } else if(id == 'event-index-sort'){
                var events = true;             
            } else {
                var contacts = true;
            }

            if (contacts || events) {
                $.canvas.removeClass("home secondary view filtered").addClass('primary');
            } else{
                $custodian.show().siblings().hide();
                if($custodian.find("input.search").val()!=''){
                    $custodian.find("input.search").val('').trigger('keyup');
                }
                /// CLASS BASED TRANSITION HOOK
                $.canvas.removeClass("home primary view filtered").addClass('secondary');
            }
            
            if(typeof constants.eventIndex!=='undefined'){
                setTimeout(function(){
                    $("#pane3-title").find("a:first").html('<span>All Events</span>').end()
                        .find(".filtered-total").text($("#sort-by-event-count").text());
                }, 200);

            } else {
                console.log("heere.");
                setTimeout(function(){
                    $("#pane3-title").find("a:first").html('<span>All Contacts</span>').end()
                        .find(".filtered-total").text($("#all-contacts-count").text());
                }, 200);

            }
            
            $(this).parent()
                .addClass('active').removeClass('inactive')
                .siblings().removeClass('active');
            
            $.listlist.find("li.active").removeClass('active');
            $.textsearch.val('');
            $("#advanced-questions").hide().find(".questions").empty();
            clearAdvancedFilters();

        } 
        massSelect = false;
        $("#select-all").val(0).parent().removeClass('checked');
        $("#email-list-btn,#export-list-btn").hide();
    }

    $.fn.donutgraph = function (donut_data) {
        
        if (typeof spotify_user !== 'undefined') {
            var __data__ = ["#0b3505", "#518902", "#2b6101"];
        } else { // the default colors
       //     var __data__ = ["#25f3d3", "#fe5fa1", "#f1ec22"];
            var __data__ = ["#0C9E86","#85F9E6","#25f3d3"];
        }
        
        var maroon = __data__[0],
            brick = __data__[1],
            red = __data__[2],
            red_list = __data__,
            


            labels = {
                instagram: ["Instagram Handles", arguments[1] || __data__[1]],
                twitter: ["Twitter Handles", arguments[2] || __data__[0]],
                email: ["Email Addresses", arguments[3] || __data__[2]]
            };

        return this.each(function () {

            var $this = $(this),

                width = 343,
                height = 250,
                radius = Math.min(width, height) / 2;
            
            var arc = d3.svg.arc()
                .outerRadius(radius)
                .innerRadius(radius - 40);
            
            var pie = d3.layout.pie()
                .sort(null)
                .value(function (d) { return d.value; });
            
            var svg = d3.select("#"+$this.attr('id'))
                .append("svg")
                //.attr("viewBox", "" + 25 + " " + 25 + " " + (width/1.35) + " " + (height/1.5) )
                .attr("viewBox", "0 0 264 281")

                .attr("preserveAspectRatio", "xMidYMid meet")
                .append("g")
                .attr("transform", "translate(131.5,125)")
                //.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
            
            var textroot = svg.append("g")
                .attr('class', "textroot")
                .attr("transform", "translate(" + 0 + "," + -45 + ")");
            
            var data_ = _(donut_data)
                .chain()
                .pairs()
                .sortBy(function (item) { return item[0]; })
                .map(function (pair) {
                    return {
                        label: pair[0],
                        value: pair[1] };
                    })
                .toArray()
                .reverse()
                .value();
            
            var width = 500,
                height = 300,
                date = new Date(),
                color_ = d3.scale.ordinal()
                    .range(__data__);
            
            data_.forEach(function (d) {
                d.value = +d.value;
            });
            
            var g = svg.selectAll(".arc")
                .data(pie(data_))
                .enter()
                .append("g")
                .attr("class", "arc");
            
            g.append("path")
                .attr("d", arc)
                .style('stroke', function (d) { return color_(d.data.label); })
                .style('fill', function (d) { return color_(d.data.label); });
                
                var textjoin = textroot.selectAll('text').data(data_);


            textjoin
                .enter()
                    .append('text')
                        .attr('class', "aggregate-name")
                        .style("text-anchor", "middle")
                        .style("font-family", "GibsonSemiBold")
                        .style("font-size", '.7em')
                        .attr("dy", function (d, i) { return 98 - (i * 40) })
                        .text(function (d) { return labels[d.label][0]; });
            
            textjoin
                .enter()
                    .append('text')
                        .attr('class', "aggregate-value")
                        .style("text-anchor", "middle")
                        .style("font-family", "GibsonSemiBold")
                        //.style("font-size", (($this.width() - 150) / 100)+"em")
                        .style("font-size", '1.8em')
                        .style("fill", function (d, idx) { return labels[d.label][1]; })
                        .style("stroke", function (d, idx) { return labels[d.label][1]; })
                        .attr("dy", function (d, i) { return 84 - (i * 40) })
                        .text(function (d) { return (d.label == "total_reach") ? (d.value + "K") : d.value; });
            
        });
        
    }

    $("#location-filter-hidden,#event-location-filter-hidden").on('change',function() {
        var mode_ = $(this).val().trim().toLowerCase();
        $("#empty-locations").hide();
        $("#search-locations").val('');
        $("#sort-by-location").firstView();

        if($(this).prop("id")=='event-location-filter-hidden'){
            $("#event-locations").defaults({ mode: mode_, force: true }).QED();
        } else {
            $.locations.defaults({ mode: mode_, force: true }).QED({

            },function(){
                if(jumpToStateID!==false){
                    var $l = $.locations.find("a[state="+jumpToStateID+"]");
                    if($l.length > 0){ //if we find a staate match, click through to that state!
                        $l.click();
                        $.Splash.scrollToObject($.locations,$l);
                    }

                }
            });
        } 
    });

    $("#event-types-filter-hidden,#collaborators-filter-hidden").on('change',function(){
        var rows = [];
        var i = 0;
        var event_contacts=false;
        if($(this).prop("id")=='event-types-filter-hidden'){
            var $ul = $("#event-types");
            $ul.find("a.event-type-option").each(function(){
                var $t = $(this);
                rows[i] = {};
                rows[i]['count'] = Number($t.find(".badge").text());
                rows[i]['name'] = $t.find(".label").text().trim();
                rows[i]['id'] = $t.attr("event_type_id");
                i++;
            });
        } else {
            event_contacts=true;
            var $ul = $("#collaborators");
            $ul.find("a.collaborator-option").each(function(){
                var $t = $(this);
                rows[i] = {};
                rows[i]['count'] = Number($t.find(".badge").text());
                rows[i]['name'] = $t.find(".label").text().trim();
                rows[i]['field'] = $t.attr("field-name");//either group_id, contact_id, or abc_id
                rows[i]['id'] = $t.attr(rows[i]['field']);//group_id, contact_id, abc_id VALUE
                i++;
            });
        }     

        var field = 'name';
        var other_field = 'count';
        var direction = 'asc';
        if($(this).val()=='count'){
            field = 'count';
            other_field = 'name';
            direction = 'desc';
        }

        rows.sort(function(a,b){
            if(field=='count'){
                var aa = a[field];
                var bb = b[field];
            } else {
                var aa = a[field].toLowerCase();
                var bb = b[field].toLowerCase();
            }

            var r = 0;
            if ( aa < bb ) r = -1;
            else if ( aa > bb ) r = 1;
            else{//equal 
                var cc = a[other_field];
                var dd = b[other_field];
                if ( cc < dd ) r = -1;
                else if ( dd > cc ) r = 1;
                //if ( field=='count'){
                    return r;
                //}
            }
            if ( direction == 'desc' )
                return r*-1;
            return r;        
        });

        var lis = '';
        if(event_contacts){
            for(var x in rows){
                lis+=eventContactMarkup(rows[x],true);
            }            
        } else {
            for(var x in rows){
                lis+=eventTypeMarkup(rows[x])
            }            
        }

        $ul.empty().html(lis).scrollTop(0);
    });

    $("#event-filter-hidden").on('change',function(){
        var mode_ = $(this).val().trim().toLowerCase();
        $("#empty-events").hide();
        $("#search-events").val('');
        $.events.defaults({ mode: mode_ }).QED();
    });

    $("#tag-filter-hidden").on('change',function(){
        var mode_ = $(this).val().trim().toLowerCase();
        $("#empty-tags").hide();
        $("#search-tags").val('');
        $.tags.defaults({ mode: mode_ }).QED();
    });

    $("#organization-filter-hidden").on('change',function(){
        var mode_ = $(this).val().trim().toLowerCase();
        $("#empty-organizations").hide();
        $("#search-organizations").val('');
        $.organizations.defaults({ mode: mode_ }).QED();
    });
    $("#event-types-filter-hidden").on('change',function(){

    });

    $("#onlyVIP").click(function(){
        var $this = $(this);
        if($this.hasClass('active')){
            $this.removeClass('active');
            $.rooty.defaults({ vip: null }).QED();
        } else {
            //console.log("wtf!");
            $this.addClass('active');
            $.rooty.defaults({ vip: 1 }).QED();
        }
    });
    /////////////////////////// CONFIGURE PAGE START STATE ///////////////////////////
    
    ///FIRST VIEW / FIRST COUNTS CALL
    $.Splash.recount();
    
    $.textsearch.keydown(function(e){
        if(e.keyCode==13){
            e.preventDefault();
            return false;
        }
    }).keyup(function(e){
        if(e.keyCode==13){
            e.preventDefault();
            return false;
        }
        var val = $.trim($.textsearch.val());
       // $("#loadingMore").hide();
        clearTimeout(typingTimer);
        typingTimer = setTimeout(
            function(){
                $.rooty.defaults({ text_filter: val, clear: true, visible: true}).QED();
            }, 
            doneTypingInterval
        );
    });

    $.Splash.setListDivHeight();
    resizeContactHeight();


    var resizeTimer;

    $(window).resize(function () {
        $.Splash.setListDivHeight();
        resizeContactHeight();

        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function()
        {
       //   $.fn.donutgraph();
        }, 100);
       
    });
    
    $("#massSelector").on('click',function(){
        var section = $.Splash.whereAmI();
        $(this).hide();
        $("#how-many-selected").text(section.count).hide().fadeIn();
        $.selectedtip.parent().hide();
        massSelect = true;
    });

    $("#select-all-bulk").on('click',function(){
        if($(this).hasClass('active')){//unselect all.
            closeMultiView();
            return false;
        } else{
            $(this).addClass('active');
            massSelect = true;
            var section = $.Splash.whereAmI();
            $.selectall.val(1).parent().addClass('checked');
            $.rooty.find('input.contact-checkbox').each(function(){
               $(this).val('1').parent().addClass('checked').parents('.contact-card:first').addClass('selected');
            });
            selectedContactCallback();
            $("#massSelector").hide();
            $("#how-many-selected").text(section.count).hide().fadeIn();
 
            $.selectedtip.parent().hide();
            
            return false;

        }
    });

    $("#filter-start-date").datepicker({
        dateFormat: 'mm/dd/y',
        maxDate: "+0d",
        onSelect: function(dateText, inst) {
            //when you change the start date, also change the end date.
            $("#filter-end-date").datepicker('option','minDate', dateText);//.val(dateText);
            $.rooty.defaults({ start_date: $(this).val() }).QED();
        }
    });
    $("#filter-end-date").datepicker({
        dateFormat:'mm/dd/y',
        minDate: $("#filter-start-date").val(),
        onSelect: function(dateText, inst){
            $.rooty.defaults({ end_date: $(this).val() }).QED();
        }
    });

    var $advanced_filters = $("#advanced-search").find(".adv-filter");
    $advanced_filters.change(function(){
        var $this = $(this);
        if($this.val()=='1'){
            if($this.attr("field")=='email'){
                var opposite = 'no_email';
            } else if($this.attr("field")=='no_email'){
                var opposite = 'email';
            }
            var $other = $('input.adv-filter[field="'+opposite+'"]');
            if($other.val()=='1'){
                $other.val(0).parent().removeClass('checked');
            }
        }
        var filters = [];
        $advanced_filters.each(function(){
            if($(this).val()=='1'){
                filters.push($(this).attr("field"));
            }       
        });

        $.rooty.defaults({ filters: filters.join(',') }).QED();
    });

    $("#clear-advanced-filters").click(function(){
        clearAdvancedFilters();
        $.rooty.QED();
    });

    // For search & filter
    $('#secondary-filter .sf-trigger').on('click',function(){
        $t = $(this).parents('.sf-wrap:first');
        if ( $t.hasClass('active')) {
            $t.removeClass('active')
        } else {
            $t.addClass('active').removeClass('ofV').addClass('ofH').find('input.search').val('').focus().css('opacity',1);
        }
    });

    // Toggle advanced search styles
    $('#toggle-filters').on('click', function(){
        if ( $(this).hasClass('active') ) {
            $(this).removeClass('active');
        } else {
            $(this).addClass('active');
        }
    });

    // Make overflow visible in the SF wrap 
    // to show the dropdown
    // needs helps!
    $('.sf-wrap .nu-dropdown').on('click',function(){
        $(this).parents(".sf-wrap:first").addClass('ofV').removeClass('ofH');
        // $('.sf-trigger').addClass('ofV');
    });

    $.fn.toFloat = function(){
        return parseFloat(this.trim());
    }

    $("#contact-history-profile").on('click','a.event-title',function(){
        var $this = $(this);
        var type = $this.attr("item-type");
        var id = $this.attr("item-id")*1;
        var event_id = $this.attr("event-id")*1;
        if(type=='list'){
            var $list = $("#list-"+id);
            if($list.length > 0){
                $list.click();                
            }
        } else if(event_id>0){
        //     jumpToEventID = event_id;
        //     //if we have an event, jump to that event.
        //     $("#sort-by-event").click();
        // }
        // else if(type=='rsvp' || type=='ticket' || type=='photo'||type=='checked_in'||type=='twitter'||type=='instagram'){
            var domain = $(this).attr("domain");
            if(typeof domain!=='undefined' && domain!=''){
                window.open('http://'+domain+'.splashthat.com');
            }
        }
    });

    $("#toggleEventQuestions").click(function(){
        var $wrap = $("#advanced-questions").find(".question-list-wrap");
        if($wrap.is(":visible")){
            hideEventQuestions($wrap);
        } else{
            $wrap.show();
            $(this).addClass('open');
        }
    });
    $("#applyEventFilters").click(function(){
        var params = '';
        $("#advanced-questions").find(".question-list").find("input").each(function(){
            var $this = $(this);
            if($this.val()!=''){
                if($this.parent().hasClass('nu-checkbox')){
                    if($this.parent().hasClass('checked')){
                        params+=$this.parents(".question").attr("field")+'='+$this.attr("field-val")+',';
                    }
                } else{
                    params+=$this.parents(".question").attr("field")+'='+$this.val()+',';
                }
            }
        });

        $.rooty.defaults({ event_filters: params }).QED({},function(){
            $.rooty.defaults({ event_filters: 'null' });
        });

        $("#toggleEventQuestions").addClass('active');
    });

    $("#hideEventQuestions").click(function(){
        hideEventQuestions($wrap);
    });

    $("#splashMessage .close").click(function(){
        $("#splashMessage").hide();
    });

    $("#all-export-fields").change(function(){
        if($(this).val()=='1'){
            $("#all-export-field-list").slideUp(300,function(){
                $(this).find(".nu-checkbox").addClass('checked').find("input").val(1)
            });
        } else{
            $("#all-export-field-list").slideDown(300);            
        }
    });


    //event card click.
    $.rooty.on('click','div.event-card',function(e){
        var $t = $(this),
            event_id = $t.attr("event-id"),//parents(".event-card:first").attr("event-id"),
            $viewWrap = $("#view-wrap");
        if($t.hasClass('active')){//if we're already in this event card, then clicking again should close it.
            $("#close-view").click();
            return;
        }    
        $t.addClass('active').siblings('.active').removeClass('active');
        $.canvas.addClass('view');
        $.viewnav.show();
        $.contactview.show().data('event_id',event_id).scrollTop(0);
        $.multicontactview.hide();
        if(typeof eventProfileCache[event_id]!=='undefined'){
            populateEventProfile(event_id,eventProfileCache[event_id]);
        } else{ 
            $viewWrap.addClass('loading');
            $.ajax({
                url: "/address_book/api_event_data/"+event_id,
                type: "POST",
                dataType: 'json',
                success: function(result){
                    if($.contactview.data('event_id')==event_id){
                        populateEventProfile(event_id,result);

                        //in either case, save cached data for this contact's history so we don't have to do another lookup.
                        eventProfileCache[event_id] = result;//['data']['history'];
                        var $avatar = $("#avatar-image-frame").find(".alpha-avatar");
                        $avatar.height($avatar.width()-10);
                        console.log('set height');
                        $viewWrap.removeClass('loading');
                    }
                },
                error: function(response){
                    $viewWrap.removeClass('loading');
                }
            });    
        }

    });

    $("#event-view-collabs").click(function(){
        constants.event_id = $.contactview.data('event_id');
        fireAjaxModal($(this),{ event_id: $.contactview.data('event_id') });   
        return false;
    });

    $("#editSettings").click(function(){
        var $link = $(this);
        //$("#simple-modal-ajax").attr("xtra-attr",'edit-settings');
        constants.event_id = $.contactview.data('event_id');
        fireAjaxModal($link,{ event_id: $.contactview.data('event_id') },function(){
            bindEventSettings();
        });   

        return false;         
    });

    function bindEventSettings(){
        $("#edit-settings").on('click','.close-modal',function(){
            closeSimpleModal();
        });

        $("#domain-input").on('click', function(){
            setTimeout(function(){
                if(!domain_focus){
                    $("#event-domain-field").focus();
                }
            },50);
        });


        var wasOpen = false,
            typingTimer,
            domain_focus = false,
            doneTypingInterval=750,
            previousVal ='';


        $("a.address-search").unbind('click').click(function(){
            _gaq.push(['_trackEvent', 'Details', 'CantFindLocation', 'id:'+constants.event_id]);
            var $p = $(this).parents(".box-content:first");
            $p.find(".venueAuto,.address-search").hide();
            $p.find(".venueManual,.google-search").show();
            $(this).hide();
            return false;
        });

        $("a.google-search").unbind('click').click(function(){
            _gaq.push(['_trackEvent', 'Details', 'CantFindLocation', 'id:'+constants.event_id]);
            var $p = $(this).parents(".box-content:first");
            $p.find(".venueAuto,.address-search").show();
            $p.find(".venueManual").hide();
            $(this).hide();
            return false;
        });

        $("#event-type").autocomplete({
            response:function(event,ui){
            },
            source: function (request, response) {
                var results = $.ui.autocomplete.filter(availableTags, request.term);
                if (!results.length) {
                    var match_found = false;
                    for(var i = 0;i<availableTags.length;i++){
                        if(!match_found && availableTags[i].id=='0'){
                            //delete availableTags[i];
                            availableTags[i]['value'] = request.term;
                            availableTags[i]['label'] = 'Add '+request.term+' as new type';
                            match_found = i;
                            //break;
                        } 
                    }
                    if(!match_found){
                        availableTags.push({
                            id: 0,
                            label: 'Add '+request.term+' as new type',
                            value: request.term,
                        });
                    }

                    setTimeout(function(){
                        $("#event-type").autocomplete('search',request.term);
                    },200);
                } else {
                    if(results.length == 1){
                        if(results[0]['id']=='0'){
                            results[0]['label']='Add '+request.term+' as new type';
                            results[0]['value']=request.term;
                        }
                    } 
                }

                response(results);

            },
            //source: availableTags,
            minLength: 0,
            select: function( event, ui ) {
                $("#event-type-id").val(ui.item.id);
            }
        });


        $("#event_date").datepicker({
            dateFormat: 'mm/dd/y',
            beforeShow: function(){
                openDatePicker = true;
            },
            onSelect: function(dateText, inst) {

                //when you change the event start date, also change the end date.
                //we want to filter both the date and the range of the end date, making all days earlier
                //than the event start unselectable.
                $("#event_date_end").datepicker('option','minDate', dateText).val(dateText);
                if($("#time-tbd").val()=='1'){
                    $("#time-tbd").val(0).addClass('changes-made');
                }
                $(this).trigger('change');
                //setChangesMade();

            },
            onClose:function(){
                setTimeout(function(){
                    openDatePicker = false;
                },500);
            }

        });
        $("#event_date_end").datepicker({
            dateFormat:'mm/dd/y',
            minDate: $("#event_date").val(),
            beforeShow: function(){
                openDatePicker = true;
            },
            onSelect: function(dateText, inst){
                if($("#time-tbd").val()=='1'){
                    $("#time-tbd").val(0).addClass('changes-made');
                }
                $(this).trigger('change');
            },
            onClose:function(){
                setTimeout(function(){
                    openDatePicker = false;
                },500);
            }

        });


        //$('#showExample').timepicker('show');
        $("#event-start-timepicker").timepicker({
            appendTo: '.tpStart'
        });
        $("#event-end-timepicker").timepicker({
            appendTo: '.tpEnd'
        });

        $("#event-start-timepicker,#event-end-timepicker").on({
            show: function(){
                openDatePicker = true;
            },
            changeTime: function(){
                $(this).parents(".timePicker").find(".timeHolder").text($(this).val()).show().end()
                       .find("input.time-select").hide();
            },
            hideTimepicker: function(){
                $(this).parents(".timePicker").find(".timeHolder").text($(this).val()).show().end()
                   .find("input.time-select").hide();
                openDatePicker = false;
            }
        });

        $("#timezone-link").unbind('click').click(function(){
            _gaq.push(['_trackEvent', 'Create', 'TimezoneOpen', 'id:'+constants.event_id]);
            $(this).hide();
            $("#timezone-selector").show().addClass('manually-changed').focus();
        });
        $("#timezone-selector").unbind("focusout").focusout(function(){
            $(this).hide();
            var thisText = $(this).find(":selected").text()
            $('.timeZoneText').text(thisText)
            $('#timezone-link').show();
            _gaq.push(['_trackEvent', 'Create', 'TimezoneChanged', 'id:'+constants.event_id]);
        }).unbind('change').change(function(){
            $(this).hide();
            var thisText = $(this).find(":selected").text()
            $('.timeZoneText').text(thisText)
            $('#timezone-link').show();
            _gaq.push(['_trackEvent', 'Create', 'TimezoneChanged', 'id:'+constants.event_id]);
        });

        $("#addEventEndDate").unbind('click').click(function(e){
            e.preventDefault();
            $(this).hide();
            $("#end-date-contain").show();
            $("#hide_end_date").val(0).addClass('changes-made').trigger('change');
            $("input.cal,select.cal").addClass('changes-made');
            //updateSplashField('date',null,$("#element-when"));
        });
        $("#deleteEventEndDate").unbind('click').click(function(e){
            e.preventDefault();

            $("#end-date-contain").hide();
            $("#hide_end_date").val(1).addClass('changes-made').trigger('change');
            $("#addEventEndDate").show();
            //updateSplashField('date',null,$("#element-when"));
        });

        $("input.private-switch").unbind('click').click(function(){
            //if($(this).val()=='1'){
            $("#privateSettings").toggle();
            //}
        });

        var initializeVenueMap = function() {
            if ( google === false ) return false;

            var input = document.getElementById('venue-search');
            var autocomplete = new google.maps.places.Autocomplete(input);

            google.maps.event.addListener(autocomplete, 'place_changed', function(e) {
                _gaq.push(['_trackEvent', 'Details', 'VenuePlaceChanged', 'id:'+constants.event_id]);
                var place = autocomplete.getPlace();
                var address = '';
                //console.log('PLACE CHANGED: ');console.log(place);
                  var address_fields = { name: place.name, street_number: '', address: '', city: '', state: '', zip: ''};
                  if (place.address_components) {

                     for ( var i in place.address_components ){
                       if ( place.address_components[i].types[0] == 'postal_code' ) address_fields.zip = place.address_components[i].long_name;
                       else if ( place.address_components[i].types[0] == 'street_number' ) address_fields.street_number = place.address_components[i].long_name;
                       else if ( place.address_components[i].types[0] == 'route' ) address_fields.address = place.address_components[i].long_name;
                       else if ( place.address_components[i].types[0] == 'locality' ) address_fields.city = place.address_components[i].long_name;
                       else if ( place.address_components[i].types[0] == 'administrative_area_level_1' ) address_fields.state = place.address_components[i].short_name;
                     }
                  }

                    address_fields.address = address_fields.street_number +' '+ address_fields.address;
                    $("#venue-name").val(address_fields.name);
                    $("#venue-address").val(address_fields.address);
                    $("#venue-city").val(address_fields.city);
                    $("#venue-state").val(address_fields.state);
                    $("#venue-zip").val(address_fields.zip);
                    if(typeof place.geometry!=='undefined'){
                        $("#venue-lat").val(place.geometry.location.lat()).addClass('changes-made');//.trigger('change');
                        $("#venue-lng").val(place.geometry.location.lng()).addClass('changes-made');//.trigger('change');
                    }

                    $("#venue-tbd").val(0).parent().removeClass('checked');//.trigger('change');
                    //console.log($("#map-container").html());
                    //updateVenueText();
                    $('a.address-search').click();

                    return;
            });


        }

        initializeVenueMap();

        $("#event-domain-field").unbind('keyup').keyup(function(){
            clearTimeout(typingTimer);
            typingTimer = setTimeout(doneTypingDomain, doneTypingInterval);
        });

        $("#event-domain").unbind('keyup').keyup(function(){
            clearTimeout(typingTimer);
            typingTimer = setTimeout(doneTypingDomain, doneTypingInterval);
        });

        $("#event-start-time,#event-end-time").unbind('click').click(function(){
            $(this).hide().parents(".timePicker").find("input.time-select").show().focus().timepicker('show');
        });

        $("#private-type-input").unbind('change').change(function(){
            if(isPrivateEvent()){
                $("#privacy-check").val(1);//.trigger('change');
                $("#private-code").show().focus();
                $("#bypassPrivacy").show();
                $("#password-holder").css('display', 'inline-block');
            } else{
                if($(this).val()=='min_age'){
                    $("#privacy-check").val(1);//.trigger('change');                    
                } else{
                    $("#privacy-check").val(0);//.trigger('change');
                }
                $("#private-code").val('').hide();
                $("#bypassPrivacy").hide();
                $("#password-holder").css('display', 'none');
                $("#privacy-invite-bypass").val(0).parent().removeClass('checked');
            };
        });

    }//end of event settings bind function call.

    $("#simple-modal-wrap").on('click','#saveEventSettings',function(){
        var postData = getChangedInputsArray($("#edit-settings").find("input,select"));
        if(isPrivateEvent() && $.trim($("#private-code").val())==''){
            alert('An access code is required for private events');
            $("#private-code").focus();
            return false;
        }

        //$("#edit-settings").find("input,select").addClass('changes-made');
        postData['data[Event][title]'] = $("#finetune-main-title").val();
        postData['data[Event][domain]'] = $("#event-domain").val();
        postData['data[Event][has_planning]'] = ($("#event-has-planning-tools").val()=='1') ? '1' : '0';

        postData['data[EventSetting][rsvp_method]'] = $("#rsvp_method_input").val();
        postData['data[EventSetting][private]'] = $("#privacy-check").val();
        postData['data[EventSetting][private_code]'] = $("#private-code").val();
        postData['data[EventSetting][private_type]'] = $("#private-type-input").val();
        postData['data[EventSetting][invite_link_privacy_bypass]'] = $("#privacy-invite-bypass").val();

        var $this = $(this);
        if($this.hasClass('in-progress')){
            return false;
        }
        $this.addClass('in-progress').text('Saving...');
        $.ajax({
            url:"/events/saveEventData/"+constants.event_id,
            type: 'post',
            data: postData,
            dataType: 'json',
            success: function(response){
                
                if(typeof eventProfileCache[constants.event_id]!=='undefined'){
                    delete eventProfileCache[constants.event_id];
                }
                
                var $card = $.rooty.find("div.event-card[event-id='"+constants.event_id+"']");    
                if($card.length > 0){
                    //should always be true.
                    $card.removeClass('active').click();
                }       

                $this.text('Save').removeClass('in-progress');
                closeSimpleModal();
            },
            error:function(){
                alert('There was an error saving your changes. Please try again.');
                $this.text('Save').removeClass('in-progress');
            }
        });    

        return;
    });

    $("#event-date-sort").change(function(){
        $.rooty.QED({
            sort_type: $(this).val()
       },function(){
            $.rooty.attr("loading",false);
            $("#loadingMore").hide();
        });
    });

    
    $("#closeGmailImport").click(function(){
        closeSimpleModal();
    });

    $("#duplicateEventLink").click(function(){
        $("#duplicate-event").fireSimpleModal();
        $("#copy_event_id").val($.contactview.data('event_id'));
        return false;
    });

    $("#joinEvent").click(function(){
        $("#viewEventLink").click();
    });

    $("#deleteEventLink").click(function(){

        //var event_title=$.trim($(this).parents("div.event-card").find("h4:first").html());
        var event_title = $("#vc-name").text().trim(),
            event_id = $.contactview.data('event_id');
        
            var confirm_1=  confirm("Are you sure you want to delete the event '"+event_title+"' from your system?");
            if(confirm_1){
                _gaq.push(['_trackEvent', 'EventIndex', 'LeaveEventClick1']);
                var confirm_2 = confirm("Just double checking here.  Deleting an event is no laughing matter.");
                if(confirm_2){
                    _gaq.push(['_trackEvent', 'EventIndex', 'LeaveEventClick2']);
                    window.location = '/events/delete/'+event_id;
                }
                //after leaving the event, refresh the event list.  
                $.rooty.QED({ force:true });
                return false;
            
            }

    });

    $("#leaveEventLink").click(function(){
        var event_title = $("#vc-name").text().trim(),
            event_id = $.contactview.data('event_id');

        _gaq.push(['_trackEvent', 'EventIndex', 'LeaveEventClick']);
        var confirm_1=  confirm("Are you sure you want to leave the event '"+event_title+"'?");
        if(confirm_1){
            _gaq.push(['_trackEvent', 'EventIndex', 'LeaveEventClick1']);
            var confirm_2 = confirm("Just double checking here.  You'll have to be invited by the event owner again to rejoin.");
            if(confirm_2){
                _gaq.push(['_trackEvent', 'EventIndex', 'LeaveEventClick2']);
                window.location = '/events/removeEventContact/'+event_id;
            }

            //after leaving the event, refresh the event list.  
            $.rooty.QED({ force:true });
            return false;
        }

    });


    $("#splashDomainLink,#changeSplashLink").click(function(){
        $("#splashDomainLink,#changeSplashDomainLink").hide();
        $("#splashDomainManual").show();
        $("#dupe-event-domain").focus();
    });

    $("#dupe-event-title").keyup(function(){
        var $obj = $(this);
        updateEventDomain();

        clearTimeout(typingTimer);
        typingTimer = setTimeout(doneTypingDomain($obj), doneTypingInterval);
    }).focusout(function(){
        if(!$("#dupe-event-domain").attr("changed")){
            doneTypingDomain();
        }
    });
    $("#dupe-event-domain").keyup(function(){
        var $obj = $(this);

        $obj.attr("changed",true);
        clearTimeout(typingTimer);
        typingTimer = setTimeout(doneTypingDomain($obj), doneTypingInterval);
    });

    googleCitySearch();
}); ///END OF DOCUMENT READY
   
////GOOGLE MAPS AUTOCOMPLETE /////
var map;
function googleCitySearch() {
    if ( google === false ) return false;
    
    var input = document.getElementById('google-search');
    var options = { types: ['(cities)'] };
    var autocomplete = new google.maps.places.Autocomplete(input,options);

    google.maps.event.addListener(autocomplete, 'place_changed', function(e) {
        _gaq.push(['_trackEvent', 'Create', 'VenuePlaceChanged', 'id:'+constants.event_id]);
        var place = autocomplete.getPlace();
        var full_name = place.formatted_address.replace(', USA','');//trim out usa if given.
        var contact_id = $.contactview.data('contact_id');

        var bg_color = $.contactview.css('background-color');
        $("#city-wrap > .content:first")
            .append($.Splash.cityTag(full_name,true))
            .find(".tag").css('background-color',bg_color);
        
        var city_tags = [];
        $.cities.find(".tag").each(function(){
            city_tags.push({ id: $(this).attr("group-id"), name: $(this).find(".name").text() });
        })
        $.contactview.data('city_tags'+contact_id,city_tags);

        $.cities.QED({ 
            city: full_name, 
            abc_ids: contact_id, 
            lat: place.geometry.location.lat(), 
            lng: place.geometry.location.lng() 
        }, function() {
            $.locations.QED({ mode: $("#location-filter-hidden").val(), visible: true, force: true });
        });
        
        setTimeout(function(){
            $("#google-search").val('');     
        },2);
    
       $("#community-link").addClass('reload');
    
       return false;
    });

}
//// END GOOGLE MAPS AUTOCOMPLETE////


String.prototype.normalize = function() {
    return this.replace(/\W/g, '')
        .toLowerCase()
        .trim();
};
String.prototype.capitalize = function() {
    return this.replace(
        /(^|\s)([a-z])/g,
        function(m, p1, p2) {
            return p1 + p2.toUpperCase();
        }
    );
};

String.prototype.rawRGB = function(){
    var val = this.split(',');
    if(val.length == 4){
        val[3] = '1)';
    }
    return val.join(',');
}

var doneTypingInterval = 600,
    typingTimer,
    massSelect = false,
    jumpToTag = false,
    jumpToSearch = false;


    function selectedContactCallback() {
        var $selected = $.rooty.find(".contact-card.selected");

        selected = [];
        var selected_count = $selected.length;
        if (selected_count > 1) {
            
            $.howmanyandwhy.text(''+selected_count);
            $.contactview.hide();
            $.viewnav.hide();
            
            $selected.each(function(){
                //console.log($(this).data());
                var selected_contact_name = $(this).data('name');
                selected.push(selected_contact_name);
            });
            
            if (selected_count> 16) {
                var not_shown = selected_count - 15;
                selected = selected.slice(0, 16).concat("And " + not_shown + " others ...");
            }
            $.selectedtip.html(selected.join('<br>')).parent().show();
            $.multicontactview.fadeIn();
            $.canvas.addClass('view');

            if($.selectall.val()=='1'){//only do this check if all are selected.
                var section = $.Splash.whereAmI();
                if(typeof section.count!=='undefined' && selected_count < section.count){
                    //alert('More peeps out there.');
                    $("#massSelector").text('Select all ('+section.count+')').fadeIn();
                 } else{
                    $("#massSelector").empty().hide();
                 }
             } else{
                $("#massSelector").empty().hide();
             }
                   
        } else if (selected_count > 0) {
            $selected.eq(0).find('a').trigger('click', [true]);
        } else {
            $.canvas.removeClass('view');
        
            $.multicontactview.hide();
        }
    }

    function closeMultiView(){
        massSelect = false;
        $.rooty.find(".contact-card.selected").each(function(){
            $(this).removeClass('selected').find(".checked").removeClass('checked').find(".contact-checkbox").val(0);
        });
        $.rooty.find(".contact-card.active").removeClass('active');
        $.selectall.val(0).parent().removeClass('checked');
        $.canvas.removeClass('view');
        $("#select-all-bulk").removeClass('active');
    }

    function addCommas(str){
        var str= new String(""+str);
        var x = str.split('.'),
            x1 = x[0],
            x2 = x.length > 1 ? '.' + x[1] : '',
            rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    function resizeContactHeight(){
        var h1 = $("div.global-header").outerHeight(true);
        var h2 = $("#pane3-holder").outerHeight();
        var h3 = $("#contacts-search-contain").outerHeight();
        var h4 = ($("#advanced-search").is(":visible"))?$("#advanced-search").outerHeight():0;
        var new_top = h2+h3+h4;//minus 10 for finetuning.

        $("#contacts-columns").css('top',new_top);
        var contacts_columns_height = $(window).height() - h2 - h3 - h4;
        $("#contacts-columns").height(contacts_columns_height);

        //$search.addClass();
        //$("#contacts-columns").height($("#contacts-columns").height()-new_top);
    }

    function toggleFilters(forceClose){
        var $search = $("#advanced-search");
        if($search.hasClass('in-progress')){//prevent double click.
            return false;
        }
        var search_height = $search.height();
        var $contacts_columns = $("#contacts-columns");
        var current_top = $contacts_columns.css('top').replace('px','')*1;
        if(forceClose!=null || $search.is(":visible")){
            $search.addClass('in-progress').slideUp(100,function(){
                $search.css('overflow','visible').removeClass('in-progress');
                //$contacts_columns.height($contacts_columns.height() - search_height);
                $.Splash.setListDivHeight();
                resizeContactHeight();
            });
        } else{ //show the search.
            //$contacts_columns.height($contacts_columns.height() + search_height);
            $search.addClass('in-progress').slideDown(200,function(){
                $search.css('overflow','visible').removeClass('in-progress');
                //$contacts_columns.css('top',(current_top + search_height));
                $.Splash.setListDivHeight();

                resizeContactHeight();
            });
        }
    }

    function getCurrentContact(contact_id){
        if(contact_id==null){
            var contact_id = $.contactview.data('contact_id');
        }
        if(typeof constants.eventIndex!=='undefined'){
            var $contact = $.rooty.find("div.event-card[event-id='"+contact_id+"']");
        } else{
            var $contact = $.rooty.find("div.contact-card[data-contact-id='"+contact_id+"']");
        }
        if($contact.length > 0 && typeof $contact.data('hashKey')==='undefined'){
            var blacklisted_keys = ['name','contact_id','initial','key','aproposHasher','aproposHash','contactId'];
            var $keys = _($contact.data()).keys();
            var match = false;
            if($keys.length > 0){
                for (var x in $keys){
                    if(!match && $.inArray($keys[x],blacklisted_keys) <= -1){
                        if(_($contact.data($keys[x])).isObject() && typeof $contact.data($keys[x])['id']!=='undefined'){
                            $contact.data('hashKey',$keys[x]);
                            match = true;
                        }
                    }   
                }
            }
        }
  
        return $contact;
    }

    function populateContactProfile(contact,$card){
        //console.time("before.");
        /// Deal with some of the data: name
        var full_name = getContactName(contact);
        if(contact.user_id!=user_id && typeof master_user_id==='undefined'){
            $.contactview.addClass('read-only');            
        } else{
            $.contactview.removeClass('read-only');
        }

        $('#vc-name').text(full_name);
        if($card!=null){
            $card.find(".name").text(full_name);
            $card.data('name',full_name);
            $card.find(".email").text(contact.primary_email);
        }        
        /// ... email
        $('#vc-primary_email').show().find(".content").html(
            $.Splash.at_fix(contact.primary_email));
        
        /// ... title
        var title = contact.title || contact.organization;
        if (contact.title && contact.organization) {
            title += ", " + contact.organization.trim();
        }
        if (!title) {
            $('#vc-title').hide().find(".content").empty();
        } else {
            $('#vc-title').show().find(".content").text(title);
        }
        
        if ('street' in contact && contact.street != null && contact.street!='') {
            $('#vc-address-fields,#vc-street').show();
            $('#vc-street').find('.content').text(contact.street.trim());
        } else{
            $('#vc-street').hide().find('.content').empty();
        }
        
        if ('city' in contact && contact.city != null) {
            $('#vc-address-fields,#vc-city').show();
            $('#vc-city').find('.content').text(contact.city.trim());
        } else {
            $('#vc-city').hide().find(".content").empty();
        }
        
        if ('state' in contact && contact.state != null) {
            $('#vc-address-fields,#vc-state').show();
            $('#vc-state').find('.content').text(contact.state.trim());
        } else {
            $('#vc-state').hide().find(".content").empty();
        }
        
        if ('zip' in contact && contact.zip != null) {
            $('#vc-address-fields,#vc-zip').show();
            $('#vc-zip').find('.content').text(contact.zip.trim());
        } else {
            $('#vc-zip').hide().find(".content").empty();
        }
        
        if ('phone' in contact && contact.phone != null) {
            $('#vc-phone').show().find('.content').text(contact.phone);
        } else {
            $('#vc-phone').hide().find(".content").empty();
        }
        
        if ('twitter_display_name' in contact && contact.twitter_display_name != null) {
            $('#vc-twitter_display_name').show().find('.content').text(contact.twitter_display_name);
        } else {
            $('#vc-twitter_display_name').hide().find(".content").empty();
        }
        if ('twitter_followers' in contact && contact.twitter_followers != null) {
            $('#vc-twitter_followers').show().find('.content').text(addCommas(contact.twitter_followers));
        } else {
            $('#vc-twitter_followers').hide().find(".content").empty();
        }
        
        if ('instagram_display_name' in contact && contact.instagram_display_name != null) {
            $('#vc-instagram_display_name').show().find('.content').text(contact.instagram_display_name);
        } else {
            $('#vc-instagram_display_name').hide().find(".content").empty();
        }
        if ('instagram_followers' in contact && contact.instagram_followers != null) {
            $('#vc-instagram_followers').show().find('.content').text(addCommas(contact.instagram_followers));
        } else {
            $('#vc-instagram_followers').hide().find(".content").empty();
        }
        
        if ('facebook_display_name' in contact && contact.facebook_display_name != null) {
            $('#vc-facebook_display_name').show().find('.content').text(contact.facebook_display_name);
        } else {
            $('#vc-facebook_display_name').hide().find(".content").empty();
        }
        if ('facebook_friends' in contact && contact.facebook_friends != null) {
            $('#vc-facebook_friends').show().find('.content').text(addCommas(contact.facebook_friends));
        } else {
            $('#vc-facebook_friends').hide().find(".content").empty();
        }
        
        if ('location' in contact && contact.location != null) {
            $('#vc-location').show().find('.content').text(contact.location);
        } else {
            $('#vc-location').hide().find(".content").empty();
        }
        
        if ('organization' in contact && contact.organization != null) {
            $('#vc-organization').show().find('.content').text(contact.organization);
        } else {
            $('#vc-organization').hide().find(".content").empty();
        }

        if ('website' in contact && contact.website != null) {
            $('#vc-website').show().find('.content').text(contact.website);
        } else {
            $('#vc-website').hide().find(".content").empty();
        }

        if ('title' in contact && contact.title != null) {
            $('#vc-title').show().find('.content').text(contact.title);
        } else {
            $('#vc-title').hide().find(".content").empty();
        }
        
        if ('gender' in contact && contact.gender != null) {
            $('#vc-gender').show().find('.content').text(contact.gender);
        } else {
            $('#vc-gender').hide().find(".content").empty();
        }

        if('birthday' in contact && contact.birthday!=null){
            $('#vc-birthday').show().find('.content').text(contact.birthday);
        } else{
            $('#vc-birthday').hide().find(".content").empty();
        }
    }

    function populateEventProfile(event_id,result){
        if(result['data']['event_domain'].indexOf("https://")==-1){
            var domain = 'http://'+result['data']['event_domain'].replace('http://','');
        } else { //if its got https, don't mess with it.
            var domain = result['data']['event_domain'];
        }

        $("#vc-name").html(result['data']['Event']['title']);
        $("#vc-title").show().find(".content").html(result['data']['Event']['title']);
        $("#event-detail-bg").css('background-image','url("'+result['data']['event_image']+'")');
        //$("#avatar-image-frame").find(".avatar-image").prop("src",result['data']['event_image']);
 
        $("#vc-website").show().find(".content").html(result['data']['event_domain']);
        $("#joinEvent").prop("href",domain);

        var venue_parts = result['data']['venue']['value'].split("<br>");
        if(venue_parts.length >0){
            venue_parts[0] = '<span class="semiBold">'+venue_parts[0]+'</span>';//wrap the venue title in bold.
        }
        var venue_formatted = venue_parts.join('<br>');
        $("#vc-venue").show().find(".content").html(venue_formatted);
        $("#vc-date").show().find(".content").html(result['data']['date']['date']+', '+result['data']['date']['day_long']+', '+result['data']['date']['year']);
        $("#vc-time-start").show().find(".content").html(result['data']['date']['time']['start']);
        if(result['data']['date']['time']['end']!=''){
            $("#vc-time-end").show().find(".content").html(result['data']['date']['time']['end']);
        }
        var txt = (result['data']['rsvp_counts']['total']=='1')?'Response':'Responses';
        $("#event-view-rsvp-count").find(".count").text(addCommas(result['data']['rsvp_counts']['total'])).end()
            .find(".noun").text(txt);
        $("#event-page-views").find(".count").text(addCommas(result['data']['EventSetting']['hits']));
        //planner counts
        var ec_count = result['data']['ec_count']*1;
        var txt = (ec_count=='1')?'Planner':'Planners';//check for plural
        $("#event-view-collabs").find(".count").text(ec_count).end()
            .find(".noun").text(txt);
        var $collabList = $("#collaborator-list");
        var lis ='';
        var x = 1;
        for(var z in result['data']['event_contacts']){
            if(x<=6){//only first 6 rows.  
                lis+='<li class="grp w1-6"><img src="'+result['data']['event_contacts'][z]['image_url']+'" /></li>';
                x++;
            }    
        }     
        $collabList.html(lis);
        
        //planner privileges
        var event_contact = result['data']['ec_row'];
        if(typeof event_contact['EventContact']!=='undefined'){
            if(event_contact['EventContact']['access_type']=='owner'){
                $.contactview.removeClass('joinEvent').addClass('eventOwner');
                $("#deleteEventLink,#duplicateEventLink").show();
                $("#leaveEventLink,#joinEvent").hide();
            } else if(event_contact['EventContact']['confirmed']=='1'){//unconfirmed. join event
                $.contactview.removeClass('joinEvent eventOwner');
                $("#leaveEventLink,#duplicateEventLink").show();
                $("#deleteEventLink,#joinEvent").hide();
            } else if(event_contact['EventContact']['confirmed']=='0'){
                $.contactview.addClass('joinEvent').removeClass('eventOwner');
                $("#deleteEventLink,#duplicateEventLink,#editSettings").hide();
                $("#joinEventLink,#leaveEvent").show();
            }
        }

        $("#viewEventLink").prop("href",domain);
        $("#viewAsGuest").prop("href",domain+'?preview');
 
        if(result['data']['Event']['type_id']>0){
            var $event_type = $("#event-types").find("a[event_type_id='"+result['data']['Event']['type_id']+"']:first");
            if(typeof $event_type!=='undefined'){
                var et = $event_type.find(".label:first").text();
                if(typeof et!=='undefined' && et!=''){
                    $("#vc-event-type").show().find(".content").html(et);
                }
            }    
        }
          // console.log("contactss that ish!");
           //only populate if they're still on the page!
           //populateContactHistory(data['id'],result['data']['history'],contact);
               
        // } else{
        //     //don't populate the history div, theyre no longer visible.
        //     //console.log("no longer visible");

           // }

    }
    function getContactName(contact){
        var full_name = '';
        if(contact.first_name !== null){
            full_name = contact.first_name;
        }
        if(contact.last_name !== null){
            if(contact.first_name !== null){
                full_name+=' '+contact.last_name;
            } else {
                full_name = contact.last_name;                        
            }
        }
        if(contact.first_name === null && contact.last_name===null && contact.primary_email!==null){
            full_name = contact.primary_email;
        }
        return full_name;
    }

    function updateContactCount(noReload){
        var section = $.Splash.whereAmI();
        //if we're in the contact section, run a hard refresh on rooty so we get the new people if applicable.
        if(section.id=='sort-by-contact' && noReload==null){
            $.rooty.QED({ force: true, visible: true });
        }
        $.ajax({
            url:"/address_book/api_stats_count/contacts",
            data: {},
            dataType: 'json',
            success:function(response){
                if ('contacts' in response.data) {
                    var contactcount = addCommas(response.data['contacts']);
                    $('#all-contacts-count,#total-community').html(contactcount).removeClass('loading');
                }
            },
            error:function(){

            }
        });  
    }

    function populateContactHistory(contact_id,history,contact){
       $("#history-container").empty();
       if(typeof history!=='undefined'){
            for(var y in history){
                //console.log('..',history[y]);
                var $item = $("#blank-timeline-item .timeline-item").clone();
                $item.attr("item",history[y]['type']).find(".script").text(history[y]['text']);
                $item.find(".event-title").text(history[y]['title']).attr({
                    'item-type':history[y]['type'],
                    'item-id':history[y]['id'],
                    'event-id':history[y]['event_id'],
                    'domain':history[y]['domain']
                });
                //prop("href",'/events/view/'+data['event_id']);
                //$item.find(".action-icon").find("i:first").addClass(history[y]['icon']);
                $item.find(".when").text(history[y]['created']);
                $item.find(".middle").text(contact.initial);
                if(history[y]['type']=='photo' || history[y]['type']=='twitter' || history[y]['type']=='instagram'){
                    if(history[y]['photo']['remote_followers']=='null' || history[y]['photo']['remote_followers']==null){ 
                        history[y]['photo']['remote_followers']='';
                    }
                    var str = '<img class="photo" src="'+history[y]['image_url']+'" />'+
                        '<span class="grp caption clear">'+history[y]['photo']['caption']+'</span>'+
                        '<div class="grp" style="border-left:1px dotted #888">'+
                        'Sent from <span class="handle ellipsis semiBold">@'+(''+history[y]['photo']['remote_screen_name']).replace('@','')+'</span>'+
                        'to <span class="followers semiBold">'+addCommas(history[y]['photo']['remote_followers'])+'</span> followers'+
                        '<div>';
                   $item.find(".more-info").html(str);     
                } else if(history[y]['type']=='rsvp'){
                    if(typeof history[y]['questions']!=='undefined' 
                        && history[y]['questions']!=''){
                        var lis = '<div class="question-list">';
                        if(typeof history[y]['questions']['order']!=='undefined'){//TICKET SALE
                            lis+='<div class="grp w3-4">';
                            lis+='<small class="question">TICKET TYPE</small><div class="answer bigger em05">'+history[y]['questions']['ticket_type']+'</div>';
                            lis+='<small class="grp abs p1 pb0 pt0 wA bl answer clearLeft answer">'+history[y]['questions']['order']+'</small>';
                            lis+='</div>';
                            lis+='<div class="grp w1-4">';
                            lis+='<small class="question">ORDERED</small><div class="answer">'+history[y]['questions']['quantity']+' @ '+history[y]['questions']['price']+'</div>';
                            //lis+='<div class="question">Price:</div><div class="answer">'+history[y]['questions']['price']+'</div>';
                            lis+='<small class="question">TOTAL</small><div class="answer">'+history[y]['questions']['total']+'</div>';
                            lis+='</div>';
                        } else {
                            for(var q in history[y]['questions']){
                                lis += '<li><div class="question">'+ history[y]['questions'][q]['question']+'</div>'+
                                '<div class="answer">'+history[y]['questions'][q]['answer']+'</div></li>';
                            }
                        }    
                        lis+='</div>';
                        $item.find(".more-info").html(lis);
                    }
                }

                $("#history-container").append($item); 

                //  var item = '<div class="grp timeline-item"><div class="grp w1-8 p0">'
            }
       }

        var dateObj = parseDatetime(contact.createdate);
        if ( dateObj !== false ) {
            //console.log("DATE OBJ",dateObj);
            var date_string = $.datepicker.formatDate('MM d, yy',dateObj); // date display
            $("#address-book-created").html('Contact created '+date_string).show();
        } else{
            $("#address-book-created").hide();
        }
    }

    //////////// DATE FUNCTIONS  ////////////
    Date.prototype.getCalendarMonth = function() {
        return (arguments[0] || this.getMonth()) + 1;
    };

    function formatDate(obj){
        var monthNames = [ "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December" ];
        var year = obj.raw.split('-')[0];
        return monthNames[obj.month]+' '+obj.day+', '+year;
    }
    //////////// END DATE FUNCTIONS ////////////

    function highlightMatches($obj,term,full_search,search_email){
         //var contact_name = $.trim($obj.text()).toLowerCase();
         var contact_name = $.trim($obj.text());
         var match_found = false;
         if (contact_name!='') {
             if (full_search==null) {

                 var contact_array = contact_name.split(' ');
                 //console.log(contact_array);
                 for (var x in contact_array) {
                     if(!match_found && typeof contact_array[x][0]!=='undefined' && contact_array[x][0].toLowerCase()==term) {
                         contact_array[x] = '<b class="highlight">'+contact_array[x][0]+'</b>'+contact_array[x].substr(1);
                         match_found = true;
                     }
                 }
                 $obj.html(contact_array.join(' '));
             } else {
                 var regex = new RegExp( '(' + term + ')', 'gi' );
                 if (contact_name.match(regex)) {
                     var updated_name = contact_name.replace( regex, "<b class='highlight'>$1</b>" );
                     $obj.html(updated_name);
                     match_found=true;
                 }
             }

         }
         if (!match_found && search_email==null) {
             highlightMatches($obj.parents("ul.details").find("li.email"),term,full_search,1);
         }
    }

    //function is used to clear out any advanced filters on the fly.  
    function clearAdvancedFilters(){
        $("#filter-start-date,#filter-end-date").val('');
        var $advanced_filters = $("#advanced-search").find(".adv-filter");
        $advanced_filters.each(function(){
            $(this).val(0).parent().removeClass('checked');
        });

        var $event_filters = $("#advanced-questions").find(".question");
        $event_filters.find("input").each(function(){
            if($(this).attr("type")=='text'){
                $(this).val('');
            } else{
                $(this).parent().removeClass('checked');
            }
        });
        hideEventQuestions();
        $("#toggleEventQuestions").removeClass('active');
        $.rooty.defaults({ filters: null, start_date: null, event_filters: null, end_date: null, vip: null });
    }

    function hideEventQuestions($wrap){
        if($wrap==null){
            var $wrap = $("#advanced-questions").find(".question-list-wrap");
        }
        $wrap.hide();
        $("#toggleEventQuestions").removeClass('open');
    }

    function parseDatetime(datetime){
        if ( datetime == '' || datetime == null ) return false;
        var parts = (''+datetime).split(/ |-|:/);
        if ( parts.length < 3 || parts[0] == '0000' ) return false;
        var dateObj = new Date(parseInt(parts[0]),parseInt(parts[1])-1,parseInt(parts[2]),parseInt(parts[3]),parseInt(parts[4]),parseInt(parts[5]));
        return dateObj;
    }

    function getRandomColor(){
        var colors = ['#25f3d2','#0C9E86','#85F9E6'];
        var color = colors[Math.floor(Math.random()*colors.length)];
        return color;
    }
    
    function imgError(obj,randomize){
        var $this = $(obj);
        var initial = $this.attr("itl");
        var letter = (initial!='none')?initial:'';

        var attr = '';
        if(randomize!=null){
            var color = getRandomColor();
            attr='style="background-color:'+color+'"';
        }


        if($this.parent().hasClass('alpha-avatar')){//only one level in.
            $this.replaceWith('<div class="letter">'+letter+'</div>');
        } else{
            $this.replaceWith('<div class="alpha-avatar letter-'+initial+'" '+attr+'><div class="letter">'+letter+'</div></div>');
        }
    }

    function getInitial(name){
        var initial = name.replace(/^[\$\W]/, "").substring(0, 1).toUpperCase();
        initial = initial.replace(/\W/g, '');//leave only alphanumeric
        if(typeof initial=='undefined' || initial.trim()==''){
            initial = 'none';
        }

        return initial;

    }

    function clearAllFilters(){
        clearAdvancedFilters();
        flipDropDown($("#filter-sorter-hidden").parents(".nu-dropdown:first"),'alphabet');  
        $.rooty.defaults({ sort_by: 'alphabet' });
    }

    function flipDropDown($dropdown,newVal,triggerChange){
        if(triggerChange!=null && triggerChange==true){//special parameter to see if we should force a change event.
            $dropdown.find('input:first').val(newVal).trigger('change');
        } else{//otherwise, just change the value.
            $dropdown.find('input:first').val(newVal);
        }
        //now find that value in the dropdown and make it show.  
        var $opt = $dropdown.find('.options div[value="'+newVal+'"]');
        $opt.addClass('active').siblings().removeClass('active');
        $dropdown.find('.current').html($opt.html());
    }

    function formatTime(dateObj){
        var hr = dateObj.getHours(),
        min = dateObj.getMinutes(),
        meridian = 'am';
        
        if(hr>12){
            meridian='pm';
            hr=hr-12;
        } else if (hr==12){
            meridian = 'pm';
        } else if(hr == 0){
            hr = 12;
            meridian = 'am';
        }
        if(min<10){ 
            min='0'+min; //ie 9 -> '09', 0 -> '00', etc.
        }
        return hr+':'+min+''+meridian;//return in g:ia format.
    }

    function setFlash(msg,extraClass,stayOpen){
        var classToAdd = '';
        if(extraClass!=null){
            classToAdd=extraClass;
        }
        $("#splashMessage").removeClass('success error').addClass(classToAdd).find(".body").text(msg).end().fadeIn(300);
        setTimeout(function(){
            if(stayOpen==null){
                $("#splashMessage").hide();//;.find(".body").text('');
            }
        },4000);
    }

    function populateEventLocations(locations){
        var lis = '',
            locationcount = addCommas(locations.length);
        for(var x in locations){
             var l_count = addCommas(locations[x]['count']),
                l_name = locations[x]['name'],
                l_val = locations[x]['event_ids'];
        
             lis+='<li class="as-written rel"><a href="#" event_ids="'+l_val+'" field-name="event_ids" class="event-location-option">'+
                 '<span class="label ellipsis">'+l_name+'</span>'+
                 '<span class="regular right badge">'+l_count+'</span></a></li>';
        }

        if (locationcount == 1) {
            $("#firstViewLocations").find(".block").html('Location');
        }
        $('#sort-by-location-count').html(locationcount).removeClass('loading');
        $("#firstViewLocations").find(".count").html(locationcount);
        $("#locations-custodian").find(".filtered-total").html(locationcount);    
        $("#event-locations").html(lis);
        //$.stats.toplocations.empty();//.america(data.locations);
    }

    function isPrivateEvent(){
        if($.inArray($("#private-type-input").val(),['all','when_where_rsvp'])>-1){
            return true;
        } else{
            return false;
        }
    }

    function eventTypeMarkup(event_type){
        var et_id = event_type['id'],
            et_count = addCommas(event_type['count']),
            et_name = event_type['name'].trim();
        
        if(et_name=='') {
            et_name='None Listed';
        } 
        var li = '<li class="as-written rel"><a href="#" event_type_id="'+et_id+'" class="event-type-option">'+
            '<span class="label ellipsis">'+et_name+'</span>'+
            '<span class="regular right badge">'+et_count+'</span></a></li>';
        return li;
    }

    function eventContactMarkup(ec,formatted){
        var ec_count = addCommas(ec['count']),
           ec_name = ec['name'];

        if(formatted!=null){
            var field = ec['field'];
            var val = ec['id'];
        } else{
           if(ec['EventContact']['abc_id']>0){
               var field = 'abc_id';
               var val = ec['EventContact']['abc_id'];
           } else if(ec['EventContact']['group_id']>0){
               var field = 'group_id';
               var val = ec['EventContact']['group_id'];
           } else{
               var field = 'contact_id';
               var val = ec['EventContact']['contact_id'];
           }
       }        
        
        var li = '<li class="as-written rel"><a href="#" '+field+'="'+val+'" field-name="'+field+'" class="collaborator-option">'+
        '<span class="label ellipsis">'+ec_name+'</span>'+
        '<span class="regular right badge">'+ec_count+'</span></a></li>';
        
        return li;
    }

    function updateEventDomain(){
        var $event_title = $("#dupe-event-title");
        var $domain_input = $("#dupe-event-domain");

        var domain_value = $.trim($event_title.val().replace(/[^-_0-9a-z]/ig,''));
        //console.log("ADOS "+domain_value);
        if(!$domain_input.attr("changed")){
            var domain_formatted = domain_value.toLowerCase().substring(0,30);
            $domain_input.val(domain_formatted);
            if(!$domain_input.is(":visible")){
                $("#splashDomainLink").find("span").text(domain_formatted+'.splashthat.com').fadeIn();
            }
            $("#changeSplashDomainLink").fadeIn();
            //return;
        }
        // $("#event-hashtag").val('#'+domain_value);
        // $("#splashHashLink").find("span").text('#'+domain_value);
    }
