---
date: 2012-05-25T00:00:00Z
tags:
- mercurial
- git
- svn
- khan-academy
title: An Argument for Mutable Local History
url: /2012/05/25/an-argument-for-mutable-local-history/
---

In my past co-op jobs, I've been using predominately git with an (unfortunate) 
smattering of subversion. This term at [Khan Academy][], I'm using mercurial for 
the most part.

Mercurial does more or less everything I want it to, and it does admittedly have 
more sanely named commands than git. It also has an amazing system for 
formatting logs in any conceivable format, a robust plugin architecture and a 
really cool system for finding the commits you care about called [revsets][].

The thing I'm missing most from git is mutable local history. Editing history is 
intentionally difficult in mercurial because it's really easy to shoot yourself 
in the foot and make your entire team's life difficult if you don't know what 
you're doing. But there are some excellent use cases for it.

**EDIT**: The above paragraph is a little misinformed. After a conversation with 
the very helpful people in #mercurial on IRC (thanks kiilerix), it seems that 
there are direct equivalents of amend and rebase. If you're running mercurial 
2.2, there is literally a `--amend` flag on commit, and there's literally an `hg 
rebase` command if you turn on the [rebase extension][].

Keeping the Logs Clean - Amending Commits
=========================================

If your history is immutable, you'll inevitably end up with logs that look like 
this:

    changeset:   11922:c669975527b7
    user:        Jamie Wong <jamiewong@khanacademy.org>
    date:        Thu May 24 15:19:25 2012 -0400
    summary:     whoops typo

    changeset:   11921:5290491fca66
    user:        Jamie Wong <jamiewong@khanacademy.org>
    date:        Thu May 24 14:07:26 2012 -0400
    summary:     lint fixes

    changeset:   11921:5290491fca66
    user:        Jamie Wong <jamiewong@khanacademy.org>
    date:        Thu May 24 14:07:26 2012 -0400
    summary:     Added button

The problem with this is that nobody cares that you fixed lint or that there was 
a typo in your original commit. All they need to know is what changed since the 
last time they pulled. The "lint fix" and "typo" commits are usually noise that 
you can avoid. Combined with a bunch of merge commits, now only about a quarter 
of the commits describe actual features being integrated.

Using git, after I made the lint and typo fixes, assuming I hadn't pushed yet 
(which I haven't, because the lint fixes and typos were caught during code 
review), I would just use `git commit --amend`, or `git rebase --interactive` to 
squash those commits down into a single commit.

The result of this is a commit history where the vast majority of commits show 
the introduction of full features or bugfixes.  Once the code is shared with 
everyone, it doesn't matter how many revisions you went through to get there, it 
just matters what the before and after look like.

[Evan Priestley][] describes this more eloquently in the [Phabricator][] article 
[One Idea is One Commit][], and also notes the benefits to release engineering 
and automated testing.

Local Features Go on Top - Rebasing
===================================

If you're using local feature branches in mercurial or git or any other DVCS 
(which you should - they're awesome), then you'll be working on Feature 2 while 
Feature 1 is up for review. So your history looks something like this:

        o  feature-1
        |
        | o  feature-2
        | |
        |/
        o  master

Workflow without Rebase
-----------------------

Feature 1 gets approved, so you switch to the master branch, and run `pull` to 
make sure you're up to date with the rest of the repository. As it turns out, 
someone just merged a couple days of commits from upstream, so now you have 
something like this:

        o master
        |
        o more stuff from upstream
        |
        o

        ...

        o stuff from upstream
        |
        | o  feature-1
        | |
        | | o  feature-2
        | | |
        |/  /
        o--+

If enough commits just came down, your feature branches won't even show up on 
the same screen as `master` any more, which is annoying by itself. You then 
merge `feature-1` into `master` and push, and end up with this:

        o master
        |\
        o |
        | |
        o | more stuff from upstream
        | |
        o |

        ...

        o |  stuff from upstream
        | |
        | o  feature-1
        | |
        | | o  feature-2
        | | |
        |/  /
        o--+

So even after you merge, you *still* can't see `feature-1` on your screen, 
despite it being the latest thing you introduced. Now you want to test Feature 2 
against the latest codebase, so you have to merge in master, leaving me with 
this:

        o feature-2
        |\
        o \  master
        |\ \
        o | |
        | | |
        o | | more stuff from upstream
        | | |
        o | |

        ...

        o | | stuff from upstream
        | | |
        | o | feature-1
        | | |
        | | o
        | | |
        |/  /
        o--+

Now I have the merge commit at the top in my branch, which is going to make 
putting this up for review ugly.

Workflow with Rebase
--------------------

`git rebase` lets you move commits around (and really do whatever you want with 
them).

**PSA**: Never, _never_ rebase commits that anyone else has access to. The only 
exception to this rule I can think of is using github pull requests, since 
nobody should be sending commits to your pull requests. `git push` actually warn 
you about this if you try to push commits that have been modified, and force you 
to use a `-f` flag to make sure you know what you're doing.

That said - on with the workflow, starting from here:

        o master
        |
        o more stuff from upstream
        |
        o

        ...

        o stuff from upstream
        |
        | o  feature-1
        | |
        | | o  feature-2
        | | |
        |/  /
        o--+

This time, we're going to rebase instead of merge `feature-1` before we push it.

    $ git checkout feature-1
    $ git rebase master

which leaves us with this:

        o feature-1
        |
        o master
        |
        o more stuff from upstream
        |
        o

        ...

        o stuff from upstream
        |
        |
        |
        | o  feature-2
        | |
        |/
        o

This found the merge base between `feature-1` and `master`, took all the commits 
that were in the history of `feature-1` but not in `master`, cut them off the 
tree and grafted them back on at `master`.

Now we can merge `feature-1` into `master` without creating a merge commit (this 
is called a "fast-forward" merge).

    $ git checkout master
    $ git merge feature-1
    $ git push

Now `feature-1` and `master` are exactly the same, so we could remove the branch 
if we wanted.

Now when we want to return to working on `feature-2`, we just rebase again and 
we're working with the latest code.

    $ git checkout feature-2
    $ git rebase master

And we're back to a nice linear history - easy to navigate, easy to read.

        o feature-2
        |
        o master, feature-1
        |
        o more stuff from upstream
        |
        o

        ...

        o stuff from upstream
        |
        o


Side Notes
----------

1. One-commit-per-feature doesn't work for huge features, but it can at least 
work for the describable features within the large feature. When the entire 
monolithic feature is done, then all of the commits representing ideas can be 
merged into production.

2. Before you start using `git rebase` and `git commit --amend` willy-nilly, I 
strongly recommend having an understanding of `git reflog`.

3. If you're interested in getting a deeper understanding of git, I strongly 
recommend reading [Pro Git][], which is free online.

4. I realize that history editing is *possible* in mercurial, but it's 
definitely not as supported as it is in git.

5. If you're not using a distributed version control system (DVCS) like git or 
hg, you're doing it wrong for a whole bunch of reasons, but that's a rant for 
another time.

6. If you're stuck using subversion for whatever reason, *please* use 
   [git-svn][].

[rebase extension]: http://mercurial.selenic.com/wiki/RebaseExtension
[Pro Git]: http://git-scm.com/book
[Khan Academy]: http://www.khanacademy.org/
[revsets]: http://www.selenic.com/hg/help/revsets
[Evan Priestley]: https://twitter.com/#!/evanpriestley
[git-svn]: http://trac.parrot.org/parrot/wiki/git-svn-tutorial
[Phabricator]: http://phabricator.org/
[One Idea is One Commit]: http://www.phabricator.com/docs/phabricator/article/Recommendations_on_Revision_Control.html#one-idea-is-one-commit
