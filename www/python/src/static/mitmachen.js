$( function() {
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

    $.getJSON($URL_FOR_SUGGEST, {},
        function(result) {
            var suggest = $("#suggested").text("Wie wäre es mit ")
            $.each(result.categories, function(i, value) {
                $("<span />").addClass("badge")
                    .addClass("badge-secondary").css("white-space", "normal")
                    .attr("id", "suggest-" + value).text(value).appendTo(suggest);
                if (i < result.categories.length - 2) {
                    suggest.append(" ");
                } else if ( i == result.categories.length - 2) {
                    suggest.append(" oder ")
                }
            });
            suggest.append("?");

            $("span.badge").click(function(event){
                $("#category").val(event.target.id.replace(/suggest-/, ""));
                $("#category").change();
            });
    });

    $("#category").on("change keypress", function(event) {
        if (event.type == 'change' || (event.type == 'keypress' && event.which == 13)) {
            var topic = $("#category").val();
            console.log(topic);

            var articleList = $("#articles");
            articleList.empty();

            $("<li/>").addClass("list-group-item")
                .text("Bitte warten...").appendTo(articleList);


            $.getJSON($URL_FOR_FIND, {q: topic}, function(result) {
                articleList.empty();
                $.each(result.articles, function(i, doc) {
                    var li = $("<li/>").addClass("list-group-item").appendTo(articleList);
                    var div = $("<div/>").appendTo(li);
                    var htitle = $("<h6>").addClass("my-0").appendTo(div);

                    $.getJSON("https://de.wikipedia.org/api/rest_v1/page/summary/".concat(encodeURIComponent(doc.page)),
                    function(result) {
                        $("<a/>").attr("href", "https://de.wikipedia.org/wiki/".concat(encodeURIComponent(doc.page))).html(result.displaytitle).appendTo(htitle);
                        $("<small/>").addClass("text-muted").text(result.description).appendTo(div);
                    });

                    $.each(doc.problems, function(i, problem){
                        $("<span/>").addClass("badge").addClass("badge-warning").text(problem).appendTo(li);
                    });
                });

                if (result.articles.length == 0) {
                    $("<li/>").addClass("list-group-item")
                        .text("Keine Ergebnisse gefunden. Wie wäre es mit einem der nebenstehenden Themen?")
                        .appendTo(articleList);
                }
            });
        }
    });

});