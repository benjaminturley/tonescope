$(document).ready(function () {
  console.log("Hello person! Feel free to check out the code. Don't be evil.");
  var hostName = (window.location.host + window.location.pathname);
  var href = window.location.href;
  var shareUrl = [href, hostName, href.substring(0, href.length-1), hostName.substring(0, hostName.length-1)];
  var temp;

  for (var i = 0; i <= shareUrl.length - 1; i++) {
    temp = i;
    $.getJSON('https://share-count.appspot.com/?url=' + encodeURIComponent(shareUrl[i]) + "&callback=?", function (data) {
      shares = data.shares;
      $(".count").each(function (index, el) {
        service = $(el).parents(".share-btn").attr("data-service");
        count = shares[service];
        if(count > 0) {
          if($(el).html() == "-") $(el).html(count);
          else if(parseInt($(el).html()) != count) $(el).html(parseInt($(el).html()) + count);
        }
      });
    });
  };
  $(".count").each(function (index, el) {
    count = parseInt($(el).html());
    if(count>1000) {
      count = (count / 1000).toFixed(1);
      if(count>1000) count = (count / 1000).toFixed(1) + "M";
      else count = count + "k";
    }
    if(count > 0)
      $(el).html(count);
  });
});