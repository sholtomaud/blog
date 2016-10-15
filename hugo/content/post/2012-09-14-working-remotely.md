---
date: 2012-09-14T00:00:00Z
tags:
- tooling
- phabricator
- hipchat
- khan-academy
title: Working Remotely
url: /2012/09/14/working-remotely/
---

My internship at Khan Academy is over now, and I already wrote extensively about 
[everything I worked on][1]. This internship was my first job working completely 
remotely from the rest of my team, and it worked out just fine.

Of the four month internship, I spent the first week in Mountain View with the 
rest of the team, then spent the remaining 15 weeks in Toronto. For the first 
two months, I was renting a desk from one of my past (awesome) co-op employers 
[The Working Group][2]. The last two I spent working out of my apartment because 
I got tired of paying for a TTC transit pass and spending an hour of every day 
commuting. The choice to work remotely was my own, and everyone Khan Academy did 
everything in their power to support that choice (to be honest, I was surprised 
they let me at all).

Autonomy
========
Working remotely came with a significant increase in responsibility and also in 
autonomy. I was responsible for managing my own time, tracking my hours, 
prioritizing my tasks and ensuring that everyone on my team was up to date with 
what I was working on.

This ability allowed me to be incredibly productive, because I was nearly never 
blocked. Not being blocked was incredibly important considering I would be 
blocked for 3 hours in the morning due to the time difference between Toronto 
and Mountain View if I needed to wait on someone else. 

On the note of being blocked, another trick to stay more productive came from my 
mentor at Facebook. During one of our weekly 1-on-1's, he asked if I had enough 
to do. I said that I thought I did for a little while, to which he responded 
that it was his job to make sure I had too much to do. This wasn't some 
nefarious plot to work interns into the ground (I never worked more than 8-9 
hours per day), but a means to always ensure I _always_ had something to work 
on. In many cases, it's not possible to increase the speed of completion of one 
specific feature, so the only thing to do is increase the number of things I can 
work on. This ensures that I always have an unblocked feature to tackle.

My absolute most productive days were the ones where I woke up early, exercised, 
showered, ate breakfast, then immediately started working. I read no email 
(personal or work related) until after lunch and focused on fixing bugs, writing 
features and merging the work that had been reviewed and approved by my 
teammates.

I think that avoiding reading my email or Hacker News before I started working 
helped me keep my mental context to as few things as possible. This is also the 
state I'm writing this blog post in at the moment, and a pattern I hope to 
continue for some time.

This level of autonomy would've been completely impossible (or at least the bad 
kind of chaotic) without the tooling set up at Khan Academy, which I'll talk 
about later on.

Social Implications
===================
I had no doubt that I would not personally know the team as well working 
remotely as I would have on-site, and I still think that's true. I missed out on 
the small talk of the company, and really only knew people through their work. 
That said, I never had any problem with communicating in a 
professional/technical capacity with any of the team. Everyone was always very 
responsive and helpful while still maintaining a very comfortable, casual 
atmosphere. 

I don’t really think Khan Academy did anything wrong in this regard -- I think 
it's just something that you have to accept if you’re not in the same physical 
location as your coworkers. What this really means is that you might need to 
have a more active social life, because the passive social life you get from 
being in an office with people doesn’t exist to the same extent.


I can see this fact being a large motivating factor behind contractors and very 
small companies participating in [coworking][5], and I got this to some extent 
during my first two months renting a desk from The Working Group, but it was 
difficult for me to justify the costs at the time. If I were working remotely 
full-time, I think I probably would try to find some good people to share an 
office with.

Tooling
========
I've worked remotely from the core development team (of a different company) 
before, and it was frustrating. Along with working with a more experienced team 
this time around, I think it was the tooling that really made (and previously 
broke) the remote experience.

All of the pieces of software listed below are what I used while at Khan 
Academy. While I think that these particular choices are all excellent, there 
are plenty of alternatives. As long as you have something that provides the same 
benefits, that's probably fine. I will argue why I think some of these are 
better than their common alternatives.

Phabricator
-----------
![Phabricator](/images/12-09-14/phabricator.png)

At Khan Academy, I used [Phabricator][3] for both code review and task 
management. Having a code review tool was *essential* to being an effective 
remote employee. I'll write a post in the future expounding some of the less 
obvious benefits of code review, but for now I'll say that it helped keep code 
quality relatively high and helped me maintain my mental context of the code I 
need to work with regularly. Discovering some new, broken code that didn't exist 
last week during a debugging session is always an exercise in frustration.

The code review tool within Phabricator is called Differential. Other teams 
within Khan Academy use [Kiln][4]. I like Differential better than Kiln or 
GitHub as a code review tool for a whole bunch of reasons. It's worth noting 
that I think GitHub is still a vastly superior tool for doing reviews for 
out-of-company contributors to open source projects.

- **Side-by-side diff view.** I personally find this much easier to follow when 
  significant changes are made than GitHub.

- **Clear state indication.** The state of every review is clearly indicated as 
  "Needs Review", "Needs Revision", "Accepted" or "Closed". Using these 
  statuses, all of the reviews you're involved in are sorted into two bins if 
  the review isn't closed: "Action Required" and "Waiting on Others". This gives 
  you a clear indication of what things you need to work on.

![Differential Status](/images/12-09-14/differential-1.png)

