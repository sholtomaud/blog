---
date: 2011-11-28T00:00:00Z
published: true
status: publish
tags:
- literate programming
- javascript
- coffeescript
- objective c
- python
title: Name your Arguments!
type: post
url: /2011/11/28/name-your-arguments/
---

> "Programs should be written for people to read, and only incidentally for 
> machines to execute." - Structure and Interpretation of Computer Programs

I've programmed enough now to start caring about the form as well as the 
function of my code. I can't even look at inconsistent style or naming 
conventions without twitching a little and wanting to fix it.

After reading and writing code full-time, I've come to appreciate the quote that 
starts this article. I'll explain why I support that sentiment so strongly with 
an example. Let's look at a very common function in JavaScript.

```javascript
element.addEventListener('click', function() {
  console.log('Just got clicked!');
}, true);
```

So let's break down this code into components.

`element` - So we've got some element - alright cool. If you know a little about 
JavaScript and HTML, you'll guess that's an HTML element - so far so good.

`addEventListener` - ...and we want to listen for some event on this element. 
Still following, good stuff.

`'click'` - "click" is a word I understand as a computer user, and based on the 
name, I'm guessing that this means the code is listening for clicks.

`function() { ... }` - If you know JavaScript, you'll recognize that as a 
callback. It's an extremely common pattern that's well recognized and is fairly 
consistent across different APIs. You pass a function as a callback when you 
want it to be called later on. Still good.

`true` - ...and here's where the communication breaks down. What's true?  Maybe 
it changes what `this` is in the context of the callback? Maybe it makes the 
callback only run once? In fact, it turns out that it fires the callback during 
the [capture][] phase of the event bubbling - obvious, right?

The point is that there's absolutely no way of knowing what that `true` means.  
Boolean flags are absolutely awful for readability. As it turns out, it's fairly 
important that `addEventListener` be extremely efficient, but let's pretend for 
a second that it didn't have to be - how can we make this more readable?

**Option 1: Helpful variable names**

```javascript
var useCapture = true;
element.addEventListener('click', function() {
  console.log('Just got clicked!');
}, useCapture);
```

By using a variable, we've at least indicated what the flag pertains to. This is 
more readable, but having a one-time use variable like that is crufty. Let's 
assume we can change the API itself to facilitate more readable code. What can 
we do then?

**Option 2: Namespaced constants**

```javascript
element.addEventListener('click', function() {
  console.log('Just got clicked!');
}, element.addEventListener.USE_CAPTURE);
```

This approach is better because it means that flag will be the same everywhere 
`addEventListener` is used, but it means duplicating the 
`element.addEventListener`.

**Option 3: Hide the boolean arguments**

If you ever have a function signature in a public API that takes a single 
boolean argument, you can hide it by just having two methods - one where that 
argument is true and another where the argument is false.

```javascript
element.addCaptureEventListener('click', function() {
  console.log('Just got clicked!');
});
```

