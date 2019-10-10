// All displayed text is defined here
var text = {
    SUGGEST_INTRO: "Wie wäre es mit",
    SUGGEST_OR: "oder",
    PLEASE_WAIT: "Bitte warte einen Moment...",
    NO_RESULTS: "Dazu haben wir leider nichts gefunden. Wie wäre es mit einem anderen Thema?",
    MORE_RESULTS: "Zu diesem Thema gibt's noch mehr...",
    LOAD_MORE: "neue Vorschläge anzeigen",
    "Belege fehlen": "In diesem Artikel fehlen Belege. Recherchiere fehlende Quellen und füge sie ein.",
    "Veraltet": "Teile dieses Artikels sind nicht auf dem neuesten Stand. Recherchiere die Informationen und ergänze den Artikel.",
    "Lückenhaft": "In diesem Artikel fehlen wichtige Informationen. Recherchiere die Informationen und ergänze den Artikel.",
    "Ungeprüfter Link": "In diesem Artikel wurde ein Link automatisch aktualisiert. Prüfe, ob der Link noch stimmt.",
    "Überarbeiten": "In diesem Artikel muss grundlegend etwas verändert werden. Schau nach, was fehlt und überarbeite den Artikel."
}

var anchor = {
    "Belege fehlen": "#Vorlage_Belege_fehlen",
    "Veraltet": "#Vorlage_Veraltet",
    "Lückenhaft": "#Vorlage_Lueckenhaft",
    "Ungeprüfter Link": "",
    "Überarbeiten": "#Vorlage_Ueberarbeiten",
    "Allgemeinverständlichkeit": "#Vorlage_Unverstaendlich"
}

var userInterests = [];
var popularInterests = [];

// get articles for a subcategory
function getArticlesSubcateg(name){

    trackingUserActivity('subcategoryarticle', name, '');

    var articleList = $('.results-search');
    articleList.empty();


    $.getJSON($URL_FOR_SUBARTICLES, {q: name}, function(result){
        if(result['status']){
            var data = result['data'][0];
            if(data.length == 0){
                $('.article-found').text("");
                $("<div/>").text(text.NO_RESULTS).appendTo(articleList);
            }else{
                $('.article-found').text(data.length + ' articles found for ' + name);
            }

            $.each(data, function(i, doc){

                var div = $("<div/>").addClass("list-box list-box-new mb-2").appendTo(articleList);
                var h3 = $("<h3/>").appendTo(div);
                var ptag = $("<p/>").appendTo(div);
                var ul = $("<ul/>").addClass('links-row').appendTo(div);

                $.getJSON("https://de.wikipedia.org/api/rest_v1/page/summary/".concat(encodeURIComponent(doc.page)), function(result){
                    $("<a/>").attr("href", "https://de.wikipedia.org/wiki/".concat(encodeURIComponent(doc.page))).attr('target', '_blank').html(result.displaytitle).appendTo(h3);
                    /*$("<small/>").addClass("text-muted")
                        .text(result.description)
                        .appendTo(div);*/

                    var pvLink = $URL_FOR_PREVIEW + "?q=https://de.wikipedia.org/wiki/".concat(encodeURIComponent(doc.page)) + "&problems=".concat(doc.problems);
                    
                    $("<a/>").attr("href", pvLink).attr('target', '_blank').html("Preview Article").appendTo(ptag);
                })

                $.each(doc.problems, function(i, problem){
                    var ulLi = $("<li/>").addClass('dropdown');
                    var a = $("<a/>").addClass('dropdown-toggle').attr("href", "https://de.wikipedia.org/wiki/".concat(encodeURIComponent(doc.page)).concat(anchor[problem])).html(problem).appendTo(ulLi);
                    var prb = problem.toLowerCase().replace(/\s/g, "_");
                    var adiv = $('<div/>').addClass('dropdown-menu custom-dropdown').addClass(prb).attr('aria-labelledby', "dropdownMenuButton");
                    $('<p/>').text(text[problem]).appendTo(adiv);
                    adiv.appendTo(ulLi);
                    /*$("<span/>").addClass("badge")
                    .addClass("badge-warning")
                    .attr("title", text[problem])
                    .text(problem)
                    .appendTo(a);*/

                    ulLi.appendTo(ul);
                })

            })

            if(result.more){
                var more = $("<div/>").text(text.MORE_RESULTS).appendTo(articleList);
                $("<button />").addClass("btn")
                    .addClass("btn-secondary")
                    .attr("type", "button")
                    .text(text.LOAD_MORE)
                    .click(function(event) {
                        $("#category").change();
                    })
                    .css("margin-left", "0.5em")
                    .appendTo(more);
            }

        }
    })

}