- **Easy local patching.** The simplicity of applying the patch up for review 
  locally encourages everyone reviewing to not only read the code, but to verify 
  the functionality themselves. While this is possible with GitHub by pulling 
  down the remote branch, it's a lot more of a pain than copying and pasting 
  "arc patch D657" from Phabricator's web inferface.

- **Decoupling of commits and revisions.** The separation of "revisions" and 
  "commits" means that each update to the diff is one "revision" regardless of 
  whether the author sent down 1 commit, 3 commits or amended the original 
  commit. This also means it's very easy to see what the diff changes as a 
  whole, or just to see what a specific update did when changes were requested. 
  This is also *possible* on GitHub, but it's definitely not easy. It also means 
  that inline comments are still reachable, even if the commit they're attached 
  to is removed by a rebase or amend.

![Differential Diff Settings](/images/12-09-14/differential-2.png)

- **Support for both Mercurial and Git.** Since Khan Academy uses both git and 
  mercurial, this was a pretty important one. It also supports svn if you're a 
  masochist.

The task management tool is called Maniphest. Having a task management system 
allowed our team to maintain several different important discussions of bugs and 
features independently in a very organized way that made it easy to reference. 
This was especially important when some features ended up being implemented a 
couple of weeks after being discussed.

Maniphest has many of the features of GitHub's issues and has a similar kind of 
integration where you can reference tasks in diffs and vice versa. The one 
feature I like about Maniphest over GitHub issues is the ability to claim a task 
as your own or reassign it to someone else if one was mistakenly assigned to you 
or if you're blocked for whatever reason.

The only major downside of Phabricator compared to GitHub is that you have to 
host it yourself at the moment (though that might change?), and that you have to 
install a tool locally.

Hipchat
-------
![HipChat](/images/12-09-14/hipchat.png)

[HipChat][8] is a group chat system. In my previous, less enjoyable experience 
working remotely, Skype was the primary tool used for group chat. After using 
Campfire during my time at The Working Group and using HipChat at Khan Academy, 
it's extremely obvious that tools not built specifically for developer team 
collaboration are at a gross disadvantage compare to those that are.

This was used to quickly diagnose bugs in production, get help with bits of code 
or infrastructure, pass around design mockups, help debug newcomers' developer 
environments and link to funny pictures of cats.

Key features that make HipChat work better than group chats not tailored to 
development teams:

- **Email notifications.** If you're offline or you've been away from the 
  computer from a while and someone @mentions you, you'll get an email 
  notification about it for you to read later. There's also the handy `@all` 
  which notifies everybody in the chat room.
- **Image embedding.** If you link to an image, a thumbnail will show up inline 
  in the chat window. As an added bonus, you can paste images directly from your 
  clipboard and they'll be uploaded to S3 for everyone to see. This makes 
  sharing screenshots of mockups or layout bugs a breeze.
- **Code pasting.** If you paste some code (or anything multiline), it'll retain 
  its monospacing. This makes reading code snippets pasted into the chat window 
  much, much easier to read.

Google Hangouts
---------------
Twice a week, once for developer standup, and once for a company update, I would 
hop into a Google Hangout room. This worked out really well -- 10-15 minutes 
before the meeting started, a link to the standup would be posted into HipChat, 
so everyone could just pile in.

A recurring problem was being able to hear people clearly, which was mostly 
fixed by a quality microphone being passed around by the person speaking.  
Please, if you have remote employees, unless everyone is sitting at their 
laptops during the call, **invest in a good microphone**.

The ability for people to join into the conversation while it was already 
underway without needing in invitation as long as they had the link made this 
run really smoothly. For that reason specifically, I like using Google Hangouts 
over Skype for group video calls.

Skype
-----
Skype is still the de-facto 1-on-1 online calling platform, and I've yet to see 
anything offer a better service for free. Whenever I had a 1-on-1 call with 
someone, we would use Skype. Both the video and audio quality have consistently 
been better than Google Hangouts.

Time Tracker
------------
![Time Tracker](/images/12-09-14/time-tracker.png)

Since I needed to track my time, I wanted a program to track me time. I didn't 
really need anything too fancy, so [Time Tracker for Mac][6] did the trick for 
me.

It's ugly, has some annoying bugs, but it does what it's supposed to. This is 
what I used to track my [121 hours of drawing][7] and how much time I spent 
doing work for each of my classes last term.

Closing Thoughts
================

Having now worked remotely with nearly no meetings, I'm confident that I can be 
at least as productive working remotely as I can onsite, provided that I know 
the domain fairly well. That said, I don't think I'll be working remotely for my 
next internship because of the social implications.

I don't regret working remotely. It gave me the ability to separate tech stuff 
from the rest of my life, which was definitely a refreshing change. I started 
chipping away at the problems I described in [Immersion and Schadenfreude][7] by 
exercising more, starting badminton again and cooking more frequently. I had a 
great time at Khan Academy, and would recommend it to anyone with the 
opportunity to work there, onsite or otherwise.

[1]: /2012/08/22/what-i-did-at-khan-academy/
[2]: http://www.theworkinggroup.ca/
[3]: http://phabricator.khanacademy.org/
[4]: http://www.fogcreek.com/kiln/
[5]: http://en.wikipedia.org/wiki/Coworking
[6]: http://code.google.com/p/time-tracker-mac/
[7]: /2011/12/30/immersion-and-schadenfreude/
[8]: https://www.hipchat.com/
