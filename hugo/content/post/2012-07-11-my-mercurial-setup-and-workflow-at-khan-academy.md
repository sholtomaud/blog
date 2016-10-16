---
date: 2012-07-11T00:00:00Z
tags:
- mercurial
- git
- khan-academy
title: My Mercurial Setup and Workflow at Khan Academy
url: /2012/07/11/my-mercurial-setup-and-workflow-at-khan-academy/
---

I've been using mercurial full time during my internship at [Khan Academy][] now 
for just over two months.  I spent a good chunk of my first few weeks here in on 
IRC in #mercurial sharpening my new tools and more or less making my mercurial 
setup work identically to my git setup.

In this post, I'll be detailing both my tooling and my amend/rebase workflow 
with mercurial. For starters, make sure you have the latest version of 
mercurial, or you'll run into issues following this. At the time of this post, 
I'm using 2.2.2. You can check what version you have with `hg --version`.

If you just want to read code, and not words, I have my dotfiles hosted on 
github, which you can see here: [jlfwong/dotfiles][]. Fellow Khan Academy intern 
[David Hu][] created a stripped down set of dotfiles specifically for KA that 
will be much easier to follow, which you can see here: [khan/khan-dotfiles][].

This post assumes you are reasonably familiar with mercurial. If not, I suggest 
reading [Mercurial: The Definitive Guide][hg book] by Bryan O'Sullivan. You can 
read it for free online.

{:toc}

Extensions
==========

Mercurial ships with a powerful plugin system to extend its capabilities. Quite 
honestly, it would be no fun at all to use without some of these extensions.

There are two kinds of extensions for mercurial - those that are built-in, and 
those that require you to download something. The built-in ones ship with 
mercurial, but are disabled by default. Enabling extensions is done by editing 
the `[extensions]` section of your `~/.hgrc` file. If you want to mirror the 
setup described in this article, `~/.hgrc` should contain something that looks 
like this at the end:

    [extensions]
    color =
    graphlog =
    pager =
    rebase =
    purge =
    remotebranches = ~/path/to/hg_remotebranches.py
    shelve = ~/path/to/hgshelve.py
    prompt = ~/path/to/hg-prompt/prompt.py

The color, graphlog, pager and rebase extensions are built-in, so you don't have 
to specify a path for them

I actually have more extensions than this installed, but these are the ones I 
use on a regular basis.

color
-----

<http://mercurial.selenic.com/wiki/ColorExtension> (builtin)

Simply put - this enables color in the mercurial command-line.

![Color Extension](/images/12-07-11-hg-color.png)

This is useful in a variety of commands. Shown above is `hg log --patch` with 
and without color enabled.  The color extension also provides color support for 
`status`, `resolve` and `status`.

graphlog
--------

<http://mercurial.selenic.com/wiki/GraphlogExtension/> (builtin)

The default output of `hg log` isn't very helpful, especially if you have a 
non-linear history. For instance - we'll take a look at 4 commits in our repo.
Here's the output of `hg log`:

![hg log](/images/12-07-11-hg-log.png)

It just shows you commits in reverse order of when they entered the repository.  
It's much more useful to be able to see the graph of all commits. The graphlog 
extension enables that - giving us the slightly more useful log output.
Here's the output of `hg glog`:

![hg graphlog](/images/12-07-11-hg-glog.png)

Now we can at least see that 3 commits that were listed sequentially by `hg log` 
are not actually linear in the commit history. You can also see that commit 
13048 is diverged from the other commits shown.

The problem with both of these is that for the most part, we don't care about 
the majority of the information here, and there's useful information missing. 
Thankfully, mercurial supports custom log formats by specifying templates of 
sorts. (See [Mercurial Theming][].)

I already had a log format I liked from working with git, so all I had to do was 
convert it to mercurial. Here's the output of my custom `hg lga`:

![hg lga](/images/12-07-11-hg-lga.png)

This contains a bunch of extra information in a much denser format, and pretty 
much all of that information is useful.

Information provided left to right:

* Short revision id (to get the full SHA1, run `hg lga -v` once you have `hg 
  lga` set up)
* The commit phase. I use phases to tell me whether or not a commit has been 
  pushed. See [Mercurial Phases][].
* Author of the commit
* First line of commit message
* How long it's been since it was committed. When I want to know exactly when 
  something was committed, I do `hg log --stat --color=always -vpr 13049`, which 
  I have aliased to `hg show 13049`.
* Any bookmarks or tags on the commit (more on bookmarks and tags later).