function suggest_topics() {
    $.getJSON($URL_FOR_SUGGEST, {},
        function(result) {
            var suggest = $("#suggested").text(text.SUGGEST_INTRO + " ")
            $.each(result.categories, function(i, value) {
                $("<span />").addClass("badge")
                    .addClass("badge-secondary").attr("title", value)
                    .attr("id", "suggest-" + value).text(value).appendTo(suggest);
                if (i < result.categories.length - 2) {
                    suggest.append(" ");
                } else if ( i == result.categories.length - 2) {
                    suggest.append(" " + text.SUGGEST_OR + " ")
                }
            });
            suggest.append("?");

            $("span.badge").click(function(event){
                $("#category").val(event.target.id.replace(/suggest-/, ""));
                $("#category").change();
            });
    });
}

// params - type, title, weblink
function trackingUserActivity(type, title, weblink){
    var data = {};
    data['type'] = type;
    data['title'] = title;
    data['weblink'] = weblink;
    $.ajax({
        url: $URL_FOR_TRACKING,
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(data),
        success: function(d){
            // console.log(d);
        },
        error: function(err){
            // console.log(err);
        }
    })
}

// get subcategories for categories
function getSubcategoriesForUser(type){

    if(type == "popular"){
        var userInt = localStorage.getItem('user_interests_popular');

        if(userInt != undefined){
            userInt = JSON.parse(userInt);
            if(userInt.length > 0){
                $.ajax({
                    url: $URL_FOR_GETSUBCATEG,
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(userInt),
                    success: function(d){
                        if(d['status']){
                            $('.categories-subcategories-popular').html('<div class="owl-carousel owl-theme common-grid-listing"></div>');

                            for(var item in d['data']){
                                if(item == 0){
                                    $('.owl-carousel').append('<div class="item active subcateg-item" data-attr-name="'+d['data'][item]+'"><span>'+d['data'][item]+'</span></div>');
                                    getArticlesSubcateg(d['data'][item]);
                                }else{
                                    $('.owl-carousel').append('<div class="item subcateg-item" data-attr-name="'+d['data'][item]+'"><span>'+d['data'][item]+'</span></div>');
                                }
                            }

                            var owl = $('.owl-carousel');
                            owl.owlCarousel({
                                stagePadding: 130,
                                margin: 10,
                                nav: true,
                                loop: false,
                                navRewind: false,
                                responsive: {
                                    0: {
                                        items: 1,
                                        stagePadding: 50,
                                    },
                                    600: {
                                        items: 2
                                    },
                                    1000: {
                                        items: 5
                                    }
                                }
                            });

                        }
                    },
                    error: function(err){
                        // console.log(err);
                    }
                })
            }
        }
    }else{
        var userInt = localStorage.getItem('user_interests');

        if(userInt != undefined){
            userInt = JSON.parse(userInt);
            if(userInt.length > 0){
                $.ajax({
                    url: $URL_FOR_GETSUBCATEG,
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(userInt),
                    success: function(d){
                        if(d['status']){
                            $('.categories-subcategories').html('<div class="owl-carousel owl-theme common-grid-listing"></div>');

                            for(var item in d['data']){
                                if(item == 0){
                                    $('.owl-carousel').append('<div class="item active subcateg-item" data-attr-name="'+d['data'][item]+'"><span>'+d['data'][item]+'</span></div>');
                                    getArticlesSubcateg(d['data'][item]);
                                }else{
                                    $('.owl-carousel').append('<div class="item subcateg-item" data-attr-name="'+d['data'][item]+'"><span>'+d['data'][item]+'</span></div>');
                                }
                            }

                            var owl = $('.owl-carousel');
                            owl.owlCarousel({
                                stagePadding: 130,
                                margin: 10,
                                nav: true,
                                loop: false,
                                navRewind: false,
                                responsive: {
                                    0: {
                                        items: 1,
                                        stagePadding: 50,
                                    },
                                    600: {
                                        items: 2
                                    },
                                    1000: {
                                        items: 5
                                    }
                                }
                            });

                        }
                    },
                    error: function(err){
                        // console.log(err);
                    }
                })
            }
        }
    }

    
}

