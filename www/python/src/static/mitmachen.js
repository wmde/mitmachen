$( function() {
    // All displayed text is defined here
    var text = {
        SUGGEST_INTRO: "Wie wäre es mit",
        SUGGEST_OR: "oder",
        PLEASE_WAIT: "Bitte warten...",
        NO_RESULTS: "Keine Ergebnisse gefunden.",
        MORE_RESULTS: "Weitere Ergebnisse verfügbar.",
        LOAD_MORE: "Neue Auswahl",
        "Belege fehlen": "In diesem Artikel fehlen Belege für Behauptungen",
        "Veraltet": "Teile dieses Artikels sind nicht auf dem neuesten Stand",
        "Lückenhaft": "Dieser Artikel ist nicht vollständig",
        "Ungeprüfter Link": "In diesem Artikel wurde automatisch ein Link aktualisiert.",
        "Überarbeiten": "In diesem Artikel muss grundlegend etwas verändert werden."
    }

    // https://stackoverflow.com/questions/34704997/jquery-autocomplete-in-flask
    $("#category").autocomplete({
        source:function(request, response) {
            $.getJSON($URL_FOR_AUTOCOMPLETE,{
                q: request.term,
            },
            function(data) {
                response(data.categories);
            });
        },
        minLength: 3,
        select: function(event, ui) {
            console.log(ui.item.value);
        }
    });

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
    suggest_topics();

    $("#category").on("change keypress", function(event) {
        if (event.type == 'change' || (event.type == 'keypress' && event.which == 13)) {
            var topic = $("#category").val();
            console.log(topic);

            $("#suggested").empty();

            var articleList = $("#articles");
            articleList.empty();

            $("<li/>").addClass("list-group-item")
                .text(text.PLEASE_WAIT).appendTo(articleList);


            $.getJSON($URL_FOR_FIND, {q: topic}, function(result) {
                articleList.empty();
                $.each(result.articles, function(i, doc) {
                    var li = $("<li/>").addClass("list-group-item")
                                       .appendTo(articleList);
                    var div = $("<div/>").appendTo(li);
                    var htitle = $("<h6>").addClass("my-0").appendTo(div);

                    $.getJSON("https://de.wikipedia.org/api/rest_v1/page/summary/".concat(encodeURIComponent(doc.page)),
                    function(result) {
                        $("<a/>").attr("href", "https://de.wikipedia.org/wiki/".concat(encodeURIComponent(doc.page)))
                                 .html(result.displaytitle)
                                 .appendTo(htitle);
                        $("<small/>").addClass("text-muted")
                                     .text(result.description)
                                     .appendTo(div);
                    });

                    $.each(doc.problems, function(i, problem){
                        $("<span/>").addClass("badge")
                                    .addClass("badge-warning")
                                    .attr("title", text[problem])
                                    .text(problem)
                                    .appendTo(li);
                        li.append(" ");
                    });
                });

                if (result.articles.length == 0) {
                    $("<li/>").addClass("list-group-item")
                              .text(text.NO_RESULTS)
                              .appendTo(articleList);
                    suggest_topics();
                }

                if (result.more) {
                    var more = $("<li/>").addClass("list-group-item")
                                         .text(text.MORE_RESULTS)
                                         .appendTo(articleList);
                    $("<button />").addClass("btn")
                                   .addClass("btn-secondary")
                                   .attr("type", "button")
                                   .text(text.LOAD_MORE)
                                   .click(function(event) {
                                       $("#category").change();
                                   })
                                   .appendTo(more);
                }
            });
        }
    });

    if ($("#category").val() != "") {
        $("#category").change();
    }
});