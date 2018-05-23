if(window.localStorage.username == null){
    window.location.href = '/login.html';
}else{
    var username = window.localStorage.username;
}

//"https://api.mlab.com/api/1/databases/darknessprevails/collections/darknessprevailssubmissions?s={'submitdate':-1}&apiKey=aDwl-yLfA68HFnJWjDsZmF8akGTu3lKJ"
$.ajax({
	url: "/feedinfo",
    method: 'get',
	success: function(data){
        console.log(data[0]._id);
        console.log(data);
		$('#outerstorycont').html(
		`<div class="container" onclick='gotoread("`+data[0]._id+`")'>
			 <div class="story">
			<div class="entrytext">
					<p class="title">`+data[0].title+`</p>
					<p class="authordate"> By `+data[0].penname+` on `+fixdate(data[0].submitdate)+`<br>
`+data[0].category+` | `+(data[0].views).length+` View(s) </p>
			</div>
			<div class="votes"> <button id="upvote" class="upvote" type="image" onclick='upvote(event, "`+data[0]._id+`")'></button>
					<p class="votecount" id="`+ data[0]._id+`">`+data[0].votes+`</p>
				<button id="downvote" class="downvote" onclick='downvote(event, "`+data[0]._id+`")'></button> </div>
		<hr class="break"> </div>
	</div>`
		)
		for(i=1;i<data.length;i++){
			$('#outerstorycont').append(
			`<div class="container" onclick='gotoread("`+data[i]._id+`")'>
			 <div class="story">
			<div class="entrytext">
					<p class="title">`+data[i].title+`</p>
					<p class="authordate"> By `+data[i].penname+` on `+fixdate(data[i].submitdate)+`<br>
`+ data[i].category + ` | ` +  (data[i].views).length   +` View(s) </p>
			</div>
			<div class="votes"> <button id="upvote" class="upvote" type="image" onclick='upvote(event, "`+ data[i]._id +`")'></button>
					<p class="votecount" id="`+ data[i]._id +`">`+data[i].votes+`</p>
				<button id="downvote" class="downvote" onclick='downvote(event, "`+ data[i]._id +`")'></button> </div>
		<hr class="break"> </div>
	</div>`
		)
		}
	},
    complete: function(){
        runupdatevotes();    
    }
})

//"https://api.mlab.com/api/1/databases/darknessprevails/collections/darknessprevailssubmissions/" + storyid + "?apiKey=aDwl-yLfA68HFnJWjDsZmF8akGTu3lKJ"
function upvote(e, storyid){
    e.stopPropagation();
    console.log("Upvote");
    $.ajax({
        url: '/obtainvotes',
        method: 'post',
        data: {'id': storyid},
        success: function(data){
            data = data[0];
            console.log(data.votes);
            console.log(data.voters);
            var voters = data.voters;
            var votetype = data.votetype;
            console.log(votetype[voters.indexOf(username)])
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
        url: '/obtainvotes',
        method: 'post',
        data: { 'id': storyid },
        success: function(data){
            console.log(data);
            data = data[0];
            console.log(data.votes);
            console.log(data.voters);
            var voters = data.voters;
            var votetype = data.votetype;
            console.log(votetype[voters.indexOf(username)])
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

//"https://api.mlab.com/api/1/databases/darknessprevails/collections/darknessprevailssubmissions/"+storyID+"?apiKey=aDwl-yLfA68HFnJWjDsZmF8akGTu3lKJ"
function updatestoryvotes(votes, voters, votetype, storyID){
    $('.votecount#' + storyID).html(votes);
    runupdatevotes();
    $.ajax({
        url: '/updatevotes',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify({"id": storyID, "votes": votes, "voters": voters, "votetype": votetype}),
        success: function(data) {
            //... do something with the data...
          console.log(data);
          console.log(votes);
            console.log($('.votecount#' + storyID).html());
          //$('.votecount#'+storyID ).html(votes);
          //runupdatevotes();

        }
    }); 
}

function fixdate(datechange){
    var feeddate = new Date(datechange);
    feeddate = feeddate.toDateString();
    return feeddate.substr(4, feeddate.length-1);
}

function gotoread(storyId){
    window.location.href = '/read.html?id='+storyId;
}

function runupdatevotes(){
    console.log('hello');
    $('.votecount').each(function(index, value){
        val = $(this).html();
        console.log(val);
        if(val == 0){ 
            $(this).siblings('.upvote').css('background-image', 'url(/images/feed/upvote_empty.png)');
            $(this).siblings('.downvote').css('background-image', 'url(/images/feed/downvote_empty.png)');
        } else if(val < 0) {
            $(this).siblings('.upvote').css('background-image', 'url(/images/feed/upvote_empty.png)');
            $(this).siblings('.downvote').css('background-image', 'url(/images/feed/downvote_clicked.png)');
        } else if(val > 0) {
            $(this).siblings('.upvote').css('background-image', 'url(/images/feed/upvote_clicked.png)');
            $(this).siblings('.downvote').css('background-image', 'url(/images/feed/downvote_empty.png)');
        }
    })
}

$(document).ready(function(){
    runupdatevotes();
})

//https://dl.dropbox.com/s/bkmd8qhu038pmm3/feed.js