// function that runs on articles page only
// check if search term is there, also bring in suggested topics, also topics based on user interests
function runArticlesCode(){

    var topic = localStorage.getItem('search');

    if(topic != undefined && topic != ""){
        $("#category").val(topic);
        findTopics(topic);
    }

    suggest_topics();

    // fetch subcategories
    // getSubcategoriesForUser();

}

function findTopics(topic){

    trackingUserActivity('search', topic, '');

    var articleList = $('.results-search');
    articleList.empty();

    $("<div/>").text(text.PLEASE_WAIT).appendTo(articleList);

    $.getJSON($URL_FOR_FIND, {q: topic}, function(result){
        articleList.empty();

        if(result.articles.length == 0){
            $("<div/>").text(text.NO_RESULTS).appendTo(articleList);
            suggest_topics();
        }else{
            $('.article-found').text(result.articles.length + ' articles found for ' + topic);
        }

        $.each(result.articles, function(i, doc){

            var div = $("<div/>").addClass("list-box list-box-new mb-2").appendTo(articleList);
            var h3 = $("<h3/>").appendTo(div);
            var ptag = $("<p/>").appendTo(div);
            var ul = $("<ul/>").addClass('links-row').appendTo(div);

            $.getJSON("https://de.wikipedia.org/api/rest_v1/page/summary/".concat(encodeURIComponent(doc.page)), function(result){
                $("<a/>").attr("href", "https://de.wikipedia.org/wiki/".concat(encodeURIComponent(doc.page))).attr('target', '_blank').html(result.displaytitle).appendTo(h3);
                /*$("<small/>").addClass("text-muted")
                    .text(result.description)
                    .appendTo(div);*/
                $("<span/>").text(result.description).appendTo(ptag);
                var pvLink = $URL_FOR_PREVIEW + "?q=https://de.wikipedia.org/wiki/".concat(encodeURIComponent(doc.page)) + "&problems=".concat(doc.problems);
                    
                $("<a/>").attr("href", pvLink).attr('target', '_blank').html("Preview Article").appendTo(ptag);
                // $("<a/>").attr("href", "https://de.wikipedia.org/wiki/".concat(encodeURIComponent(doc.page))).attr('target', '_blank').html("Preview Article").appendTo(ptag);
            })

            $.each(doc.problems, function(i, problem){
                var ulLi = $("<li/>").addClass('dropdown');
                var a = $("<a/>").addClass('dropdown-toggle').attr("href", "https://de.wikipedia.org/wiki/".concat(encodeURIComponent(doc.page)).concat(anchor[problem])).html(problem).appendTo(ulLi);
                var prb = problem.toLowerCase().replace(/\s/g, "_");
                var adiv = $('<div/>').addClass('dropdown-menu custom-dropdown').addClass(prb).attr('aria-labelledby', "dropdownMenuButton");
                $('<p/>').text(text[problem]).appendTo(adiv);
                adiv.appendTo(ulLi);
                /*$("<span/>").addClass("badge")
                .addClass("badge-warning")
                .attr("title", text[problem])
                .text(problem)
                .appendTo(a);*/

                ulLi.appendTo(ul);
            })

        })

        if(result.more){
            var more = $("<div/>").text(text.MORE_RESULTS).appendTo(articleList);
            $("<button />").addClass("btn")
                .addClass("btn-secondary")
                .attr("type", "button")
                .text(text.LOAD_MORE)
                .click(function(event) {
                    $("#category").change();
                })
                .css("margin-left", "0.5em")
                .appendTo(more);
        }

    })

}