In the implementation, you would still have that boolean argument internally, 
(you weren't thinking of copy-pasting, right?) but at least the API user doesn't 
have to worry about it. This solution clearly doesn't scale for functions with a 
lot of boolean options, unless you have no problem with exponential growth in 
API size.

**Option 4: "Named" arguments**

```javascript
element.addEventListener('click', function() {
  console.log('Just got clicked!');
}, {inCapturePhase: true});
```

Ah, there we go. Now I now what the `true` means! Now, there's still the matter 
of understanding what the "capture phase" is, but at least that's looking up 
concepts, not some arbitrary syntax imposed on you. Understanding event bubbling 
is useful - memorizing what the boolean third argument means is not.

Named Arguments
================

I love named arguments. Being able to tell exactly what all the arguments mean 
at the call site without having to look up the function signature every time is 
a sure way to make me happy as a developer.

JavaScript
----------

"Named" was in quotes in Option 4 because JavaScript doesn't have real named 
arguments.  Writing functions that take them in JavaScript is pretty kludgy, but 
it makes using the APIs much nicer. Take for instance, jQuery's [`$.ajax`][] 
method.

```javascript
$.ajax({
  url: "test.html",
  timeout: 1000,
  success: function(data) {
    console.log(data);
  },
  error: function(jqXHR, textStatus) {
    console.log(jxXHR);
  }
});
```

And compare that to another API with the same functionality but without using 
these named arguments:

```javascript
$.ajax("test.html", 1000, function(data) {
  console.log(data);
}, function(jqXHR, textStatus) {
  console.log(jqXHR);
});
```

And watch the communication break down again. What's the `1000`? Is the first 
callback the `success` callback or the `error` one? These are all questions you 
should never have to ask while reading code. In particular, it's an immense 
waste of everyone's time to have to remember _what order_ arguments are supposed 
to be in.

Implementing APIs like this is unreasonable in some languages, and it's frankly 
somewhat of a pain in JavaScript. If you want to take options like this, you 
have to do silly things like this:

```javascript
function fancyPrint(message, options) {
  options = options || {};

  var color = options.color;
  var bold = options.bold;
  var underline = options.underline;

  // ... implementation ...
}

fancyPrint('Hello', {color: 'red', bold: true});
fancyPrint('World', {underline: true, bold: false, color: 'blue'})
```

Still, if you're writing a library, _please_ do this. I assure you the 
developers will appreciate it.

CoffeeScript
------------

CoffeeScript provides an extremely nice syntax for this style exactly because 
it's such a pain in raw JavaScript. A translation of the above would look like 
this:

```coffeescript
fancyPrint = (message, {color, bold, underline}) ->
  # ... implementation ...

print 'Hello', {color: 'red', bold: true}
print 'World', {underline: true, bold: false, color:'blue'}
```

Unfortunately, you lose the ability to have default arguments in CoffeeScript 
when using named arguments like this. Sadly, this doesn't work:

```coffeescript
print = (message, {color='black', bold=false, underline=false}) ->
# Error: Parse error on line 2: Unexpected '='
```

Python
------

The argument system is Python is beautiful. All arguments are optionally named 
arguments, and you can define defaults just fine!

```python
def fancyPrint(message, color='black', bold=True, underline=True):
  # ... implementation ...

fancyPrint('Hello', color='red', bold=True)
fancyPrint('World', underline=true, bold=false)
fancyPrint(color='black', message='!')

# You can even do this (please don't)
fancyPrint('Eugh', 'yellow', True, True)
```

An additional nicety of Python's argument system is that it will complain if you  
pass it arguments it doesn't understand. (JavaScript just ignores them if you do
this)

```python
>>> fancyPrint('Hello', monkeys='cool')
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: fancyPrint() got an unexpected keyword argument 'monkeys'
```

Objective C
-----------

Objective C takes a different approach here - the parameter names are part of 
the function signature itself. For example:

```objc
// A function invoked like this:
BOOL result = [myData writeToFile:@"/tmp/log.txt" atomically:NO];

// Will have signature like this
-(BOOL)writeToFile:(NSString *)path atomically:(BOOL)useAuxiliaryFile;
```

 From Cocoa Dev Central's [Learn Objective-C][],

> These are not just named arguments. The method name is actually 
> `writeToFile:atomically:` in the runtime system.

Hacking It
----------

In addition to the object literal solution I showed in the JavaScript and 
CoffeeScript sections above, there's another solution for C-like languages such 
as JavaScript, and it looks like this:

```javascript
function fancyPrint(message, color, bold) {
  // ... implementation ...
}

var color, bold;
fancyPrint('Hello', color='red', bold=true);
```

Looks exactly like python - great, right? Well, not exactly. This is just 
abusing the fact that assignments return the value assigned in C-like languages.

While this does make the code more readable, it also makes it more fragile, and 
confusingly so. For instance, let's say we change the function signature:

```javascript
function fancyPrint(message, color, underline, bold) {
  // ... implementation ...
}

var color, bold;
fancyPrint('Hello', color='red', bold=true);
```

Now you have the result of `bold=true` actually being assigned to the 
`underline` argument. So I'm not a fan of this solution for one reason:

**Bad assumptions are far worse than no assumptions**

Having to go look something up to see what that stupid boolean parameter does is 
annoying, but it's better than the code indicating it does something different 
than what it actually does. 

This is actually a problem with options 1 & 2 above as well, but this is 
slightly worse because of the additional confusion created for people who might 
think that the assignment like this *does* act like Python's named arguments.


You get the same problem from commenting like this:

```javascript
fancyPrint('Hello', /*color*/ 'red', /*bold*/ true);
```

For stable APIs, like `addEventListener`, these techniques are probably fine, 
but for your own projects' internal workings, it's probably a good idea to avoid 
this style.

Takeaways
---------

1. Naming your arguments makes function calls more readable.
2. Avoid boolean arguments like the plague.
3. Bad assumptions are far worse than no assumptions.

If you want to hear more rambling about the minutia of good API design, you 
should follow me on twitter [@jlfwong][twitter].

[capture]: https://developer.mozilla.org/en/DOM/element.addEventListener
[`$.ajax`]: http://api.jquery.com/jQuery.ajax/
[Learn Objective-C]: http://cocoadevcentral.com/d/learn_objectivec/
[twitter]: http://twitter.com/jlfwong
