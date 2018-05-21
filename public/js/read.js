if(window.localStorage.username == null){
    window.location.href = '/login.html';
}else{
    var username = window.localStorage.username;
}

var url_string = window.location.href
var url = new URL(url_string);
//var storyid = url.searchParams.get("id"); 

try {
    //var username = url.searchParams.get("username");
    //var salt = url.searchParams.get("salt");
    var storyid = url.searchParams.get("id");
} catch (e) {
    //var username = parse_query_string(location.search.substring(1))["username"];
    var storyid = parse_query_string(location.search.substring(1))["id"];
}

$.ajax({
	url: "https://api.mlab.com/api/1/databases/darknessprevails/collections/darknessprevailssubmissions/"+storyid+"?apiKey=aDwl-yLfA68HFnJWjDsZmF8akGTu3lKJ",
	method: 'get',
	success: function(data){
        console.log('works');
        console.log(data);
        var text = data.story;
        text = text.replace(/\r?\n/g, '<br />');
		$('body').html(
		`<div class="storymeta">
          <h1 class="title"> `+data.title+` </h1>
          <hr class="break">
          <div class="postinfo">
            <h2 class="author"> By `+data.user+` <img src="/images/read/testuser.png" class="profilepic">
            </h2>
            <p class="stats"> `+data.category+` | `+(data.views).length+` view(s) | <img class="commenticon" src="/images/read/comment_icon.png">
              21 </p>
            <p class="usercontrols"> Edit | Report | Delete </p>
          </div>
          <div class="votes"> <button id="upvote" class="upvote" type="image" onclick='upvote(event, "`+storyid+`")'></button>
            <label class="votecount">`+data.votes+`</label> <button id="downvote" class="downvote" onclick='downvote(event, "`+storyid+`")'></button>
          </div>
          <hr class="break">
          <div class="body">
            <p class="storybody">`+text+`</p>
            <hr class="break">
          </div>
          <p> End <br><br>Share this story:<br>(add share button or buttons, whatever is most efficient)</p>
          <div class="commentarea">
            <hr class="break">
            <p> Leave a comment </p>
            <textarea id="comment" class="autoExpand" rows="5" data-min-rows="5" placeholder="Tell Your Story"

        minlength="500" required="">        </textarea>
            <hr class="break"> </div>
          <p style="text-align: left; margin-left: 5%;"> 21 comments: </p>
          Comments go here
          <hr class="break"> </div>`
		)
	},
    complete: function(){
        runupdatevotes();    
    }
})

function upvote(e, storyid){
    e.stopPropagation();
    console.log("Upvote");
    $.ajax({
        url: "https://api.mlab.com/api/1/databases/darknessprevails/collections/darknessprevailssubmissions/"+storyid+"?apiKey=aDwl-yLfA68HFnJWjDsZmF8akGTu3lKJ",
        method: 'get',
        success: function(data){
            console.log(data.votes);
            console.log(data.voters);
            var voters = data.voters;
            var votetype = data.votetype;
            if(voters.indexOf(username) < 0 || votetype[voters.indexOf(username)] == 'D' || votetype[voters.indexOf(username)] == 'N'){
                if(voters.indexOf(username) < 0){
                    voters.push(username);
                    votetype.push('U');
                } else if (votetype[voters.indexOf(username)] == 'D') {
                    votetype[voters.indexOf(username)] = 'N';
                } else {
                    votetype[voters.indexOf(username)] = 'U';
                }
                var votes = data.votes + 1;
                updatestoryvotes(votes, voters, votetype, storyid);
            }
        }
    })
}