function runTabAndCategCode(t){

    if(t == 'popular'){
        $(".nav-link").removeClass('active');
        $('.nav-link[href="#home"]').addClass('active');

        var curSelUserInterests = localStorage.getItem('user_interests_popular');
        curSelUserInterests = curSelUserInterests != undefined ? JSON.parse(curSelUserInterests) : "";
        
        var textToAdd = "";
        var fs = curSelUserInterests.length > 0 ? curSelUserInterests.slice(0,2).join(", ") : "";
        var ls = curSelUserInterests.length > 0 ? curSelUserInterests.slice(2).length : "";
        
        var textToAdd = (curSelUserInterests != undefined && curSelUserInterests.length > 0) ? ls > 0 ? (fs + " +"+ls+" more <a href='#' class='edit-categ-popular' data-toggle='modal' data-target='#changeCategPopular'>Edit</a>") : fs + " <a href='#' class='edit-categ-popular' data-toggle='modal' data-target='#changeCategPopular'>Edit</a>" : "";
        
        $('.user-sel-categories-popular').html(textToAdd);

        getSubcategoriesForUser('popular');

    }else{
        var curSelUserInterests = localStorage.getItem('user_interests');
        curSelUserInterests = curSelUserInterests != undefined ? JSON.parse(curSelUserInterests) : "";

        var textToAdd = "";
        var fs = curSelUserInterests.length > 0 ? curSelUserInterests.slice(0,2).join(", ") : "";
        var ls = curSelUserInterests.length > 0 ? curSelUserInterests.slice(2).length : "";

        var textToAdd = (curSelUserInterests != undefined && curSelUserInterests.length > 0) ? ls > 0 ? (fs + " +"+ls+" more <a href='#' class='edit-categ' data-toggle='modal' data-target='#changeCateg'>Edit</a>") : fs + " <a href='#' class='edit-categ' data-toggle='modal' data-target='#changeCateg'>Edit</a>" : ("No interests selected, please select. <a href='#' class='edit-categ' data-toggle='modal' data-target='#changeCateg'>Edit</a>");
        $('.user-sel-categories').html(textToAdd);

        getSubcategoriesForUser('user_interests');
    }
}

