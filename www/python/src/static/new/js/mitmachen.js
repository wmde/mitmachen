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
            console.log(d);
        },
        error: function(err){
            console.log(err);
        }
    })
}

// get subcategories for categories
function getSubcategoriesForUser(){
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
                            $('.owl-carousel').append('<div class="item active"><span>'+d['data'][item]+'</span></div>')
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
                    console.log(err);
                }
            })
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
    getSubcategoriesForUser();

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

                $("<a/>").attr("href", "https://de.wikipedia.org/wiki/".concat(encodeURIComponent(doc.page))).attr('target', '_blank').html("Preview Article").appendTo(ptag);
            })

            $.each(doc.problems, function(i, problem){
                var ulLi = $("<li/>");
                var a = $("<a/>").addClass('dropdown').attr("href", "https://de.wikipedia.org/wiki/".concat(encodeURIComponent(doc.page)).concat(anchor[problem])).appendTo(ulLi);
                var adiv = $('<div/>').addClass('dropdown-menu custom-dropdown');
                $('<p/>').text(problem).appendTo(adiv);
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

            window.location.href = '/articles';
        }
    })

    if ($("#category").val() != "") {
        // console.log('this is running');
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

    var userInterests = [];

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
});
