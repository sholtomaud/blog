---
date: 2012-04-16T00:00:00Z
tags:
- javascript
- api
title: Declarative Programming and Autosubscribe
url: /2012/04/16/declarative-programming-and-autosubscribe/
---

While I was watching the [Meteor screencast][] (if you haven't already seen it, 
go watch it), I paused around 1:35. They had just said "There's no callbacks, no 
bindings, and no controllers. It just works." after showing off the code 
something like the following:

```javascript
Template.color_list.colors = function() {
  return Colors.find({}, {sort: {likes: -1, name: 1}});
}
```

along with a [handlebars][] template kind of like this:

```html
<template name="color_list">
  {{#each colors}}
    <ul>
      <li>
        {{ name }}
      </li>
    </ul>
  {{/each}}
</template>
```

From an application developer's perspective, I thought "Wow. That is really 
amazing". This is a perfect example of how incredible working with declarative 
programming can be. Meteor itself focuses on reactive programming, but it 
facilitates declarative style in its live templates.

From working on my own libraries and frameworks, I thought "Wow. How the hell 
did they get that to work?" More on this later.

[Meteor screencast]: http://meteor.com/screencast
[handlebars]: http://handlebarsjs.com/

Declarative Programming (The What)
==================================

Whenever you're trying to make anything, you want to spend your time figuring 
out _what_ you want in your application, not _how_ to get it there. Declarative 
programming tries to shift the focus from control flow to logic and state.

A prime example of this is the divide between the creation and updating of views 
in imperative style. For example, consider a simple view that wraps an `h1`
that reflects some data stored in a model.

Ultimately the goal here is to have an `h1` that says "Salutations, NAME", where 
NAME is always synchronized with the model.

Imperative Creation and Update
------------------------------

If you were to write it in this style, you would probably do it with jQuery or 
some similar DOM manipulation library, so that's what we'll use here.

```javascript
var HelloView = function() {
  this.h1 = $('<h1/>');

  var self = this;
  model.bind('update', function() {
    self.update();
  });
  self.update();
};

HelloView.prototype.update = function() {
  this.h1.text("Salutations, " + Model.get('name') + "!");
}
```

Mentally, I had to translate the original task into "create an element,
listen for any updates to the model, then update the view to match the model".
This isn't so bad, and is definitely better than the model knowing about the 
view, but there's room for improvement.

Namely, it's very apparent that the creation of the elements and the 
synchronization of the data exist as two distinct tasks, when they really don't 
need to.

Declarative Creation and Update
-------------------------------

Here's the same example written in Meteor style declarative programming.

The template code:

```html
<template name="hello_view">
  <h1>Salutations, {{ name }}!</h1>
</template>
```

And the JavaScript:

```javascript
Template.hello_view.name = function() {
  return Model.get('name');
}
```

In this style, we aren't manually wiring up synchronization at all.  We aren't 
thinking in a "when this, then that" kind of mindset. We just say "this is how 
it always should be". As a side effect, the mental separation between create and 
update becomes unnecessary. You don't need to consider what happens when the 
model changes - the view just _always_ reflects the model.

While the amount of code isn't significantly different between these two 
examples, I believe that as applications become more complex, the savings in the 
declarative style will increase, and the logic will be easier to follow.

Autosubscribe (The How)
=======================

I've done a bunch of JS development by now, and this is one of the first things 
I've tripped over in a long time thinking "How is this possible?". I'm not 
talking about how the task was algorithmically complicated, I'm talking about 
how it looked like there was something essential _missing_ from the code.

In particular, I couldn't understand how the views knew when to update, since 
there was no event binding anywhere.

The solution comes from Meteor's concepts of "autosubscribe".

The basic idea is to establish a global context that things are currently 
running in and check this whenever any mutable data is accessed. If the accessor 
notices that a global context is active, it will subscribe that context to be 
re-run when that data changes.

A basic implementation would look something like this:

```javascript
var Magic = {
  context: null
  autosubscribe: function(cb) {
    Magic.context = cb;
    Magic.context();
  }
};

var Model = function() {
  this.props = {};
};

Model.prototype.get = function(prop) {
  if (Magic.context != null) {
    // An autosubscribe context is active, so subscribe it to future
    // changes to the property
    this.bind('change:' + prop, Magic.context);
  }
  return this.props[prop];
}

Model.prototype.set = function(prop, val) {
  this.props[prop] = val;
  this.trigger('change: ' + prop);
}

// Implementations of bind and trigger omitted, but they would act exactly 
// like Backbone's
```

Then it could be used like this - no manual event binding!

```javascript
var person = new Model();
person.set('name', 'Odeen');

Magic.autosubscribe(function() {
  $('h1').text('Salutations, ' + person.get('name'));
});

person.set('name', 'Estwald');
```

While Meteor did not invent the concept of live templates, this method of 
dodging event binding seems the most powerful. While the idea of client-side 
access to the database seems a little scary, and it might end up hairier than 
normal client-server architecture if you want security, there are some ideas 
from Meteor that I think are a definite step in the right direction.
