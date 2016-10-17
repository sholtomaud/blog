---
date: 2011-06-25T00:00:00Z
meta:
  _edit_last: "1"
  _edit_lock: "1309066702"
  _wp_old_slug: ""
published: true
status: publish
tags:
- AJAX
- asynchronous
- javascript
- Karma
title: Complex Asynchronous Queries in JavaScript
type: post
url: /2011/06/25/complex-asynchronous-queries-in-javascript/
---

Over the past couple of weeks, I finally got around to working on personal projects at an event I decided to create with the help of my housemates which we call [SEHackDay][]. The first and only project I worked on over the 3 nights was [Karma][], a Facebook App which gives you statistics about your posts and how they stack up against your friends.

While it has not been remotely as successful as [The Wub Machine][] by one of my housemates, [Peter Sobot][], it did make me think about how to make complex asynchronous queries in JavaScript.

While I was actually dealing with `FB.api` calls to the Facebook API, I'll use the example of jQuery AJAX queries for the purposes of this blog post, since they are more common. Before we delve into the complex examples, let's take a look at the basics.

[Karma]: http://myfriendkarma.heroku.com/
[SEHackDay]: http://www.sehackday.com/
[The Wub Machine]: http://the.wubmachine.com/
[Peter Sobot]: http://www.petersobot.com/

Asynchronous Callbacks
---------------------
*If you already understand AJAX, skip to the complex queries below*.

JavaScript is, by nature, an asynchronous language. A few of the language's built-in constructs use callbacks, including `setTimeout` and `addEventListener`. The basic principle of a callback is this:

**When something happens, do this, but keep doing other things while you're waiting.**

Here's a simple example:

```js
window.setTimeout(function() {
  console.log("Three");
}, 1000);

console.log("One");
console.log("Two");
```

Run that with Firebug, Chrome Developer Tools or whatever other console logging tools you work with and you'll see that the numbers come out "One", "Two" and then finally "Three" after a one second delay.

A more useful example is retrieving data in jQuery through AJAX from the server. AJAX (for those unfamiliar) allows you to retrieve information on a web page from the server without necessitating a full page reload. A query typically looks something like this:

```js
$.ajax({
  url: '/records.php',
  success: function(data) {
    console.log(data);
  }
});
```

Which says roughly: **Send an HTTP GET request to the path `/date`. When the server responds, log the response body to the console.**

*For those of you reading this and unfamiliar with complex JavaScript, you should probably stop here, fiddle around with asynchronous callbacks and AJAX, and then consider continuing.*

Sequential Requests with a Callback
------------------------------

**Scenario**: I want to request a series of documents, one after another, then run a callback after they've all completed. A common example is running through paginated data when you don't know how many pages there are.

**Solution**: Make the call recursive, keeping track of the data retrieved, then run the final callback when the last request completes.

For example, let's assume a page `records.php` returns the latest 10 records in a database as JSON, with a parameter `offset`, specifying how many records from the front to skip. We'll assume if it returns fewer than 10 results, there are no more. The coded solution will look something like this: 

```js
function allRecords(callback, offset, data) {
  if (typeof offset === 'undefined') {
    offset = 0;
  }
  if (typeof data === 'undefined') {
    data = [];
  }
  $.ajax({
    url: 'records.php',
    data: {offset: offset},
    success: function(dataChunk) {
      data = data.concat(dataChunk);
      if (dataChunk.length < 10) {
        callback(data);
      } else {
        allRecords(callback, offset + 10, data);
      }
    }
  });
}
```

And since there's a check for the `undefined` state of the second two parameters, they can be omitted when the function is actually called, like so:

```js
allRecords(function(allData) {
  console.log(allData);
});
```

And this callback will be called only after the last request finishes. Assuming there are 47 records, it would make the following requests in series, then run the callback with the concatenated arrays of data.

    records.php?offset=0
    records.php?offset=10
    records.php?offset=20
    records.php?offset=30
    records.php?offset=40

Note that this solution ensures that the records are returned in order.

Parallel Requests with a Callback
----------------------------

**Scenario**: I know exactly which documents I need, but I can't get them all at once, and I want to run a callback after all of them have been retrieved. A common use case is when you know exactly how many records there are, but for whatever reason (usually API limits), you can't get them all at once.

While a simple modification of the above solution would work, it's inefficient. We can send more than one AJAX response at a time, so we might as well wait on more than one at a time. Chances are we can send at least the second request while we're waiting for the first to return.

**Solution**: Send all the requests at once, noting how many were sent. Then count the responses as they come back. Once the count equals the number of requests sent, run the callback. Note that this does nothing to preserve order (and usually we don't care).

Assuming the same general rules as above, let's say we want to retrieve the most recent n records.

```js
function nRecords(n, callback) {
  var nCallsNeeded = Math.ceil(n / 10);
  var nCallsFinished = 0;
  var data = [];
  for (var i = 0; i < nCallsNeeded; i++) {
    $.ajax({
      url: 'records.php',
      data: {offset : i * 10},
      success: function(dataChunk) {
        data = data.concat(dataChunk);
        nCallsFinished += 1;
        if (nCallsFinished == nCallsNeeded) {
          callback(data.slice(0,n));
        }
      }
    });
  }
}

```
So if I want the latest 23 records, I would get them like so:

```js
nRecords(23, function(allData) {
  console.log(allData);
});
```

If you have suggestions on ways to improve these solutions, I'm all ears.

Also, if you are interested in what your highest rated post or just generally want to see your own statistics on pretty graphs, please check out [Karma][].