To get your log to look like this, install the graphlog extension, then create a 
file called `map-cmdline.lg`, and put this in it:

```python
changeset = '\033[0;31m{rev}:{phase} \033[0;34m{author|person}\033[0m 
{desc|firstline|strip} \033[0;32m({date|age}) {branches}{bookmarks}{tags}\n\n'
changeset_verbose = '\033[0;31m{rev}:{node|short}:{phase} \033[0;34m{author|person}\033[0m {desc|firstline|strip} \033[0;32m({date|age}) {branches}{bookmarks}{tags}\n\n'

start_branches = ' '
branch = '\033[0;31m{branch}\033[0m'

start_bookmarks = ' '
bookmark = '\033[0;31m[{bookmark}]\033[0m '
last_bookmark = '\033[0;31m[{bookmark}]\033[0m'

start_tags = ' '
tag = '\033[0;31m{tag}\033[0m, '
last_tag = '\033[0;31m{tag}\033[0m'
```

then add this alias to your `~/.hgrc`, correcting the path to `map-cmdline.lg`.

```ini
[alias]
lga = glog --style=your/path/to/map-cmdline.lg
```

If you want a similar log for git, add this to your `~/.gitconfig`.

```ini
[alias]
lg = log --graph --pretty=format:'%Cred%h%Creset %Creset%Cblue%an%Creset 
%s %Cgreen(%cr)%Cred%d%Creset' --abbrev-commit --date=relative
```

pager
-----
<http://mercurial.selenic.com/wiki/PagerExtension> (builtin)

By default, when you run mercurial commands that have a big output, they just 
vomit everything onto the screen. This is especially annoying for `hg log`, 
since it will dump the entire repository history onto your screen.

The pager extension fixes this by piping the output of selected commands through 
a pager of your choice. After enabling the plugin in your `.hgrc`, add the 
following pager configuration section:

```ini
[pager]
pager = LESS='FSRX' less
attend = cat, diff, glog, log, incoming, outgoing, lg, show, lga
```

This specifies which command to use as a pager, and which commands hg commands 
you want to be piped through the pager.

rebase
------
<http://mercurial.selenic.com/wiki/RebaseExtension> (builtin)

The rebase extension provides a direct equivalent of `git rebase` for mercurial.
For more information on why I rebase instead of merge, see below and the see my 
past post [An Argument for Mutable Local History][].

There isn't really any configuration required for this one.

purge
-----
<http://mercurial.selenic.com/wiki/PurgeExtension> (builtin)

The purge extension lets you clean your working directory of all untracked 
files. This is often useful when reviewing changes that create new files.

To completely reset the state of your working copy to what it was at the latest 
commit, I have an alias that removes untracked files and reverts all changes in 
the working copy:

```ini
[alias]
# Nuke everything in the working copy
nuke = !hg up -C . && hg clean
```

remotebranches
--------------
<http://mercurial.selenic.com/wiki/RemoteBranchesExtension> (requires download)

It's often useful to have a quick answer to the question "what commit is the 
remote on?".  You can infer this information using `hg outgoing`, but it's much 
nicer to be able to see this information marked in the revision history. This is 
also particularly useful because I frequently need to switch to this commit 
either to review others' work or to start a new feature.

The remotebranches extension provides this by attaching tags to commits whenever 
you push or pull. So after you pull from the default remote, you'll have a 
commit tagged with `default/default`. Then switching to this commit becomes as 
easy as running `hg up default/default`.

Unlike the previous extensions, this one requires a download. After you've 
downloaded the plugin, you need to specify the path to where you downloaded it.
So you'll have a line like this in your `~/.hgrc`, under the `[extensions]` 
header:

```ini
remotebranches = ~/path/to/hg_remotebranches.py
```

shelve
------
<http://mercurial.selenic.com/wiki/ShelveExtension> (requires download)

This is a rough equivalent of `git stash`. For those unfamiliar, it allows you 
to temporarily store the changes to your working copy without making a commit.  
This means you can clean your working directory to test something quickly, the 
bring the changes back easily.

`hg shelve` stores the changes in your working copy, `hg unshelve` brings those 
changes back.

The behaviour of this is significantly different than `git stash` in that it 
prompts you for file-by-file changes to save, provides the ability to name 
multiple shelves with `hg shelve NAME`, and does not operate on a stack like 
`git stash` does.

prompt
------
<http://mercurial.selenic.com/wiki/PromptExtension> (requires download)

Having contextual information about the repository in your prompt is really 
useful for seeing the status at a glance. My bash prompt when I'm working in a 
mercurial repository looks like this:

