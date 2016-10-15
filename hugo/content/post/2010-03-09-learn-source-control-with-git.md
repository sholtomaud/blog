---
date: 2010-03-09T00:00:00Z
meta:
  _edit_last: "1"
  _edit_lock: "1274333057"
published: true
status: publish
tags:
- git
- hg
- mercurial
- revision control
- source control
- svn
- Tools
title: Learn Source Control with Git
type: post
url: /2010/03/09/learn-source-control-with-git/
---

<div style='text-align:center'>
  <img alt="" src="/images/git.png" />
</div>

One of the gaps among my tech skills upon entering university was source/revision control.

For those of you unfamiliar, revision control is a method of tracking and storing the changes made to files. This is particularly useful when keeping track of all the changes made to source code being worked on in a group. This allows you to all work on the same set of files at once and merge together the changes later. 

This doesn't mean it isn't useful for projects you're working on by yourself. If you've ever coded something up, then decided you have a better way of solving the problem, then finally realize your new solution doesn't work, you need to go back. Except the deleted code is one undo step beyond your history. Crap.

And no, allowing for more undo steps is not the solution to this problem. If you want to look at older versions across multiple files from weeks ago, undo won't help you. Revision control will.

After speaking with employers, it seems that the most commonly used source control system at the moment is git. I'd like to note that most of the people I interviewed with were small, fairly new, web or mobile based companies. Older companies may be using svn or possibly even cvs. Then there's the whole set of Microsoft source control systems such as Microsoft Visual Source Safe.

You can see a summary of source control options here: <a href="http://en.wikipedia.org/wiki/Comparison_of_revision_control_software">Comparison of revision control software @ Wikipedia</a>

I'm posting about this now because I'm working on a collaborative project using git for the first time. Since this is a private project, I'm using <a href="http://www.projectlocker.com/">Project Locker</a> instead of <a href="http://github.com/">Github</a>. To be honest, I probably should have just set up my own private repository and I might look into that later.

You don't actually need to have a remote repository. You can use a git repository to control your source locally if you're the only one working on it. You might consider doing this for school projects so you don't accidentally overwrite your working code in an attempt to appease Marmoset (automated testing in CS at U Waterloo).

In order to learn how to use git, I can recommend two sources of information.

1. <a href="http://gitcasts.com">GitCasts</a>: these are screen casts, going through git and explaining things along the way. I'm in the middle of the fourth cast right now, so I can't say for sure these are all of high quality, but I'm seeing things I didn't know before, and that's enough for me.

2. <a href="http://marklodato.github.com/visual-git-guide/">Visual Git Guide</a>: Pictures are awesome, especially for those people of the tl;dr mindset. Or those attracted to colourful pictures. The picture at the top of the post is from the visual git guide. This is a fairly in depth explanation of some of the functionality of git and shows you what's actually happening behind the scenes.

For those of you more interested in learning Mercurial (Hg), <a 
href="http://zameermanji.com/">Zameer Manji</a> has recommended the following 
guide: <a href="http://hginit.com/index.html">Hg Init: a Mercurial tutorial by 
Joel Spolsky</a>.

I would recommend you go grab an account of GitHub to help yourself learning. If you're in need of something to fool around with, fork one of my projects: <a href="http://github.com/jlfwong">jlfwong @ github</a>.
