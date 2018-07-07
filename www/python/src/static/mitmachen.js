$( function() {
    // https://stackoverflow.com/questions/34704997/jquery-autocomplete-in-flask
    $("#category").autocomplete({
        source:function(request, response) {
            $.getJSON("{{url_for('autocomplete')}}",{
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

    $.getJSON("{{url_for('suggest')}}", {},
        function(result) {
            var suggest = $("#suggested").text("Wie wäre es mit ")
            $.each(result.categories, function(i, value) {
                console.log(value);
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
                console.log(event.target.id);
                $("#category").val(event.target.id.replace(/suggest-/, ""));
                $("#category").change();
            });
    });

    $("#category").change(function(event) {
        var topic = $("#category").val();
        console.log(topic);

        var articleList = $("#articles");
        articleList.empty();

        $("<li/>").addClass("list-group-item")
            .text("Bitte warten...").appendTo(articleList);


        $.getJSON("{{url_for('find')}}", {q: topic}, function(result) {
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
        });

    });
});