function downvote(e, storyid){
    e.stopPropagation();
    console.log("Downvote");
    $.ajax({
        url: "https://api.mlab.com/api/1/databases/darknessprevails/collections/darknessprevailssubmissions/"+storyid+"?apiKey=aDwl-yLfA68HFnJWjDsZmF8akGTu3lKJ",
        method: 'get',
        success: function(data){
            console.log(data.votes);
            console.log(data.voters);
            var voters = data.voters;
            var votetype = data.votetype;
            if(voters.indexOf(username) < 0 || votetype[voters.indexOf(username)] == 'U' || votetype[voters.indexOf(username)] == 'N'){
                if(voters.indexOf(username) < 0){
                    voters.push(username);
                    votetype.push('D');
                } else if (votetype[voters.indexOf(username)] == 'U') {
                    votetype[voters.indexOf(username)] = 'N';
                } else {
                    votetype[voters.indexOf(username)] = 'D';
                }
                var votes = data.votes - 1;
                updatestoryvotes(votes, voters, votetype, storyid);
            }
        }
    })
}

function updatestoryvotes(votes, voters, votetype, storyID){
    $.ajax({
        url: "https://api.mlab.com/api/1/databases/darknessprevails/collections/darknessprevailssubmissions/"+storyID+"?apiKey=aDwl-yLfA68HFnJWjDsZmF8akGTu3lKJ",
        type: 'put',
        contentType: 'application/json',
        data: JSON.stringify({ "$set" : {"votes": votes, "voters": voters, "votetype": votetype}}),
        success: function(data) {
            //... do something with the data...
          console.log(data);
          $('.votecount').html(votes);
          if(votes == 0){ 
              $('.upvote').css('background-image', 'url(/images/read/upvote_empty.png)');
              $('.downvote').css('background-image', 'url(/images/read/downvote_empty.png)');
          } else if(votes < 0) {
              $('.upvote').css('background-image', 'url(/images/read/upvote_empty.png)');
              $('.downvote').css('background-image', 'url(/images/read/downvote_clicked.png)');
          } else if(votes > 0) {
              $('.upvote').css('background-image', 'url(/images/read/upvote_clicked.png)');
              $('.downvote').css('background-image', 'url(/images/read/downvote_empty.png)');
          }

        }
    }); 
}

function getviews(storyid){
    $.ajax({
	url: "https://api.mlab.com/api/1/databases/darknessprevails/collections/darknessprevailssubmissions/"+storyid+"?apiKey=aDwl-yLfA68HFnJWjDsZmF8akGTu3lKJ",
	method: 'get',
	success: function(data){
        var views = data.views;
        if(views.indexOf(username) < 0){
            views.push(username);
            updateview(views, storyid);
        }
	}
})
}

function updateview(views, storyID){
    $.ajax({
        url: "https://api.mlab.com/api/1/databases/darknessprevails/collections/darknessprevailssubmissions/"+storyID+"?apiKey=aDwl-yLfA68HFnJWjDsZmF8akGTu3lKJ",
        type: 'put',
        contentType: 'application/json',
        data: JSON.stringify({ "$set" : {"views": views}}),
        success: function(data) {
            //... do something with the data...
          console.log(data);

        }
    }); 
}

getviews(storyid);

function runupdatevotes(){
    //$('.votecount').each(function(index, value){
        val = $('.votecount').html();
        console.log(val);
        if(val == 0){ 
            $('.votecount').siblings('.upvote').css('background-image', 'url(/images/feed/upvote_empty.png)');
            $('.votecount').siblings('.downvote').css('background-image', 'url(/images/feed/downvote_empty.png)');
        } else if(val < 0) {
            $('.votecount').siblings('.upvote').css('background-image', 'url(/images/feed/upvote_empty.png)');
            $('.votecount').siblings('.downvote').css('background-image', 'url(/images/feed/downvote_clicked.png)');
        } else if(val > 0) {
            $('.votecount').siblings('.upvote').css('background-image', 'url(/images/feed/upvote_clicked.png)');
            $('.votecount').siblings('.downvote').css('background-image', 'url(/images/feed/downvote_empty.png)');
        }
    //})
}

function parse_query_string(query) {
    var vars = query.split("&");
    var query_string = {};
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}
//$('.')