![hg prompt](/images/12-07-11-hg-prompt.png)

After getting the plugin and installing it, you need to inject it into your 
shell prompt. You can do that by adding something like this to your 
`~/.bash_profile`:

```bash
function hg_ps1
{
hg prompt "({root|basename}@{bookmark}{[{tags|quiet|,}]}{ {status|modified|unknown}}{ {shelf}}) " 2> /dev/null
}

export PS1='\e[33m\][\W] \e[31m\]$(hg_ps1)\e[0m\]'
```

This displays, from left to right: 

* the directory name of the repository root
* the current bookmark I'm on
* any tags other than `tip`
* the status of the working copy - whether or not there are any uncommitted 
  changes or untracked files
* the status of any shelves (this one is non standard, and you'll have to grab 
  my copy of prompt.py if you want this)

There's a list of the information available for your prompt on the [hg prompt
project page][hg prompt].

If you want to see how to do it for git too, see [GIT autocompletion and 
enhanced bash prompt][git prompt].

I have modifications for both my git prompt and hg prompt to make the status 
indicators more verbose (i.e. "[unstaged]" instead of "?"). If you want the 
changes, here's my copy of [git-completion.bash][] for git and [prompt.py][] for 
mercurial. My version of `prompt.py` also includes support for [displaying the 
status of shelves][prompt-shelves] - I'll send that upstream when I get the 
chance.

autocomplete
------------
Autocompletion for mercurial is not a mercurial extension - it's just a bash 
script. This will contextually complete things like flag names, file names, 
bookmarks and tags. For instance, if I do `hg up default/de[TAB]`, it will 
complete to `hg up default/default`.

I can't remember offhand where I originally got the autocomplete for mercurial, 
but you can grab it from my github repo: [hg-completion.bash][]. After you stick 
that file somewhere, just add a line like this to your `~/.bash_profile`:

```bash
source ~/path/to/hg-completion.bash
```

Workflow
========

This is my personal workflow at [Khan Academy][]. The workflows people use here 
vary wildly, as they jump between repositories, git and hg, python, javascript, 
server configuration, github, kiln, and phabricator.

I'm using a mutable history workflow where each feature branch only ever 
contains one commit. You can read my explanation for why I do this in a previous 
post, [An Argument for Mutable Local History][].

There are two predominate review systems used at Khan Academy - [Phabricator][] 
and [Kiln][].  I was accustomed to using Phabricator from interning at Facebook, 
so that's what I've been using and what I'll be talking about here. The 
associated commandline tool is [arcanist][], so that's what all of the `arc` 
commands below are about.

Configuration
-------------

### .arcrc

By default, arcanist does not amend commits for mercurial. I wanted this 
ability, so I submitted a patch to support this. To make arcanist amend commits, 
add the following to your `~/.arcrc` (or to your project `.arcconfig`).

```javascript
{
  "config": {
    "history.immutable": false
  }
}
```

**EDIT**: The setting was originally `"immutable_history": false`, but it's been 
changed to "history.immutable".

### project .hg/.hgrc

Many of my coworkers maintain their own complete remote clone of the main 
repository. I don't do this, so my default remote is the repository shared by my 
team. In my project root, I have two remotes specified: one for my team and one 
for stable. Stable is what gets deployed to production.

In the root of any mercurial repository, there should be a `.hg/.hgrc` file - 
mine looks something like this:

    [paths]
    # Team remote
    default = https://example.com/path/to/khan/repositories/labs-cs
    # Production-deployable remote
    stable = https://example.com/path/to/khan/repositories/stable

Starting a Feature
------------------
Before starting a feature, I always make sure I'm up to date, so I run the 
following:

    hg pull
    hg up default/default

