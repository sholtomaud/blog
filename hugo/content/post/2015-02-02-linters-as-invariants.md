---
date: 2015-02-02T00:00:00Z
published: true
status: publish
tags:
- javascript
- khan-academy
- process
title: Linters as Invariants
type: post
url: /2015/02/02/linters-as-invariants/
---

<blockquote class="twitter-tweet" lang="en"><p>Programming is a constant series 
errors where I know -- even before I understand the error! -- that the computer 
could&#39;ve found it.</p>&mdash; Gary Bernhardt (@garybernhardt) <a 
href="https://twitter.com/garybernhardt/status/559906131682684929">January 27, 
2015</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

This is a post about using static analysis in dynamic languages to help you make 
stronger assumptions about your code. Those assumptions will make you faster and 
probably less likely to tear out tufts of your own hair.

Static programming languages generally make this much easier than dynamic
ones. In C++, for instance, I get the *invariant* that **if the code compiles,
all symbols resolve.**

    $ cat /tmp/foo.cpp
    #include <cstdio>

    int main() {
        printf("%d\n", num);
        return 0;
    }
    $ gcc /tmp.foo.cpp
    /tmp/foo.cpp:4:20: error: use of undeclared identifier 'num'
        printf("%d\n", num);

Now, you might say "Sure, but that code would've obviously crashed in a dynamic 
language." Okay, but what about this?

    $ cat /tmp/foo.js
    function main(x) {
        if (x) {
            console.log("Yay!");
        } else {
            console.log(num);
        }
    }

    main(true);
    $ node /tmp/foo.js
    Yay!

Fine, fine -- how about **if the code runs without crashing, all symbols 
referenced in the executed code path resolve**? Nope.

    $ cat /tmp/foo.js
    function main() {
        try {
            console.log(num);
        } catch (err) {
            console.log("Nothing to see here");
        }
    }

    main();
    $ node /tmp/foo.js
    Nothing to see here

So it looks like we don't have much of an invariant at all.

While this might seem trivial, consider the challenges this induces when
reading old code. You have to ask so many questions you avoid in a statically 
checked environment. Is this variable defined? Is it
always defined? Do I need to load some other script first to make sure it's
defined?

The computer should answer these questions so you don't have to.

# Linters to the rescue

<blockquote class="twitter-tweet" lang="en"><p>I just got why JSHint, pyflakes 
etc. are called &quot;linters&quot;. Lint gets stuck to you by static. Linters 
do static analysis.</p>&mdash; Jamie Wong (@jlfwong) <a 
href="https://twitter.com/jlfwong/status/562418126948548609">February 3, 
2015</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

You might've come across linters like [JSHint][0] or [pyflakes][1] before. Most 
likely, you've used them in your local development environment to catch obvious 
mistakes.

    $ cat /tmp/foo.js
    function main(x) {
        if (x) {
            console.log("Yay!");
        } else {
            console.log(num);
        }
    }

    main(true);
    $ jshint --config /tmp/jshintrc /tmp/foo.js
    /tmp/foo.js: line 5, col 21, 'num' is not defined.

Nice! We'd also get an error for the try/catch example from above So now we have 
this invariant: **if the code passes JSHint, all top level symbols 
resolve**[^1].

We can _strengthen_ that invariant by adding the linter as a [git
pre-commit hook][2]. This is a good start, but it's easy to bypass commit hooks
or have them misconfigured, so our invariant becomes **if the code is checked
in _and_ the commit hook ran, all top level symbols in it resolve** instead of
the desired **if the code is checked in, all top level symbols resolve**.

Can we do better?

# Linting as a deploy blocker

Many engineering organizations run unit tests before each deploy, and abort on 
failures. Why not apply the same to linting?

Then our invariant would become: **If the code is deployed, all top level 
symbols in it resolve**. This still isn't good enough, because it's not always 
clear whether a particular bit of code has been deployed yet.

At [Khan Academy][3], we write code in feature branches, then merge into master 
after successfully deploying each branch. Since tests and linters block deploys, 
we now have this invariant: **if the code is in master, all top level symbols 
resolve**. Nice!

# Custom linters

JSHint is a collection of great general purpose checks, but you should cater 
your linters to your needs. At Khan Academy, we use CommonJS-esque modules and 
lint that dependencies resolve correctly[^2].

    $ cat javascript/notifications-package/notification-dropdown-view.js
    var Notifications = require("./notificaions.js");
    $ tools/runlint.py /tmp/foo.js
    javascript/notifications-package/notification-dropdown-view.js:1:
        E314 require()'d file 'javascript/notifications-package/notificaions.js' 
        does not exist.
        (js_css_packages.modules_lint.lint_all_require_calls_and_partials_resolve)

A more interesting case is linting against code that *works* but breaks an 
established standard. For example, we want all our
dependencies to be statically determinable, so we lint for that:

    $ cat javascript/notifications-package/notification-dropdown-view.js
    ["video.js", "exercise.js", "tutorial.js"].forEach(function(fileName) {
        require("./" + fileName);
    })
    $ tools/runlint.py javascript/notifications-package/notification-dropdown-view.js
    javascript/notifications-package/notification-dropdown-view.js:20:
        E314 Dynamic require calls are not allowed. Argument must be a single string.  
        Found: 'require("./" + fileName)' 
        (js_css_packages.modules_lint.lint_no_dynamic_require_calls)

Now I can write tooling with the invariant **all
dependencies are statically determinable**. This lets me do deadcode analysis by 
looking for orphans in the dependency graph, which would otherwise be super 
painful.

# Maintainability

You can also use tests and linters to maintain your codebase. In his post [Move 
Fast & Break Nothing][6], Zach Holman mentions that removing a class reference 
from HTML without removing the corresponding CSS will fail the build. The 
invariant is **if a classname in a CSS file is in master, it's in use by some 
HTML file**.

In [Everything Is a Polyfill][7] by Rachel Myers & Emily Nakashima, they talk 
about "sunset tests", which ensure that browser-specific code is purged after a 
browser is deprecated.

As a codebase scales, questions that were once simple to answer[^3] manually 
become monumental undertakings. Let static analysis bail you out.

*Thanks to [Andy Matuschak][8] for helping me make this post clearer and more 
concise.*

[0]: http://jshint.com/
[1]: https://github.com/pyflakes/pyflakes/
[2]: http://git-scm.com/docs/githooks
[3]: http://khanacademy.org/
[4]: https://github.com/blog/1241-deploying-at-github
[5]: http://en.wikipedia.org/wiki/Invariant_%28computer_science%29
[6]: http://zachholman.com/talk/move-fast-break-nothing/
[7]: https://www.youtube.com/watch?v=3mXH95lA-FQ
[8]: http://andymatuschak.org/

[^1]: This is only roughly true because of different browser APIs defined in different browsers. For instance, `var x = new Promise()` will throw a `ReferenceError` in browsers that haven't implemented the `Promise` API. This also won't save you from `Cannot read property 'z' of undefined` errors you get from `x.y.z`. JSHint will only complain if `x` is undefined, since it has no way of telling whether `x` is going to have a property `y` or not. 

[^2]: You might think "Wouldn't you have found that while testing?" That's a pretty valid point in most cases, but I've done a few mass refactors (changing 100+ JS files in one shot) where testing all the relevant code paths manually is infeasible. Better automated tests would certainly help.

[^3]: My favourite (read as: most frustrating) example of this is "Is this JavaScript file in use?". This might seem like a straightforward question until you consider objects constructed across multiple files, functions with the same name, plugins, and other repositories consuming code in the repo you're maintaining.
