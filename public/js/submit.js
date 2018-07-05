/*
Title: Darkness Prevails Submit
Written by: Jonathan Forrider
Date: April 15 2018
Description: This is the javascript for handling the submission at 'darkness prevails' in their 'Spooked' app. 
CDN Link: https://dl.dropbox.com/s/0tzktfzq502vd9e/darknessprevailssubmit.js
Link to debug: https://horrorcast.goodbarber.com/pview/horrorcast/custom-submit
*/

if(window.localStorage.username == null){
    var url_string = window.location.href;
    var url = new URL(url_string);
    console.log(url_string);
    console.log(url);
    try{
        var username = url.searchParams.get("username"); 
        var salt = url.searchParams.get("salt");
    } catch(e){
        var username = parse_query_string(location.search.substring(1))["username"];
        var salt = parse_query_string(location.search.substring(1))["salt"];
    }
    
    if(username == null || salt == null){
        window.location.href = '/login.html';
    } 
}else{
    var username = window.localStorage.username;
}

$(function() {
    //hang on event of form with id=myform
    $("#myform").submit(function(e) {
      
      e.preventDefault();
      yay();

    });

});

function yay(){
 var storytype;
 var category;
 var trmcnd;
 var inputdate = new Date();
 var date1 = inputdate.toUTCString();
 
  if($('#fictional').is(':checked')) storytype = 'Fictional Story';
  else if($('#true').is(':checked')) storytype = 'True Story';
  
  if($('#para').is(':checked')) category = 'Paranormal';
  else if($('#mons').is(':checked')) category = 'Monsters';
  else if($('#people').is(':checked')) category = 'People';

  trmcnd = ($('#agree').is(':checked'));
  //do your own request and handle the results
    $.ajax({
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify({"user": username, "title": $('#title').val(), "penname": username, "storytype": storytype, "category": category, "story": $('#story').val(), "trmcnd": trmcnd, "votes": 0, "voters": [], "votetype": [],  "submitdate": date1, "views": [] }),
            url: "/posts",
            error: function(err) {
                console.log(err);
            },
            success: function(data) {
                //... do something with the data...
                console.log(data);
                //window.localStorage.setItem('username', data[0].username);
                console.log(data);
                $('#myform')[0].reset();
                window.location = data;
            }
    });
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