$( function() {
    

    // https://stackoverflow.com/questions/34704997/jquery-autocomplete-in-flask
    $("#category,#categoryindex").autocomplete({
        source:function(request, response) {
            var term = request.term.trim();
            if(term == ""){
                return false;
            }
            $.getJSON($URL_FOR_AUTOCOMPLETE,{
                q: term,
            },
            function(data) {
                response(data.categories);
            });
        },
        minLength: 3,
        select: function(event, ui) {
            $("#category,#categoryindex").val(ui.item.value);
            $("#category,#categoryindex").change();

            localStorage.setItem('search', ui.item.value.trim().toLowerCase());

            window.location.href = $URL_FOR_ARTICLES;

        }
    });

    
    // suggest_topics();

    $("#category").on("change keypress", function(event) {
        // if (event.type == 'change' || (event.type == 'keypress' && event.which == 13)) {
        if (event.type == 'keypress' && event.which == 13) {
            var topic = $("#category").val();
            topic = topic.trim().toLowerCase();
            $("#suggested").empty();

            
            if (!topic) {
                suggest_topics();
            } else {
                findTopics(topic);
            }
        }
    });

    $("#categoryindex").on('change keypress', function(event){
        if(event.type == 'keypress' && event.which == 13){
            var topic = $("#categoryindex").val();
            topic = topic.trim().toLowerCase();

            localStorage.setItem('search', topic);

            // window.location.href = '/articles';
            window.location.href = $URL_FOR_ARTICLES;
        }
    })

    if ($("#category").val() != "") {
        $("#category").change();
    }

    if($("#categoryindex").val() != ""){
        $("#categoryindex").change();
    }

    // for tracking
    // trackingUserActivity();
    $('body').on('click', '.slick-slide, .list-box h3 a', function(evt){
        // console.log($(this).attr('class'));
        // console.log(evt.target.tagName);

        var cl = $(this).attr('class');
        var tg = evt.target.tagName;
        // type title weblink
        if(cl === "search-title"){
            var txt = $(this).text();
            var link = $(this).attr('href');
            trackingUserActivity('link', txt, link);
        }else{
            var txt = $(this).text();
            txt.pop();
            txt.pop();
            txt = txt.join(' ');
            trackingUserActivity('category', txt, '');
        }

    })


    // for selecting user interests
    $('.user-interest').on('click', function(e){
        e.preventDefault();

        var itemName = $(this).attr('data-attr-name').replace(/_/g, " ");

        if($(this).hasClass('active')){
            $(this).removeClass('active');
            var idx = userInterests.indexOf(itemName);

            if(idx != -1)
                userInterests.splice(idx, 1)
    
        }else{
            $(this).addClass('active');
            userInterests.push(itemName);
        }


        if(userInterests.length > 0){
            $('#to-articles').removeClass('disabled');
        }else{
            $('#to-articles').addClass('disabled');
        }

        localStorage.setItem('user_interests', JSON.stringify(userInterests));
    })


    // popular interests select
    
    $('.user-interest-popular').on('click', function(e){
        e.preventDefault();
        var itemName = $(this).attr('data-attr-name').replace(/_/g, " ");

        if($(this).hasClass('active')){
            $(this).removeClass('active');
            var idx = popularInterests.indexOf(itemName);

            if(idx != -1)
                popularInterests.splice(idx, 1)
    
        }else{
            $(this).addClass('active');
            popularInterests.push(itemName);
        }


        if(popularInterests.length > 0){
            $('#to-articles-popular').removeClass('disabled');
        }else{
            $('#to-articles-popular').addClass('disabled');
        }

        localStorage.setItem('user_interests_popular', JSON.stringify(popularInterests));
    })

    $("#to-articles-popular").on('click', function(){
        localStorage.setItem('frompopular', 1);
    })

    $("#to-articles").on('click', function(){
        localStorage.setItem('frompopular', 0);
    })

    // show all selected by default
    $('.filter-task').trigger('click');

    $('.filter-task').on('click', function(e){
        // e.preventDefault();

        // var allChecked = $('.filter-task:checkbox:checked');
        // console.log(allChecked.length);

        var dn = $(this).attr('data-attr-name');
        var v = $(this).prop('checked');

        if(dn == "all_tasks" && v == true){
            $(".filter-task").prop('checked', true);
            $('.list-box').show();
        }else if(dn == "all_tasks" && v == false){
            $(".filter-task").prop('checked', false);
            $('.list-box').show();
        }

        if(dn != "all_tasks"){
            var p = $('.select-subitems ul .filter-task:checked').length;
            var q = $('.select-subitems ul .filter-task').length;
            // console.log(p, q);
            if(p == q){
                $('.filter-task[data-attr-name="all_tasks"]').prop('checked', true);
            }else{
                $('.filter-task[data-attr-name="all_tasks"]').prop('checked', false);
            }

            if(v == true){

                if($('.filter-task[data-attr-name="all_tasks"]').is(':checked')){
                    // $('.filter-task').prop('checked', false);
                    $(this).prop('checked', true);
                }else{
                    $('.list-box').hide();
                    // get all selected and show them
                    if($('.filter-task:checkbox:checked').length == 0){
                        $('.list-box').show();
                    }else{
                        $('.filter-task:checkbox:checked').each(function(i){
                            $('.'+$(this).attr('data-attr-name')).parent().parent().parent().show();
                        })
                    }
                }

            }else if(v == false){
                $('.list-box').hide();
                // get all selected and show them
                if($('.filter-task:checkbox:checked').length == 0){
                    $('.list-box').show();
                }else{
                    $('.filter-task:checkbox:checked').each(function(i){
                        $('.'+$(this).attr('data-attr-name')).parent().parent().parent().show();
                    })
                }
            }
        }

    })


    $('#category, #categoryindex').on('focus', function(){
        // $(this).prop('placeholder', 'Search a topic you want to contribute to');
        $(this).prop('placeholder', '');
    })

    $('#category, #categoryindex').on('focusout', function(){
        var v = $("#category,#categoryindex").val().trim();
        if(v == "")
            $(this).prop('placeholder', 'Search a topic you want to contribute to');
    })

    // show user selected categories on articles page
    /*var curSelUserInterests = localStorage.getItem('user_interests');
    curSelUserInterests = curSelUserInterests != undefined ? JSON.parse(curSelUserInterests) : "";

    var textToAdd = "";
    var fs = curSelUserInterests.length > 0 ? curSelUserInterests.slice(0,2).join(", ") : "";
    var ls = curSelUserInterests.length > 0 ? curSelUserInterests.slice(2).length : "";

    var textToAdd = (curSelUserInterests != undefined && curSelUserInterests.length > 0) ? ls > 0 ? (fs + " +"+ls+" more <a href='#' class='edit-categ' data-toggle='modal' data-target='#changeCateg'>Edit</a>") : fs + " <a href='#' class='edit-categ' data-toggle='modal' data-target='#changeCateg'>Edit</a>" : "";
    $('.user-sel-categories').html(textToAdd);*/


    $("#update-user-int").on('click', function(e){
        e.preventDefault();
        // update 
        $("#changeCateg").modal('hide');
        window.location.reload();
    })

    $("#update-user-int-popular").on('click', function(e){
        e.preventDefault();
        // update 
        $("#changeCategPopular").modal('hide');
        window.location.reload();
    })

    $("#changeCateg").on('shown.bs.modal', function(){
        var ui = localStorage.getItem('user_interests');
        ui = (ui != undefined) ? JSON.parse(ui) : [];

        if(ui.length > 0){
            ui.map((item) => {
                item = item.replace(/\s/g, '_');
                $('.user-interest-popup[data-attr-name="'+item+'"]').addClass('active');
            })
        }
    })

    $("#changeCategPopular").on('shown.bs.modal', function(){
        var ui = localStorage.getItem('user_interests_popular');
        ui = (ui != undefined) ? JSON.parse(ui) : [];

        if(ui.length > 0){
            ui.map((item) => {
                item = item.replace(/\s/g, '_');
                $('.user-interest-popup-popular[data-attr-name="'+item+'"]').addClass('active');
            })
        }
    })

    $('.user-interest-popup').on('click', function(e){
        e.preventDefault();
        console.log('clciked');
        var uIFromDb = localStorage.getItem('user_interests');
        uIFromDb = uIFromDb != undefined ? JSON.parse(uIFromDb) : [];

        var itemName = $(this).attr('data-attr-name').replace(/_/g, " ");

        // if(uIFromDb.length > 0){
        if($(this).hasClass('active')){
            $(this).removeClass('active');
            var idx = uIFromDb.indexOf(itemName);
            if(idx != -1)
                uIFromDb.splice(idx, 1)
    
        }else{
            $(this).addClass('active');
            uIFromDb.push(itemName);
        }
        // }

        localStorage.setItem('user_interests', JSON.stringify(uIFromDb));
    })

    $('.user-interest-popup-popular').on('click', function(e){
        e.preventDefault();

        var uIFromDb = localStorage.getItem('user_interests_popular');
        uIFromDb = uIFromDb != undefined ? JSON.parse(uIFromDb) : [];

        var itemName = $(this).attr('data-attr-name').replace(/_/g, " ");

        if(uIFromDb.length > 0){
            if($(this).hasClass('active')){
                $(this).removeClass('active');
                var idx = uIFromDb.indexOf(itemName);
                if(idx != -1)
                    uIFromDb.splice(idx, 1)
        
            }else{
                $(this).addClass('active');
                uIFromDb.push(itemName);
            }
        }

        localStorage.setItem('user_interests_popular', JSON.stringify(uIFromDb));
    })

    const $menu = $('.select-box-wrap');

    $(document).mouseup(e => {
        if (!$menu.is(e.target) // if the target of the click isn't the container...
            && $menu.has(e.target).length === 0) // ... nor a descendant of the container
        {
            $menu.find('.select-subitems').css('display', 'none');
        }
    });


    $('body').on('click', '.subcateg-item', function(){
        var name = $(this).attr('data-attr-name');
        $('.owl-item .item').removeClass('active');
        $(this).addClass('active');
        getArticlesSubcateg(name);
    })


});