Note that `default/default` specifies the latest commit on the remote default.  
The `default/default` tag is created by the [remotebranches](#remotebranches) 
plugin. This is not always the same as just running `hg up` with no argument, 
since `hg pull` may not have pulled down any commits, and `tip` may refer to a 
commit that hasn't been pushed.

After filing or finding a Phabricator Maniphest task I want to work on, I create 
a new mercurial bookmark that includes the id of the task. For instance, I just 
put up a diff to fix an issue filed under T111 relating to an issue with 
timestamps. When I started working on the feature, I ran

    hg book timestamp-T111

By default, when you commit in mercurial, all bookmarks on the current commit 
will move forward. We're trying to use bookmarks as lightweight local branches, 
so this isn't the behaviour we want. To make it only move the currently active 
bookmark, add this to your `~/.hgrc`:

    [bookmarks]
    track.current = True

**WARNING**: Mercurial has both the concept of "branches" and "bookmarks". 
Mercurial branches are **not** the same as git branches.  When you commit on a 
mercurial branch, that branch is forever embedded into the commit, even when its 
pushed. I don't have a good understanding of the branching mechanism in 
mercurial, but I would generally advise against using `hg branch` to work on 
feature branches. To look at all the options available for branching in 
mercurial, I suggest reading [A Guide to Branching in 
Mercurial][stevelosh-branching].

Saving Work in Progress
-----------------------
Sometimes I'll need to stop working on a feature to revise other features that 
have been reviewed or to review someone else's changes. Since I'm using a 
mutable history workflow, I just commit the work on the bookmark to be amended 
later.

    hg commit -m "WIP Fix timestamp issue"

When I need to return to this bookmark later, I can do so by running

    hg up timestamp-T111

Since I have [autocomplete](#autocomplete) installed, I can just type `hg up 
times[TAB]`.

Putting a Diff up for Review
----------------------------
When I'm ready to put up a diff for review, I ensure that I have all my work 
committed in one commit. After I've tested that everything works, I run

    arc diff

Then fill out the summary, test plan, associated tasks, who I want to review the 
change and anyone I want to cc on the diff in the editor that pops up from 
running `arc diff`.

After I'm done, I save from the editor and exit, which completes the process and 
puts the diff up on Phabricator.

If you did the `"immutable_history": false` configuration noted in the 
introduction of [Workflow](#Workflow), then the commit message will be amended 
to include all the information written during `arc diff`, along with the URL to 
the Phabricator Differential revision.

Revising the Diff
-----------------
After someone has reviewed my changes and inevitably requested changes, I switch 
back to the bookmark, make the changes, amend the commit and send out an updated 
diff.

    hg up timestamp-T111
    # hack hack hack
    hg commit --amend
    arc diff

When I amend the commit, I don't usually change the commit message. This means 
that messages like "fixed lint" or "split lines to fit in 80 characters" never 
enter the revision history. In my opinion, this is a good thing. For an 
explanation of why, I'll refer again to my post [An Argument for Mutable Local 
History][].

When I run `arc diff` on a commit that's already been put up for review, it will 
bring up an editor asking what changed. This tells reviewers that you've "fixed 
lint" without sticking it in the revision history forever.

Pushing the Commit
------------------
After the diff has been approved by one or more of the reviewers, it's time to 
share that change with the rest of my team. At Khan Academy, each team has their 
own remote clone of the repository (this is what happens when you hit "branch" 
in Kiln).

To land the change, I make sure I'm up to date with the remote, and rebase my 
change onto default. Rebasing requires that the builtin [rebase](#rebase) 
extension be enabled. I rebase instead of merge in order to maintain a linear 
commit history, which is much easier to read and work with.

    hg pull
    hg up timestamp-T111
    hg rebase -d default/default

At this point, it's possible I've run into some merge conflicts. I can get a 
list of these conflicts using

    hg resolve -l

Unresolved conflicts will have "U" before the filename. "R" means there was a 
conflict, but it was automatically resolved.

Once I've gone through all the unresolved conflicts, I can mark them as resolved 
using

    hg resolve --mark [FILENAMES]

From here, I can continue the rebase (*without* committing) by running

    hg rebase --continue

Once my commit has been successfully rebased, I run through the test plan 
described when I first ran `arc diff` to ensure that everything is still 
working. I also run the entire suite of automated tests and ensure everything 
passes lint. For Khan Academy, that's done by running `make check`.

Now I double check which commit is going out by running

    hg outgoing -r .

Now I'm ready to push, which I do by running

    hg push -r .

Note that the `-r .` is required here. `hg push` with no arguments will attempt 
to push all commits not in the remote (i.e. will push all commits listed by `hg 
outgoing` with no arguments). This might attempt to push many different 
features, some of which have not yet been reviewed. This will fail with a 
message from mercurial about creating multiple heads on the remote. If you 
specify a revision with `-r`, it will only push revisions that are ancestors of 
the commit specified.

Since I always want to use `-r .` whenever I push, I have `hg nudge` aliased to 
`hg push`. Thanks to [David Hu][] for the alias.

```ini
[alias]
nudge = push --rev .
```


If everything went okay, I close the Phabricator Maniphest task and delete the 
bookmark, since it's no longer needed.

    arc close T111
    hg book -d timestamp-T111

Merging Changes into Stable
---------------------------
When my team decides that we have a group of features ready to go into 
production, we merge our branch with stable and push to both remotes.

This one has to be a merge --- as opposed to a rebase --- because any changes in 
either stable or the team remote have already been shared with other people.  
**Never rebase shared commits**. Mercurial will actually attempt to stop you 
from rebasing any commit in the "public" phase.

The merge process will look something like this:

    # Sync with remote
    hg pull
    hg pull stable

    # Merge team branch with stable
    hg up stable/default
    hg merge default/default
    # Deal with any conflicts using hg resolve
    hg commit -m 'Merge stable + labs-cs'

    # Test to make sure everything is working

    # Push changes
    hg push -r . # Push to team remote
    hg push stable -r . # Push to stable remote

Reviewing Others' Changes
-------------------------
When someone lists me as a reviewer, I need to pull down their changes to test 
them out locally. First, I revert my working copy to be the same as the remote.

    hg pull
    hg up default/default

Usually the person requesting review is on my team. If they weren't, I'd instead 
do

    hg pull stable
    hg up stable/default

Then I apply the patch I'm reviewing. With arcanist, this is done by doing 
something like

    arc patch D381

I play around with it and test it out, then when I'm done reviewing, I clean my 
local directory state. Assuming you have the [purge](#purge) extension, this is 
done with

    hg clean
    hg up -C .

or if you crated the nuke alias described in the [purge](#purge) section above, 
just

    hg nuke

Things I'm Missing
==================

Overall, I'm pretty happy with my mercurial setup. It provides rough analogs of 
everything I'm used to using in git, and that's all I really need.

There are, however, a few things I had while working with git that I'm still 
lacking in mercurial. Some of these may be due to ignorance, some of them due to 
actual non-existence.

Git Grep
--------
`hg grep` and `git grep` do very different things. From the man pages, `git 
grep` "Look[s] for specified patterns in the tracked files in the work tree", 
whereas `hg grep` "Search[es] revisions of files for a regular expression. [...] 
It searches repository history, not the working directory."

For now I've been using [ack][], which works well enough. The real advantage of 
`git grep` is that it ignores all files ignored by the `.gitignore` in the 
current repository, and the files you want ignored might vary project by 
project. It's also really fast.

Fugitive - Vim Plugin
---------------------
While working in git repositories, I have [fugitive][] - an awesome vim plugin 
written by [Tim Pope][]. It provides a lot of really cool ways of interacting 
with the repository. Two of my absolute favorites are `:GDiff` and `:GBlame`.

I won't talk about it much here, but if you're using vim and work in git 
repositories, you should seriously check it out.

**EDIT**: I *sort* of made it: [vim-mercenary][].

[Khan Academy]: http://www.khanacademy.org
[jlfwong/dotfiles]: https://github.com/jlfwong/dotfiles/
[David Hu]: http://david-hu.com/
[khan/khan-dotfiles]: https://github.com/khan/khan-dotfiles/
[hg book]: http://hgbook.red-bean.com/
[Mercurial Theming]: http://mercurial.selenic.com/wiki/Theming
[Mercurial Phases]: http://mercurial.selenic.com/wiki/Phases
[git prompt]: http://en.newinstance.it/2010/05/23/git-autocompletion-and-enhanced-bash-prompt/
[prompt-shelves]: https://github.com/jlfwong/dotfiles/commit/16ff9758a03a1a06574b8909d9a9cd0ea8302b70
[git-completion.bash]: https://github.com/jlfwong/dotfiles/blob/master/git-completion.bash
[prompt.py]: https://github.com/jlfwong/dotfiles/blob/master/hg-prompt/prompt.py
[hg prompt]: http://sjl.bitbucket.org/hg-prompt/
[hg-completion.bash]: https://github.com/jlfwong/dotfiles/blob/master/hg-completion.bash
[Phabricator]: http://phabricator.org/
[Kiln]: http://www.fogcreek.com/Kiln/
[arcanist]: http://www.phabricator.com/docs/phabricator/article/Arcanist_User_Guide.html
[stevelosh-branching]: http://stevelosh.com/blog/2009/08/a-guide-to-branching-in-mercurial/
[An Argument for Mutable Local History]: /2012/05/25/an-argument-for-mutable-local-history/
[ack]: http://betterthangrep.com/
[fugitive]: https://github.com/tpope/vim-fugitive/
[Tim Pope]: https://twitter.com/tpope
[vim-mercenary]: https://github.com/jlfwong/vim-mercenary
