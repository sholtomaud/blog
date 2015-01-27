---
layout: post
title: Changing Code Patterns with Sanity
tags:
- javascript
- khan-academy
- process
status: publish
type: post
published: true
---

Here's how I used to think about making infrastructural changes[^1]:

1. Decide the Right Way™ to do things.
2. Change everything in the codebase to do it that way.
3. Announce the change to the team, praising the beautiful new patterns.

Unsurprisingly, this resulted in this actual process:

1. Fumble around guessing what the right way to do things is.
2. Change everything in the codebase to do it that way, over the course of 
   several hours/days/weeks, pulling hair, and straining tendons.
3. Put up a several thousand line diff.
4. Bribe someone to review your code bomb.
5. Deal with giant conflicts, since you touched every file.
6. Discover that while working on the diff, new code using the old patterns has 
emerged.
7. Increase desire to stop programming and move to a mango farm.

# A better way

Thankfully, I have guidance at [Khan Academy][8] that led me to the following, 
much more reasonable process:

1. *Discuss* the Right Way™ of doing something.
2. Implement the infrastructure required to do things the right way, with 
   frequent reviews along the way.
3. Implement a really good linter to help people do things the right way.
4. Communicate loudly to the team what the right way of doing things is.
5. (Optional) Migrate the old code patterns in many small commits, deploying 
   frequently.

# Discussion

![Google Docs Discussion](/images/15-01-27/gdocs.png)

A lot of our architectural discussion takes place in Google Docs[^2]. The 
general process is that the implementer does a bunch of research, and prepares 
their proposal for how things should work and why. Next, they invite a bunch of 
reviewers (occasionally emailing the entire dev-team) requesting comments. After 
the comments have settled down and concerns have been addressed, the doc is 
updated with the corrected proposal.

# Implementation

![Phabricator](/images/15-01-27/phabricator.png)

With the proposal well established in the doc, it's now much easier to break 
down the work into logical commits without the reviewer wondering "what is this 
all _for_?" I won't extol the virtues of mandatory code review here, but if 
you're not convinced or want some ammunition to convince others, check out the 
posts by [Ben Kamens][1] and [Tom Yedwab][2]. We use [Phabricator][4] at Khan 
Academy, but whatever tool fits your workflow, just get code review into your 
process.

# Linting

You've probably seen linters like [JSHint][5] or [PyFlakes][6] before that help 
you catch common programming errors for the language on the whole, but have you 
thought of writing your own, specific to your company? You totally should.

Lint errors, like unit test failures, block deploys at Khan Academy, and your 
code only winds up in master if you successfully deploy, so linters can act as 
kinds of invariants on the codebase. They also run as a git pre-commit hook, so 
developers should be able to catch these errors early.

The specific refactor I was working on that prompted this post was wiring up the 
dependency graph for all of our JavaScript code to use a CommonJS-esque 
`require()` instead of using the global namespace for everything.

This was a pain for a variety of reasons - mostly for "lol JavaScript" reasons.  
One of the difficulties was ensuring that if you reference a jQuery plugin, you 
`require()` the file that contains that plugin.

If I have a file like this:

    var $ = require("jquery");

    module.exports = function(el) {
        $(el).qtip({
            content: ("It looks like you're trying to improve education. " +
                      "Would you like help?")
        });
    };

and I try to commit that, the commit gets aborted and a helpful error is 
printed.

    $ git commit -m 'Add some 98 era goodness'
    javascript/legacy-package/tooltippy.js:4: E314 Missing dependency on jquery.qtip.js.
        Found uses: .qtip(.
        To fix, add at the top of the file: require("../../third_party/javascript-khansrc/qTip2/jquery.qtip.js"); 
        (js_css_packages.modules_lint.lint_non_globals_required)

This message has 3 key parts for getting people to abide by the new
conventions.

1. *Where* the problem is: `javascript/legacy-package/tooltippy.js:4:`
2. *What* the problem is: `Missing dependency on jquery.qtip.js.`
3. *How to fix* the problem: `To fix, add at the top of the file: 
   require("../../third_party/javascript-khansrc/qTip2/jquery.qtip.js");`

**BUT WAIT** you might be saying. Doesn't adding a linter like this require me 
to fix all the places causing problems first!?

Nope!

You can introduce and land this linter along with a whitelist. The idea is that 
if the linter finds an error within a file in the whitelist, it ignores the 
error. This allows you to land the linter, and slowly remove files from the 
whitelist one by one, while enforcing the new code pattern in new files.

Constructing the whitelist should be really easy. Run your linter, and output 
all the files that currently have errors into your whitelist file. For us, that 
looked like this:

    tools/runlint.py -l js_css_packages | cut -d: -f1 | \
        sort -u >> js_css_packages/allow_implicit_dependencies_whitelist.txt

You can then fix up the old patterns file-by-file while resting assured that 
nobody is making the situation worse with new files using the old style.

# Communication

Your beautiful implementation don't mean squat unless people know about it.

We have a bunch of communication channels at Khan Academy, the primary ones for 
notifying people being HipChat and email. This kind of announcement is a "all 
developers need to know about this, but not in the next 10 minutes" kind of 
deal, so that's the role of email for us. HipChat is more appropriate for bugs 
in production or bread ready in the kitchen.

We have a culture of being a bit [over the top][3], so an infrastructure change 
announcement might look like this:

![Phabricator](/images/15-01-27/email.png)

# Migration

You might've noticed that in the outline at the start of this post, I listed 
this step as optional. In some cases, it's not important that all old code be 
converted immediately, so it's a good time to abide by the "if it aint broke, 
don't fix it" doctrine.

But sometimes, you really *do* need everything updated. That was the case for 
getting the dependency graph wired up for the whole site, because it allowed us 
to do proper deadcode elimination and [JavaScript package optimization][7].
Since we set up our file whitelist, whittling away at the problem file by file 
ended up being not very stressful.


[^1]: I work day to day in JavaScript in Python, both of which are dynamic and therefore don't lend themselves terribly well to IDE assisted mass refactors.  This is especially true in JavaScript, where everyone uses their own class system/module system that's damn near impossible to automatically reason about with any degree of success. You win this round, static typing, you win this round.

[^2]: Google Docs has served us well for discussion so far, but does suffer a little from being difficult to pull up again later. Perhaps judicious use of folders would help with this problem.  

[1]: http://bjk5.com/post/18441794352/required-code-reviews
[2]: http://www.arguingwithalgorithms.com/posts/13-03-14-code-reviews
[3]: http://bjk5.com/post/92617394126/going-over-the-top
[4]: http://phabricator.org/
[5]: http://jshint.com/
[6]: https://github.com/pyflakes/pyflakes/
[7]: /2014/11/29/the-js-packaging-problem/
[8]: http://khanacademy.org/
